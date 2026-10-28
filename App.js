import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Services
import {
  getPhotos,
  addPhoto,
  deletePhoto,
  updatePhoto,
  clearAllPhotos,
} from './src/services/storageService';
import { getCurrentLocation } from './src/services/locationService';
import { generateImageDescription } from './src/services/geminiService';

// Components
import PhotoCard from './src/components/PhotoCard';
import PhotoDetailModal from './src/components/PhotoDetailModal';
import OverviewMapView from './src/components/OverviewMapView';
import ApiKeyModal from './src/components/ApiKeyModal';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'map'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [captureModalVisible, setCaptureModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Tải danh sách ảnh từ AsyncStorage khi khởi động app
  useEffect(() => {
    loadSavedPhotos();
  }, []);

  const loadSavedPhotos = async () => {
    try {
      setIsLoading(true);
      const list = await getPhotos();
      setPhotos(list);
    } catch (e) {
      console.error('Lỗi khi tải ảnh:', e);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý luồng sau khi chụp hoặc chọn ảnh
   */
  const processImage = async (pickerResult) => {
    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      return;
    }

    const asset = pickerResult.assets[0];
    const imageUri = asset.uri;
    const base64Data = asset.base64;

    setCaptureModalVisible(false);
    setIsProcessing(true);
    setProcessingStatus('Đang lấy toạ độ vị trí GPS...');

    // 1. Lấy vị trí toạ độ địa lý lúc chụp
    let locationData = null;
    try {
      locationData = await getCurrentLocation();
    } catch (locErr) {
      console.warn('Không lấy được vị trí:', locErr);
    }

    // 2. Tạo đối tượng ảnh tạm thời
    const photoId = 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const now = Date.now();
    const defaultTitle = locationData?.address
      ? `Kỷ niệm tại ${locationData.address.split(',')[0]}`
      : `Kỷ niệm ${new Date(now).toLocaleDateString('vi-VN')}`;

    setProcessingStatus('Gemini AI đang phân tích và viết mô tả...');

    // 3. Gọi Gemini AI để sinh mô tả
    let aiDescription = '';
    let aiStatus = 'idle';

    if (base64Data) {
      try {
        const aiResult = await generateImageDescription(base64Data, 'image/jpeg', {
          address: locationData?.address,
          timestamp: now,
        });
        aiDescription = aiResult.text;
        aiStatus = aiResult.isFallback ? 'fallback' : 'success';
      } catch (aiErr) {
        console.warn('Lỗi phân tích AI:', aiErr);
        aiDescription = 'Chưa có mô tả cho bức ảnh này.';
        aiStatus = 'error';
      }
    } else {
      aiDescription = 'Đã lưu ảnh kỷ niệm.';
    }

    // 4. Lưu ảnh hoàn chỉnh vào AsyncStorage
    const newPhotoItem = {
      id: photoId,
      uri: imageUri,
      base64: base64Data,
      title: defaultTitle,
      description: aiDescription,
      timestamp: now,
      location: locationData,
      aiStatus,
    };

    const updatedList = await addPhoto(newPhotoItem);
    if (updatedList) {
      setPhotos(updatedList);
      // Mở modal chi tiết để người dùng xem ngay kết quả
      setSelectedPhoto(newPhotoItem);
      setDetailVisible(true);
    }

    setIsProcessing(false);
    setProcessingStatus('');
  };

  /**
   * Chụp ảnh mới bằng Camera
   */
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập Camera',
          'Ứng dụng cần quyền sử dụng máy ảnh để chụp bức ảnh kỷ niệm mới.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.65,
        base64: true,
      });

      await processImage(result);
    } catch (e) {
      console.error('Lỗi khi chụp ảnh:', e);
      Alert.alert('Lỗi', 'Không thể khởi động máy ảnh: ' + e.message);
      setIsProcessing(false);
    }
  };

  /**
   * Chọn ảnh có sẵn từ Thư viện
   */
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập Thư viện ảnh',
          'Vui lòng cấp quyền thư viện để chọn ảnh từ thiết bị.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.65,
        base64: true,
      });

      await processImage(result);
    } catch (e) {
      console.error('Lỗi khi chọn ảnh:', e);
      Alert.alert('Lỗi', 'Không thể mở thư viện: ' + e.message);
      setIsProcessing(false);
    }
  };

  /**
   * Xoá một bức ảnh
   */
  const handleDeletePhoto = useCallback((id, title) => {
    Alert.alert(
      'Xác nhận xoá ảnh',
      `Bạn có chắc chắn muốn xoá ảnh "${title || 'này'}" không?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            const updated = await deletePhoto(id);
            if (updated) {
              setPhotos(updated);
            }
          },
        },
      ]
    );
  }, []);

  /**
   * Cập nhật thông tin ảnh
   */
  const handleUpdatePhoto = useCallback(async (id, updates) => {
    const updated = await updatePhoto(id, updates);
    if (updated) {
      setPhotos(updated);
      setSelectedPhoto((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
    }
  }, []);

  /**
   * Xoá toàn bộ ảnh (reset)
   */
  const handleClearAll = () => {
    if (photos.length === 0) return;
    Alert.alert(
      'Xoá tất cả ảnh',
      'Thao tác này sẽ xoá toàn bộ danh sách ảnh kỷ niệm đã lưu trong máy. Bạn có chắc không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá hết',
          style: 'destructive',
          onPress: async () => {
            await clearAllPhotos();
            setPhotos([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />

      {/* Header thanh công cụ ứng dụng */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconBg}>
            <Ionicons name="camera-reverse" size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Photo Memory AI</Text>
            <Text style={styles.headerSubtitle}>Bản đồ kỷ niệm & Trí tuệ Gemini</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {/* Cài đặt API key */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setApiKeyModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="key-outline" size={20} color="#475569" />
          </TouchableOpacity>

          {/* Xoá tất cả */}
          {photos.length > 0 && (
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleClearAll}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Segmented Tab: Bộ sưu tập / Bản đồ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'list' && styles.tabBtnActive]}
          onPress={() => setActiveTab('list')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="images"
            size={16}
            color={activeTab === 'list' ? '#ffffff' : '#64748b'}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'list' && styles.tabBtnTextActive,
            ]}
          >
            Ảnh đã chụp ({photos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'map' && styles.tabBtnActive]}
          onPress={() => setActiveTab('map')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="map"
            size={16}
            color={activeTab === 'map' ? '#ffffff' : '#64748b'}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'map' && styles.tabBtnTextActive,
            ]}
          >
            Bản đồ kỷ niệm
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung chính tuỳ theo tab */}
      {isLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingMainText}>Đang tải bộ sưu tập...</Text>
        </View>
      ) : activeTab === 'list' ? (
        <View style={styles.listWrapper}>
          {photos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="images-outline" size={54} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>Chưa có ảnh nào được lưu</Text>
              <Text style={styles.emptyText}>
                Hãy nhấn nút chụp ảnh bên dưới để ghi lại khoảnh khắc. Ứng dụng
                sẽ tự động định vị trên bản đồ và dùng Gemini AI sinh mô tả cho bạn!
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => setCaptureModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={20} color="#ffffff" />
                <Text style={styles.emptyActionBtnText}>Chụp bức ảnh đầu tiên</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={photos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PhotoCard
                  photo={item}
                  onPress={(p) => {
                    setSelectedPhoto(p);
                    setDetailVisible(true);
                  }}
                  onDelete={handleDeletePhoto}
                />
              )}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      ) : (
        <OverviewMapView
          photos={photos}
          onSelectPhoto={(p) => {
            setSelectedPhoto(p);
            setDetailVisible(true);
          }}
          onOpenCapture={() => setCaptureModalVisible(true)}
        />
      )}

      {/* Nút FAB chụp ảnh tròn nổi bật */}
      <TouchableOpacity
        style={styles.fabBtn}
        onPress={() => setCaptureModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="camera" size={26} color="#ffffff" />
        <Text style={styles.fabText}>Chụp ảnh</Text>
      </TouchableOpacity>

      {/* Modal Bottom Sheet chọn nguồn ảnh */}
      <Modal
        visible={captureModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCaptureModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCaptureModalVisible(false)}
        >
          <View style={styles.captureSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Thêm ảnh kỷ niệm mới</Text>
            <Text style={styles.sheetSubtitle}>
              Tự động lưu vị trí GPS và phân tích ảnh với Gemini AI
            </Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <View style={[styles.sheetIconBox, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="camera" size={22} color="#2563eb" />
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={styles.sheetOptionTitle}>Chụp bằng Máy ảnh</Text>
                <Text style={styles.sheetOptionDesc}>Mở camera để chụp trực tiếp</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handlePickFromGallery}
              activeOpacity={0.8}
            >
              <View style={[styles.sheetIconBox, { backgroundColor: '#f5f3ff' }]}>
                <Ionicons name="images" size={22} color="#7c3aed" />
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={styles.sheetOptionTitle}>Chọn từ Thư viện ảnh</Text>
                <Text style={styles.sheetOptionDesc}>Tải ảnh có sẵn trong máy</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setCaptureModalVisible(false)}
            >
              <Text style={styles.sheetCancelText}>Huỷ</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal xử lý Loading khi AI đang phân tích ảnh */}
      <Modal visible={isProcessing} transparent={true} animationType="fade">
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.processingTitle}>Đang xử lý bức ảnh</Text>
            <Text style={styles.processingSub}>{processingStatus}</Text>
          </View>
        </View>
      </Modal>

      {/* Modal chi tiết bức ảnh & Bản đồ */}
      <PhotoDetailModal
        visible={detailVisible}
        photo={selectedPhoto}
        onClose={() => setDetailVisible(false)}
        onDelete={handleDeletePhoto}
        onUpdatePhoto={handleUpdatePhoto}
      />

      {/* Modal cấu hình Gemini API Key */}
      <ApiKeyModal
        visible={apiKeyModalVisible}
        onClose={() => setApiKeyModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#0f172a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 6,
  },
  tabBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listWrapper: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMainText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  captureSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sheetIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  sheetOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  sheetOptionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sheetCancelBtn: {
    marginTop: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  processingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  processingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 14,
    marginBottom: 6,
  },
  processingSub: {
    fontSize: 13,
    color: '#6366f1',
    textAlign: 'center',
  },
});

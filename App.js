import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from './constants/theme';
import { 
  getStoredPhotos, 
  savePhoto, 
  deletePhoto, 
  clearAllPhotos, 
  getStoredApiKey 
} from './services/storageService';
import { getCurrentLocationAndAddress } from './services/locationService';
import { generateImageDescription } from './services/geminiService';
import { CONFIG } from './config';

import MapView, { Marker, Callout } from 'react-native-maps';

import PhotoCard from './components/PhotoCard';
import PhotoDetailModal from './components/PhotoDetailModal';
import ApiKeyModal from './components/ApiKeyModal';

const { width } = Dimensions.get('window');

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [apiKey, setApiKey] = useState(CONFIG.GEMINI_API_KEY || '');
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'map'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Trạng thái xử lý chụp và gọi AI
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Tải danh sách ảnh và API Key khi khởi chạy app
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const storedPhotos = await getStoredPhotos();
      setPhotos(storedPhotos);

      const storedKey = await getStoredApiKey();
      if (storedKey) {
        setApiKey(storedKey);
      } else if (CONFIG.GEMINI_API_KEY) {
        setApiKey(CONFIG.GEMINI_API_KEY);
      }
    } catch (e) {
      console.error('Lỗi khởi tạo ứng dụng:', e);
    }
  };

  /**
   * Xử lý sau khi người dùng chọn hoặc chụp ảnh thành công
   */
  const processCapturedImage = async (asset) => {
    try {
      setIsProcessing(true);
      
      // Bước 1: Lấy vị trí GPS & Địa chỉ
      setProcessingStatus('Đang lấy vị trí chụp ảnh (GPS)...');
      const locationData = await getCurrentLocationAndAddress();

      // Bước 2: Gọi Gemini AI phân tích hình ảnh
      setProcessingStatus('Gemini AI đang phân tích và sinh mô tả...');
      let description = '';

      if (apiKey && apiKey.trim() !== '') {
        try {
          description = await generateImageDescription(asset.base64, apiKey);
        } catch (aiErr) {
          console.warn('Lỗi phân tích Gemini AI:', aiErr);
          description = `[Thông báo AI: ${aiErr.message || 'Không thể tạo mô tả'}]. Ảnh chụp tại ${locationData.address}.`;
        }
      } else {
        description = `Ảnh được chụp tại ${locationData.address}. Chưa cấu hình Gemini API Key nên mô tả tự động chưa được bật.`;
      }

      // Bước 3: Lưu vào AsyncStorage
      setProcessingStatus('Đang lưu vào bộ nhớ thiết bị...');
      const newPhotoItem = {
        id: Date.now().toString(),
        uri: asset.uri,
        timestamp: new Date().toISOString(),
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
        },
        description: description,
      };

      const updatedList = await savePhoto(newPhotoItem);
      setPhotos(updatedList);

      setIsProcessing(false);
      setProcessingStatus('');

      // Mở modal xem chi tiết bức ảnh vừa tạo
      setSelectedPhoto(newPhotoItem);

      if (!apiKey) {
        Alert.alert(
          'Gợi ý cấu hình AI',
          'Bạn chưa nhập Gemini API Key. Nhấn vào icon Cài đặt (bánh răng) ở góc trên để nhập key và kích hoạt mô tả thông minh.',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Nhập Key ngay', onPress: () => setIsKeyModalOpen(true) }
          ]
        );
      }
    } catch (error) {
      setIsProcessing(false);
      setProcessingStatus('');
      console.error('Lỗi xử lý ảnh:', error);
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi xử lý ảnh.');
    }
  };

  /**
   * Mở camera chụp ảnh trực tiếp
   */
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền Camera', 'Vui lòng cấp quyền truy cập máy ảnh để chụp ảnh.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processCapturedImage(result.assets[0]);
      }
    } catch (err) {
      console.error('Lỗi khi chụp ảnh:', err);
      Alert.alert('Lỗi', 'Không thể mở máy ảnh.');
    }
  };

  /**
   * Chọn ảnh từ thư viện thiết bị
   */
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền Thư viện', 'Vui lòng cấp quyền truy cập bộ sưu tập ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processCapturedImage(result.assets[0]);
      }
    } catch (err) {
      console.error('Lỗi khi chọn ảnh:', err);
      Alert.alert('Lỗi', 'Không thể mở bộ sưu tập.');
    }
  };

  /**
   * Xóa một bức ảnh
   */
  const handleDeletePhoto = async (id) => {
    try {
      const updated = await deletePhoto(id);
      setPhotos(updated);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa ảnh.');
    }
  };

  /**
   * Xóa tất cả ảnh (Reset)
   */
  const handleClearAll = () => {
    if (photos.length === 0) return;
    Alert.alert(
      'Xóa toàn bộ ảnh',
      'Bạn có chắc muốn xóa sạch toàn bộ lịch sử ảnh kỷ niệm không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa hết', 
          style: 'destructive',
          onPress: async () => {
            await clearAllPhotos();
            setPhotos([]);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

        {/* Thanh Header chính */}
        <View style={styles.topHeader}>
          <View style={styles.appBrand}>
            <View style={styles.brandIconWrap}>
              <Ionicons name="camera" size={20} color={THEME.colors.primary} />
            </View>
            <View>
              <Text style={styles.brandTitle}>Photo Memories</Text>
              <Text style={styles.brandSubtitle}>AI Vision & Google Maps</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {photos.length > 0 && (
              <TouchableOpacity 
                style={styles.headerIconBtn} 
                onPress={handleClearAll}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-bin-outline" size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.headerIconBtn, apiKey ? styles.keyActiveBtn : null]} 
              onPress={() => setIsKeyModalOpen(true)}
            >
              <Ionicons 
                name="sparkles" 
                size={18} 
                color={apiKey ? THEME.colors.accent : THEME.colors.textMuted} 
              />
              <Text style={[styles.keyBtnLabel, apiKey && { color: THEME.colors.accent }]}>
                {apiKey ? 'AI Sẵn sàng' : 'Nhập Key'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Control chuyển tab */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'gallery' && styles.tabButtonActive]}
            onPress={() => setActiveTab('gallery')}
          >
            <Ionicons 
              name="images-outline" 
              size={18} 
              color={activeTab === 'gallery' ? THEME.colors.primary : THEME.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'gallery' && styles.tabTextActive]}>
              Bộ sưu tập ({photos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'map' && styles.tabButtonActive]}
            onPress={() => setActiveTab('map')}
          >
            <Ionicons 
              name="map-outline" 
              size={18} 
              color={activeTab === 'map' ? THEME.colors.primary : THEME.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'map' && styles.tabTextActive]}>
              Bản đồ ký ức
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nội dung theo Tab */}
        <View style={styles.mainContent}>
          {activeTab === 'gallery' ? (
            <FlatList
              data={photos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PhotoCard
                  photo={item}
                  onPress={(p) => setSelectedPhoto(p)}
                  onDelete={handleDeletePhoto}
                />
              )}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="images-outline" size={48} color={THEME.colors.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>Chưa có ảnh nào được lưu</Text>
                  <Text style={styles.emptyDesc}>
                    Hãy chụp một bức ảnh mới hoặc chọn từ thư viện. Gemini AI sẽ tự động phân tích và ghim vị trí lên Google Maps!
                  </Text>
                  <TouchableOpacity style={styles.emptyCaptureBtn} onPress={handleTakePhoto}>
                    <Ionicons name="camera" size={18} color={THEME.colors.background} />
                    <Text style={styles.emptyCaptureBtnText}>Chụp ảnh ngay</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          ) : (
            /* Tab Bản đồ tổng quan hiển thị tất cả các marker */
            <View style={styles.mapTabWrapper}>
              {MapView && Marker && Platform.OS !== 'web' ? (
                <MapView
                  style={styles.fullMap}
                  initialRegion={{
                    latitude: photos[0]?.location?.latitude || 21.0124167,
                    longitude: photos[0]?.location?.longitude || 105.5207831,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.15,
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                >
                  {photos.map((item) => (
                    <Marker
                      key={item.id}
                      coordinate={{
                        latitude: item.location?.latitude || 21.0124167,
                        longitude: item.location?.longitude || 105.5207831,
                      }}
                      title={item.location?.address || 'Ảnh kỷ niệm'}
                      description={item.description?.slice(0, 50) + '...'}
                      onCalloutPress={() => setSelectedPhoto(item)}
                    />
                  ))}
                </MapView>
              ) : (
                <View style={styles.webMapOverview}>
                  <Ionicons name="map" size={56} color={THEME.colors.primary} />
                  <Text style={styles.webMapTitle}>Bản đồ kỷ niệm ảnh</Text>
                  <Text style={styles.webMapSub}>
                    Đang có {photos.length} bức ảnh được gắn thẻ vị trí GPS.
                  </Text>
                  <FlatList
                    data={photos}
                    keyExtractor={(item) => item.id}
                    style={{ width: '100%', marginTop: 20 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.webMapItem} 
                        onPress={() => setSelectedPhoto(item)}
                      >
                        <Image source={{ uri: item.uri }} style={styles.webMapThumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.webMapItemAddr} numberOfLines={1}>
                            {item.location?.address}
                          </Text>
                          <Text style={styles.webMapItemCoords}>
                            {item.location?.latitude?.toFixed(4)}, {item.location?.longitude?.toFixed(4)}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>
          )}
        </View>

        {/* Floating Action Bar bên dưới */}
        <View style={styles.bottomActionBar}>
          <TouchableOpacity 
            style={styles.pickGalleryBtn} 
            onPress={handlePickFromGallery}
            disabled={isProcessing}
          >
            <Ionicons name="folder-open-outline" size={20} color={THEME.colors.text} />
            <Text style={styles.pickGalleryText}>Thư viện</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mainCameraBtn} 
            onPress={handleTakePhoto}
            disabled={isProcessing}
          >
            <Ionicons name="camera" size={26} color={THEME.colors.background} />
            <Text style={styles.mainCameraText}>Chụp ảnh</Text>
          </TouchableOpacity>
        </View>

        {/* Modal chi tiết ảnh */}
        <PhotoDetailModal
          visible={selectedPhoto !== null}
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={handleDeletePhoto}
        />

        {/* Modal nhập Gemini API Key */}
        <ApiKeyModal
          visible={isKeyModalOpen}
          currentKey={apiKey}
          onClose={() => setIsKeyModalOpen(false)}
          onKeySaved={(newKey) => setApiKey(newKey)}
        />

        {/* Loading Overlay khi xử lý GPS và AI */}
        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={THEME.colors.primary} />
              <Text style={styles.loadingTitle}>Đang xử lý bức ảnh</Text>
              <Text style={styles.loadingStep}>{processingStatus}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  appBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconWrap: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  keyActiveBtn: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  keyBtnLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 8,
    backgroundColor: THEME.colors.surface,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceHighlight,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  tabText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: THEME.colors.primary,
  },
  mainContent: {
    flex: 1,
  },
  listContainer: {
    padding: THEME.spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  emptyTitle: {
    color: THEME.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyCaptureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.full,
  },
  emptyCaptureBtnText: {
    color: THEME.colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  mapTabWrapper: {
    flex: 1,
  },
  fullMap: {
    width: '100%',
    height: '100%',
  },
  webMapOverview: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  webMapTitle: {
    color: THEME.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  webMapSub: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  webMapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 12,
  },
  webMapThumb: {
    width: 50,
    height: 50,
    borderRadius: THEME.borderRadius.sm,
  },
  webMapItemAddr: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  webMapItemCoords: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  pickGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surfaceHighlight,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  pickGalleryText: {
    color: THEME.colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  mainCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.full,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  mainCameraText: {
    color: THEME.colors.background,
    fontWeight: '800',
    fontSize: 15,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingCard: {
    backgroundColor: THEME.colors.surface,
    padding: 24,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    width: width * 0.8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  loadingTitle: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  loadingStep: {
    color: THEME.colors.primary,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});

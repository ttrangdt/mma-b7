import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LeafletMap from './LeafletMap';
import { generateImageDescription } from '../services/geminiService';
import { openInGoogleMaps } from '../services/locationService';

export default function PhotoDetailModal({
  visible,
  photo,
  onClose,
  onDelete,
  onUpdatePhoto,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [isRegeneratingAi, setIsRegeneratingAi] = useState(false);

  // Khi mở modal, đồng bộ state
  React.useEffect(() => {
    if (photo) {
      setEditedTitle(photo.title || '');
      setEditedDesc(photo.description || '');
      setIsEditing(false);
    }
  }, [photo]);

  if (!photo) return null;

  const dateFormatted = photo.timestamp
    ? new Date(photo.timestamp).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const hasLocation =
    photo.location && photo.location.latitude && photo.location.longitude;

  // Xử lý tạo lại mô tả AI
  const handleRegenerateAi = async () => {
    if (!photo.base64) {
      Alert.alert(
        'Thông báo',
        'Ảnh này không còn chuỗi dữ liệu gốc để gửi cho AI. Bạn có thể tự chỉnh sửa mô tả.'
      );
      return;
    }

    try {
      setIsRegeneratingAi(true);
      const res = await generateImageDescription(photo.base64, 'image/jpeg', {
        address: photo.location?.address,
        timestamp: photo.timestamp,
      });

      if (res.text) {
        onUpdatePhoto(photo.id, {
          description: res.text,
          aiStatus: res.isFallback ? 'fallback' : 'success',
        });
        setEditedDesc(res.text);

        if (res.isFallback && res.error) {
          Alert.alert('Lưu ý từ Gemini AI', res.error);
        } else {
          Alert.alert('Thành công', 'Gemini AI đã làm mới mô tả cho bức ảnh!');
        }
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kết nối tới Gemini AI: ' + err.message);
    } finally {
      setIsRegeneratingAi(false);
    }
  };

  // Lưu chỉnh sửa thủ công
  const handleSaveEdit = () => {
    onUpdatePhoto(photo.id, {
      title: editedTitle.trim() || 'Khoảnh khắc đáng nhớ',
      description: editedDesc.trim(),
    });
    setIsEditing(false);
    Alert.alert('Thành công', 'Đã cập nhật thông tin bức ảnh.');
  };

  // Xử lý xoá ảnh
  const handleDeletePress = () => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc chắn muốn xoá bức ảnh này khỏi nhật ký không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá vĩnh viễn',
          style: 'destructive',
          onPress: () => {
            onClose();
            onDelete(photo.id, photo.title);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        {/* Thanh Header Modal */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#0f172a" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Chi tiết ảnh
          </Text>

          <TouchableOpacity
            style={styles.headerDeleteBtn}
            onPress={handleDeletePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Ảnh toàn diện */}
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>

          {/* Tiêu đề & Ngày giờ */}
          <View style={styles.section}>
            {isEditing ? (
              <View style={styles.editTitleBox}>
                <Text style={styles.inputLabel}>Tiêu đề ảnh:</Text>
                <TextInput
                  style={styles.titleInput}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  placeholder="Nhập tiêu đề cho ảnh..."
                  placeholderTextColor="#94a3b8"
                />
              </View>
            ) : (
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>{photo.title || 'Khoảnh khắc đáng nhớ'}</Text>
                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="pencil" size={16} color="#475569" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={styles.dateText}>{dateFormatted}</Text>
            </View>
          </View>

          {/* Phần Gemini AI Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color="#6366f1" />
                <Text style={styles.aiBadgeText}>Mô tả từ Gemini AI</Text>
              </View>

              <TouchableOpacity
                style={styles.regenBtn}
                onPress={handleRegenerateAi}
                disabled={isRegeneratingAi}
              >
                {isRegeneratingAi ? (
                  <ActivityIndicator size="small" color="#6366f1" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={13} color="#6366f1" />
                    <Text style={styles.regenBtnText}>Tạo lại</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <View style={styles.editDescBox}>
                <Text style={styles.inputLabel}>Nội dung mô tả:</Text>
                <TextInput
                  style={styles.descInput}
                  value={editedDesc}
                  onChangeText={setEditedDesc}
                  multiline
                  numberOfLines={4}
                  placeholder="Nhập mô tả chi tiết..."
                  placeholderTextColor="#94a3b8"
                />
                <View style={styles.editActionRow}>
                  <TouchableOpacity
                    style={styles.cancelEditBtn}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.cancelEditBtnText}>Huỷ bỏ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveEditBtn}
                    onPress={handleSaveEdit}
                  >
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                    <Text style={styles.saveEditBtnText}>Lưu thay đổi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.descBox}>
                <Text style={styles.descText}>
                  {photo.description || 'Chưa có mô tả cho bức ảnh này.'}
                </Text>
              </View>
            )}
          </View>

          {/* Phần Google Map / Leaflet Map */}
          <View style={styles.section}>
            <View style={styles.mapSectionHeader}>
              <View style={styles.mapBadge}>
                <Ionicons name="map" size={14} color="#0284c7" />
                <Text style={styles.mapBadgeText}>Bản đồ vị trí chụp</Text>
              </View>
              {hasLocation && (
                <TouchableOpacity
                  style={styles.mapNavBtn}
                  onPress={() =>
                    openInGoogleMaps(
                      photo.location.latitude,
                      photo.location.longitude,
                      photo.title
                    )
                  }
                >
                  <Ionicons name="navigate" size={12} color="#0284c7" />
                  <Text style={styles.mapNavBtnText}>Google Maps</Text>
                </TouchableOpacity>
              )}
            </View>

            {hasLocation ? (
              <View style={styles.mapWrapper}>
                <LeafletMap
                  latitude={photo.location.latitude}
                  longitude={photo.location.longitude}
                  address={photo.location.address}
                  title={photo.title}
                  height={220}
                  showExternalButton={true}
                />
              </View>
            ) : (
              <View style={styles.noMapBox}>
                <Ionicons name="location-outline" size={32} color="#94a3b8" />
                <Text style={styles.noMapTitle}>Không có dữ liệu toạ độ</Text>
                <Text style={styles.noMapSubtitle}>
                  Bức ảnh này không được lưu kèm vị trí GPS lúc chụp.
                </Text>
              </View>
            )}
          </View>

          {/* Nút xoá ở chân trang */}
          <TouchableOpacity
            style={styles.bottomDeleteBtn}
            onPress={handleDeletePress}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.bottomDeleteBtnText}>Xoá ảnh này khỏi máy</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerDeleteBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#0f172a',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  editIconBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginLeft: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
    marginLeft: 5,
  },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  regenBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 4,
  },
  descBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  editTitleBox: {
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  editDescBox: {
    marginTop: 6,
  },
  descInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    minHeight: 90,
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelEditBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
  },
  cancelEditBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  saveEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveEditBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  mapSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
    marginLeft: 5,
  },
  mapNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mapNavBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
    marginLeft: 3,
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  noMapBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noMapTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
  },
  noMapSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  bottomDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 18,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  bottomDeleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    marginLeft: 6,
  },
});

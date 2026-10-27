import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function PhotoCard({ photo, onPress, onDelete }) {
  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bức ảnh kỷ niệm này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa ngay', 
          style: 'destructive',
          onPress: () => onDelete(photo.id) 
        },
      ]
    );
  };

  const formattedDate = new Date(photo.timestamp).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.85} 
      onPress={() => onPress(photo)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: photo.uri }} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.dateBadge}>
          <Ionicons name="time-outline" size={12} color={THEME.colors.white} />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Vị trí chụp */}
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={15} color={THEME.colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {photo.location?.address || 'Chưa rõ vị trí'}
          </Text>
        </View>

        {/* Đoạn mô tả từ Gemini AI */}
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={13} color={THEME.colors.accent} />
          <Text style={styles.aiBadgeText}>Gemini AI sinh mô tả</Text>
        </View>
        <Text style={styles.descriptionText} numberOfLines={3}>
          {photo.description || 'Không có mô tả.'}
        </Text>

        {/* Thanh tác vụ */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.viewDetailBtn} 
            onPress={() => onPress(photo)}
          >
            <Ionicons name="eye-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.viewDetailText}>Xem chi tiết & Bản đồ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={THEME.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: THEME.colors.surfaceHighlight,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  dateBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    gap: 4,
  },
  dateText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '500',
  },
  content: {
    padding: THEME.spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  aiBadgeText: {
    color: THEME.colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewDetailText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
});

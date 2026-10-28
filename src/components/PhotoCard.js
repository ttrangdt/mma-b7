import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PhotoCard({ photo, onPress, onDelete }) {
  const dateFormatted = photo.timestamp
    ? new Date(photo.timestamp).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const hasLocation = photo.location && photo.location.latitude && photo.location.longitude;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress && onPress(photo)}
    >
      {/* Ảnh kỷ niệm */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Badge ngày giờ */}
        <View style={styles.dateBadge}>
          <Ionicons name="time-outline" size={12} color="#ffffff" />
          <Text style={styles.dateBadgeText}>{dateFormatted}</Text>
        </View>

        {/* Nút xoá nhanh */}
        <TouchableOpacity
          style={styles.deleteBtn}
          activeOpacity={0.8}
          onPress={() => onDelete && onDelete(photo.id, photo.title)}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Thông tin chi tiết bên dưới ảnh */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {photo.title || 'Khoảnh khắc đáng nhớ'}
        </Text>

        {/* Vị trí */}
        <View style={styles.metaRow}>
          <Ionicons
            name={hasLocation ? 'location' : 'location-outline'}
            size={14}
            color={hasLocation ? '#ef4444' : '#94a3b8'}
          />
          <Text
            style={[styles.locationText, !hasLocation && styles.noLocationText]}
            numberOfLines={1}
          >
            {hasLocation
              ? photo.location.address ||
                `${Number(photo.location.latitude).toFixed(4)}, ${Number(
                  photo.location.longitude
                ).toFixed(4)}`
              : 'Không có toạ độ'}
          </Text>
        </View>

        {/* Mô tả Gemini AI */}
        <View style={styles.aiBox}>
          <View style={styles.aiHeader}>
            <View style={styles.aiTag}>
              <Ionicons name="sparkles" size={11} color="#6366f1" />
              <Text style={styles.aiTagText}>Gemini AI</Text>
            </View>
            {photo.aiStatus === 'generating' && (
              <View style={styles.aiGenerating}>
                <ActivityIndicator size="small" color="#6366f1" />
                <Text style={styles.aiGeneratingText}>Đang tạo mô tả...</Text>
              </View>
            )}
          </View>
          <Text
            style={styles.aiDescription}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {photo.description || 'Chưa có mô tả chi tiết cho ảnh này.'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backdropFilter: 'blur(4px)',
  },
  dateBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 4,
    flex: 1,
  },
  noLocationText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  aiBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366f1',
    marginLeft: 3,
  },
  aiGenerating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiGeneratingText: {
    fontSize: 10,
    color: '#6366f1',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  aiDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
  },
});

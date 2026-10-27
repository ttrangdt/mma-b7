import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  Linking,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from './MapWrapper';
import { THEME } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function PhotoDetailModal({ photo, visible, onClose, onDelete }) {
  if (!photo) return null;

  const lat = photo.location?.latitude || 21.0124167;
  const lng = photo.location?.longitude || 105.5207831;

  const formattedDate = new Date(photo.timestamp).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const openGoogleMapsExternal = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa ảnh kỷ niệm',
      'Bạn có chắc chắn muốn xóa ảnh này khỏi danh sách?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            onDelete(photo.id);
            onClose();
          } 
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={THEME.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết kỷ niệm</Text>
          <TouchableOpacity style={styles.deleteIconBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color={THEME.colors.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Bức ảnh lớn */}
          <View style={styles.imageWrapper}>
            <Image source={{ uri: photo.uri }} style={styles.mainImage} resizeMode="cover" />
          </View>

          {/* Thời gian */}
          <View style={styles.timeRow}>
            <Ionicons name="calendar-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.timeText}>{formattedDate}</Text>
          </View>

          {/* Khối mô tả của Gemini AI */}
          <View style={styles.aiBox}>
            <View style={styles.aiBoxHeader}>
              <Ionicons name="sparkles" size={18} color={THEME.colors.accent} />
              <Text style={styles.aiBoxTitle}>Gemini AI phân tích hình ảnh</Text>
            </View>
            <Text style={styles.aiBoxContent}>{photo.description}</Text>
          </View>

          {/* Khối vị trí và Google Maps */}
          <View style={styles.mapSection}>
            <View style={styles.mapSectionHeader}>
              <View style={styles.mapHeaderLeft}>
                <Ionicons name="location" size={20} color={THEME.colors.primary} />
                <Text style={styles.mapSectionTitle}>Vị trí chụp trên Google Maps</Text>
              </View>
              <TouchableOpacity onPress={openGoogleMapsExternal} style={styles.extMapLink}>
                <Text style={styles.extMapText}>Mở app Maps</Text>
                <Ionicons name="open-outline" size={14} color={THEME.colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.addressText}>{photo.location?.address}</Text>
            <Text style={styles.coordsText}>
              Tọa độ: {lat.toFixed(6)}, {lng.toFixed(6)}
            </Text>

            {/* Google Map View */}
            <View style={styles.mapContainer}>
              {MapView && Marker && Platform.OS !== 'web' ? (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{ latitude: lat, longitude: lng }}
                    title="Vị trí bức ảnh"
                    description={photo.location?.address}
                  />
                </MapView>
              ) : (
                <View style={styles.webMapFallback}>
                  <Ionicons name="map-outline" size={40} color={THEME.colors.primary} />
                  <Text style={styles.fallbackTitle}>Bản đồ Google Maps</Text>
                  <Text style={styles.fallbackDesc}>
                    Lat: {lat.toFixed(5)} | Lng: {lng.toFixed(5)}
                  </Text>
                  <TouchableOpacity style={styles.fallbackBtn} onPress={openGoogleMapsExternal}>
                    <Text style={styles.fallbackBtnText}>Xem trực tiếp trên Google Maps</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  headerTitle: {
    color: THEME.colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 6,
  },
  deleteIconBtn: {
    padding: 6,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceHighlight,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: THEME.spacing.lg,
  },
  timeText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  aiBox: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    marginBottom: THEME.spacing.xl,
  },
  aiBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiBoxTitle: {
    color: THEME.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  aiBoxContent: {
    color: THEME.colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  mapSection: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  mapSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapSectionTitle: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  extMapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  extMapText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  coordsText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceLight,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: THEME.colors.surfaceHighlight,
  },
  fallbackTitle: {
    color: THEME.colors.text,
    fontWeight: '600',
    marginTop: 8,
  },
  fallbackDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  fallbackBtn: {
    marginTop: 10,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
  },
  fallbackBtnText: {
    color: THEME.colors.background,
    fontWeight: '700',
    fontSize: 12,
  },
});

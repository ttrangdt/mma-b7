import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LeafletMap from './LeafletMap';

export default function OverviewMapView({ photos, onSelectPhoto, onOpenCapture }) {
  // Lọc ra các bức ảnh có toạ độ hợp lệ
  const photosWithLocation = (photos || []).filter(
    (p) => p.location && p.location.latitude && p.location.longitude
  );

  const markers = photosWithLocation.map((p) => ({
    lat: p.location.latitude,
    lng: p.location.longitude,
    title: p.title || 'Ảnh kỷ niệm',
    address: p.location.address || '',
  }));

  if (photosWithLocation.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="map-outline" size={48} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>Chưa có ảnh nào có toạ độ GPS</Text>
        <Text style={styles.emptyDesc}>
          Khi bạn chụp ảnh bằng máy ảnh hoặc chọn ảnh có vị trí, các bức ảnh sẽ
          được ghim lên bản đồ này tự động!
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={onOpenCapture}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={18} color="#ffffff" />
          <Text style={styles.emptyBtnText}>Chụp ảnh có vị trí ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Thẻ bản đồ tổng hợp */}
      <View style={styles.mapCard}>
        <View style={styles.badgeBanner}>
          <Ionicons name="location" size={16} color="#ef4444" />
          <Text style={styles.badgeBannerText}>
            Đang hiển thị {photosWithLocation.length} địa điểm đã chụp
          </Text>
        </View>
        <LeafletMap
          markers={markers}
          height={320}
          showExternalButton={true}
          style={styles.mapStyle}
        />
      </View>

      {/* Danh sách địa điểm đã chụp */}
      <Text style={styles.listHeader}>Các địa điểm đã lưu</Text>
      <ScrollView
        style={styles.photoList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {photosWithLocation.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemRow}
            activeOpacity={0.75}
            onPress={() => onSelectPhoto(item)}
          >
            <Image source={{ uri: item.uri }} style={styles.itemThumb} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title || 'Khoảnh khắc'}
              </Text>
              <Text style={styles.itemAddress} numberOfLines={1}>
                {item.location.address ||
                  `${Number(item.location.latitude).toFixed(4)}, ${Number(
                    item.location.longitude
                  ).toFixed(4)}`}
              </Text>
              <Text style={styles.itemDate}>
                {new Date(item.timestamp).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  badgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff1f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe4e6',
  },
  badgeBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e11d48',
    marginLeft: 6,
  },
  mapStyle: {
    borderWidth: 0,
    borderRadius: 0,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 18,
    marginBottom: 10,
  },
  photoList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 30,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemThumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemAddress: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  itemDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f8fafc',
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});

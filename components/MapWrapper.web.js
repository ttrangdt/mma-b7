import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Web fallback component for Expo Snack Web preview
 * Giải quyết lỗi "o.UIManager.hasViewManagerConfig is not a function" trên Snack Web
 */
const MapView = ({ style, initialRegion, children }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.webBadge}>
        <Ionicons name="map-outline" size={24} color="#38BDF8" />
        <Text style={styles.webTitle}>Bản đồ Google Maps (Chế độ xem trước Web)</Text>
        <Text style={styles.webSub}>
          {initialRegion ? `Tọa độ trung tâm: ${initialRegion.latitude?.toFixed(4)}, ${initialRegion.longitude?.toFixed(4)}` : ''}
        </Text>
      </View>
      <View style={styles.markerContainer}>
        {children}
      </View>
    </View>
  );
};

export const Marker = ({ coordinate, title, description, onCalloutPress, children }) => {
  return (
    <TouchableOpacity 
      style={styles.markerCard} 
      activeOpacity={0.8}
      onPress={onCalloutPress}
    >
      <View style={styles.markerHeader}>
        <Ionicons name="location-sharp" size={16} color="#38BDF8" />
        <Text style={styles.markerTitle} numberOfLines={1}>{title || 'Ảnh kỷ niệm'}</Text>
      </View>
      {description ? (
        <Text style={styles.markerDesc} numberOfLines={2}>{description}</Text>
      ) : null}
      {coordinate ? (
        <Text style={styles.markerCoords}>
          ({coordinate.latitude?.toFixed(4)}, {coordinate.longitude?.toFixed(4)})
        </Text>
      ) : null}
      {children}
    </TouchableOpacity>
  );
};

export const Callout = ({ children }) => {
  return <View style={styles.calloutWrapper}>{children}</View>;
};

export const UrlTile = () => null;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27354A',
    padding: 16,
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webBadge: {
    alignItems: 'center',
    marginBottom: 12,
  },
  webTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 6,
  },
  webSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  markerContainer: {
    width: '100%',
    gap: 8,
  },
  markerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
    padding: 10,
    marginVertical: 4,
  },
  markerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  markerTitle: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  markerDesc: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 4,
  },
  markerCoords: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  calloutWrapper: {
    marginTop: 6,
  },
});

export default MapView;

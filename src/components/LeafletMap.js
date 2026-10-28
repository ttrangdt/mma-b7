import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { openInGoogleMaps } from '../services/locationService';

/**
 * Tạo mã HTML cho Leaflet Map hiển thị trên WebView hoặc iframe
 */
const generateLeafletHtml = ({ markers = [], center = [10.7769, 106.7009], zoom = 15 }) => {
  const markersJson = JSON.stringify(markers);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      padding: 4px;
    }
    .popup-card {
      font-size: 13px;
      line-height: 1.4;
      color: #1e293b;
      min-width: 160px;
    }
    .popup-title {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .popup-addr {
      font-size: 12px;
      color: #64748b;
    }
    .custom-pin {
      background: #ef4444;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      width: 22px;
      height: 22px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      var map = L.map('map', {
        zoomControl: true,
        attributionControl: false
      }).setView([${center[0]}, ${center[1]}], ${zoom});

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      var markers = ${markersJson};
      var group = [];

      markers.forEach(function(m) {
        if (!m.lat || !m.lng) return;
        var marker = L.marker([m.lat, m.lng]).addTo(map);
        group.push([m.lat, m.lng]);

        var content = '<div class="popup-card">';
        if (m.title) content += '<div class="popup-title">' + m.title + '</div>';
        if (m.address) content += '<div class="popup-addr">' + m.address + '</div>';
        content += '</div>';

        marker.bindPopup(content);
        if (markers.length === 1) {
          marker.openPopup();
        }
      });

      if (group.length > 1) {
        map.fitBounds(group, { padding: [40, 40] });
      }
    } catch(e) {
      document.body.innerHTML = '<div style="padding:20px;text-align:center;color:#ef4444;">Không thể tải bản đồ: ' + e.message + '</div>';
    }
  </script>
</body>
</html>
  `;
};

/**
 * Component hiển thị bản đồ tương tác Leaflet / OpenStreetMap (0đ chi phí, không cần Visa)
 * kết hợp nút mở nhanh trong Google Maps app
 */
export default function LeafletMap({
  latitude,
  longitude,
  address,
  title = 'Vị trí bức ảnh',
  markers = [],
  height = 240,
  showExternalButton = true,
  style,
}) {
  // Chuẩn bị danh sách marker
  const mapMarkers = useMemo(() => {
    if (markers && markers.length > 0) return markers;
    if (latitude && longitude) {
      return [{ lat: latitude, lng: longitude, title, address }];
    }
    return [];
  }, [markers, latitude, longitude, title, address]);

  const centerCoords = useMemo(() => {
    if (latitude && longitude) return [latitude, longitude];
    if (mapMarkers.length > 0) return [mapMarkers[0].lat, mapMarkers[0].lng];
    return [10.7769, 106.7009]; // Tọa độ mặc định (TP.HCM)
  }, [latitude, longitude, mapMarkers]);

  const htmlSource = useMemo(() => {
    return generateLeafletHtml({
      markers: mapMarkers,
      center: centerCoords,
      zoom: mapMarkers.length === 1 ? 16 : 13,
    });
  }, [mapMarkers, centerCoords]);

  // Nếu không có toạ độ
  if (mapMarkers.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }, style]}>
        <Ionicons name="location-outline" size={40} color="#94a3b8" />
        <Text style={styles.emptyTitle}>Chưa có thông tin toạ độ</Text>
        <Text style={styles.emptySubtitle}>
          Bức ảnh này được chụp hoặc tải lên mà không có dữ liệu GPS.
        </Text>
      </View>
    );
  }

  const activeLat = latitude || (mapMarkers[0] && mapMarkers[0].lat);
  const activeLng = longitude || (mapMarkers[0] && mapMarkers[0].lng);

  return (
    <View style={[styles.wrapper, { height }, style]}>
      {/* Bản đồ hiển thị trong WebView */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={htmlSource}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Leaflet Map"
          />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlSource }}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
              </View>
            )}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
          />
        )}
      </View>

      {/* Thanh thông tin và nút mở Google Maps ngoài */}
      {showExternalButton && activeLat && activeLng && (
        <View style={styles.footerBar}>
          <View style={styles.coordInfo}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="map" size={12} color="#2563eb" />
                <Text style={styles.badgeText}>OpenStreetMap 0đ</Text>
              </View>
              <Text style={styles.coordsText}>
                {Number(activeLat).toFixed(4)}, {Number(activeLng).toFixed(4)}
              </Text>
            </View>
            {address ? (
              <Text style={styles.addressText} numberOfLines={1}>
                {address}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.googleMapsBtn}
            activeOpacity={0.8}
            onPress={() => openInGoogleMaps(activeLat, activeLng, title)}
          >
            <Ionicons name="navigate-circle" size={18} color="#ffffff" />
            <Text style={styles.googleMapsBtnText}>Mở Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748b',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  coordInfo: {
    flex: 1,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 3,
  },
  coordsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  addressText: {
    fontSize: 11,
    color: '#64748b',
  },
  googleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  googleMapsBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
});

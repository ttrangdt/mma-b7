import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

/**
 * Xin quyền vị trí và lấy toạ độ hiện tại
 * @returns {Promise<{latitude: number, longitude: number, address: string} | null>}
 */
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Quyền truy cập vị trí bị từ chối');
      return null;
    }

    // Cố gắng lấy vị trí hiện tại với timeout hợp lý
    let position;
    try {
      position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    } catch (e) {
      // Fallback sang vị trí gần nhất nếu getCurrentPosition gặp timeout
      position = await Location.getLastKnownPositionAsync();
    }

    if (!position || !position.coords) {
      return null;
    }

    const { latitude, longitude } = position.coords;

    // Lấy tên địa chỉ tương ứng (Reverse Geocoding)
    let address = 'Vị trí đã chụp';
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const parts = [
          item.streetNumber ? `${item.streetNumber}` : null,
          item.street,
          item.subregion || item.district,
          item.city || item.region,
          item.country,
        ].filter(Boolean);

        if (parts.length > 0) {
          address = parts.join(', ');
        } else if (item.name) {
          address = item.name;
        }
      }
    } catch (geoErr) {
      console.warn('Không thể lấy địa chỉ chi tiết:', geoErr.message);
    }

    return {
      latitude,
      longitude,
      address,
    };
  } catch (error) {
    console.error('Lỗi khi lấy toạ độ vị trí:', error);
    return null;
  }
};

/**
 * Mở toạ độ trên ứng dụng Google Maps hoặc trình duyệt
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} label
 */
export const openInGoogleMaps = (latitude, longitude, label = 'Vị trí chụp ảnh') => {
  if (!latitude || !longitude) return;

  const encodedLabel = encodeURIComponent(label);
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  if (Platform.OS === 'ios') {
    // Có thể mở Apple Maps hoặc Google Maps
    const appleUrl = `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`;
    Linking.canOpenURL(appleUrl).then((supported) => {
      if (supported) {
        Linking.openURL(appleUrl);
      } else {
        Linking.openURL(webUrl);
      }
    }).catch(() => Linking.openURL(webUrl));
  } else if (Platform.OS === 'android') {
    const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`;
    Linking.canOpenURL(geoUrl).then((supported) => {
      if (supported) {
        Linking.openURL(geoUrl);
      } else {
        Linking.openURL(webUrl);
      }
    }).catch(() => Linking.openURL(webUrl));
  } else {
    // Web
    Linking.openURL(webUrl);
  }
};

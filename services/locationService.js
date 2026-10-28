import * as Location from 'expo-location';

// Vị trí mặc định (Hà Nội, Việt Nam - theo slide 15 của bài học)
const DEFAULT_COORDS = {
  latitude: 21.0124167,
  longitude: 105.5207831,
  address: 'Khu Công Nghệ Cao Hòa Lạc, Hà Nội, Việt Nam',
};

/**
 * Yêu cầu quyền vị trí và lấy tọa độ GPS hiện tại kèm địa chỉ thân thiện
 */
export const getCurrentLocationAndAddress = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('Quyền truy cập vị trí bị từ chối. Sử dụng vị trí mặc định.');
      return {
        ...DEFAULT_COORDS,
        permissionGranted: false,
      };
    }

    // Lấy vị trí với độ chính xác cân bằng để lấy nhanh
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;
    let address = 'Không xác định được địa chỉ cụ thể';

    try {
      const reverseList = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseList && reverseList.length > 0) {
        const item = reverseList[0];
        const parts = [
          item.name || item.street,
          item.district || item.subregion,
          item.city || item.region,
          item.country,
        ].filter(Boolean);
        
        if (parts.length > 0) {
          address = parts.join(', ');
        }
      }
    } catch (geocodeErr) {
      console.warn('Lỗi reverse geocode:', geocodeErr);
      address = `Tọa độ: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }

    return {
      latitude,
      longitude,
      address,
      permissionGranted: true,
    };
  } catch (error) {
    console.warn('Không thể lấy vị trí hiện tại. Dùng vị trí dự phòng:', error);
    return {
      ...DEFAULT_COORDS,
      permissionGranted: false,
    };
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PHOTOS: '@ai_photo_memories_photos',
  API_KEY: '@ai_photo_memories_gemini_key',
  VIETMAP_KEY: '@ai_photo_memories_vietmap_key',
};

/**
 * Lấy danh sách tất cả các ảnh đã lưu từ AsyncStorage
 */
export const getStoredPhotos = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PHOTOS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Lỗi khi đọc danh sách ảnh từ AsyncStorage:', error);
    return [];
  }
};

/**
 * Lưu một ảnh mới vào AsyncStorage
 * @param {Object} photo - Đối tượng ảnh gồm id, uri, location, description, timestamp
 */
export const savePhoto = async (photo) => {
  try {
    const existing = await getStoredPhotos();
    const updated = [photo, ...existing];
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Lỗi khi lưu ảnh vào AsyncStorage:', error);
    throw error;
  }
};

/**
 * Xóa một ảnh theo id khỏi AsyncStorage
 * @param {string} id - Id của ảnh cần xóa
 */
export const deletePhoto = async (id) => {
  try {
    const existing = await getStoredPhotos();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Lỗi khi xóa ảnh khỏi AsyncStorage:', error);
    throw error;
  }
};

/**
 * Xóa toàn bộ ảnh trong bộ nhớ (Dùng khi reset dữ liệu)
 */
export const clearAllPhotos = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PHOTOS);
    return [];
  } catch (error) {
    console.error('Lỗi khi xóa toàn bộ ảnh:', error);
    throw error;
  }
};

/**
 * Lấy Gemini API Key đã lưu
 */
export const getStoredApiKey = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
  } catch (error) {
    console.error('Lỗi khi đọc API Key:', error);
    return null;
  }
};

/**
 * Lưu Gemini API Key
 * @param {string} key - API Key của Google Gemini
 */
export const saveStoredApiKey = async (key) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu API Key:', error);
    return false;
  }
};

/**
 * Lấy VietMap API Key đã lưu
 */
export const getStoredVietmapKey = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.VIETMAP_KEY);
  } catch (error) {
    console.error('Lỗi khi đọc VietMap API Key:', error);
    return null;
  }
};

/**
 * Lưu VietMap API Key
 */
export const saveStoredVietmapKey = async (key) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.VIETMAP_KEY, key.trim());
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu VietMap API Key:', error);
    return false;
  }
};

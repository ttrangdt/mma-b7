import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@photo_memory_list_v1';
const API_KEY_STORAGE = '@gemini_api_key_v1';
export const DEFAULT_GEMINI_KEY = 'AIzaSyDRmSdKWPGV63tA1chj5cYIrwMjptyoe5Q';

/**
 * Lấy danh sách tất cả các ảnh đã lưu từ AsyncStorage
 */
export const getPhotos = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!jsonValue) return [];
    const list = JSON.parse(jsonValue);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error('Lỗi khi tải danh sách ảnh:', error);
    return [];
  }
};

/**
 * Lưu danh sách ảnh vào AsyncStorage
 */
export const savePhotos = async (photos) => {
  try {
    const jsonValue = JSON.stringify(photos);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu danh sách ảnh:', error);
    return false;
  }
};

/**
 * Thêm một ảnh mới vào đầu danh sách
 */
export const addPhoto = async (photoItem) => {
  try {
    const current = await getPhotos();
    const updated = [photoItem, ...current];
    await savePhotos(updated);
    return updated;
  } catch (error) {
    console.error('Lỗi khi thêm ảnh:', error);
    return null;
  }
};

/**
 * Cập nhật thông tin của một bức ảnh
 */
export const updatePhoto = async (id, updates) => {
  try {
    const current = await getPhotos();
    const updated = current.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    await savePhotos(updated);
    return updated;
  } catch (error) {
    console.error('Lỗi khi cập nhật ảnh:', error);
    return null;
  }
};

/**
 * Xoá một bức ảnh theo id
 */
export const deletePhoto = async (id) => {
  try {
    const current = await getPhotos();
    const updated = current.filter((item) => item.id !== id);
    await savePhotos(updated);
    return updated;
  } catch (error) {
    console.error('Lỗi khi xoá ảnh:', error);
    return null;
  }
};

/**
 * Xoá toàn bộ ảnh
 */
export const clearAllPhotos = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (error) {
    console.error('Lỗi khi xoá toàn bộ ảnh:', error);
    return [];
  }
};

/**
 * Lấy Gemini API key (từ storage hoặc mặc định)
 */
export const getGeminiApiKey = async () => {
  try {
    const stored = await AsyncStorage.getItem(API_KEY_STORAGE);
    return stored && stored.trim().length > 0 ? stored.trim() : DEFAULT_GEMINI_KEY;
  } catch (e) {
    return DEFAULT_GEMINI_KEY;
  }
};

/**
 * Lưu Gemini API key tùy chỉnh
 */
export const saveGeminiApiKey = async (newKey) => {
  try {
    if (!newKey || newKey.trim().length === 0) {
      await AsyncStorage.removeItem(API_KEY_STORAGE);
      return DEFAULT_GEMINI_KEY;
    }
    const cleanKey = newKey.trim();
    await AsyncStorage.setItem(API_KEY_STORAGE, cleanKey);
    return cleanKey;
  } catch (e) {
    console.error('Lỗi lưu API key:', e);
    return DEFAULT_GEMINI_KEY;
  }
};

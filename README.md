# Photo Memory Map AI (Expo / React Native)

Ứng dụng di động chụp và xem lại ảnh kỷ niệm thông minh, tích hợp:
1. **Google Maps & Leaflet OpenStreetMap (0đ)**: Xem lại vị trí bức ảnh ngay trên giao diện app và mở chuyển tiếp trực tiếp vào ứng dụng Google Maps.
2. **Google Gemini AI**: Tự động phân tích ảnh và sinh đoạn mô tả sinh động (hỗ trợ nhập Custom API Key & có chế độ fallback thông minh nếu hết hạn mức).
3. **Image Picker**: Chụp ảnh trực tiếp từ camera hoặc chọn ảnh từ thư viện thiết bị.
4. **AsyncStorage**: Lưu trữ danh sách ảnh cục bộ, tự động phục hồi khi mở lại app.
5. **Quản lý & Xoá ảnh**: Cho phép xem chi tiết, sửa tiêu đề/mô tả và xoá ảnh (đơn lẻ hoặc tất cả).
6. **Tương thích hoàn toàn với Expo Snack**: Cấu hình chuẩn Expo SDK 52, có thể import trực tiếp từ Git lên [snack.expo.dev](https://snack.expo.dev).

---

## 🚀 Các tính năng chính

### 1. Chụp ảnh & Định vị GPS
- Sử dụng `expo-image-picker` để khởi động máy ảnh (`launchCameraAsync`) và chọn ảnh từ thư viện (`launchImageLibraryAsync`).
- Sử dụng `expo-location` để tự động lấy toạ độ GPS (`latitude`, `longitude`) ngay khi chụp ảnh, đồng thời thực hiện **Reverse Geocoding** để chuyển đổi toạ độ sang địa chỉ tên đường, quận/huyện, thành phố thân thiện với người dùng.

### 2. Bản đồ vị trí chụp ảnh (Giải pháp 0đ, không cần thẻ Visa)
- **Bản đồ tương tác trong ứng dụng**: Dùng `react-native-webview` hiển thị Leaflet + OpenStreetMap hoàn toàn miễn phí, không yêu cầu thẻ tín dụng hay Google Maps billing.
- **Marker & Popup**: Hiển thị ghim đỏ tại toạ độ chụp cùng thông tin tiêu đề và địa chỉ.
- **Nút "Mở Google Maps"**: Gọi `Linking.openURL` để chuyển tiếp nhanh sang ứng dụng Google Maps chính thức của thiết bị (hoặc trình duyệt) để người dùng xem đường đi hoặc chế độ Street View.
- **Tab "Bản đồ kỷ niệm" (Overview Map)**: Ghim tất cả các bức ảnh đã chụp lên cùng một bản đồ tổng quan.

### 3. Phân tích ảnh với Google Gemini AI
- Gửi ảnh dạng base64 qua API Gemini (`gemini-2.5-flash`, `gemini-flash-latest`,...) để AI đóng vai trợ lý du lịch, viết mô tả ngắn gọn, sinh động bằng tiếng Việt.
- Tích hợp nút **"Cài đặt API Key"** trên thanh Header: người dùng có thể nhập API Key riêng của mình, kiểm tra kết nối (Ping test) hoặc đặt lại API Key ban đầu.
- **Cơ chế Graceful Degradation (Dự phòng thông minh)**: Nếu API Key gặp lỗi hạn mức (Code 402/429 Prepayment credits depleted), app sẽ tự động tạo mô tả mẫu theo địa danh & thời gian và hiển thị thông báo hướng dẫn, không bao giờ để ứng dụng bị crash hay kẹt màn hình.

### 4. Lưu trữ bền vững với AsyncStorage
- Mọi dữ liệu (ảnh, toạ độ, địa chỉ, mô tả AI, thời gian) được lưu trữ vào `@react-native-async-storage/async-storage`.
- Tự động tải lại đầy đủ khi người dùng tắt app và mở lại.

### 5. Quản lý ảnh
- Chạm vào từng ảnh để mở **Photo Detail Modal**: xem ảnh full size, vị trí trên bản đồ, nút "Tạo lại mô tả AI" và chỉnh sửa nội dung.
- Nút xoá ảnh có hộp thoại cảnh báo xác nhận an toàn.

---

## 📂 Cấu trúc thư mục

```
bonus7/
├── App.js                     # Giao diện chính, điều hướng tab và luồng xử lý
├── index.js                   # Điểm khởi chạy của Expo
├── app.json                   # Cấu hình app và cấp quyền camera, location
├── package.json               # Dependencies chuẩn Expo SDK 52
├── babel.config.js            # Babel preset expo
└── src/
    ├── services/
    │   ├── storageService.js  # Thao tác AsyncStorage (get, add, update, delete)
    │   ├── locationService.js # Lấy GPS, Reverse Geocoding & mở Google Maps
    │   └── geminiService.js   # Gọi Gemini Vision API & sinh mô tả fallback
    └── components/
        ├── LeafletMap.js      # Bản đồ Leaflet WebView + nút Google Maps
        ├── PhotoCard.js       # Thẻ hiển thị từng bức ảnh trong danh sách
        ├── PhotoDetailModal.js# Modal xem chi tiết ảnh, bản đồ & sửa thông tin
        ├── OverviewMapView.js # Bản đồ tổng hợp tất cả ảnh đã chụp
        └── ApiKeyModal.js     # Modal kiểm tra và đổi Gemini API Key
```

---

## 🛠 Hướng dẫn chạy tại máy nội bộ

1. Cài đặt các gói phụ thuộc (nếu chưa):
   ```bash
   npm install
   ```

2. Kiểm tra sức khoẻ cấu hình Expo:
   ```bash
   npx expo-doctor
   ```

3. Khởi động ứng dụng:
   ```bash
   npx expo start
   ```
   - Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại Android hoặc iOS.
   - Hoặc nhấn phím `w` để chạy thử trên trình duyệt web.

---

## 🌐 Hướng dẫn import lên Expo Snack (snack.expo.dev)

1. Đẩy mã nguồn này lên repository GitHub cá nhân:
   ```bash
   git add .
   git commit -m "Hoàn thiện Photo Memory Map AI"
   git push origin main
   ```
2. Truy cập [https://snack.expo.dev](https://snack.expo.dev).
3. Chọn menu **Import Git Repository** và dán đường link repo GitHub của bạn vào.
4. Expo Snack sẽ tự động nhận diện `App.js` và các dependencies trong `package.json` (Expo SDK 52) để chạy ngay lập tức trên web hoặc qua Expo Go!

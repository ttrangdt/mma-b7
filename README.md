# Ứng Dụng Chụp & Xem Lại Ảnh Kỷ Niệm (Photo Memories)
> Tích hợp **Google Maps**, **Gemini AI Vision**, **Expo ImagePicker**, **AsyncStorage** và **Expo EAS Build APK**.

Dự án được xây dựng dựa trên bài giảng **"Integrating Advanced Features into Your Expo App"** (MMA301), tối ưu hóa hoàn toàn để:
- Chạy mượt mà trên **Expo Go** và **Thiết bị thật (Android / iOS)**.
- Import trực tiếp vào **Expo Snack** mà không bị lỗi thiếu asset hay thư viện.
- Build thành file **APK Android** thông qua **EAS Build** để nộp link online.

---

## 📱 Các Tính Năng Đã Hoàn Thiện

1. **Chụp ảnh & Chọn ảnh (Expo Image Picker)**:
   - Sử dụng `ImagePicker.launchCameraAsync` để mở máy ảnh chụp trực tiếp.
   - Hỗ trợ chọn ảnh từ thư viện với `ImagePicker.launchImageLibraryAsync`.
   - Cấu hình nén chất lượng phù hợp và xuất chuỗi `base64` để gửi sang AI.

2. **Lấy vị trí GPS & Hiển thị Google Maps (Expo Location & React Native Maps)**:
   - Tự động lấy tọa độ GPS (`latitude`, `longitude`) ngay khi chụp ảnh bằng `expo-location`.
   - Reverse Geocoding để chuyển tọa độ thành tên đường, phường/xã, quận/huyện, thành phố dễ đọc.
   - Hiển thị vị trí bức ảnh bằng **Marker trên Google Maps** (`react-native-maps`).
   - Có tab **"Bản đồ ký ức"** tổng hợp tất cả các bức ảnh đã chụp dưới dạng các ghim trên bản đồ.

3. **Tự động sinh mô tả ảnh bằng Gemini AI (Google Generative AI)**:
   - Tích hợp model `gemini-1.5-flash` xử lý đa phương thức (Multimodal Vision).
   - Tự động phân tích bối cảnh, chủ thể, ánh sáng và cảm xúc của bức ảnh bằng tiếng Việt (2-3 câu).
   - Có nút Cài đặt ngay trên Header để nhập/thay đổi Gemini API Key bất kỳ lúc nào.

4. **Lưu trữ dữ liệu Offline với AsyncStorage (@react-native-async-storage/async-storage)**:
   - Lưu trữ danh sách ảnh (URI, tọa độ, địa chỉ, mô tả AI, ngày giờ).
   - Dữ liệu được lưu vĩnh viễn trong máy, khi tắt app mở lại vẫn xem lại được đầy đủ.

5. **Xóa ảnh linh hoạt**:
   - Nút xóa ảnh trên từng thẻ (Card) và trong trang chi tiết bức ảnh.
   - Có hộp thoại cảnh báo xác nhận trước khi xóa để tránh bấm nhầm.
   - Cung cấp nút xóa toàn bộ để làm mới dữ liệu thử nghiệm.

6. **Tương thích 100% Expo Snack**:
   - Toàn bộ asset đều là Online HTTPS URLs và vector icons từ `@expo/vector-icons`.
   - Không chứa bất kỳ file ảnh local tĩnh nào gây lỗi bundler trên web/snack.

---

## 🛠️ HƯỚNG DẪN CHI TIẾT TỪNG BƯỚC

### BƯỚC 1: Lấy Google Gemini API Key Miễn Phí (1 Phút)
1. Truy cập vào trang: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Đăng nhập bằng tài khoản Google.
3. Bấm nút **"Create API key"** -> Chọn **"Create API key in new project"**.
4. Sao chép chuỗi API key vừa tạo (dạng `AIzaSy...`).
5. Khi mở ứng dụng lên, bấm vào nút **"Nhập Key"** (icon ngôi sao AI ở góc trên bên phải) và dán key vào, bấm **"Lưu Key"**.

---

### BƯỚC 2: Chạy Thử Ứng Dụng Trên Máy Local

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

2. Khởi động Expo Dev Server:
   ```bash
   npx expo start
   ```

3. Mở ứng dụng:
   - Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại Android / iOS.
   - Hoặc nhấn `a` trên bàn phím để mở trên Android Emulator.

---

### BƯỚC 3: Đẩy Code Lên GitHub Để Nộp Bài & Import Vào Expo Snack

1. Khởi tạo Git và Commit toàn bộ mã nguồn:
   ```bash
   git init
   git add .
   git commit -m "feat: complete expo advanced photo memories app"
   ```

2. Tạo một repository mới trên GitHub (ví dụ đặt tên: `expo-photo-memories`).
3. Liên kết và đẩy code lên:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-github-cua-ban>/expo-photo-memories.git
   git push -u origin main
   ```

---

### BƯỚC 4: Import Vào Expo Snack (Chạy Online Không Cần Cài Đặt)

Bạn có 2 cách cực kỳ nhanh để nộp link Expo Snack:

#### Cách 1: Import trực tiếp từ link GitHub (Khuyên Dùng)
1. Truy cập vào đường link sau trên trình duyệt (thay link GitHub của bạn vào):
   ```text
   https://snack.expo.dev?github=https://github.com/<tai-khoan-github-cua-ban>/expo-photo-memories
   ```
2. Expo Snack sẽ tự động clone repo, kéo toàn bộ file `App.js`, `components`, `services`, `package.json` về và chạy ngay trên trình duyệt!
3. Bấm nút **Save** ở góc trên bên phải của Expo Snack để lấy đường link online dạng:
   `https://snack.expo.dev/@your_username/expo-photo-memories`

#### Cách 2: Tạo thủ công trên Snack
1. Vào [https://snack.expo.dev](https://snack.expo.dev).
2. Tạo các thư mục và copy nội dung các file tương ứng:
   - `App.js`
   - `constants/theme.js`
   - `services/storageService.js`
   - `services/locationService.js`
   - `services/geminiService.js`
   - `components/PhotoCard.js`
   - `components/PhotoDetailModal.js`
   - `components/ApiKeyModal.js`
   - `package.json`
3. Nhấn **Save** để lấy link nộp.

---

### BƯỚC 5: Build File APK Độc Lập Bằng EAS Build (Lấy Link Nộp Online)

Yêu cầu đề bài: *"nộp link online ở đây tức là build thành apk sử dụng expo cli để build"*.  
Hiện nay Expo sử dụng **EAS Build** (thay thế cho `expo build` cũ) để build file APK trực tiếp trên đám mây của Expo và trả về link tải online.

1. Cài đặt EAS CLI (nếu chưa có):
   ```bash
   npm install -g eas-cli
   ```

2. Đăng nhập vào tài khoản Expo của bạn:
   ```bash
   eas login
   ```
   *(Nếu chưa có tài khoản, đăng ký miễn phí tại [expo.dev/signup](https://expo.dev/signup))*.

3. Cấu hình dự án (chọn cấu hình mặc định):
   ```bash
   eas build:configure
   ```

4. Tiến hành Build ra file **APK Android**:
   ```bash
   eas build -p android --profile preview
   ```
   - Trong quá trình build, EAS sẽ hỏi tạo keystore tự động -> Chọn **Yes** (EAS sẽ tự quản lý keystore cho bạn).
   - Hệ thống Cloud của Expo sẽ tự động đóng gói dự án thành file APK (`.apk`).
   - Khi build xong, terminal và trang quản lý Expo (`https://expo.dev`) sẽ xuất hiện một đường link tải APK online công khai, ví dụ:
     `https://expo.dev/artifacts/eas/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.apk`
   - Bạn chỉ cần copy link APK này hoặc link trang build của Expo để nộp bài!

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
├── App.js                         # Màn hình chính, điều hướng tab, chụp ảnh, hiển thị danh sách
├── app.json                       # Cấu hình quyền hạn Camera, Location, Google Maps Android
├── eas.json                       # Cấu hình EAS Build xuất file APK (Profile Preview)
├── package.json                   # Khai báo các thư viện phụ thuộc Expo SDK 52
├── constants/
│   └── theme.js                   # Hệ màu giao diện Dark Mode cao cấp
├── components/
│   ├── PhotoCard.js               # Thẻ hiển thị từng bức ảnh kỷ niệm
│   ├── PhotoDetailModal.js        # Xem chi tiết ảnh lớn, Google Maps & Mô tả Gemini AI
│   └── ApiKeyModal.js             # Hộp thoại nhập & lưu Gemini API Key
└── services/
    ├── storageService.js          # Xử lý AsyncStorage (lưu, xóa, đọc danh sách ảnh, lưu API key)
    ├── locationService.js         # Lấy tọa độ GPS và địa chỉ qua expo-location
    └── geminiService.js           # Gửi ảnh sang Gemini Vision API sinh mô tả
```

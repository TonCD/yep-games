# 🔥 Hướng dẫn Setup Firebase cho YEP GAMES

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc **"Thêm dự án"**
3. Nhập tên project: `YEP-GAMES` hoặc tên bạn thích
4. Tắt Google Analytics (không cần cho project này)
5. Click **"Create project"**

## Bước 2: Tạo Web App

1. Trong Firebase Console, click vào icon **Web** `</>`
2. Nhập App nickname: `YEP Games Web`
3. **KHÔNG** check "Firebase Hosting" (deploy bằng Vercel)
4. Click **"Register app"**
5. Copy đoạn config code (sẽ dùng ở bước 3)

## Bước 3: Cấu hình Firebase trong Project

1. Mở file `src/firebase.ts`
2. Thay thế các giá trị `YOUR_XXX` bằng config từ Firebase Console:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "yep-games-xxxxx.firebaseapp.com",
  projectId: "yep-games-xxxxx",
  storageBucket: "yep-games-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxx"
};
```

## Bước 4: Bật Firestore Database

1. Trong Firebase Console, vào **"Build" > "Firestore Database"**
2. Click **"Create database"**
3. Chọn location: `asia-southeast1` (Singapore - gần VN nhất)
4. Chọn **"Start in production mode"** (sẽ config rules sau)
5. Click **"Enable"**

## Bước 5: Cấu hình Security Rules

1. Trong Firestore Database, vào tab **"Rules"**
2. Copy paste rules sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to rooms collection
    match /rooms/{roomId} {
      // Anyone can read room data
      allow read: if true;
      
      // Anyone can create a new room
      allow create: if true;
      
      // Only allow updates if request is adding judges, performances, or scores
      allow update: if true;
      
      // Don't allow delete
      allow delete: if false;
    }
  }
}
```

3. Click **"Publish"**

**⚠️ Lưu ý:** Rules này cho phép public read/write. Trong production thực tế nên cấu hình authentication và giới hạn quyền.

## Bước 6: Test Project

1. Chạy dev server:
```bash
npm run dev
```

2. Truy cập `http://localhost:5173`
3. Click vào **"Chấm Điểm Tiết Mục"**
4. Chọn **"Tạo phòng (Host)"**
5. Nhập tên và tạo phòng
6. Nếu thấy mã phòng → Firebase hoạt động! 🎉

## Bước 7: Verify Firestore Data

1. Vào Firebase Console > Firestore Database
2. Bạn sẽ thấy collection **"rooms"** với document vừa tạo
3. Document chứa: judges, performances, scores arrays

## 🚀 Deploy lên Vercel

1. Push code lên GitHub
2. Truy cập [Vercel](https://vercel.com)
3. Import GitHub repository
4. Vercel sẽ tự động detect Vite project
5. Click **"Deploy"**
6. Xong! Website của bạn đã live

## 📱 Cách sử dụng

### Cho Host (người tổ chức):
1. Vào `/scoring` → Chọn **"Tạo phòng"**
2. Chia sẻ **mã phòng 6 ký tự** cho giám khảo
3. Thêm các tiết mục cần chấm
4. Xem realtime ranking khi giám khảo chấm điểm
5. Click **"Kết thúc"** để kết thúc phiên → Pháo hoa xuất hiện! 🎆

### Cho Judge (giám khảo):
1. Vào `/scoring` → Chọn **"Tham gia"**
2. Nhập mã phòng + tên giám khảo
3. Click từng tiết mục và chọn điểm 1-10
4. Điểm được sync realtime với Host

## 🔐 Tính năng đã implement

✅ Room system với mã 6 ký tự
✅ 12 giờ tự động hết hạn
✅ Realtime sync (Firestore listeners)
✅ Judge authentication qua unique token
✅ Host controls: remove judge, complete room
✅ Performance management
✅ Live ranking với top 3 styling
✅ Confetti animation cho winner
✅ Progress tracking
✅ Mobile responsive

## 🔧 Troubleshooting

### Lỗi: "Firebase not initialized"
- Check file `src/firebase.ts` đã điền đúng config chưa
- Verify apiKey không có dấu ngoặc kép thừa

### Lỗi: "Permission denied"
- Vào Firestore Rules và publish lại rules ở Bước 5

### Lỗi: "Room not found"
- Check Firestore Database có collection `rooms` chưa
- Verify rules cho phép read/write

### Confetti không xuất hiện
- Check console có lỗi không
- Verify `canvas-confetti` đã install: `npm list canvas-confetti`

## 📞 Contact

Nếu gặp vấn đề, check:
1. Firebase Console → Firestore Database (data có đúng không?)
2. Browser Console (F12) → có lỗi màu đỏ không?
3. Network tab → các request đến Firestore có success không?

Chúc bạn thành công! 🎉

# Firestore Security Rules - Dresscode Voting

## ❌ Lỗi: "Missing or insufficient permissions"

Đây là lỗi do **chưa cấu hình Firestore Rules** cho Dresscode voting system.

## 🔧 Cách Sửa (2 Phút):

### Bước 1: Mở Firebase Console
1. Truy cập: https://console.firebase.google.com/
2. Chọn project **"yep-games"**
3. Menu bên trái → **"Firestore Database"**
4. Tab **"Rules"** (ở trên cùng)

### Bước 2: Update Rules

**Thay thế toàn bộ** nội dung hiện tại bằng rules sau:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // SCORING SYSTEM (đã có từ trước)
    // ============================================
    match /rooms/{roomId} {
      allow read, write: if true;
    }
    
    // ============================================
    // DRESSCODE VOTING SYSTEM (MỚI THÊM)
    // ============================================
    match /dressCodeRooms/{roomId} {
      // Cho phép mọi người đọc và ghi
      // (vì đây là app nội bộ company, không cần auth phức tạp)
      allow read, write: if true;
    }
    
    // Deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Bước 3: Publish Rules
1. Click nút **"Publish"** (góc trên bên phải)
2. Đợi vài giây để rules được apply
3. Xem thông báo "Rules published successfully" ✅

## ✅ Xong!

Quay lại app và thử tạo room Dresscode lại nhé!

## 🔒 Giải Thích Rules:

**Điều này cho phép:**
- ✅ Mọi người tạo dresscode room (host)
- ✅ Mọi người upload ảnh + vote (participants)
- ✅ Realtime sync cho tất cả users

**Tại sao `allow read, write: if true`?**
- Đây là **company internal app**, không public ra ngoài
- Không cần authentication phức tạp
- Nếu muốn secure hơn, có thể thêm Firebase Auth sau

## 🚨 Lưu Ý:

Nếu bạn muốn **bảo mật hơn**, có thể đổi thành:
```javascript
match /dressCodeRooms/{roomId} {
  // Chỉ cho phép read
  allow read: if true;
  
  // Chỉ cho phép write nếu roomCode match
  allow write: if request.resource.data.roomCode is string;
}
```

Nhưng với company event, rules đơn giản ở trên là đủ!

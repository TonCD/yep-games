# Firestore Security Rules - CẬP NHẬT CHO SPY GAME

## 🔥 FIRESTORE RULES MỚI (Bao gồm Spy Game)

### 📍 Cách Cập Nhật:

1. Truy cập: https://console.firebase.google.com/
2. Chọn project **"yep-games"**
3. Menu bên trái → **"Firestore Database"**
4. Tab **"Rules"** (ở trên cùng)
5. **THAY THẾ TOÀN BỘ** nội dung bằng rules bên dưới
6. Click **"Publish"** ✅

---

## 📋 RULES ĐẦY ĐỦ (Copy toàn bộ):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // SCORING SYSTEM
    // ============================================
    match /rooms/{roomId} {
      // Cho phép tất cả read/write cho Scoring game
      allow read, write: if true;
    }
    
    // ============================================
    // DRESSCODE VOTING SYSTEM
    // ============================================
    match /dressCodeRooms/{roomId} {
      // Cho phép tất cả read/write cho Dresscode voting
      allow read, write: if true;
    }
    
    // ============================================
    // SPY GAME (MỚI THÊM) 🕵️
    // ============================================
    match /spyRooms/{roomId} {
      // Cho phép tất cả read/write cho Spy game
      allow read, write: if true;
    }
    
    // ============================================
    // DENY ALL OTHER COLLECTIONS
    // ============================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## ✅ SAU KHI PUBLISH:

**Rules sẽ cho phép:**
- ✅ Host tạo spy room
- ✅ Players join room và nhận từ khóa
- ✅ Host loại người chơi realtime
- ✅ Auto-delete sau 12 giờ (logic trong code)

**Tại sao `allow read, write: if true`?**
- Đây là **company internal app**, không public
- Dùng trong các buổi YEP party nội bộ
- Không cần Firebase Auth phức tạp

---

## 🔒 (TÙY CHỌN) Rules Bảo Mật Hơn:

Nếu muốn kiểm soát chặt chẽ hơn:

```javascript
match /spyRooms/{roomId} {
  // Cho phép đọc với mọi người
  allow read: if true;
  
  // Chỉ cho phép tạo room mới (create)
  allow create: if request.resource.data.code is string 
                && request.resource.data.players is list;
  
  // Cho phép update nếu có players array
  allow update: if request.resource.data.players is list;
  
  // Không cho phép xóa (dùng auto-delete sau 12h)
  allow delete: if false;
}
```

**Nhưng với YEP party, rules đơn giản ở trên là đủ!** 🎮

---

## ⚠️ LƯU Ý:

- Rules này áp dụng cho **TẤT CẢ 3 GAME**: Scoring, Dresscode, Spy
- Nếu gặp lỗi "Missing or insufficient permissions" → Chưa publish rules
- Rules update trong vài giây, không cần restart app

---

## 🚀 TEST SAU KHI PUBLISH:

1. Tạo Spy room → Thành công ✅
2. Players join → Thành công ✅
3. Host bắt đầu game → Thành công ✅
4. Loại người chơi → Thành công ✅

**Done!** 🎉

# 🎮 GETELL YEP GAMES

[![en](https://img.shields.io/badge/lang-English-blue.svg)](README.md)
[![vn](https://img.shields.io/badge/lang-Tiếng_Việt-red.svg)](README_VN.md)
[![cn](https://img.shields.io/badge/lang-中文-yellow.svg)](README_CN.md)

Mini-games website for GETELL company team building activities and events.

## 🎯 Games

### 1. 🎡 Lucky Wheel
- Enter participant list (one per line)
- Realtime wheel updates
- Click center icon to spin
- Smooth animations

### 2. 🎲 Bingo
- Set number range (20-100)
- Random draw without duplicates
- Grid displays drawn numbers
- Track history and progress

### 3. 🎭 Performance Scoring System
**Room-based system with Firebase Firestore**

#### For Host:
- Create room with 6-character code
- Add/remove judges
- Add performances
- View realtime rankings
- Countdown animation (Top 5 → Top 1)
- Confetti on results reveal 🎆

#### For Judges:
- Join with 6-character code
- Score 1-10 for each performance
- Realtime sync
- Track progress

### 4. 👗 Dresscode Vote
**Voting system with images (Firebase Firestore + Base64)**

#### For Host:
- Create room with 6-character code
- Copy share link for everyone
- View realtime: participants, voted count
- Visual progress bars
- Results with:
  - Fade-up animation (Rank 3 → 2 → 1)
  - 3-tier podium 🏆
  - Winner confetti 🎉

#### For Participants:
- **Upload Phase**:
  - Enter name
  - Take/upload dresscode photo (auto compress)
  - Write message
- **Voting Phase**:
  - Vote for up to 3 people
  - Cannot vote for yourself
  - One-time voting (no revoting)
- Device-based tracking (localStorage)

#### Technical Features:
- ✅ Base64 image storage (no Firebase Storage needed)
- ✅ Auto compress images: 2-8MB → 100-300KB
- ✅ Device fingerprint tracking
- ✅ Realtime sync
- ✅ Podium animation with tiers
- ✅ Mobile responsive

## 🛠️ Tech Stack

- **Frontend**: React 19.2.0 + TypeScript
- **Build**: Vite 7.2.5 (rolldown)
- **Styling**: Tailwind CSS 3.4.17
- **Animation**: Framer Motion 12.27.5
- **Database**: Firebase Firestore 12.8.0
- **Effects**: canvas-confetti
- **Router**: React Router DOM 7.1.3

## 📦 Installation & Local Setup

```bash
# Clone repository
git clone https://github.com/TonCD/yep-games.git
cd yep-games

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open http://localhost:5173

## 🔥 Firebase Setup

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Create new project: "yep-games"
3. Select "Continue" → "Default Account" → "Create project"

### Step 2: Add Web App
1. Project Overview → Add app → Web (</> icon)
2. Nickname: "YEP Games Web"
3. **DO NOT** check "Firebase Hosting"
4. Register app → Copy config

### Step 3: Enable Firestore
1. Build → Firestore Database → Create database
2. Choose location: asia-southeast1
3. Start in **production mode**

### Step 4: Setup Security Rules
Go to Firestore → Rules → Paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Scoring System
    match /rooms/{roomId} {
      allow read, write: if true;
    }
    
    // Dresscode Voting System
    match /dressCodeRooms/{roomId} {
      allow read, write: if true;
    }
  }
}
```

Click **Publish**

### Step 5: Update Code
File `src/firebase.ts` has default config. If you want to use your Firebase project, replace config in that file or create `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Note:** Firebase API keys are **safe to expose publicly** according to [Google's official documentation](https://firebase.google.com/docs/projects/api-keys). Real security comes from Firestore Security Rules.

## 🚀 Deployment

### Option 1: Vercel (Recommended - Free & Fast)

1. **Create GitHub Repo:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to https://vercel.com/
   - Login with GitHub
   - Click "Add New" → "Project"
   - Import your repo
   - Framework Preset: **Vite**
   - Click "Deploy"
   - Wait 1-2 minutes → Done! ✅

3. **URL:** `https://your-project.vercel.app`

### Option 2: Netlify (Free)

1. Push code to GitHub (as above)

2. **Deploy:**
   - Go to https://netlify.com/
   - Login → "Add new site" → "Import from Git"
   - Select repo
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Deploy

3. **URL:** `https://your-site.netlify.app`

### Option 3: Firebase Hosting (Free)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init hosting
firebase init hosting
# Choose: dist, single-page app: Yes

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

**URL:** `https://your-project.web.app`

## 📱 Usage

### Performance Scoring:
1. Host: `/scoring` → Create room → Share link with judges
2. Judge: Receive link → Join → Score performances
3. Host: Complete → Watch animation + confetti 🎉

### Dresscode Vote:
1. Host: `/dresscode/create` → Create room → Copy share link
2. Participants: 
   - Upload photo + name + message
   - Vote for 3 best dressed
3. Host: Complete → View podium 🏆

## 📁 Project Structure

```
src/
├── pages/
│   ├── HomePage.tsx                # Home page
│   ├── LuckyWheelPage.tsx         # Lucky wheel
│   ├── BingoPage.tsx              # Bingo game
│   ├── ScoringPage.tsx            # Scoring: Entry
│   ├── ScoringRoomPage.tsx        # Scoring: Host
│   ├── JudgeScoringPage.tsx       # Scoring: Judge
│   ├── DressCodeVotingPage.tsx    # Dresscode: Entry
│   ├── DressCodeRoomPage.tsx      # Dresscode: Host
│   └── DressCodeParticipantPage.tsx # Dresscode: Participant
├── services/
│   ├── roomService.ts             # Scoring API
│   └── dressCodeService.ts        # Dresscode API
├── types/
│   ├── room.ts                    # Scoring types
│   └── dressCode.ts               # Dresscode types
├── firebase.ts                    # Firebase config
└── App.tsx                        # Routes
```

## 🐛 Troubleshooting

### Error: "Missing or insufficient permissions"
→ Check Firestore Rules (see file [FIRESTORE_RULES_DRESSCODE.md](FIRESTORE_RULES_DRESSCODE.md))

### Images not displaying
→ Images use base64, no Storage needed. Check console logs.

### Room not syncing realtime
→ Check Firebase config and internet connection

## 📄 License

MIT License - Free to use for company events

## 👨‍💻 Developer

Built for GETELL Company Events 🎉

---

**Read in other languages:**
- [Tiếng Việt](README_VN.md)
- [中文](README_CN.md)

**Documentation:**
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Detailed Firebase setup
- [FIRESTORE_RULES_DRESSCODE.md](FIRESTORE_RULES_DRESSCODE.md) - Security Rules details
- [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) - Detailed deployment guide

**Version**: 2.0.0  
**Last Updated**: January 2025

### 1. 🎡 Lucky Wheel (Vòng Quay May Mắn)
- Nhập danh sách người tham gia (mỗi dòng 1 người)
- Realtime update trên vòng quay
- Click icon giữa để quay
- Animation smooth

### 2. 🎲 Bingo (Lô Tô)
- Thiết lập giới hạn số (20-100)
- Rút số ngẫu nhiên không trùng lặp
- Grid hiển thị số đã rút
- Theo dõi lịch sử và tiến độ

### 3. 🎭 Performance Scoring (Chấm Điểm Tiết Mục)
**Hệ thống phòng với Firebase Firestore**

#### Cho Host:
- Tạo phòng với mã 6 ký tự
- Thêm/xóa giám khảo
- Thêm tiết mục
- Xem ranking realtime
- Animation countdown (Top 5 → Top 1)
- Pháo hoa khi công bố kết quả 🎆

#### Cho Judge (Giám khảo):
- Join bằng mã 6 ký tự
- Chấm điểm 1-10 cho từng tiết mục
- Realtime sync
- Track progress

### 4. 👗 Dresscode Vote (Bình Chọn Dresscode)
**Hệ thống voting với ảnh (Firebase Firestore + Base64)**

#### Cho Host:
- Tạo phòng với mã 6 ký tự
- Copy link share cho mọi người
- Xem realtime: người tham gia, đã vote
- Progress bars trực quan
- Kết quả với:
  - Animation fade-up (Rank 3 → 2 → 1)
  - Bục vinh danh 3 bậc thang 🏆
  - Pháo hoa cho winner 🎉

#### Cho Participants:
- **Upload Phase**:
  - Nhập tên
  - Chụp/tải ảnh dresscode (auto compress)
  - Viết lời nhắn
- **Voting Phase**:
  - Vote tối đa 3 người
  - Không vote chính mình
  - One-time voting (không vote lại)
- Device-based tracking (localStorage)

#### Tính năng kỹ thuật:
- ✅ Base64 image storage (không cần Firebase Storage)
- ✅ Auto compress ảnh: 2-8MB → 100-300KB
- ✅ Device fingerprint tracking
- ✅ Realtime sync
- ✅ Podium animation với bậc thang
- ✅ Mobile responsive

## 🛠️ Tech Stack

- **Frontend**: React 19.2.0 + TypeScript
- **Build**: Vite 7.2.5 (rolldown)
- **Styling**: Tailwind CSS 3.4.17
- **Animation**: Framer Motion 12.27.5
- **Database**: Firebase Firestore 12.8.0
- **Effects**: canvas-confetti (pháo hoa)
- **Router**: React Router DOM 7.1.3

## 📦 Cài Đặt & Chạy Local

```bash
# Clone repo
git clone https://github.com/<your-username>/yep-game.git
cd yep-game

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

Mở http://localhost:5173

## 🔥 Setup Firebase

### Bước 1: Tạo Firebase Project
1. Vào https://console.firebase.google.com/
2. Tạo project mới: "yep-games"
3. Chọn "Continue" → "Default Account" → "Create project"

### Bước 2: Thêm Web App
1. Project Overview → Add app → Web (</> icon)
2. Nickname: "YEP Games Web"
3. **KHÔNG** check "Firebase Hosting"
4. Register app → Copy config

### Bước 3: Enable Firestore
1. Build → Firestore Database → Create database
2. Chọn location: asia-southeast1
3. Start in **production mode**

### Bước 4: Setup Security Rules
Vào Firestore → Rules → Paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Scoring System
    match /rooms/{roomId} {
      allow read, write: if true;
    }
    
    // Dresscode Voting System
    match /dressCodeRooms/{roomId} {
      allow read, write: if true;
    }
  }
}
```

Click **Publish**

### Bước 5: Update Code
File `src/firebase.ts` đã có config mặc định. Nếu muốn dùng Firebase project của bạn, thay config trong file đó hoặc tạo `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Lưu ý:** Firebase API keys **an toàn để public** theo [tài liệu chính thức của Google](https://firebase.google.com/docs/projects/api-keys). Bảo mật thật sự nằm ở Firestore Security Rules.

## 🚀 Deploy

### Option 1: Vercel (Khuyên dùng - Miễn phí & Nhanh)

1. **Tạo GitHub Repo:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

2. **Deploy lên Vercel:**
   - Vào https://vercel.com/
   - Login bằng GitHub
   - Click "Add New" → "Project"
   - Import repo của bạn
   - Framework Preset: **Vite**
   - Click "Deploy"
   - Đợi 1-2 phút → Xong! ✅

3. **URL:** `https://your-project.vercel.app`

### Option 2: Netlify (Miễn phí)

1. Push code lên GitHub (như trên)

2. **Deploy:**
   - Vào https://netlify.com/
   - Login → "Add new site" → "Import from Git"
   - Chọn repo
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Deploy

3. **URL:** `https://your-site.netlify.app`

### Option 3: Firebase Hosting (Miễn phí)

```bash
# Cài Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init hosting
firebase init hosting
# Chọn: dist, single-page app: Yes

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

**URL:** `https://your-project.web.app`

## 📱 Sử Dụng

### Performance Scoring:
1. Host: `/scoring` → Tạo phòng → Share link với judges
2. Judge: Nhận link → Join → Chấm điểm
3. Host: Kết thúc → Xem animation + confetti 🎉

### Dresscode Vote:
1. Host: `/dresscode/create` → Tạo phòng → Copy link share
2. Participants: 
   - Upload ảnh + tên + message
   - Vote 3 người đẹp nhất
3. Host: Kết thúc → Xem bục vinh danh 🏆

## 📁 Project Structure

```
src/
├── pages/
│   ├── HomePage.tsx                # Trang chủ
│   ├── LuckyWheelPage.tsx         # Vòng quay
│   ├── BingoPage.tsx              # Lô tô
│   ├── ScoringPage.tsx            # Scoring: Entry
│   ├── ScoringRoomPage.tsx        # Scoring: Host
│   ├── JudgeScoringPage.tsx       # Scoring: Judge
│   ├── DressCodeVotingPage.tsx    # Dresscode: Entry
│   ├── DressCodeRoomPage.tsx      # Dresscode: Host
│   └── DressCodeParticipantPage.tsx # Dresscode: Participant
├── services/
│   ├── roomService.ts             # Scoring API
│   └── dressCodeService.ts        # Dresscode API
├── types/
│   ├── room.ts                    # Scoring types
│   └── dressCode.ts               # Dresscode types
├── firebase.ts                    # Firebase config
└── App.tsx                        # Routes
```

## 🐛 Troubleshooting

### Lỗi: "Missing or insufficient permissions"
→ Kiểm tra Firestore Rules (xem file [FIRESTORE_RULES_DRESSCODE.md](FIRESTORE_RULES_DRESSCODE.md))

### Ảnh không hiển thị
→ Ảnh đang dùng base64, không cần Storage. Check console logs.

### Room không sync realtime
→ Check Firebase config và internet connection

## 📄 License

MIT License - Free to use for company events

## 👨‍💻 Developer

Built for GETELL Company Events 🎉

---

**Need help?** Check files:
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Chi tiết setup Firebase
- [FIRESTORE_RULES_DRESSCODE.md](FIRESTORE_RULES_DRESSCODE.md) - Chi tiết Security Rules
- [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) - Hướng dẫn deploy chi tiết

**Version**: 2.0.0  
**Last Updated**: January 2025

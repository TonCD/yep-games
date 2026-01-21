# 🚀 Hướng Dẫn Deploy YEP Games

## 📋 Chuẩn Bị

1. ✅ Firebase đã setup (Firestore + Rules)
2. ✅ Code hoạt động tốt ở local
3. ✅ GitHub account
4. ✅ Vercel account (hoặc Netlify/Firebase Hosting)

---

## 🎯 CÁCH 1: Deploy Lên Vercel (KHUYÊN DÙNG)

### Bước 1: Tạo GitHub Repository

1. **Tạo repo trên GitHub:**
   - Vào https://github.com/new
   - Repository name: `yep-games` (hoặc tên khác)
   - Chọn **Public** hoặc **Private**
   - **KHÔNG** check "Add README" (vì đã có)
   - Click **"Create repository"**

2. **Push code lên GitHub:**

Mở PowerShell trong thư mục project:

```powershell
# Khởi tạo git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit - YEP Games with all features"

# Đổi branch thành main
git branch -M main

# Add remote (thay <username> và <repo-name>)
git remote add origin https://github.com/<username>/<repo-name>.git

# Push lên GitHub
git push -u origin main
```

**Ví dụ cụ thể:**
```powershell
git remote add origin https://github.com/toannguyen/yep-games.git
git push -u origin main
```

### Bước 2: Deploy Lên Vercel

1. **Mở Vercel:**
   - Vào https://vercel.com/
   - Click **"Sign Up"** (nếu chưa có account)
   - Chọn **"Continue with GitHub"**
   - Authorize Vercel

2. **Import Project:**
   - Click **"Add New..."** → **"Project"**
   - Chọn repo **"yep-games"** của bạn
   - Click **"Import"**

3. **Configure Project:**
   - Framework Preset: **Vite** (tự động detect)
   - Root Directory: `./` (mặc định)
   - Build Command: `npm run build` (mặc định)
   - Output Directory: `dist` (mặc định)
   - **Environment Variables**: 
     - Nếu dùng `.env`: Add các VITE_FIREBASE_* variables
     - Nếu hardcode trong code: Bỏ qua bước này

4. **Deploy:**
   - Click **"Deploy"**
   - Đợi 1-2 phút ⏳
   - Xong! ✅

5. **Nhận Link:**
   - URL: `https://yep-games.vercel.app`
   - Vercel tự động tạo link cho bạn
   - Có thể custom domain sau

### Bước 3: Test Production

1. Mở link Vercel
2. Test các game:
   - Lucky Wheel ✅
   - Bingo ✅
   - Scoring System ✅
   - Dresscode Vote ✅

---

## 🎯 CÁCH 2: Deploy Lên Netlify

### Bước 1: Push lên GitHub
(Giống như Vercel ở trên)

### Bước 2: Deploy Netlify

1. **Mở Netlify:**
   - Vào https://netlify.com/
   - Sign up với GitHub

2. **Import:**
   - Click **"Add new site"** → **"Import an existing project"**
   - Chọn **"GitHub"**
   - Authorize → Chọn repo

3. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click **"Deploy site"**

4. **URL:** `https://your-site-name.netlify.app`

---

## 🎯 CÁCH 3: Firebase Hosting

### Bước 1: Cài Firebase CLI

```powershell
npm install -g firebase-tools
```

### Bước 2: Login & Init

```powershell
# Login Firebase
firebase login

# Init hosting
firebase init hosting
```

**Trả lời:**
- Use existing project: Chọn **yep-games**
- Public directory: `dist`
- Single-page app: **Yes**
- Overwrite index.html: **No**

### Bước 3: Build & Deploy

```powershell
# Build production
npm run build

# Deploy
firebase deploy --only hosting
```

**URL:** `https://yep-games.web.app`

---

## 📱 Sau Khi Deploy

### 1. Update Firebase CORS (Nếu Cần)

Nếu gặp lỗi CORS với Firebase, không cần làm gì (vì dùng Firestore, không phải Storage).

### 2. Test Trên Mobile

- Mở link production trên điện thoại
- Test dresscode vote với camera
- Test tất cả game

### 3. Share Link

Share link production với team:
- Link chính: `https://yep-games.vercel.app`
- Scoring: `https://yep-games.vercel.app/scoring`
- Dresscode: `https://yep-games.vercel.app/dresscode/create`

---

## 🔄 Update Code Sau Deploy

### Nếu dùng Vercel:

```powershell
# Sửa code
# ...

# Commit changes
git add .
git commit -m "Fix: update feature"
git push

# Vercel TỰ ĐỘNG deploy lại! 🎉
```

### Nếu dùng Firebase Hosting:

```powershell
# Sửa code
# ...

# Build lại
npm run build

# Deploy lại
firebase deploy --only hosting
```

---

## 🎨 Custom Domain (Optional)

### Vercel:
1. Project Settings → Domains
2. Add domain của bạn
3. Update DNS records theo hướng dẫn

### Netlify:
1. Domain settings → Add custom domain
2. Update DNS

---

## ⚡ Performance Tips

### 1. Optimize Build:
File `vite.config.ts` đã optimize sẵn với rolldown

### 2. Cache Firebase:
Firestore đã có cache tự động

### 3. Image Optimization:
Ảnh dresscode đã auto compress (800px, 70% quality)

---

## 🐛 Common Issues

### Issue 1: Deploy thành công nhưng blank page
**Fix:**
- Check base URL trong `vite.config.ts`
- Should be: `base: '/'` (mặc định)

### Issue 2: Firebase errors in production
**Fix:**
- Check Firebase config
- Verify Firestore Rules đã publish
- Check API keys (có trong code hoặc env variables)

### Issue 3: Images không load
**Fix:**
- Ảnh đang dùng base64, không có external links
- Check console logs

---

## 📊 Monitor Performance

### Vercel Analytics:
- Project → Analytics
- Xem visitors, performance

### Firebase Console:
- Firestore → Usage
- Monitor reads/writes

---

## 💰 Cost Estimation

**100% MIỄN PHÍ** với:
- Vercel Free: 100GB bandwidth/month
- Firebase Free: 1GB storage, 50k reads/day
- Netlify Free: 100GB bandwidth/month

Đủ cho company events! 🎉

---

## ✅ Checklist Deploy

- [ ] Push code lên GitHub
- [ ] Import vào Vercel/Netlify
- [ ] Deploy thành công
- [ ] Test tất cả games
- [ ] Test trên mobile
- [ ] Share link với team
- [ ] Monitor trong 1-2 ngày đầu

---

**Chúc bạn deploy thành công!** 🚀

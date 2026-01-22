# 🎮 GETELL YEP 游戏中心

为 GETELL 公司团建活动和公司活动设计的迷你游戏网站。

## 🎯 游戏列表

### 1. 🎡 幸运转盘
- 输入参与者名单（每行一个）
- 实时更新转盘
- 点击中心图标开始旋转
- 流畅动画效果

### 2. 🎲 宾戈游戏（乐透）
- 设置数字范围（20-100）
- 随机抽取不重复的数字
- 网格显示已抽取的数字
- 追踪历史记录和进度

### 3. 🎭 节目评分系统
**基于 Firebase Firestore 的房间系统**

#### 主持人功能：
- 创建带有 6 位代码的房间
- 添加/删除评委
- 添加节目
- 实时查看排名
- 倒计时动画（前5名 → 第1名）
- 公布结果时的烟花效果 🎆

#### 评委功能：
- 使用 6 位代码加入房间
- 为每个节目评分 1-10 分
- 实时同步
- 追踪进度

### 4. 👗 服装投票系统
**带图片的投票系统（Firebase Firestore + Base64）**

#### 主持人功能：
- 创建带有 6 位代码的房间
- 复制链接分享给所有人
- 实时查看：参与者、已投票
- 可视化进度条
- 结果展示：
  - 渐显动画（第3名 → 第2名 → 第1名）
  - 三层领奖台 🏆
  - 优胜者烟花效果 🎉

#### 参与者功能：
- **上传阶段**：
  - 输入姓名
  - 拍摄/上传服装照片（自动压缩）
  - 写留言
- **投票阶段**：
  - 最多投票给 3 人
  - 不能给自己投票
  - 一次性投票（不能重复投票）
- 基于设备追踪（localStorage）

#### 技术特性：
- ✅ Base64 图片存储（无需 Firebase Storage）
- ✅ 自动压缩图片：2-8MB → 100-300KB
- ✅ 设备指纹追踪
- ✅ 实时同步
- ✅ 领奖台动画效果
- ✅ 移动端响应式

## 🛠️ 技术栈

- **前端框架**: React 19.2.0 + TypeScript
- **构建工具**: Vite 7.2.5 (rolldown)
- **样式**: Tailwind CSS 3.4.17
- **动画**: Framer Motion 12.27.5
- **数据库**: Firebase Firestore 12.8.0
- **特效**: canvas-confetti（烟花）
- **路由**: React Router DOM 7.1.3

## 📦 安装与本地运行

```bash
# 克隆仓库
git clone https://github.com/TonCD/yep-games.git
cd yep-games

# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

打开 http://localhost:5173

## 🔥 Firebase 设置

### 步骤 1：创建 Firebase 项目
1. 访问 https://console.firebase.google.com/
2. 创建新项目："yep-games"
3. 选择 "Continue" → "Default Account" → "Create project"

### 步骤 2：添加 Web 应用
1. Project Overview → Add app → Web (</> 图标)
2. 昵称："YEP Games Web"
3. **不要**勾选 "Firebase Hosting"
4. 注册应用 → 复制配置

### 步骤 3：启用 Firestore
1. Build → Firestore Database → Create database
2. 选择位置：asia-southeast1
3. 以**生产模式**启动

### 步骤 4：设置安全规则
进入 Firestore → Rules → 粘贴：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 评分系统
    match /rooms/{roomId} {
      allow read, write: if true;
    }
    
    // 服装投票系统
    match /dressCodeRooms/{roomId} {
      allow read, write: if true;
    }
  }
}
```

点击 **Publish**

### 步骤 5：更新代码
文件 `src/firebase.ts` 已有默认配置。如果要使用您的 Firebase 项目，请在该文件中替换配置或创建 `.env`：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**注意：** 根据 [Google 官方文档](https://firebase.google.com/docs/projects/api-keys)，Firebase API 密钥**可以安全公开**。真正的安全性在于 Firestore 安全规则。

## 🚀 部署

### 选项 1：Vercel（推荐 - 免费且快速）

1. **创建 GitHub 仓库：**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

2. **部署到 Vercel：**
   - 访问 https://vercel.com/
   - 使用 GitHub 登录
   - 点击 "Add New" → "Project"
   - 导入您的仓库
   - Framework Preset：**Vite**
   - 点击 "Deploy"
   - 等待 1-2 分钟 → 完成！ ✅

3. **URL：** `https://your-project.vercel.app`

### 选项 2：Netlify（免费）

1. 将代码推送到 GitHub（如上）

2. **部署：**
   - 访问 https://netlify.com/
   - 登录 → "Add new site" → "Import from Git"
   - 选择仓库
   - Build command：`npm run build`
   - Publish directory：`dist`
   - Deploy

3. **URL：** `https://your-site.netlify.app`

### 选项 3：Firebase Hosting（免费）

```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录
firebase login

# 初始化 hosting
firebase init hosting
# 选择：dist，single-page app: Yes

# 构建
npm run build

# 部署
firebase deploy --only hosting
```

**URL：** `https://your-project.web.app`

## 📱 使用方法

### 节目评分：
1. 主持人：`/scoring` → 创建房间 → 分享链接给评委
2. 评委：接收链接 → 加入 → 评分
3. 主持人：结束 → 观看动画 + 烟花 🎉

### 服装投票：
1. 主持人：`/dresscode/create` → 创建房间 → 复制链接分享
2. 参与者：
   - 上传照片 + 姓名 + 留言
   - 投票给 3 位最佳着装
3. 主持人：结束 → 查看领奖台 🏆

## 📁 项目结构

```
src/
├── pages/
│   ├── HomePage.tsx                # 主页
│   ├── LuckyWheelPage.tsx         # 幸运转盘
│   ├── BingoPage.tsx              # 宾戈游戏
│   ├── ScoringPage.tsx            # 评分：入口
│   ├── ScoringRoomPage.tsx        # 评分：主持人
│   ├── JudgeScoringPage.tsx       # 评分：评委
│   ├── DressCodeVotingPage.tsx    # 服装投票：入口
│   ├── DressCodeRoomPage.tsx      # 服装投票：主持人
│   └── DressCodeParticipantPage.tsx # 服装投票：参与者
├── services/
│   ├── roomService.ts             # 评分 API
│   └── dressCodeService.ts        # 服装投票 API
├── types/
│   ├── room.ts                    # 评分类型
│   └── dressCode.ts               # 服装投票类型
├── firebase.ts                    # Firebase 配置
└── App.tsx                        # 路由
```

## 🐛 故障排除

### 错误："Missing or insufficient permissions"
→ 检查 Firestore 规则（查看文件 [FIRESTORE_RULES_DRESSCODE.md](FIRESTORE_RULES_DRESSCODE.md)）

### 图片无法显示
→ 图片使用 base64 格式，无需 Storage。检查控制台日志。

### 房间无法实时同步
→ 检查 Firebase 配置和网络连接

## 📄 许可证

MIT License - 免费用于公司活动

## 👨‍💻 开发者

为 GETELL 公司活动打造 🎉

---

**其他语言版本：**
- [English](README.md)
- [Tiếng Việt](README_VN.md)

**支持文档：**
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase 详细设置
- [FIRESTORE_RULES_DRESSCODE.md](FIRESTORE_RULES_DRESSCODE.md) - 安全规则详情
- [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) - 详细部署指南

**版本**: 2.0.0  
**最后更新**: 2025年1月

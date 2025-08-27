# LIFF 整合設置指南

## 📋 概述
本專案已整合 LINE LIFF (LINE Front-end Framework)，可以自動獲取 LINE 用戶的真實 ID，替代之前硬編碼的測試用戶 ID "abc"。

## 🚀 快速開始

### 1. 設置 LIFF ID
在 `index.html` 文件中，找到以下配置並替換為您的實際 LIFF ID：

```javascript
window.endpoint = {
  // API 配置
  baseURL: 'https://your-api-server.com/api',
  // LIFF 配置
  liffId: 'YOUR_LIFF_ID', // 👈 替換為您的實際 LIFF ID
  basicId: 'YOUR_BASIC_ID', // 👈 替換為您的實際 Basic ID
  enableLiff: true
};
```

### 2. 獲取 LIFF ID
1. 登入 [LINE Developers Console](https://developers.line.biz/)
2. 創建或選擇您的 Provider
3. 創建一個新的 LIFF 應用
4. 複製 LIFF ID

### 3. 配置 LIFF 應用
在 LINE Developers Console 中設置：
- **Endpoint URL**: 您的應用部署 URL
- **Scope**: 選擇需要的權限（如 profile、openid 等）

## 🔧 功能特性

### 自動用戶 ID 獲取
- ✅ 在 LIFF 環境中自動獲取真實用戶 ID
- ✅ 支援訪客模式（未登入用戶）
- ✅ 開發環境後備機制

### 錯誤處理
- ✅ LIFF 初始化失敗時自動降級到測試模式
- ✅ 詳細的日誌記錄
- ✅ 優雅的錯誤恢復

### 環境適配
- ✅ 自動檢測 LIFF 環境
- ✅ 開發和生產環境無縫切換
- ✅ 支援多種部署場景

## 📱 使用場景

### 在 LINE 應用內
- 自動獲取用戶 ID
- 完整的用戶資料
- 原生 LINE 體驗

### 在瀏覽器中
- 訪客模式支援
- 測試功能可用
- 開發調試友好

## 🛠️ 開發調試

### 啟用調試模式
在 `index.html` 中設置：

```javascript
window.endpoint = {
  // API 配置
  baseURL: 'https://your-api-server.com/api',
  // LIFF 配置
  liffId: 'your-liff-id',
  basicId: 'your-basic-id',
  // 調試模式
  debug: true, // 👈 啟用調試模式
  timeout: 30000
};
```

### 查看控制台日誌
調試模式下會顯示：
- LIFF 初始化狀態
- 用戶資料獲取過程
- 錯誤和警告信息

## 🔍 故障排除

### 常見問題

#### 1. LIFF 初始化失敗
**症狀**: 控制台顯示 "LIFF 初始化失敗"
**解決方案**: 
- 檢查 LIFF ID 是否正確
- 確認 LIFF 應用配置
- 檢查網路連接

#### 2. 用戶未登入
**症狀**: 用戶 ID 為訪客 ID
**解決方案**:
- 在 LINE 應用內打開
- 檢查用戶權限設置
- 確認 Scope 配置

#### 3. 不在 LIFF 環境
**症狀**: 使用測試用戶 ID "abc"
**解決方案**:
- 在 LINE 應用內測試
- 檢查 LIFF 應用狀態
- 確認部署 URL 配置

## 📚 API 參考

### LiffService 類

#### 方法
- `initialize(liffId)`: 初始化 LIFF
- `getUserProfile()`: 獲取用戶資料
- `getUserId()`: 獲取用戶 ID
- `isLoggedIn()`: 檢查登入狀態
- `login(redirectUri)`: 用戶登入
- `logout()`: 用戶登出

#### 屬性
- `isInitialized`: 是否已初始化
- `userId`: 當前用戶 ID
- `userProfile`: 用戶資料

## 🔄 更新日誌

### v1.0.0 (當前版本)
- ✅ 整合 LIFF SDK
- ✅ 自動用戶 ID 獲取
- ✅ 訪客模式支援
- ✅ 錯誤處理和後備機制
- ✅ 開發環境支援

## 📞 支援

如有問題，請檢查：
1. 控制台錯誤日誌
2. LIFF 應用配置
3. 網路連接狀態
4. 用戶權限設置

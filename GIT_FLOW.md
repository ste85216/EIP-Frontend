# 公司專案 Git Flow 規範

## 1. 分支命名規則
Git Flow 使用更複雜的分支模型，包括以下主要分支：
- **`main`**：穩定的正式版本，僅接受 `release` 或 `hotfix` 分支合併。
- **`develop`**：開發中的主幹分支，所有功能分支從此切出。
- **`feature/xxx`**：新功能開發，如 `feature/add-payment`
- **`release/xxx`**：準備發佈的分支，如 `release/v1.2.0`
- **`hotfix/xxx`**：緊急修復，如 `hotfix/security-patch`

## 2. Git Flow Pull Request (PR) 流程
- **功能開發 PR**：`feature/xxx` → `develop`
- **版本發布 PR**：`release/xxx` → `main`
- **緊急修復 PR**：`hotfix/xxx` → `main` 及 `develop`

PR 標題格式：
```
[類型] 簡要描述
```
示例：
```
[feat] 新增支付功能
[fix] 修正 API 超時錯誤
```

## 3. Commit 規範
使用 **[Conventional Commits](https://www.conventionalcommits.org/)** 規範：
```
type(scope): message
```
- `feat`: 新功能
- `fix`: 修復 Bug
- `docs`: 文件更新
- `style`: 格式變更（不影響程式碼運行）
- `refactor`: 重構（非新功能或修復 Bug）
- `test`: 測試相關變更
- `chore`: 其他雜項變更

示例：
```
feat(auth): add JWT authentication
fix(ui): fix button alignment issue
```

## 4. Repository 與檔案命名規則
### Repository 命名
- **使用 kebab-case**，例如：
  - `project-name`
  - `company-website`
  - `admin-dashboard`
- **理由**：與 GitHub 風格一致，易讀且適合 URL 格式。

### 資料夾與檔案命名
- **資料夾名稱**：使用 **kebab-case**（如 `components`、`user-profile`）
- **JavaScript/TypeScript 檔案**：使用 **camelCase**（如 `userService.js`）
- **React Component 檔案**：使用 **PascalCase**（如 `UserProfile.jsx`）
- **CSS/SCSS 檔案**：使用 **kebab-case**（如 `main-style.css`）
- **環境變數**：使用 **SCREAMING_SNAKE_CASE**（如 `API_KEY`）

~~## 5. Git Flow Code Review 規範~~
~~- **審查標準**~~
 ~~- 確保符合 **程式碼風格指南**~~
  ~~- 檢查是否有 **單元測試**~~
  ~~- 確認 **功能符合需求**~~
  ~~- 檢查 **效能與安全性**~~
~~- **審查方式**~~
  ~~- 提供清楚的回饋~~
  ~~- 若需要變更，請標明具體原因與建議~~
  ~~- 批准後請標記 `Approved`~~

## 6. Git Flow 發布與版本管理
- **標記版本號** (`vX.Y.Z`)，遵循 [Semantic Versioning](https://semver.org/)
- **建立 Release Notes**
- **合併 `release/xxx` 至 `main` 並標記版本**
- **合併 `release/xxx` 至 `develop` 以確保更新同步**

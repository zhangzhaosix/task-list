# 每日任务清单 - 项目说明

## 目录结构

```
聊天框1(每日清单网页)/
├── 任务清单/             ← 主要工作目录（Git 仓库）
│   ├── index.html         (页面入口，全部功能在此一个文件中)
│   ├── README.md
│   ├── LICENSE            (MIT)
│   ├── .nojekyll          (GitHub Pages 用)
│   └── CLAUDE.md          (本文件)
│
└── 任务清单-备份/         ← 镜像备份目录（自动同步）
    ├── index.html
    ├── README.md
    └── LICENSE
```

## Git 仓库

- **远程**: `origin → https://github.com/zhangzhaosix/task-list.git`
- **分支**: `master`
- **两个目录指向同一个远程仓库**

## 开发工作流

### 核心流程

```
修改代码（index.html）
  → 本地浏览器测试
  → 用户反馈满意？
     ├── 不满意 → 继续修改
     └── 满意 → 执行上传同步三部曲
```

### 第一步：修改代码

所有修改仅在 `index.html` 中进行（唯一代码文件）。
**不允许修改** `任务清单-备份/` 目录下的任何文件。

### 第二步：本地测试

在浏览器中直接打开 `index.html` 测试。
测试满意后告知 Claude。

### 第三步：上传同步（用户确认满意后执行）

当用户说"可以了"/"没问题"/"满意"等确认信号后，执行：

```bash
# 1) 主目录提交并推送至 GitHub
cd 任务清单
git add .
git commit -m "修改内容描述"
git push origin master

# 2) 同步文件到本地备份目录（仅本地，不推送到 GitHub）
cp 任务清单/index.html 任务清单-备份/index.html
cp 任务清单/README.md 任务清单-备份/README.md

# 3) 回到主目录
cd ../任务清单
```

## 关于项目

每日任务清单是一个纯前端单页面应用，支持：
- 每日必做 / 临时事件 两种任务类型
- 拖拽排序、内联编辑、进度统计
- 思维模式（工作原则）记录
- 长期规划笔记
- Firebase Auth 登录 + Firestore 云端同步
- 数据导入/导出（JSON）

## 技术架构

### 数据模型

**任务（Task）**
```javascript
{
  id: string,          // Date.now() + 随机后缀
  text: string,        // 任务标题
  type: 'daily' | 'temporary',
  done: boolean,
  url: string,         // 相关链接（选填）
  note: string,        // 备注（选填）
  createdAt: number
}
```

**思维模式（Mindset）**
```javascript
{
  id: string,
  text: string,
  createdAt: number
}
```

### 数据流

```
Firebase Auth 登录
  → Firestore users/{uid} 文档 onSnapshot 实时订阅
  → 所有 CRUD 操作通过 set() 写入 Firestore
  → onSnapshot 回调触发 render() 刷新 UI
  → 首次登录自动迁移 localStorage 存量数据到云端
```

### 核心模块（index.html 行号对照）

| 模块 | 行号 | 说明 |
|------|------|------|
| 三步添加/编辑模态框 | 1774–1860 | 标题必填 + 链接+备注选填，Enter/Ctrl+Enter |
| 内联编辑 | 1972–2027 | 点击文本直接编辑，Enter 保存 / Escape 取消 |
| 拖拽排序 | 1878–1968 | HTML5 Drag & Drop，仅同类型任务内 |
| 认证状态机 | 2092–2188 | 表单登录 / 一键登录 / 登出 |
| 进度条 | 106–146 | 完成任务占比 + 微光动画 |
| 思维模式 CRUD | 2287–2401 | 独立列表，支持排序、内联编辑 |
| 长期规划文本 | 2191–2216 | 自动保存（500ms debounce）+ 字数统计 |
| 数据导入/导出 | 2404–2448 | JSON 格式 |

## CSS 设计系统

- **风格**: 毛玻璃（Glassmorphism）
  - 半透明背景（`rgba(255,255,255,0.12~0.3)`）
  - `backdrop-filter: blur(8px~20px)`
  - 白色半透明边框
  - 柔和阴影 + `inset` 高光
- **配色**: 暖橙渐变主题 `#f5b041 → #ff9a76`
  - 每日必做 → 橙色系
  - 临时事件 → 绿色系 `#00b894`
  - 文字主色 `#2d3436`，辅助色 `#636e72`
- **背景**: 多径向渐变叠加 + 固定模糊光斑 `div.bg-spot`
- **响应式断点**: 860px（3→2列），600px（2→1列 + 移动端适配）
- **动效**: 卡片悬停上移、进度条 shimmer 动画、任务入场 `taskIn` keyframe

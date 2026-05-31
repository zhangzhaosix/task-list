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

### 重要流程变更

> ⚠️ **用户测试优先，上传同步在后**
>
> 所有代码修改仅限 `任务清单/` 目录，修改后用户先在本地测试确认满意，
> **再由用户告知后进行 GitHub 上传和备份目录同步。**

### 1. 修改代码

所有修改均在 `任务清单/` 目录下进行。
核心文件只有 `index.html`（纯前端单页面应用，HTML + CSS + JavaScript 全部在同一个文件中）。

**仅修改此目录**，不允许修改 `任务清单-备份/` 目录下的任何文件。

### 2. 本地测试

修改完成后，用户在浏览器中打开 `任务清单/index.html` 进行测试。
测试满意后告知 Claude，再进行下一步。

### 3. 提交并推送至 GitHub（用户确认后执行）

```bash
cd 任务清单
git add .
git commit -m "本次修改内容描述"
git push origin master
```

### 4. 同步备份目录（用户确认后执行）

提交并推送完主目录后，**必须同步更新备份目录**：

```bash
# 将主目录的文件复制到备份目录
cp 任务清单/index.html 任务清单-备份/index.html
cp 任务清单/README.md 任务清单-备份/README.md

# 备份目录也要提交并推送
cd 任务清单-备份
git add .
git commit -m "同步: $(cd ../任务清单 && git log -1 --format=%s)"
git push origin master
```

> **注意**：备份目录与主目录指向**同一个 GitHub 远程仓库**，两个目录各自维护独立的 commit 历史，但最终都会推送到同一个仓库。

### 简化一键同步命令

```bash
# 如果觉得上面太繁琐，直接执行这个（在 聊天框1(每日清单网页) 目录下）：
cd 任务清单 && git add . && git commit -m "update" && git push origin master && cd ../任务清单-备份 && cp ../任务清单/index.html . && cp ../任务清单/README.md . && git add . && git commit -m "sync" && git push origin master && cd ../任务清单
```

## 关于项目

每日任务清单是一个纯前端单页面应用，支持：
- 每日必做 / 临时事件 两种任务类型
- 拖拽排序、内联编辑、进度统计
- 思维模式（工作原则）记录
- 长期规划笔记
- Firebase Auth 登录 + Firestore 云端同步
- 数据导入/导出（JSON）

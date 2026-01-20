---
title: GitHub常用命令完全指南：从入门到精通
date: 2026-01-20 22:30:00
categories:
  - 前端
  - 工具
tags:
  - Git
  - GitHub
  - 版本控制
  - 开发工具
---

## 前言

Git是目前世界上最先进的分布式版本控制系统，而GitHub是基于Git的代码托管平台。掌握Git和GitHub的常用命令是每个开发者的必备技能。

本文将从基础到高级，全面介绍Git和GitHub的常用命令及实战技巧。

## 环境准备

### 安装Git

```bash
# macOS
brew install git

# Windows
# 下载安装包：https://git-scm.com/download/win

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install git

# 验证安装
git --version
```

### 初始配置

```bash
# 设置用户名
git config --global user.name "Your Name"

# 设置邮箱
git config --global user.email "your.email@example.com"

# 设置默认分支名
git config --global init.defaultBranch main

# 查看配置
git config --list

# 设置编辑器
git config --global core.editor vim

# 设置差异比较工具
git config --global merge.tool vscode
```

## 基础命令

### 仓库初始化

```bash
# 初始化新仓库
git init

# 克隆远程仓库
git clone https://github.com/username/repo.git

# 克隆到指定目录
git clone https://github.com/username/repo.git my-folder

# 克隆指定分支
git clone -b dev https://github.com/username/repo.git
```

### 文件操作

```bash
# 查看当前状态
git status

# 添加指定文件到暂存区
git add file.txt

# 添加所有文件到暂存区
git add .

# 添加所有修改的文件（不包括未跟踪的文件）
git add -u

# 添加所有文件（包括删除的文件）
git add -A

# 撤销暂存区的文件
git restore --staged file.txt

# 丢弃工作区的修改
git restore file.txt

# 删除文件
git rm file.txt

# 重命名文件
git mv old.txt new.txt
```

### 提交更改

```bash
# 提交暂存区的更改
git commit -m "commit message"

# 添加并提交（跳过git add）
git commit -am "commit message"

# 修改最后一次提交
git commit --amend

# 修改最后一次提交信息
git commit --amend -m "new message"

# 提交时跳过钩子
git commit --no-verify -m "message"
```

### 查看差异

```bash
# 查看工作区和暂存区的差异
git diff

# 查看暂存区和上次提交的差异
git diff --staged

# 查看工作区和上次提交的差异
git diff HEAD

# 查看两个提交之间的差异
git diff commit1 commit2

# 查看指定文件的差异
git diff file.txt
```

## 分支管理

### 分支操作

```bash
# 查看所有分支
git branch

# 查看远程分支
git branch -r

# 查看所有分支（包括远程）
git branch -a

# 创建新分支
git branch feature-branch

# 切换分支
git checkout feature-branch

# 创建并切换到新分支
git checkout -b feature-branch

# 切换到上一个分支
git checkout -

# 删除本地分支
git branch -d feature-branch

# 强制删除分支
git branch -D feature-branch

# 重命名分支
git branch -m old-branch new-branch
```

### 分支合并

```bash
# 合并指定分支到当前分支
git merge feature-branch

# 禁用快进合并
git merge --no-ff feature-branch

# 使用squash合并（合并为一个提交）
git merge --squash feature-branch

# 变基（将当前分支变基到指定分支）
git rebase main

# 继续变基
git rebase --continue

# 跳过当前提交
git rebase --skip

# 放弃变基
git rebase --abort
```

### 分支最佳实践

```
主分支结构:
├── main (生产环境)
│   └── 始终保持稳定，可部署
├── develop (开发环境)
│   └── 开发集成分支
└── feature/* (功能分支)
    ├── feature/user-auth
    ├── feature-payment
    └── feature-search
```

## 远程操作

### 远程仓库管理

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin https://github.com/username/repo.git

# 删除远程仓库
git remote remove origin

# 修改远程仓库URL
git remote set-url origin https://github.com/username/new-repo.git

# 查看远程仓库信息
git remote show origin

# 重命名远程分支
git remote rename origin upstream
```

### 拉取和推送

```bash
# 拉取远程更改并合并
git pull origin main

# 拉取远程更改但不合并
git fetch origin

# 拉取所有远程分支
git fetch --all

# 拉取远程更改并变基
git pull --rebase origin main

# 推送到远程仓库
git push origin main

# 推送所有分支
git push --all

# 推送标签
git push --tags

# 推送并建立上游分支
git push -u origin feature-branch

# 强制推送（谨慎使用）
git push --force origin main

# 强制推送更安全的方式
git push --force-with-lease origin main

# 删除远程分支
git push origin --delete feature-branch
```

## 日志和查看

### 查看提交历史

```bash
# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看分支图
git log --graph --oneline --all

# 查看最近N次提交
git log -n 5

# 查看指定文件的提交历史
git log file.txt

# 查看提交统计
git log --stat

# 美化输出
git log --pretty=format:"%h - %an, %ar : %s"

# 查看特定作者的提交
git log --author="John"
```

### 查看文件内容

```bash
# 查看指定提交的文件内容
git show commit_hash:file.txt

# 查看提交详情
git show commit_hash

# 查看某次提交的修改
git show HEAD~1

# 查看文件的每一行是谁修改的
git blame file.txt
```

## 撤销操作

### 撤销更改

```bash
# 撤销工作区的修改
git restore file.txt

# 撤销暂存区的修改
git restore --staged file.txt

# 回退到指定提交（保留工作区修改）
git reset --soft HEAD~1

# 回退到指定提交（撤销暂存区修改）
git reset --mixed HEAD~1

# 回退到指定提交（撤销工作区和暂存区修改）
git reset --hard HEAD~1

# 回退到指定提交（危险操作）
git reset --hard commit_hash

# 恢复指定提交的文件
git checkout commit_hash -- file.txt

# 创建新的提交来撤销指定提交
git revert commit_hash
```

### reset vs revert

```bash
# reset - 删除历史（适用于本地）
git reset --hard HEAD~1

# revert - 创建新提交来撤销（适用于公共分支）
git revert HEAD
```

## 标签管理

### 标签操作

```bash
# 查看所有标签
git tag

# 创建轻量标签
git tag v1.0.0

# 创建附注标签
git tag -a v1.0.0 -m "Version 1.0.0"

# 给指定提交打标签
git tag -a v0.9.0 commit_hash -m "Version 0.9.0"

# 查看标签信息
git show v1.0.0

# 删除本地标签
git tag -d v1.0.0

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 删除远程标签
git push origin --delete v1.0.0

# 检出标签
git checkout v1.0.0
```

## 储藏（Stash）

### 临时保存工作

```bash
# 储藏当前工作
git stash

# 储藏并添加说明
git stash save "work in progress"

# 查看储藏列表
git stash list

# 应用最新的储藏
git stash pop

# 应用指定储藏
git stash apply stash@{1}

# 删除储藏
git stash drop stash@{0}

# 清空所有储藏
git stash clear

# 查看储藏内容
git stash show -p
```

## 实战场景

### 场景1：开始新功能开发

```bash
# 1. 切换到主分支并更新
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/new-feature

# 3. 开发并提交
git add .
git commit -m "feat: add new feature"

# 4. 推送到远程
git push -u origin feature/new-feature

# 5. 创建Pull Request
# 在GitHub网页上操作
```

### 场景2：解决合并冲突

```bash
# 1. 拉取最新代码
git checkout main
git pull origin main

# 2. 合并功能分支
git merge feature/new-feature

# 3. 如果有冲突，标记冲突文件
# Auto-merging file.txt
# CONFLICT (content): Merge conflict in file.txt

# 4. 手动解决冲突
# 编辑文件，删除冲突标记

# 5. 添加解决后的文件
git add file.txt

# 6. 完成合并
git commit -m "merge: resolve merge conflicts"
```

### 场景3：修改历史提交

```bash
# 交互式变基修改最近的3次提交
git rebase -i HEAD~3

# 在编辑器中：
# pick -> reword = 修改提交信息
# pick -> edit = 修改提交内容
# pick -> drop = 删除提交
# pick -> squash = 合并到前一个提交

# 保存后按提示操作
```

### 场景4：回滚错误的提交

```bash
# 方法1：revert（推荐）
git revert bad_commit_hash
git push

# 方法2：reset（仅本地或团队协作）
git reset --hard good_commit_hash
git push --force-with-lease
```

### 场景5：同步上游仓库

```bash
# 1. 添加上游仓库
git remote add upstream https://github.com/original/repo.git

# 2. 拉取上游更改
git fetch upstream

# 3. 合并上游主分支
git checkout main
git merge upstream/main

# 4. 推送到你的仓库
git push origin main
```

## GitHub特定操作

### GitHub CLI (gh)

```bash
# 安装GitHub CLI
brew install gh  # macOS
# 或从 https://cli.github.com/ 下载

# 认证
gh auth login

# 创建仓库
gh repo create my-repo --public

# 克隆仓库
gh repo clone username/repo

# 创建Pull Request
gh pr create --title "Add feature" --body "Description"

# 查看PR列表
gh pr list

# 合并PR
gh pr merge 123

# 创建Issue
gh issue create --title "Bug" --body "Description"

# 查看Issues
gh issue list
```

### .gitignore 最佳实践

```gitignore
# .gitignore 示例

# 依赖目录
node_modules/
vendor/

# 构建输出
dist/
build/
public/

# 环境变量
.env
.env.local

# IDE配置
.vscode/
.idea/
*.swp
*.swo

# 操作系统文件
.DS_Store
Thumbs.db

# 日志文件
*.log
npm-debug.log*

# 临时文件
*.tmp
*.temp
```

### Git别名配置

```bash
# 设置常用别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --graph --oneline --all"

# 使用别名
git co main        # git checkout main
git br             # git branch
git ci -m "msg"    # git commit -m "msg"
git st             # git status
git lg             # 美化的日志
```

## 高级技巧

### Cherry-pick（精选提交）

```bash
# 将指定提交应用到当前分支
git cherry-pick commit_hash

# 应用但不自动提交
git cherry-pick -n commit_hash

# 应用多个提交
git cherry-pick commit1 commit2

# 应用一系列提交
git cherry-pick commit1..commit2
```

### Bisect（二分查找）

```bash
# 开始二分查找（用于定位引入bug的提交）
git bisect start

# 标记当前为坏的提交
git bisect bad

# 标记已知的好的提交
git bisect good commit_hash

# Git会自动切换到中间提交
# 测试后标记good或bad
git bisect good  # 或 git bisect bad

# 完成后回到主分支
git bisect reset
```

### Worktree（多工作树）

```bash
# 创建关联的工作树
git worktree add ../feature-branch feature-branch

# 查看所有工作树
git worktree list

# 删除工作树
git worktree remove ../feature-branch

# 清理工作树
git worktree prune
```

## 性能优化

```bash
# 清理无效文件
git gc --prune=now

# 清理未跟踪的文件
git clean -f

# 清理未跟踪的文件和目录
git clean -fd

# 预览要删除的文件
git clean -n

# 查看仓库大小
git count-objects -vH

# 使用浅克隆（只下载最新历史）
git clone --depth 1 https://github.com/user/repo.git
```

## 安全最佳实践

### 保护敏感信息

```bash
# 1. 从历史中移除敏感文件
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config/secrets.json" \
  --prune-empty --tag-name-filter cat -- --all

# 2. 使用BFG Repo-Cleaner（更快）
brew install bfg
bfg --delete-files secrets.json
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. 推送清理后的历史
git push origin --force --all
git push origin --force --tags
```

### 提交信息规范

```bash
# 使用约定式提交格式
<type>(<scope>): <subject>

<body>

<footer>

# 类型（type）:
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构
perf:     性能优化
test:     测试相关
chore:    构建/工具链相关

# 示例:
feat(auth): add user login feature
fix(api): resolve timeout issue
docs(readme): update installation guide
```

## 调试技巧

```bash
# 查看Git引用
git show-ref

# 查看HEAD指向
git log --oneline -n 1 HEAD

# 查看分支关系
git log --graph --decorate --oneline

# 查看未被跟踪的文件
git ls-files --others --exclude-standard

# 查找丢失的提交
git fsck --lost-found

# 恢复丢失的提交
git reflog
git checkout commit_hash
```

## 常见问题解决

### 问题1：提交了错误的文件

```bash
# 撤销最后一次提交但保留更改
git reset --soft HEAD~1

# 修改后重新提交
git add .
git commit -m "correct message"
```

### 问题2：忘记推送到远程

```bash
# 直接推送
git push origin main

# 如果被别人推送了新的提交
git pull --rebase origin main
git push origin main
```

### 问题3：合并后后悔了

```bash
# 回到合并前
git merge --abort

# 或使用reflog
git reflog
git reset --hard HEAD@{N}
```

## 总结

Git和GitHub是现代软件开发不可或缺的工具。掌握这些命令不仅能提高开发效率，还能更好地管理代码版本和协作开发。

**学习路径建议：**
1. 熟练掌握基础命令（add, commit, push, pull）
2. 理解分支管理和合并策略
3. 学习处理冲突和回退操作
4. 掌握高级技巧和最佳实践
5. 使用GitHub协作功能（PR, Issue, Actions）

**参考资源：**
- [Git官方文档](https://git-scm.com/doc)
- [GitHub官方文档](https://docs.github.com/)
- [GitHub Skills](https://skills.github.com/)
- [Git Hero](https://githeroes.com/)

记住：**熟能生巧**，多使用这些命令，自然会越来越熟练！

---

*下一篇文章将介绍Git Flow工作流和团队协作最佳实践，敬请期待！*

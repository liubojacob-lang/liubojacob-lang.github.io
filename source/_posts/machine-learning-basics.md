---
title: 机器学习实战：从线性回归到神经网络
date: 2026-01-20 15:00:00
categories:
  - 后端
  - AI
tags:
  - 机器学习
  - Python
  - 实战教程
  - Scikit-learn
---

## 机器学习概述

机器学习（Machine Learning, ML）是人工智能的核心技术之一，它使计算机能够从数据中学习，而不是通过显式编程。

### 机器学习的三种主要类型

```
┌─────────────────────────────────────────────────┐
│              机器学习分类图                       │
├─────────────────────────────────────────────────┤
│  监督学习          无监督学习        强化学习    │
│  (有标签数据)      (无标签数据)      (奖励机制)  │
│     ↓                ↓                ↓         │
│  分类/回归         聚类/降维       游戏AI       │
│  图像识别         异常检测         机器人控制   │
│  语音识别         关联规则         推荐系统     │
└─────────────────────────────────────────────────┘
```

## 环境准备

首先，让我们安装必要的Python库：

```bash
pip install numpy pandas scikit-learn matplotlib jupyter
```

## 1. 线性回归 - 最简单的机器学习算法

线性回归用于预测连续值。让我们用一个简单的房价预测例子：

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# 生成示例数据
np.random.seed(42)
n_samples = 100
X = np.random.randn(n_samples, 1) * 10 + 50  # 房屋面积 (50-150平米)
y = 2 * X.flatten() + 10 + np.random.randn(n_samples) * 20  # 房价

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 创建并训练模型
model = LinearRegression()
model.fit(X_train, y_train)

# 预测
y_pred = model.predict(X_test)

# 评估
print(f"系数: {model.coef_[0]:.2f}")
print(f"截距: {model.intercept_:.2f}")
print(f"R²分数: {r2_score(y_test, y_pred):.2f}")
print(f"均方误差: {mean_squared_error(y_test, y_pred):.2f}")

# 可视化
plt.scatter(X_test, y_test, color='blue', alpha=0.5, label='实际值')
plt.plot(X_test, y_pred, color='red', linewidth=2, label='预测线')
plt.xlabel('房屋面积 (㎡)')
plt.ylabel('房价 (万元)')
plt.title('线性回归：房屋面积 vs 房价')
plt.legend()
plt.show()
```

**输出示例：**
```
系数: 2.01
截距: 9.87
R²分数: 0.91
均方误差: 376.42
```

## 2. 逻辑回归 - 二分类问题

逻辑回归用于分类任务，例如判断邮件是否为垃圾邮件：

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

# 生成二分类数据
from sklearn.datasets import make_classification
X, y = make_classification(
    n_samples=1000,
    n_features=20,
    n_informative=15,
    n_redundant=5,
    random_state=42
)

# 划分数据集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 训练模型
lr_model = LogisticRegression(max_iter=1000)
lr_model.fit(X_train, y_train)

# 预测
y_pred = lr_model.predict(X_test)

# 评估
print("分类报告:")
print(classification_report(y_test, y_pred))
print("\n混淆矩阵:")
print(confusion_matrix(y_test, y_pred))
```

## 3. 决策树 - 可解释性强的分类器

决策树易于理解和解释，适合可视化展示：

```python
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.datasets import load_iris

# 使用经典鸢尾花数据集
iris = load_iris()
X, y = iris.data, iris.target

# 训练决策树
tree_model = DecisionTreeClassifier(max_depth=3, random_state=42)
tree_model.fit(X, y)

# 可视化决策树
plt.figure(figsize=(12, 8))
plot_tree(tree_model,
          feature_names=iris.feature_names,
          class_names=iris.target_names,
          filled=True,
          rounded=True)
plt.title('决策树：鸢尾花分类')
plt.show()
```

## 4. 随机森林 - 集成学习的威力

随机森林结合多个决策树，提供更好的泛化能力：

```python
from sklearn.ensemble import RandomForestClassifier

rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=5,
    random_state=42
)
rf_model.fit(X_train, y_train)

# 特征重要性
feature_importance = pd.DataFrame({
    'Feature': iris.feature_names,
    'Importance': rf_model.feature_importances_
}).sort_values('Importance', ascending=False)

print("特征重要性:")
print(feature_importance)
```

## 5. K-Means聚类 - 无监督学习

K-Means用于将数据分成K个组：

```python
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

# 生成聚类数据
X_blob, y_blob = make_blobs(
    n_samples=300,
    centers=4,
    cluster_std=0.60,
    random_state=0
)

# K-Means聚类
kmeans = KMeans(n_clusters=4, random_state=42)
y_kmeans = kmeans.fit_predict(X_blob)

# 可视化
plt.scatter(X_blob[:, 0], X_blob[:, 1], c=y_kmeans, s=50, cmap='viridis')
centers = kmeans.cluster_centers_
plt.scatter(centers[:, 0], centers[:, 1],
            c='red', s=200, alpha=0.5, marker='X', label='聚类中心')
plt.title('K-Means聚类结果')
plt.legend()
plt.show()
```

## 6. 神经网络入门 - 深度学习基础

使用多层神经网络处理复杂问题：

```python
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

# 数据标准化（对神经网络很重要）
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 创建神经网络
mlp = MLPClassifier(
    hidden_layer_sizes=(100, 50),
    activation='relu',
    solver='adam',
    max_iter=500,
    random_state=42
)

# 训练
mlp.fit(X_train_scaled, y_train)

# 评估
train_score = mlp.score(X_train_scaled, y_train)
test_score = mlp.score(X_test_scaled, y_test)

print(f"训练集准确率: {train_score:.2%}")
print(f"测试集准确率: {test_score:.2%}")

# 绘制学习曲线
plt.figure(figsize=(10, 5))
plt.plot(mlp.loss_curve_, linewidth=2)
plt.title('神经网络训练损失曲线')
plt.xlabel('迭代次数')
plt.ylabel('损失值')
plt.grid(True)
plt.show()
```

## 模型评估指标

| 任务类型 | 评估指标 | 说明 |
|---------|---------|-----|
| 回归 | MSE, RMSE, MAE, R² | 衡量预测值与实际值的差距 |
| 分类 | 准确率, 精确率, 召回率, F1 | 衡量分类效果 |
| 聚类 | 轮廓系数, Davies-Bouldin | 衡量聚类质量 |

## 实战项目建议

### 初级项目
1. **房价预测** - 使用波士顿房价数据集
2. **泰坦尼克号生存预测** - 二分类问题
3. **手写数字识别** - MNIST数据集

### 中级项目
4. **客户细分** - K-Means聚类
5. **情感分析** - 自然语言处理
6. **股票价格预测** - 时间序列分析

### 高级项目
7. **图像分类** - CNN卷积神经网络
8. **推荐系统** - 协同过滤
9. **文本生成** - RNN/LSTM

## 最佳实践

### 1. 数据预处理

```python
# 处理缺失值
df.fillna(df.mean(), inplace=True)

# 特征缩放
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 编码分类变量
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
y_encoded = le.fit_transform(y)
```

### 2. 交叉验证

```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"交叉验证准确率: {scores.mean():.2%} (+/- {scores.std() * 2:.2%})")
```

### 3. 超参数调优

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 7, None]
}

grid_search = GridSearchCV(
    RandomForestClassifier(),
    param_grid,
    cv=5
)
grid_search.fit(X_train, y_train)

print(f"最佳参数: {grid_search.best_params_}")
```

## 总结

机器学习是一个广阔的领域，从简单的线性回归到复杂的深度神经网络，每种算法都有其适用场景。

**学习路径建议：**
1. 掌握基础算法（线性回归、逻辑回归）
2. 理解模型评估和验证方法
3. 学习集成学习方法（随机森林、GBDT）
4. 进入深度学习领域
5. 在实际项目中应用所学知识

记住：**实践是最好的老师！** 选择感兴趣的数据集，动手实现你的第一个机器学习项目吧！

---

*下一篇将深入讲解深度学习和神经网络，敬请期待！*

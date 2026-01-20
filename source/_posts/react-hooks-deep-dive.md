---
title: React Hooks完全指南：深入理解现代React开发
date: 2026-01-20 23:00:00
categories:
  - 前端
  - React
tags:
  - React
  - Hooks
  - 前端开发
  - JavaScript
---

## 前言

React Hooks 自 React 16.8 版本引入以来，彻底改变了我们编写 React 组件的方式。它让函数组件拥有了状态管理和副作用处理的能力，同时提供了更优雅的代码组织方式。

本文将深入探讨 React Hooks 的核心概念、使用技巧和最佳实践。

## 为什么需要 Hooks？

### Hooks 解决的问题

```javascript
// ❌ 旧方式：类组件的痛点
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.fetchUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
  }

  async fetchUser() {
    this.setState({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${this.props.userId}`);
      const user = await response.json();
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  render() {
    // JSX 渲染逻辑
  }
}

// ✅ 新方式：使用 Hooks
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  async function fetchUser() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // JSX 渲染逻辑
}
```

**Hooks 的优势**：
- ✅ 代码更简洁，逻辑更清晰
- ✅ 相关逻辑组织在一起，而不是分散在不同生命周期方法中
- ✅ 复用状态逻辑更容易
- ✅ 没有 `this` 绑定问题

## 核心 Hooks 详解

### 1. useState - 状态管理

#### 基础用法

```javascript
import { useState } from 'react';

function Counter() {
  // 声明一个叫 count 的状态变量，初始值为 0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

#### 惰性初始化

```javascript
// 如果初始状态需要复杂计算，使用函数避免重复计算
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});
```

#### 函数式更新

```javascript
// 当新状态依赖于旧状态时，使用函数式更新
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // ✅ 正确：使用函数式更新
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    // 结果：count + 3

    // ❌ 错误：直接使用值
    // setCount(count + 1);
    // setCount(count + 1);
    // setCount(count + 1);
    // 结果：只增加 1，因为 count 没有更新
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

#### 对象和数组状态

```javascript
function UserForm() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  });

  const updateField = (field, value) => {
    // ✅ 正确：创建新对象
    setUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateName = (name) => {
    setUser(prev => ({ ...prev, name }));
  };

  return (
    <form>
      <input
        value={user.name}
        onChange={(e) => updateField('name', e.target.value)}
      />
      <input
        value={user.email}
        onChange={(e) => updateField('email', e.target.value)}
      />
    </form>
  );
}
```

### 2. useEffect - 副作用处理

#### 基础用法

```javascript
import { useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // 类似于 componentDidMount 和 componentDidUpdate
  useEffect(() => {
    // 副作用：获取用户数据
    fetchUser(userId).then(setUser);

    // 可选的清理函数：类似于 componentWillUnmount
    return () => {
      console.log('组件卸载或重新渲染前');
    };
  }, [userId]); // 依赖数组：只有 userId 改变时才重新执行

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
```

#### useEffect 的执行时机

```javascript
function EffectDemo() {
  const [count, setCount] = useState(0);

  // 1. 每次渲染后都执行（不推荐）
  useEffect(() => {
    console.log('每次渲染后执行');
  });

  // 2. 只在挂载时执行一次
  useEffect(() => {
    console.log('只在挂载时执行');
  }, []);

  // 3. 当 count 改变时执行
  useEffect(() => {
    console.log('count 改变:', count);
  }, [count]);

  // 4. 带清理函数
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('定时器执行');
    }, 1000);

    return () => clearInterval(timer); // 清理
  }, []);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 常见使用场景

```javascript
// 场景1：数据获取
function DataFetcher({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const result = await response.json();
        if (!cancelled) {
          setData(result);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return <div>加载中...</div>;
  return <div>{data.name}</div>;
}

// 场景2：订阅事件
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      窗口大小: {size.width} x {size.height}
    </div>
  );
}

// 场景3：手动修改 DOM
function FocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

### 3. useContext - 跨组件状态共享

```javascript
import { createContext, useContext, useState } from 'react';

// 1. 创建 Context
const ThemeContext = createContext();

// 2. 创建 Provider 组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. 创建自定义 Hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 4. 使用 Context
function App() {
  return (
    <ThemeProvider>
      <Toolbar />
      <Content />
    </ThemeProvider>
  );
}

function Toolbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      当前主题: {theme}
    </button>
  );
}
```

### 4. useReducer - 复杂状态管理

```javascript
import { useReducer } from 'react';

// Reducer 函数
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>计数: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>
        增加
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        减少
      </button>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>
        重置
      </button>
    </div>
  );
}

// 复杂示例：Todo 应用
const initialState = {
  todos: [],
  filter: 'all'
};

function todoReducer(state, action) {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload,
            completed: false
          }
        ]
      };
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    case 'delete':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    case 'setFilter':
      return {
        ...state,
        filter: action.payload
      };
    default:
      return state;
  }
}
```

### 5. useRef - 访问 DOM 和保存可变值

```javascript
import { useRef, useEffect } from 'react';

// 用法1：访问 DOM 元素
function TextInputWithFocusButton() {
  const inputEl = useRef(null);

  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputEl.current.focus();
  };

  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>
        聚焦输入框
      </button>
    </>
  );
}

// 用法2：保存可变值（不触发重新渲染）
function Timer() {
  const intervalRef = useRef();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    intervalRef.current = id;

    return () => clearInterval(intervalRef.current);
  }, []);

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={stopTimer}>停止</button>
    </div>
  );
}

// 用法3：获取上一次的值
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>当前: {count}</p>
      <p>上一次: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

### 6. useMemo - 性能优化

```javascript
import { useMemo } from 'react';

// 缓存昂贵的计算
function ExpensiveComponent({ items }) {
  // ❌ 每次渲染都重新计算
  // const sorted = items.sort((a, b) => a - b);

  // ✅ 只在 items 改变时重新计算
  const sorted = useMemo(() => {
    console.log('排序计算');
    return items.slice().sort((a, b) => a - b);
  }, [items]);

  return <div>{sorted.join(', ')}</div>;
}

// 缓存复杂对象
function UserProfile({ userId }) {
  const user = useMemo(() => {
    return fetchUser(userId);
  }, [userId]);

  return <div>{user.name}</div>;
}

// 避免不必要的子组件渲染
function ParentComponent({ items }) {
  const sorted = useMemo(
    () => items.slice().sort((a, b) => a.id - b.id),
    [items]
  );

  return <ChildComponent items={sorted} />;
}
```

### 7. useCallback - 函数缓存

```javascript
import { useCallback } from 'react';

// 基础用法
function Form() {
  const [value, setValue] = useState('');

  // ❌ 每次渲染都创建新函数
  // const handleChange = (e) => setValue(e.target.value);

  // ✅ 只有依赖改变时才创建新函数
  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []); // 空依赖数组，函数永远不会改变

  return <input value={value} onChange={handleChange} />;
}

// 配合 useMemo 使用
function ProductList({ products, addToCart }) {
  // 缓存计算结果
  const sortedProducts = useMemo(() => {
    return products.slice().sort((a, b) => a.price - b.price);
  }, [products]);

  // 缓存回调函数
  const handleAddToCart = useCallback((product) => {
    addToCart(product);
  }, [addToCart]);

  return (
    <div>
      {sortedProducts.map(product => (
        <Product
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
```

## 自定义 Hooks

自定义 Hooks 是复用逻辑的强大方式。

### 基础自定义 Hook

```javascript
// 1. 封装数据获取逻辑
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        const result = await response.json();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

// 使用
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(
    `/api/users/${userId}`
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  return <div>{user.name}</div>;
}

// 2. 封装本地存储
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// 使用
function App() {
  const [name, setName] = useLocalStorage('name', 'Guest');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}

// 3. 封装 debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// 使用：搜索框防抖
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // 使用防抖后的搜索词进行搜索
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="搜索..."
    />
  );
}

// 4. 封装窗口大小
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// 5. 封装表单验证
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors(validate({ ...values, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(values));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}

// 使用
function LoginForm() {
  const { values, errors, handleChange, handleBlur, isValid } = useForm(
    { email: '', password: '' },
    (values) => {
      const errors = {};
      if (!values.email) errors.email = '邮箱必填';
      if (!values.password) errors.password = '密码必填';
      return errors;
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      // 提交表单
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {errors.email && <span>{errors.email}</span>}

      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {errors.password && <span>{errors.password}</span>}

      <button disabled={!isValid}>提交</button>
    </form>
  );
}
```

## Hooks 最佳实践

### 1. 遵循 Hooks 规则

```javascript
// ✅ 正确：只在顶层调用 Hooks
function GoodComponent() {
  const [count, setCount] = useState(0);
  const user = useFetch('/api/user');
  useEffect(() => {
    // 副作用
  }, []);
  return <div>{count}</div>;
}

// ❌ 错误：在条件语句中使用
function BadComponent() {
  const [count, setCount] = useState(0);
  if (count > 0) {
    const [data, setData] = useState(null); // ❌ 错误
  }
  return <div>{count}</div>;
}

// ❌ 错误：在循环中使用
function BadComponent() {
  const items = [1, 2, 3];
  items.forEach(item => {
    const [value, setValue] = useState(item); // ❌ 错误
  });
}

// ✅ 正确：提前返回
function GoodComponent({ flag }) {
  const [count, setCount] = useState(0);

  if (flag) {
    return <div>Early return</div>;
  }

  useEffect(() => {
    // OK：所有 Hooks 都在 return 之前调用
  }, []);

  return <div>{count}</div>;
}
```

### 2. 合理使用依赖数组

```javascript
// ✅ 指定所有依赖
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, [props.source]); // ✅ 正确

// ❌ 缺少依赖
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, []); // ❌ 警告：props.source 缺失

// ✅ 使用 ESLint 插件检查依赖
// npm install eslint-plugin-react-hooks --save-dev
```

### 3. 避免过度的优化

```javascript
// ❌ 过度优化：简单计算不需要 useMemo
function SimpleComponent({ a, b }) {
  const sum = useMemo(() => a + b, [a, b]); // ❌ 不必要
  return <div>{sum}</div>;
}

// ✅ 直接计算
function SimpleComponent({ a, b }) {
  return <div>{a + b}</div>;
}

// ✅ 合理使用：昂贵的计算
function ExpensiveComponent({ data }) {
  const result = useMemo(() => {
    return data.filter(item => item.value > 100)
               .map(item => item.value * 2)
               .reduce((a, b) => a + b, 0);
  }, [data]);

  return <div>{result}</div>;
}
```

### 4. 组织自定义 Hooks

```javascript
// ✅ 单一职责：一个 Hook 只做一件事
function useFetch(url) {
  // 只负责数据获取
}

function useLocalStorage(key, initialValue) {
  // 只负责本地存储
}

// ❌ 职责混乱
function useFetchAndStore(url, key) {
  // 既负责获取数据又负责存储
}

// ✅ 组合使用
function UserProfile({ userId }) {
  const { data } = useFetch(`/api/users/${userId}`);
  useLocalStorage(`user_${userId}`, data);
  return <div>{data.name}</div>;
}
```

## 常见陷阱和解决方案

### 1. 闭包陷阱

```javascript
// ❌ 问题：闭包捕获旧值
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // 总是打印 0
    }, 1000);
    return () => clearInterval(id);
  }, []); // 空依赖数组

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ 解决方案1：使用函数式更新
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>{count}</div>;
}

// ✅ 解决方案2：使用 useRef
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 2. 无限循环

```javascript
// ❌ 问题：无限循环
function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }); // ❌ 缺少依赖数组，每次渲染都执行

  return <div>{data}</div>;
}

// ✅ 解决方案：添加依赖数组
function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []); // ✅ 只在挂载时执行

  return <div>{data}</div>;
}

// ❌ 问题：对象作为依赖导致无限循环
function Component({ user }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    fetch('/api/token').then(res => res.json()).then(setToken);
  }, [user]); // ❌ user 是对象，每次都是新引用

  return <div>{token}</div>;
}

// ✅ 解决方案：只依赖具体属性
function Component({ user }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    fetch('/api/token').then(res => res.json()).then(setToken);
  }, [user.id]); // ✅ 只依赖 ID

  return <div>{token}</div>;
}
```

### 3. 条件渲染中的 Hooks

```javascript
// ❌ 错误：条件调用 Hooks
function Component({ flag }) {
  if (flag) {
    const [value, setValue] = useState(0); // ❌ 错误
  }
  return <div></div>;
}

// ✅ 解决方案1：提前计算
function Component({ flag }) {
  const [value, setValue] = useState(0);

  if (!flag) {
    return null;
  }

  return <div>{value}</div>;
}

// ✅ 解决方案2：提取组件
function ConditionalHook({ flag }) {
  const [value, setValue] = useState(0);
  return <div>{value}</div>;
}

function Component({ flag }) {
  return flag ? <ConditionalHook /> : null;
}
```

## 性能优化技巧

### 1. 使用 React.memo 避免不必要的渲染

```javascript
const MyComponent = React.memo(function MyComponent({ name }) {
  console.log('渲染 MyComponent');
  return <div>{name}</div>;
});

// 使用自定义比较函数
const MyComponent = React.memo(
  function MyComponent({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // 返回 true 表示不需要重新渲染
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 2. 虚拟化长列表

```javascript
// 使用 react-window
import { FixedSizeList } from 'react-window';

function Row({ index, style }) {
  return (
    <div style={style}>
      行 {index}
    </div>
  );
}

function VirtualizedList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 3. 代码分割和懒加载

```javascript
import { lazy, Suspense } from 'react';

// 懒加载组件
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// 路由级别的代码分割
const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

## 总结

React Hooks 是现代 React 开发的核心，掌握它能让你写出更简洁、更易维护的代码。

**核心要点**：
1. ✅ 遵循 Hooks 规则（只在顶层调用）
2. ✅ 合理使用依赖数组
3. ✅ 提取自定义 Hooks 复用逻辑
4. ✅ 使用 useMemo 和 useCallback 优化性能
5. ✅ 避免常见的闭包和无限循环陷阱

**学习路径**：
1. 理解基础 Hooks（useState, useEffect）
2. 掌握高级 Hooks（useContext, useReducer）
3. 学习自定义 Hooks
4. 性能优化技巧
5. 实战项目应用

**推荐资源**：
- [React 官方文档](https://react.dev/)
- [Hooks FAQ](https://react.dev/reference/react)
- [useHooks.com](https://usehooks.com/)
- [Hooks 规则 ESLint 插件](https://www.npmjs.com/package/eslint-plugin-react-hooks)

继续探索 Hooks 的强大功能，构建更优秀的 React 应用！

---

*下一篇将深入讲解 React 性能优化和并发模式，敬请期待！*

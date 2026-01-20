---
title: Vue3完全指南：组合式API与响应式原理深度解析
date: 2026-01-21 00:00:00
categories:
  - 前端
  - Vue
tags:
  - Vue3
  - Composition API
  - 响应式
  - 前端开发
---

## 前言

Vue3 带来了全新的 Composition API（组合式 API），相比 Options API 提供了更好的逻辑复用和类型推断。同时，Vue3 的响应式系统也从 Object 升级到了 Proxy，性能和功能都有了显著提升。

本文将深入解析 Vue3 的核心特性。

## 一、Composition API 基础

### setup 函数

```javascript
import { ref, reactive, computed, onMounted } from 'vue';

export default {
  setup() {
    // 响应式状态
    const count = ref(0);
    const user = reactive({ name: 'Alice', age: 25 });

    // 计算属性
    const doubleCount = computed(() => count.value * 2);

    // 方法
    const increment = () => {
      count.value++;
    };

    // 生命周期钩子
    onMounted(() => {
      console.log('组件已挂载');
    });

    // 返回给模板使用
    return {
      count,
      user,
      doubleCount,
      increment
    };
  }
};
```

### `<script setup>` 语法糖

```vue
<script setup>
import { ref, computed, onMounted } from 'vue';

// 自动注册的响应式状态
const count = ref(0);
const user = reactive({ name: 'Alice', age: 25 });

// 自动暴露给模板
const doubleCount = computed(() => count.value * 2);

function increment() {
  count.value++;
}

onMounted(() => {
  console.log('组件已挂载');
});
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">增加</button>
  </div>
</template>
```

## 二、响应式系统

### ref vs reactive

```javascript
import { ref, reactive } from 'vue';

// ref - 用于基本类型和对象
const count = ref(0);
const user = ref({ name: 'Alice', age: 25 });

// 访问值需要 .value
count.value++;
console.log(user.value.name);

// reactive - 只用于对象
const state = reactive({
  count: 0,
  user: { name: 'Alice', age: 25 }
});

// 直接访问属性
state.count++;
console.log(state.user.name);

// ⚠️ reactive 解构失去响应性
const { count } = state;
count++; // 不会触发更新

// ✅ 使用 toRefs 保持响应性
import { toRefs } from 'vue';
const { count } = toRefs(state);
count.value++; // ✅ 响应式
```

### 响应式转换工具

```javascript
import { ref, reactive, toRef, toRefs, readonly, isRef, isReactive } from 'vue';

// toRef - 为响应式对象的属性创建 ref
const state = reactive({ count: 0 });
const countRef = toRef(state, 'count');
countRef.value++; // ✅ 会更新 state.count

// toRefs - 将响应式对象转换为普通对象，每个属性都是 ref
const state = reactive({
  count: 0,
  name: 'Vue'
});
const { count, name } = toRefs(state);

// readonly - 创建只读的响应式对象
const original = reactive({ count: 0 });
const copy = readonly(original);

copy.count++; // ⚠️ 警告：不能修改只读对象

// 判断类型
console.log(isRef(ref(0)));         // true
console.log(isReactive(reactive({}))); // true
```

### computed 计算属性

```javascript
import { ref, computed } from 'vue';

const count = ref(0);

// 只读计算属性
const doubleCount = computed(() => count.value * 2);

// 可写计算属性
const doubleCount = computed({
  get() {
    return count.value * 2;
  },
  set(value) {
    count.value = value / 2;
  }
});

doubleCount.value = 10; // 会设置 count.value = 5

// 计算属性缓存
const expensiveValue = computed(() => {
  console.log('计算中...');
  return heavyComputation(count.value);
});

// 只有 count 改变时才重新计算
```

### watch 和 watchEffect

```javascript
import { ref, watch, watchEffect } from 'vue';

const count = ref(0);
const user = reactive({ name: 'Alice' });

// watchEffect - 自动追踪依赖，立即执行
watchEffect(() => {
  console.log(`Count is: ${count.value}`);
});

// watch - 明确指定源，懒执行
watch(count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`);
});

// 监听多个源
watch([count, () => user.name], ([newCount, newName]) => {
  console.log(`count: ${newCount}, name: ${newName}`);
});

// 深度监听
watch(
  () => user,
  (newValue) => {
    console.log('user changed:', newValue);
  },
  { deep: true } // 深度监听
);

// 立即执行
watch(
  count,
  (value) => {
    console.log('count:', value);
  },
  { immediate: true }
);

// watchEffect 停止监听
const stop = watchEffect(() => {
  console.log(count.value);
});

// 调用 stop 停止监听
stop();
```

## 三、生命周期钩子

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered
} from 'vue';

export default {
  setup() {
    onBeforeMount(() => {
      console.log('挂载之前');
    });

    onMounted(() => {
      console.log('已挂载');
    });

    onBeforeUpdate(() => {
      console.log('更新之前');
    });

    onUpdated(() => {
      console.log('已更新');
    });

    onBeforeUnmount(() => {
      console.log('卸载之前');
    });

    onUnmounted(() => {
      console.log('已卸载');
    });

    // 错误捕获
    onErrorCaptured((err, instance, info) => {
      console.error('错误:', err);
      return false; // 阻止错误继续传播
    });

    // 调试钩子
    onRenderTracked((e) => {
      console.log('跟踪:', e);
    });

    onRenderTriggered((e) => {
      console.log('触发:', e);
    });
  }
};

// Options API vs Composition API 生命周期对照
/*
Options API           | Composition API
---------------------|---------------------
beforeCreate         | setup()
created              | setup()
beforeMount          | onBeforeMount
mounted              | onMounted
beforeUpdate         | onBeforeUpdate
updated              | onUpdated
beforeUnmount        | onBeforeUnmount
unmounted            | onUnmounted
errorCaptured        | onErrorCaptured
*/
```

## 四、组件通信

### Props 和 Emits

```vue
<!-- 父组件 Parent.vue -->
<script setup>
import { ref } from 'vue';
import Child from './Child.vue';

const count = ref(0);
const message = ref('Hello from parent');

function receiveFromChild(data) {
  console.log('来自子组件:', data);
}
</script>

<template>
  <Child
    :count="count"
    :message="message"
    @update="receiveFromChild"
  />
</template>

<!-- 子组件 Child.vue -->
<script setup>
// 定义 props
const props = defineProps({
  count: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    default: 'Default message'
  }
});

// 定义 emits
const emit = defineEmits(['update']);

function sendToParent() {
  emit('update', { data: 'Hello from child' });
}
</script>

<template>
  <div>
    <p>Count: {{ props.count }}</p>
    <p>Message: {{ props.message }}</p>
    <button @click="sendToParent">发送给父组件</button>
  </div>
</template>
```

### provide/inject

```javascript
// 祖先组件
import { provide, ref, readonly } from 'vue';

const theme = ref('light');

provide('theme', readonly(theme)); // 提供只读主题
provide('updateTheme', (newTheme) => {
  theme.value = newTheme;
});

// 后代组件
import { inject } from 'vue';

const theme = inject('theme', 'light'); // 默认值 'light'
const updateTheme = inject('updateTheme');

// 使用 TypeScript
import { inject } from 'vue';
import type { InjectionKey } from 'vue';

// 定义注入键
interface Theme {
  value: string;
}
const themeKey: InjectionKey<Theme> = Symbol('theme');

// 提供
provide(themeKey, theme);

// 注入
const theme = inject(themeKey);
```

### expose 和 ref

```vue
<!-- 子组件 Child.vue -->
<script setup>
const count = ref(0);

function increment() {
  count.value++;
}

// 暴露给父组件
defineExpose({
  count,
  increment
});
</script>

<!-- 父组件 Parent.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import Child from './Child.vue';

const childRef = ref(null);

onMounted(() => {
  console.log(childRef.value.count);  // 访问子组件数据
  childRef.value.increment();         // 调用子组件方法
});
</script>

<template>
  <Child ref="childRef" />
</template>
```

### v-model

```vue
<!-- 父组件 -->
<script setup>
import { ref } from 'vue';
import Child from './Child.vue';

const message = ref('Hello');

// 等同于：
// <Child :modelValue="message" @update:modelValue="message = $event" />
</script>

<template>
  <Child v-model="message" />
  <p>Message: {{ message }}</p>
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

function update(e) {
  emit('update:modelValue', e.target.value);
}
</script>

<template>
  <input :value="props.modelValue" @input="update" />
</template>

<!-- 多个 v-model -->
<UserName
  v-model:first-name="first"
  v-model:last-name="last"
/>

<script setup>
const props = defineProps(['firstName', 'lastName']);
const emit = defineEmits(['update:firstName', 'update:lastName']);
</script>
```

## 五、Composition API 高级用法

### 自定义组合式函数（Composables）

```javascript
// useMouse.js - 鼠标位置追踪
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(event) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  onMounted(() => {
    window.addEventListener('mousemove', update);
  });

  onUnmounted(() => {
    window.removeEventListener('mousemove', update);
  });

  return { x, y };
}

// 使用
<script setup>
import { useMouse } from './useMouse';

const { x, y } = useMouse();
</script>

<template>
  <p>Mouse position: {{ x }}, {{ y }}</p>
</template>
```

```javascript
// useLocalStorage.js - 本地存储
import { ref, watch } from 'vue';

export function useLocalStorage(key, defaultValue) {
  const storedValue = localStorage.getItem(key);
  const value = ref(storedValue ? JSON.parse(storedValue) : defaultValue);

  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue));
  }, { deep: true });

  return value;
}

// 使用
const count = useLocalStorage('count', 0);
```

```javascript
// useFetch.js - 数据获取
import { ref, onMounted } from 'vue';

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(true);

  async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(url);
      data.value = await response.json();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchData();
  });

  return { data, error, loading, refresh: fetchData };
}

// 使用
const { data, error, loading, refresh } = useFetch('/api/user');
```

### 响应式工具函数

```javascript
// 1. 防抖
import { watch, watchEffect } from 'vue';

export function useDebounce(fn, delay = 300) {
  let timeoutId = null;

  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 响应式防抖
export function watchDebounce(source, cb, delay = 300) {
  let timeoutId = null;

  return watch(
    source,
    (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        cb(...args);
      }, delay);
    },
    { immediate: true }
  );
}

// 2. 节流
export function useThrottle(fn, delay = 300) {
  let lastCall = 0;

  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// 3. useArray - 数组操作
export function useArray(initial = []) {
  const array = ref(initial);

  const push = (item) => array.value.push(item);
  const pop = () => array.value.pop();
  const shift = () => array.value.shift();
  const unshift = (item) => array.value.unshift(item);
  const remove = (index) => array.value.splice(index, 1);

  return {
    array,
    push,
    pop,
    shift,
    unshift,
    remove
  };
}

// 4. useCounter - 计数器
export function useCounter(initial = 0) {
  const count = ref(initial);

  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => count.value = initial;
  const setValue = (value) => count.value = value;

  return {
    count,
    increment,
    decrement,
    reset,
    setValue
  };
}
```

## 六、响应式原理深度解析

### Proxy vs Object.defineProperty

```javascript
// Vue2 - Object.defineProperty
function defineReactive(obj, key, val) {
  const dep = []; // 依赖收集

  Object.defineProperty(obj, key, {
    get() {
      dep.forEach(fn => fn()); // 收集依赖
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal;
        dep.forEach(fn => fn()); // 触发更新
      }
    }
  });
}

// ⚠️ Vue2 的限制
const obj = {};
defineReactive(obj, 'name', 'Alice');
obj.name = 'Bob'; // ✅ 可以检测到
obj.age = 25;     // ❌ 无法检测新增属性
delete obj.name;  // ❌ 无法检测删除
obj.arr.push(1);  // ❌ 无法检测数组索引变化

// Vue3 - Proxy
function reactive(obj) {
  const handlers = {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      // 依赖收集
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key);
      }
      return result;
    }
  };

  return new Proxy(obj, handlers);
}

// ✅ Vue3 可以检测所有操作
const obj = reactive({ name: 'Alice' });
obj.name = 'Bob';  // ✅ 可以检测
obj.age = 25;      // ✅ 可以检测
delete obj.name;   // ✅ 可以检测
```

### 简化的响应式系统实现

```javascript
// 依赖收集
let activeEffect = null;
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => {
      effect();
    });
  }
}

// 响应式对象
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      // 嵌套对象递归代理
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    }
  });
}

// ref 实现
function ref(value) {
  return reactive({
    get value() {
      return this._value;
    },
    set value(newValue) {
      this._value = newValue;
    },
    _value: value
  });
}

// effect 实现
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 使用示例
const state = reactive({ count: 0 });

effect(() => {
  console.log('Count is:', state.count);
});

state.count++; // 自动触发 effect
```

### computed 实现

```javascript
function computed(getter) {
  let _value;
  let _dirty = true;

  const effectFn = effect(() => {
    _value = getter();
    _dirty = false;
  });

  return {
    get value() {
      if (_dirty) {
        effectFn();
      }
      return _value;
    }
  };
}

// 使用
const count = ref(0);
const doubleCount = computed(() => count.value * 2);

console.log(doubleCount.value); // 0
count.value++;
console.log(doubleCount.value); // 2
```

## 七、性能优化

### 虚拟DOM和Diff算法

```javascript
// Vue3 使用最长递增子序列算法优化 diff
// 时间复杂度从 O(n³) 降低到 O(n)

function patchKeyedChildren(c1, c2, container) {
  let i = 0;
  let e1 = c1.length - 1;
  let e2 = c2.length - 1;

  // 1. 从前往后同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[i];
    const n2 = c2[i];
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2);
    } else {
      break;
    }
    i++;
  }

  // 2. 从后往前同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1];
    const n2 = c2[e2];
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2);
    } else {
      break;
    }
    e1--;
    e2--;
  }

  // 3. 处理新增节点
  if (i > e1) {
    if (i <= e2) {
      const nextPos = e2 + 1;
      const anchor = nextPos < c2.length ? c2[nextPos] : null;
      while (i <= e2) {
        patch(null, c2[i], anchor);
        i++;
      }
    }
  }

  // 4. 处理删除节点
  else if (i > e2) {
    while (i <= e1) {
      unmount(c1[i]);
      i++;
    }
  }

  // 5. 处理未知序列（使用最长递增子序列）
  else {
    const s1 = i;
    const s2 = i;
    const keyToNewIndexMap = new Map();

    for (let i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i);
    }

    let j;
    let patched = 0;
    const toBePatched = e2 - s2 + 1;
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

    for (let i = s1; i <= e1; i++) {
      if (patched >= toBePatched) {
        unmount(c1[i]);
        continue;
      }

      let newIndex;
      if (c1[i].key != null) {
        newIndex = keyToNewIndexMap.get(c1[i].key);
      } else {
        for (j = s2; j <= e2; j++) {
          if (isSameVNodeType(c1[i], c2[j])) {
            newIndex = j;
            break;
          }
        }
      }

      if (newIndex === undefined) {
        unmount(c1[i]);
      } else {
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        patch(c1[i], c2[newIndex]);
        patched++;
      }
    }

    const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
    j = increasingNewIndexSequence.length - 1;

    for (let i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i;
      const nextChild = c2[nextIndex];
      const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1] : null;

      if (newIndexToOldIndexMap[i] === 0) {
        patch(null, nextChild, anchor);
      } else {
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          move(nextChild, anchor);
        } else {
          j--;
        }
      }
    }
  }
}
```

### 组件优化技巧

```vue
<!-- 1. 使用 v-once 只渲染一次 -->
<template>
  <div v-once>
    <h1>{{ title }}</h1>
    <p>{{ staticContent }}</p>
  </div>

  <div>
    <p>{{ dynamicContent }}</p>
  </div>
</template>

<!-- 2. 使用 v-memo 跳过不必要的更新 -->
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    <p>{{ item.name }}</p>
    <span v-if="item.selected">Selected</span>
  </div>
</template>

<!-- 3. 异步组件 -->
<script setup>
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);

// 带配置的异步组件
const AsyncComponentWithOptions = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
});
</script>

<!-- 4. keep-alive 缓存组件 -->
<template>
  <keep-alive :include="['Home', 'About']" :max="10">
    <component :is="currentComponent" />
  </keep-alive>
</template>
```

## 八、TypeScript 支持

```typescript
// 为 props 定义类型
<script setup lang="ts">
interface User {
  id: number;
  name: string;
  age: number;
}

const props = defineProps<{
  user: User;
  count: number;
}>();

// 带默认值
const props = withDefaults(defineProps<{
  user?: User;
  count: number;
}>(), {
  user: () => ({ id: 0, name: '', age: 0 }),
  count: 0
});

// 为 emits 定义类型
const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'delete', id: number): void;
}>();

// ref 添加类型
const count = ref<number>(0);
const user = ref<User | null>(null);

// reactive 添加类型
interface State {
  count: number;
  user: User | null;
}
const state = reactive<State>({
  count: 0,
  user: null
});

// computed 添加类型
const doubleCount = computed<number>(() => count.value * 2);

// 组合式函数添加类型
function useMouse() {
  const x = ref(0);
  const y = ref(0);

  return {
    x: Readonly<Ref<number>>,
    y: Readonly<Ref<number>>
  };
}
</script>
```

## 总结

### Vue3 核心优势
- ✅ Composition API 提供更好的逻辑复用
- ✅ Proxy 响应式系统更强大
- ✅ 更好的 TypeScript 支持
- ✅ 性能提升（更小的包，更快的渲染）
- ✅ Tree-shaking 友好

### 学习路径
1. 掌握 setup 和基础 API
2. 理解响应式原理
3. 学习组合式函数
4. 实战项目巩固
5. 性能优化

### 推荐资源
- [Vue3 官方文档](https://cn.vuejs.org/)
- [Vue3 源码解析](https://github.com/vuejs/core)

Vue3 的 Composition API 让代码更易维护和测试，是现代 Vue 开发的首选方式！

---

*下一篇将深入前端工程化和构建优化，敬请期待！*

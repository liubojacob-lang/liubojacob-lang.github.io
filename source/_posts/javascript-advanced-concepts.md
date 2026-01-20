---
title: JavaScript深入理解：闭包、原型链与异步编程
date: 2026-01-20 23:45:00
categories:
  - 前端
  - JavaScript
tags:
  - JavaScript
  - 闭包
  - 原型链
  - 异步编程
  - 前端开发
---

## 前言

JavaScript 作为一门动态语言，有一些独特而强大的特性。深入理解闭包、原型链和异步编程，是从会用 JavaScript 到精通 JavaScript 的必经之路。本文将深入剖析这些核心概念。

## 一、闭包（Closure）

### 什么是闭包？

闭包是指函数能够记住并访问其词法作用域，即使函数在其词法作用域之外执行。

```javascript
// 基础闭包示例
function createCounter() {
  let count = 0;  // 私有变量

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
console.log(counter.count);       // undefined - 无法直接访问
```

### 闭包的原理

```javascript
function outerFunction(outerVar) {
  return function innerFunction(innerVar) {
    console.log('outerVar:', outerVar);
    console.log('innerVar:', innerVar);
  };
}

const myClosure = outerFunction('outside');
myClosure('inside'); // 输出: outerVar: outside, innerVar: inside

// 闭包的作用域链
function scopeChain() {
  let a = 1;

  function level1() {
    let b = 2;

    function level2() {
      let c = 3;
      console.log(a, b, c); // 1 2 3
    }

    return level2;
  }

  return level1();
}

const closure = scopeChain();
closure(); // 仍然可以访问 a, b, c
```

### 闭包的常见应用场景

#### 1. 数据私有化

```javascript
function createUser(name) {
  let _name = name;  // 私有变量
  let _age = 0;

  return {
    getName() {
      return _name;
    },
    getAge() {
      return _age;
    },
    setAge(age) {
      if (age > 0) {
        _age = age;
      }
    },
    greet() {
      console.log(`Hello, I'm ${_name}, ${_age} years old`);
    }
  };
}

const user = createUser('Alice');
user.greet();           // Hello, I'm Alice, 0 years old
user.setAge(25);
user.greet();           // Hello, I'm Alice, 25 years old
console.log(user._name); // undefined - 无法直接访问
```

#### 2. 函数柯里化（Currying）

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

// 使用示例
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));    // 6
console.log(curriedAdd(1, 2)(3));    // 6
console.log(curriedAdd(1)(2, 3));    // 6
console.log(curriedAdd(1, 2, 3));    // 6

// 实际应用：配置复用
const fetch = curry((baseUrl, endpoint, params) => {
  return fetch(`${baseUrl}${endpoint}`, params);
});

const githubFetch = fetch('https://api.github.com');
githubFetch('/users', { method: 'GET' });
githubFetch('/repos', { method: 'GET' });
```

#### 3. 防抖和节流

```javascript
// 防抖
function debounce(func, wait, immediate = false) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(this, args);
  };
}

// 节流
function throttle(func, limit) {
  let inThrottle;

  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 使用示例
const debouncedSearch = debounce((query) => {
  console.log('搜索:', query);
}, 300);

const throttledScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY);
}, 100);
```

#### 4. 模块模式

```javascript
const myModule = (function() {
  // 私有变量和函数
  let privateVar = 'private';
  function privateFunc() {
    console.log('私有函数');
  }

  // 公共API
  return {
    publicMethod() {
      privateFunc();
      return privateVar;
    },
    publicVar: 'public'
  };
})();

console.log(myModule.publicMethod()); // 私有函数 \n private
console.log(myModule.publicVar);       // public
console.log(myModule.privateVar);     // undefined
```

### 闭包的内存问题

```javascript
// ⚠️ 潜在的内存泄漏
function createElements() {
  const arr = new Array(1000000).fill('data');

  return {
    getArr() {
      return arr;
    }
  };
}

const elements = createElements();
// arr 数组会一直存在于内存中，直到 elements 被销毁

// ✅ 解决方案：及时释放引用
function createElements() {
  const arr = new Array(1000000).fill('data');

  return {
    getArr() {
      return arr.slice();  // 返回副本
    },
    destroy() {
      // 清理大数组
      arr.length = 0;
    }
  };
}

const elements = createElements();
const data = elements.getArr();
elements.destroy();  // 手动释放内存
elements = null;     // 解除引用
```

### 经典面试题

```javascript
// 面试题1：循环中的闭包
// ❌ 错误写法
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 输出: 3, 3, 3
}

// ✅ 解决方案1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 输出: 0, 1, 2
}

// ✅ 解决方案2：使用闭包
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100); // 输出: 0, 1, 2
  })(i);
}

// ✅ 解决方案3：使用 bind
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(null, i), 100); // 输出: 0, 1, 2
}

// 面试题2：实现单例
const Singleton = (function() {
  let instance;

  function createInstance() {
    return {
      name: 'Singleton',
      method() {
        console.log('Singleton method');
      }
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true
```

## 二、原型链（Prototype Chain）

### 理解原型

JavaScript 没有传统的类继承，而是使用原型链实现继承。

```javascript
// 原型链示例
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('Alice');

// 原型链关系
console.log(person.__proto__ === Person.prototype);             // true
console.log(Person.prototype.__proto__ === Object.prototype);  // true
console.log(Object.prototype.__proto__ === null);              // true

// 属性查找过程
console.log(person.name);      // 'Alice' - 从实例找到
console.log(person.sayHello);  // Function - 从原型找到
console.log(person.toString);  // Function - 从 Object.prototype 找到
```

### 原型链示意图

```
person (实例)
  ↓ __proto__
Person.prototype
  ↓ __proto__
Object.prototype
  ↓ __proto__
null
```

### 原型继承

```javascript
// 1. 构造函数继承
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

function Dog(name, breed) {
  Animal.call(this, name);  // 调用父类构造函数
  this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log(`${this.name} is barking`);
};

const dog = new Dog('Buddy', 'Golden Retriever');
dog.eat();   // Buddy is eating
dog.bark();  // Buddy is barking

// 2. ES6 class 继承
class Animal {
  constructor(name) {
    this.name = name;
  }

  eat() {
    console.log(`${this.name} is eating`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // 调用父类构造函数
    this.breed = breed;
  }

  bark() {
    console.log(`${this.name} is barking`);
  }
}

const dog = new Dog('Buddy', 'Golden Retriever');
```

### 原型方法 vs 实例方法

```javascript
// ❌ 低效：每次创建实例都创建新方法
function Person(name) {
  this.name = name;
  this.sayHello = function() {  // 实例方法
    console.log(`Hello, I'm ${this.name}`);
  };
}

const person1 = new Person('Alice');
const person2 = new Person('Bob');
console.log(person1.sayHello === person2.sayHello); // false

// ✅ 高效：方法在原型上共享
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {  // 原型方法
  console.log(`Hello, I'm ${this.name}`);
};

const person1 = new Person('Alice');
const person2 = new Person('Bob');
console.log(person1.sayHello === person2.sayHello); // true
```

### Object.create 实现

```javascript
// 简化版 Object.create
function objectCreate(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}

// 使用示例
const person = {
  name: 'Alice',
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

const anotherPerson = objectCreate(person);
anotherPerson.name = 'Bob';
anotherPerson.sayHello(); // Hello, I'm Bob
```

### 原型链实用技巧

```javascript
// 1. 方法扩展
Array.prototype.first = function() {
  return this[0];
};

Array.prototype.last = function() {
  return this[this.length - 1];
};

[1, 2, 3].first(); // 1
[1, 2, 3].last();  // 3

// 2. 检测原型关系
console.log(instance instanceof Constructor);  // instanceof
console.log(Constructor.prototype.isPrototypeOf(instance));  // isPrototypeOf

// 3. 获取对象原型
console.log(Object.getPrototypeOf(instance));
console.log(Object.getPrototypeOf(instance) === Constructor.prototype);

// 4. 设置对象原型
const obj = Object.create({ protoMethod() {} });
Object.setPrototypeOf(obj, { newMethod() {} });
```

## 三、异步编程

### 回调函数（Callback）

```javascript
// 基础回调
function fetchData(callback) {
  setTimeout(() => {
    const data = { id: 1, name: 'Alice' };
    callback(data);
  }, 1000);
}

fetchData(function(data) {
  console.log('收到数据:', data);
});

// 回调地狱（Callback Hell）
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        // 嵌套太深！
      });
    });
  });
});
```

### Promise

```javascript
// 基础 Promise
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true;
      if (success) {
        resolve({ id: 1, name: 'Alice' });
      } else {
        reject(new Error('请求失败'));
      }
    }, 1000);
  });
}

// 使用 then/catch
fetchData()
  .then(data => console.log('数据:', data))
  .catch(error => console.error('错误:', error))
  .finally(() => console.log('完成'));

// Promise 链式调用
fetchData()
  .then(data => {
    console.log('第一步:', data);
    return fetchMoreData(data.id);  // 返回新的 Promise
  })
  .then(moreData => {
    console.log('第二步:', moreData);
    return fetchEvenMoreData(moreData.id);
  })
  .then(evenMoreData => {
    console.log('第三步:', evenMoreData);
  })
  .catch(error => {
    console.error('任何步骤出错:', error);
  });
```

### Promise 实用方法

```javascript
// Promise.all - 所有成功才算成功
Promise.all([
  fetchUser(1),
  fetchPosts(1),
  fetchComments(1)
])
  .then(([user, posts, comments]) => {
    console.log('所有数据:', { user, posts, comments });
  })
  .catch(error => {
    console.error('任何一个失败:', error);
  });

// Promise.race - 谁快用谁
Promise.race([
  fetchFromServer1(),
  fetchFromServer2()
])
  .then(data => {
    console.log('最快返回的结果:', data);
  });

// Promise.allSettled - 返回所有结果（无论成功失败）
Promise.allSettled([
  fetchTask1(),
  fetchTask2(),
  fetchTask3()
])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`任务${index + 1}成功:`, result.value);
      } else {
        console.log(`任务${index + 1}失败:`, result.reason);
      }
    });
  });

// Promise.any - 第一个成功的结果
Promise.any([
  fetchFromMirror1(),
  fetchFromMirror2(),
  fetchFromMirror3()
])
  .then(data => {
    console.log('第一个成功的:', data);
  })
  .catch(error => {
    console.error('全部失败:', error);
  });
```

### async/await

```javascript
// async/await 让异步代码看起来像同步代码
async function fetchAllData() {
  try {
    const user = await fetchUser(1);
    console.log('用户:', user);

    const posts = await fetchPosts(user.id);
    console.log('文章:', posts);

    const comments = await fetchComments(posts[0].id);
    console.log('评论:', comments);

    return { user, posts, comments };
  } catch (error) {
    console.error('错误:', error);
    throw error;
  }
}

// 并行执行
async function fetchAllDataParallel() {
  try {
    const [user, posts, comments] = await Promise.all([
      fetchUser(1),
      fetchPosts(1),
      fetchComments(1)
    ]);

    return { user, posts, comments };
  } catch (error) {
    console.error('错误:', error);
    throw error;
  }
}

// 顺序执行
async function processItems(items) {
  const results = [];
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
  }
  return results;
}

// 并行执行（批量）
async function processItems(items, batchSize = 5) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
  }
  return results;
}
```

### 事件循环（Event Loop）

```javascript
// 理解事件循环
console.log('1. 开始');

setTimeout(() => {
  console.log('2. setTimeout (宏任务)');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Promise (微任务)');
});

console.log('4. 结束');

// 输出顺序：
// 1. 开始
// 4. 结束
// 3. Promise (微任务)
// 2. setTimeout (宏任务)

// 完整示例
console.log('start');

setTimeout(() => {
  console.log('timeout1');
  Promise.resolve().then(() => {
    console.log('promise1');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('promise2');
  setTimeout(() => {
    console.log('timeout2');
  }, 0);
});

console.log('end');

// 输出：
// start
// end
// promise2
// timeout1
// promise1
// timeout2
```

### 实战：串行和并行控制

```javascript
// 串行执行
async function series(tasks) {
  const results = [];
  for (const task of tasks) {
    const result = await task();
    results.push(result);
  }
  return results;
}

// 并行执行
async function parallel(tasks) {
  return await Promise.all(tasks.map(task => task()));
}

// 限制并发数
async function parallelLimit(tasks, limit = 2) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const promise = task().then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return await Promise.all(results);
}

// 使用示例
const tasks = [
  () => delay(1000).then(() => 'Task 1'),
  () => delay(2000).then(() => 'Task 2'),
  () => delay(1500).then(() => 'Task 3'),
  () => delay(800).then(() => 'Task 4'),
  () => delay(1200).then(() => 'Task 5'),
];

await parallelLimit(tasks, 2);
// 最多同时执行2个任务
```

### 错误处理

```javascript
// try-catch 捕获错误
async function handleRequest() {
  try {
    const data = await fetchData();
    const processed = await processData(data);
    return processed;
  } catch (error) {
    console.error('请求失败:', error);
    // 可以选择：
    // 1. 返回默认值
    // return null;
    // 2. 重试
    // return retryRequest();
    // 3. 向上抛出
    throw error;
  }
}

// 全局错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
  event.preventDefault(); // 阻止默认处理
});

// 高级：重试机制
async function retry(fn, options = {}) {
  const {
    times = 3,
    delay = 1000,
    backoff = 2
  } = options;

  let lastError;

  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < times - 1) {
        const waitTime = delay * Math.pow(backoff, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

// 使用
const data = await retry(
  () => fetchData(),
  { times: 3, delay: 1000, backoff: 2 }
);
```

## 总结

### 闭包要点
- ✅ 函数能够访问其词法作用域
- ✅ 用于数据私有化、函数柯里化、模块模式
- ⚠️ 注意内存泄漏问题

### 原型链要点
- ✅ JavaScript 使用原型链实现继承
- ✅ `__proto__` 指向原型对象
- ✅ 原型方法比实例方法更高效

### 异步编程要点
- ✅ 回调 → Promise → async/await
- ✅ 理解事件循环和宏任务/微任务
- ✅ 合理使用并行和串行执行

**学习建议**：
1. 多写代码实践这些概念
2. 阅读优秀开源代码
3. 做项目巩固知识

---

*下一篇将深入讲解 Vue3 组合式 API 和响应式原理，敬请期待！*

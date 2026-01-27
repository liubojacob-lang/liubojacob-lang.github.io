---
title: TypeScript完全指南：从基础到高级类型系统
slug: typescript-advanced-type-system-guide
cover: /images/typescript-advanced-guide.webp
top_img: /images/typescript-advanced-guide.webp
date: 2026-01-21 00:30:00
categories:
  - 前端
  - TypeScript
tags:
  - TypeScript
  - 类型系统
  - 前端开发
---

## 前言

TypeScript 为 JavaScript 添加了强大的类型系统，让代码更健壮、更易维护。本文将深入讲解 TypeScript 的核心概念，从基础类型到高级特性。

## 一、基础类型

### 基本类型注解

```typescript
// 基础类型
let username: string = 'Alice';
let age: number = 25;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// 数组
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ['a', 'b', 'c'];

// 元组（固定长度和类型）
let user: [string, number] = ['Alice', 25];
user[0]; // 'Alice'
user[1]; // 25

// 枚举
enum Direction {
  Up = 1,
  Down,
  Left,
  Right
}
let dir: Direction = Direction.Up;

// 字符串枚举
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// any - 任意类型（尽量避免）
let anything: any = 42;
anything = 'hello';
anything = true;

// unknown - 类型安全的 any
let value: unknown = 42;
if (typeof value === 'number') {
  console.log(value * 2); // ✅ TypeScript 知道它是 number
}

// void - 无返回值
function log(message: string): void {
  console.log(message);
}

// never - 永不返回
function error(message: string): never {
  throw new Error(message);
}

// object - 非原始类型
let obj: object = { name: 'Alice' };
let better: { name: string } = { name: 'Alice' };
```

### 类型推断

```typescript
// TypeScript 会自动推断类型
let count = 0; // 推断为 number
count = 'hello'; // ❌ 错误

// 函数返回类型推断
function add(a: number, b: number) {
  return a + b; // 推断返回类型为 number
}

// 最佳通用类型
let arr = [0, 1, null]; // 推断为 (number | null)[]
```

## 二、对象类型

### 接口（Interface）

```typescript
// 基础接口
interface User {
  name: string;
  age: number;
  email?: string; // 可选属性
  readonly id: number; // 只读属性
}

const user: User = {
  id: 1,
  name: 'Alice',
  age: 25
};
// user.id = 2; // ❌ 错误：只读

// 函数类型接口
interface SearchFunc {
  (source: string, subString: string): boolean;
}

const mySearch: SearchFunc = function(src, sub) {
  return src.includes(sub);
};

// 索引签名
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = ['Alice', 'Bob'];

interface StringDictionary {
  [key: string]: string | number;
}

const myDict: StringDictionary = {
  name: 'Alice',
  age: 25
};
```

### 类型别名（Type Alias）

```typescript
// 基础类型别名
type ID = number | string;

type UserId = ID;
type ProductId = ID;

// 联合类型
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status) {
  switch (status) {
    case 'pending':
      break;
    case 'success':
      break;
    case 'error':
      break;
  }
}

// 交叉类型
type Employee = {
  name: string;
  employeeId: number;
};

type Manager = {
  name: string;
  department: string;
};

type EmployeeManager = Employee & Manager;

const person: EmployeeManager = {
  name: 'Alice',
  employeeId: 123,
  department: 'Engineering'
};

// 复杂类型
type AsyncReturnType<T extends (...args: any) => Promise<any>>
  = T extends (...args: any) => Promise<infer R> ? R : any;

// 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type Result = NonNullable<string | null>; // string
```

### 类类型

```typescript
// 类实现接口
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

class Clock implements ClockInterface {
  currentTime: Date = new Date();

  setTime(d: Date) {
    this.currentTime = d;
  }
}

// 访问修饰符
class Person {
  public name: string;      // 公开（默认）
  private age: number;      // 私有
  protected email: string;  // 受保护
  readonly id: number;      // 只读

  constructor(name: string, age: number, id: number) {
    this.name = name;
    this.age = age;
    this.id = id;
  }

  private getAge(): number {
    return this.age;
  }
}

// 抽象类
abstract class Animal {
  abstract makeSound(): void;

  move(): void {
    console.log('Moving...');
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log('Woof!');
  }
}

// 类作为接口
class Point {
  x: number;
  y: number;
}

interface Point3d extends Point {
  z: number;
}
```

## 三、泛型（Generics）

### 基础泛型

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

const num = identity<number>(42);
const str = identity('hello');

// 类型推断
const num = identity(42); // 推断 T 为 number
const str = identity('hello'); // 推断 T 为 string

// 泛型接口
interface Box<T> {
  value: T;
}

const box: Box<number> = { value: 42 };

// 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

const myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) {
  return x + y;
};
```

### 泛型约束

```typescript
// 约束 T 必须有 length 属性
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength({ length: 10, value: 'hello' });

// 约束 T 必须是 U 的子类型
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

const user = { name: 'Alice', age: 25 };
const name = getProperty(user, 'name'); // string
const age = getProperty(user, 'age'); // number
// const invalid = getProperty(user, 'email'); // ❌ 错误

// 在约束中使用类型参数
function getOwnProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

### 高级泛型

```typescript
// 泛型默认类型
interface FormData<T = string> {
  data: T;
  timestamp: number;
}

const textData: FormData = { data: 'hello', timestamp: Date.now() };
const numberData: FormData<number> = { data: 42, timestamp: Date.now() };

// 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type TypeName<T> = T extends string
  ? 'string'
  : T extends number
  ? 'number'
  : T extends boolean
  ? 'boolean'
  : T extends undefined
  ? 'undefined'
  : T extends Function
  ? 'function'
  : 'object';

type T0 = TypeName<string>; // 'string'
type T1 = TypeName<string[]>; // 'object'

// 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type User = {
  name: string;
  age: number;
};

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;

// 条件映射类型
type Getters<T> = {
  [P in keyof T as `get${Capitalize<P & string>}`]: () => T[P];
};

interface Person {
  name: string;
  age: number;
}

type LazyPerson = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }
```

## 四、工具类型

### 内置工具类型

```typescript
// Partial<T> - 所有属性变为可选
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

// Required<T> - 所有属性变为必需
type RequiredUser = Required<PartialUser>;

// Readonly<T> - 所有属性变为只读
type ReadonlyUser = Readonly<User>;

// Record<K, T> - 构建对象类型
type PageInfo = {
  title: string;
};

type Page = 'home' | 'about' | 'contact';

const nav: Record<Page, PageInfo> = {
  home: { title: 'Home' },
  about: { title: 'About' },
  contact: { title: 'Contact' }
};

// Pick<T, K> - 选择部分属性
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }

// Omit<T, K> - 排除部分属性
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string; }

// Exclude<T, U> - 从 T 中排除可赋值给 U 的类型
type T0 = Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'

// Extract<T, U> - 提取 T 中可赋值给 U 的类型
type T1 = Extract<'a' | 'b' | 'c', 'a' | 'f'>; // 'a'

// NonNullable<T> - 排除 null 和 undefined
type T2 = NonNullable<string | null | undefined>; // string

// ReturnType<T> - 获取函数返回类型
function f() {
  return { x: 10, y: 20 };
}

type P = ReturnType<typeof f>; // { x: number; y: number; }

// InstanceType<T> - 获取类实例类型
class C {
  x = 0;
  y = 0;
}

type T3 = InstanceType<typeof C>; // C

// Parameters<T> - 获取函数参数类型
type T4 = Parameters<typeof f>; // []

// Uppercase/Lowercase/Capitalize/Uncapitalize
type T5 = Uppercase<'hello'>; // 'HELLO'
type T6 = Lowercase<'HELLO'>; // 'hello'
type T7 = Capitalize<'hello'>; // 'Hello'
type T8 = Uncapitalize<'Hello'>; // 'hello'
```

### 自定义工具类型

```typescript
// 深度 Readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// 深度 Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

// 深度 Required
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? DeepRequired<T[P]>
    : T[P];
};

// 可空类型
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// 元组转联合
type TupleToUnion<T extends any[]> = T[number];

type Tuple = ['a', 'b', 'c'];
type Union = TupleToUnion<Tuple>; // 'a' | 'b' | 'c'

// 获取函数名
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

interface User {
  id: number;
  name: string;
  greet(): string;
  farewell(): string;
}

type UserMethods = FunctionPropertyNames<User>; // 'greet' | 'farewell'

// 条件类型：Promise 解包
type Awaited<T> = T extends Promise<infer U> ? U : T;

type PromiseType = Awaited<Promise<string>>; // string

// 路径类型
type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? K | `${K}.${Path<T[K]>}`
        : never;
    }[keyof T]
  : never;

interface User {
  name: string;
  address: {
    city: string;
    street: string;
  };
}

type UserPaths = Path<User>;
// 'name' | 'address' | 'address.city' | 'address.street'
```

## 五、类型守卫与类型收窄

### typeof 类型守卫

```typescript
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value;
  }
  if (typeof padding === 'string') {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${padding}'.`);
}
```

### instanceof 类型守卫

```typescript
class Bird {
  fly() {
    console.log('Flying...');
  }
}

class Fish {
  swim() {
    console.log('Swimming...');
  }
}

function move(pet: Bird | Fish) {
  if (pet instanceof Bird) {
    pet.fly();
  } else if (pet instanceof Fish) {
    pet.swim();
  }
}
```

### 自定义类型守卫

```typescript
// is 关键字
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function process(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // TypeScript 知道是 string
  } else if (isNumber(value)) {
    console.log(value.toFixed(2)); // TypeScript 知道是 number
  }
}

// 更复杂的类型守卫
interface User {
  name: string;
  email: string;
}

interface Admin {
  name: string;
  permissions: string[];
}

function isAdmin(user: User | Admin): user is Admin {
  return 'permissions' in user;
}

function handleUser(user: User | Admin) {
  if (isAdmin(user)) {
    console.log(user.permissions); // ✅ Admin
  } else {
    console.log(user.email); // ✅ User
  }
}

// 可辨识联合
interface Square {
  kind: 'square';
  size: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Circle {
  kind: 'circle';
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      return shape.size * shape.size;
    case 'rectangle':
      return shape.width * shape.height;
    case 'circle':
      return Math.PI * shape.radius * shape.radius;
  }
}

// 完全覆盖检查
function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}

function area2(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      return shape.size * shape.size;
    case 'rectangle':
      return shape.width * shape.height;
    case 'circle':
      return Math.PI * shape.radius * shape.radius;
    default:
      return assertNever(shape); // 如果有遗漏会报错
  }
}
```

## 六、装饰器（Decorators）

```typescript
// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class MyClass {
  // ...
}

// 方法装饰器
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} returned`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

// 装饰器工厂
function format(formatString: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const result = originalMethod.apply(this, args);
      return formatString.replace('%s', result);
    };

    return descriptor;
  };
}

class Greeter {
  @format('Hello, %s!')
  greet(name: string) {
    return name;
  }
}
```

## 七、模块与命名空间

### ES6 模块

```typescript
// utils.ts
export function add(a: number, b: number): number {
  return a + b;
}

export const PI = 3.14;

export interface User {
  name: string;
  age: number;
}

export default class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

// main.ts
import Calculator, { add, PI, User } from './utils';
import * as utils from './utils';
```

### 命名空间

```typescript
namespace MyNamespace {
  export interface User {
    name: string;
  }

  export function createUser(name: string): User {
    return { name };
  }
}

// 使用
const user: MyNamespace.User = MyNamespace.createUser('Alice');

// 嵌套命名空间
namespace MyNamespace.SubNamespace {
  export function greet(name: string) {
    console.log(`Hello, ${name}`);
  }
}

// 跨文件命名空间
// types.ts
namespace MyNamespace {
  export interface User {
    name: string;
  }
}

// utils.ts
/// <reference path="types.ts" />
namespace MyNamespace {
  export function createUser(name: string): User {
    return { name };
  }
}
```

## 八、实战示例

### API 请求类型定义

```typescript
// types.ts
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

// api.ts
async function fetchUser(id: number): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

async function fetchPosts(): Promise<ApiResponse<Post[]>> {
  const response = await fetch('/api/posts');
  return response.json();
}

// 使用
const { data: user } = await fetchUser(1);
console.log(user.name);
```

### React + TypeScript

```typescript
// types.ts
type Props = {
  title: string;
  count: number;
  onIncrement: () => void;
};

// Component.tsx
import React, { useState } from 'react';

const Counter: React.FC<Props> = ({ title, count, onIncrement }) => {
  const [localCount, setLocalCount] = useState(0);

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={onIncrement}>Increment</button>
    </div>
  );
};

export default Counter;

// Hooks 类型
function useFetch<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
```

## 总结

### TypeScript 核心优势
- ✅ 静态类型检查
- ✅ 更好的 IDE 支持
- ✅ 代码自文档化
- ✅ 重构更安全
- ✅ 减少运行时错误

### 学习路径
1. 基础类型和注解
2. 接口和类型别名
3. 泛型编程
4. 高级类型技巧
5. 实战项目应用

### 最佳实践
1. 优先使用 interface 而不是 type
2. 避免使用 any，使用 unknown
3. 使用类型守卫收窄类型
4. 合理使用泛型提高复用性
5. 严格的 tsconfig 配置

TypeScript 让 JavaScript 开发更安全、更高效！

---

*下一篇将介绍微前端架构，敬请期待！*

### 、settimeout
```ts
const mySetTimeout = (fn, wait, ...args) => {
  const start = +new Date()
  let timer, now;
  const loop = () => {
    tiemr = window.requestAnimationFrame(loop)
    now = +new Date()
    if(now - start >= wait) {
      fn.apply(this, args)
      window.cancelAnimationFrame(timer)
    }
  }
  window.requestAnimationFrame(loop)
}

const test = mySetTimeout(()=>{
  console.log('huamu')
},1000)
```
### 、用 settimeout实现下setinterval和clearinterval
```ts
const timeWorker = {}
const mySetinterval = (fn, time) => {
  // 标识定时器
  const key = Symbol();
  // 定义一个递归函数，持续调用定时器
  const cb = (fn, time) => {
    timeWorker[key] = setTimeout(() => {
      fn();
      cb(fn, time);
    }, time)
  }
  cb(fn, time)
  return key
}
const myClearinterval = (key) => {
  if (key in timeWorker) {
    clearTimeout(timeWorker[key])
    delete timeWorker[key]
  }
}
```
### 、Promise

Promise本质上是一个绑定了回调的对象，而不是将回调传回函数内部
```ts
// Promise是一个状态机，每个Promise有三种状态：pending、fulfilled 和 rejected
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function MyPromise(callback) {
  const self = this;
  self.value = 0;
  self.currentState = PENDING
  // 当状态为'pending'时才会缓存then的回调，且每个实例至多缓存一个
  self.onResolvedCallbacks = []
  self.onRejectdCallbacks = []
  self.resolve = function (value) {
    // 递归执行
    if (value instanceof MyPromise) {
      // 依次循环直到当前Promise没有子Promise
      return value.then(self.resolve, self.reject)
    }
    // 异步执行
    setTimeout(() => {
      // 状态机制，顺序执行
      if (self.currentState === PENDING) {
        self.currentState = FULFILLED
        self.value = value
        self.onResolvedCallbacks.forEach(cb => cb())
      }
    })

  }
  self.reject = function (value) {
    setTimeout(() => {
      if (self.currentState === PENDING) {
        self.currentState = REJECTED
        self.value = value
        self.onRejectdCallbacks.forEach(cb => cb())
      }
    })
  }
  // 异常处理
  try {
    // 执行callback并传入相应的参数
    callback(self.resolve, self.reject)
  } catch (error) {
    self.reject(error)
  }

}

// then 方法可以被同一个 Promise 调用多次
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  const self = this
  // then 必须返回一个 Promise 
  let result;
  // onFulfilled 和 onRejected 不是函数需要忽略，同时实现值穿透
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : value => { throw value };

  if (self.currentState === FULFILLED) {
    // then 必须返回一个 Promise 
    return result = new MyPromise(function (resolve, reject) {
      // 异步执行
      setTimeout(() => {
        try {
          const val = onFulfilled(self.value)
          // todo 优化
          if (val instanceof MyPromise) {
            val.then(resolve, reject)
          }
          // 返回值
          resolve(val)
        } catch (error) {
          reject(error)
        }
      })
    })
  }
  if (self.currentState === REJECTED) {
    return result = new MyPromise(function (resolve, reject) {
      setTimeout(() => {
        try {
          const val = onRejected(self.value)
          if (val instanceof MyPromise) {
            val.then(resolve, reject)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }
  if (self.currentState === PENDING) {
    return result = new MyPromise(function (resolve, reject) {
      // 把两种情况的处理逻辑转换成callback放入promise1的回调数组中
      self.onResolvedCallbacks.push(() => {
        try {
          const val = onFulfilled(self.value)
          if (val instanceof MyPromise) {
            val.then(resolve, reject)
          }
          resolve(val)
        } catch (error) {
          reject(error)
        }
      })
      self.onRejectdCallbacks.push(() => {
        try {
          const val = onRejected(self.value)
          if (val instanceof MyPromise) {
            val.then(resolve, reject)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}
```
### 、Promise.all
```ts
const isPromise = (promise) => {
  return true
}
// promise.all
Promise.all = function (values) {
  let result = []
  let count = 0;
  // 记录执行完数据
  const processData = (key, value) => {
    result[key] = value
    // 是否最后一个
    if (++count === values.length) {
      resolve(result)
    }
  }
  // 遍历执行
  for (let i = 0; i < values.length; i++) {
    const cur = values[i]
    if (isPromise(cur)) {
      cur.then(data => {
        processData(i, data)
      })
    } else {
      processData(i, cur)
    }
  }
}
```
### 、Promise的并发控制
### 、使用Proxy 实现观察者模式
```ts
// 观察者集合
const queued = new Set()
const observe = fn => queued.add(fn)

// Proxy方法拦截obj对象的属性赋值行为，触发充当观察者的各个函数
const observable = obj => new Proxy(obj, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    // queued.forEach(observe => observe());
    return result
  }
})

//  一个个可观察的对象
const person1 = observable({ name: 'hua', age: 10 });
const person2 = observable({ name: 'mu', age: 20 });

// 充当观察者的函数
const change = (arg) => {
  console.log("🚀 ~ arg", arg)
}
// 添加观察者函数
observe(change)

// 观察对象更改
person1.name = 'jill'
```
### 、防抖
多次触发，只在最后⼀次触发时，执⾏⽬标函数
* 
```ts
const debounce = (fn, wait, immediate) => {
  let time = null;
  return function (...args) {
    if (time) clearInterval(time)
    if (immediate) {
      !time && fn.apply(this, ...args)
      time = setTimeout(() => time = null, wait)
    } else {
      time = setTimeout(() => fn.apply(this, ...args), wait)
    }
  }
}
const fn =()=>{console.log("🚀")}
const fnDebounced = debounce(fn,1000)
```
### 、节流
限制⽬标函数调⽤的频率，⽐如：1s内不能调⽤2次
* 配置
  * 是否需要响应事件刚开始的那次回调`{ leading: true }`
  * 是否需要响应事件结束后的那次回调`{ trailing: true }`
```ts
const throttle = (fn, wait) => {
  // 上⼀次执⾏回调的时间戳
  let preTime = 0
  return (args) => {
    const curTime = +new Date()
    if (curTime - preTime > wait) {
      fn.apply(this, ...args)
    }
  }
}
```
### 、curry
```ts
function curry1(...args) {
  const nums = [...args];
  const obj = (...args) => {
    if(args.length === 0){
      return nums.reduce((a,b)=>a+b,0)
    }
    nums.push(...args)
    return obj
  }
  return obj
}

function curry2(...num) {
  const nums = [...num];
  const fn = (...args) => {
    nums.push(...args)
    return fn
  }
  fn.sumOf = () => {
    return nums.reduce((a, b) => a + b);
  }
  return fn;
}
const test1 = curry1(1)(2)(3,23,3)()
const test2 = curry2(1)(2)(3, 23, 3).sumOf()
```
### 、new
* 创建一个空对象链接到原型
* 绑定this实现继承
* 优先返回构造函数返回的对象
```ts
const newFn = (fn,...args)=>{
  const obj = Object.create(fn.prototype)
  const res = fn.apply(obj, ...args)
  return res instanceof Object ? res : obj
}
```
### 、instanceof
通过判断对象的原型链上是否能找到对象的 prototype ，来确定instanceof 返回值
```ts
function myInstanceof(L, R) {//L 表左表达式，R 表示右表达式(类型)
  const prototype = R.prototype; // 显式原型
  L = L.__proto__; // 隐式原型
  while (true) {
    if (L === null) return false;
    if (L === prototype) return true; // 当 prototype 严格等于 L 时，返回 true
    L = L.__proto__
  }
}

var arr = []
console.log("🚀 ", arr instanceof Array) // true
console.log("🚀 ", myInstanceof(arr, Array)) // true
console.log("🚀 ", typeof arr) // "object"
```
### 、call
```ts
Function.prototype.call = (context) => {
  const id = Symbol()
  context[id] = this;
  const res = context[id](...[...arguments].slice(1))
  delete context[id]
  return res;
}
```
### 、apply
* 将当前函数链接到指定的上下文中(将函数设置为对象属性)
* 当前函数在context上下文中执行
* 移除context中已执行的当前函数
```ts
const apply = (fn, context = window, args = []) => {
  const id = Symbol()
  context[id] = fn
  const res = context[id](...args)
  delete context[id]
  return res 
}
```
### 、深拷贝
深拷贝递归复制遇到循环引用会栈溢出，解决办法是使用map缓存、尾递归、改用循环
* 复制那些能够被`json`直接表示的数据结构，比如：Number, String, Boolean, Array, 扁平对象
```js
JSON.parse(JSON.stringify(obj1))
```

### 、
### 、
### 、
### 、
### 、
### 、
### 、
### 、jsonp
跨域接口会被浏览器拦截。但是跨域脚本是可以获取的。JSONP兼容好，但是只支持GET。基本原理就是用script标签请求一个json文件，然后再将json里面的内容解析出来
```ts
const getJsonp = (name) => {
  const el = document.createElement('script');
  el.src = `/asset/jsonp.json?callback=${name}`;
  window[name] = (data)=>{
    // 在获取完数据后清除多余的函数和元素
    document.body.removeChild(el);
    window[name] = null;
  }
  document.body.appendChild(el)
}

getJsonp('fn123')
```


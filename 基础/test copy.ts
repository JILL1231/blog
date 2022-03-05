// setTimeout(function(){
//   console.log(2)
// },0)

// new Promise(function(resolve){
//   console.log(3)
//   process.nextTick(resolve)
// }).then(function(){
//   console.log(5)
// })

// process.nextTick(function(){
//   console.log(7)
// })

// setImmediate(function(){
//   console.log(1)
// },0)

// setTimeout(() => { 
//   console.log("setTimeout100")
//   // 文件 I/O
//   fs.readFile('./promisetext.ts', {encoding: 'utf-8'}, (err, data) => {
//       if (err) throw err;
//       console.log('read file sync100 success');
//   });
// }, 0);

// // setTimeout 如果不设置时间或者设置时间为0，则会默认为1ms
// setTimeout(() => { 
//   console.log("setTimeout0")
//   // 文件 I/O
//   fs.readFile('./promisetext.ts', {encoding: 'utf-8'}, (err, data) => {
//       if (err) throw err;
//       console.log('read file sync0 success');
//   });
// }, 0);

// // 文件 I/O 优先级高于 setTimeout，但处理事件长于1ms
// fs.readFile('./promisetext.ts', {encoding: 'utf-8'}, (err, data) => {
//   if (err) throw err;
//   console.log('read file success');
// });

// // 微任务
// Promise.resolve().then(()=>{
//   console.log('Promise callback');
// });

// // 微任务，process.nextTick 优先级高于 Promise
// process.nextTick(()=>{
//   console.log("process callback")
// })

// // 主流程 
// console.log('start');

// jsonp
// 跨域接口会被浏览器拦截。但是跨域脚本是可以获取的。JSONP兼容好，但是只支持GET
// 基本原理就是用script标签请求一个json文件，然后再将json里面的内容解析出来
/**
 * 
 */
// const getJsonp = (name) => {
//   const el = document.createElement('script');
//   el.src = `/asset/jsonp.json?callback=${name}`;
//   window[name] = (data)=>{
//     // 在获取完数据后清除多余的函数和元素
//     document.body.removeChild(el);
//     window[name] = null;
//   }
//   document.body.appendChild(el)
// }

// getJsonp('fn123')


// async...await 可以通过Promise+Generator实现的
// function run(gen) {
//   var it = gen()

//   return new Promise((resolve, reject) => {
//     onFulfilled()

//     function onFulfilled(value) {
//       var ret
//       try {
//         ret = it.next(value)
//       } catch (error) {
//         reject(error)
//       }

//       next(ret)
//     }

//     function onRejected(value) {
//       var ret
//       try {
//         ret = it.throw(value)
//       } catch (error) {
//         reject(error)
//       }

//       next(ret)
//     }

//     function next(ret) {
//       if (ret && ret.done) {
//         resolve(ret.value)
//         return
//       }
//       ret && ret.value.then(onFulfilled, onRejected)
//     }
//   })
// }

// function asyncFun(prev = 0) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(prev + 1)
//     }, 500)
//   })
// }

// function* foo() {
//   var s0 = yield asyncFun(0)
//   var s1 = yield asyncFun(s0).then(() => {
//     return Promise.reject('abort')
//   })
//   var s2 = yield asyncFun(s1)
//   return s2
// }

// run(foo).then(
//   (val) => {
//     console.log("🚀 ~ file: test.js ~ line 217 ~ val", val)
//   },
//   (rea) => {
//     console.log("🚀 ~ file: test.js ~ line 220 ~ rea", rea)
//   }
// )

// prev: 0
// prev: 1
// Error: abort
// function curry(fn) {
//   console.log("🚀 ~ file: test.js ~ line 225 ~ curry ~ fn", fn)
//   return function curried(...args) {
//     console.log("🚀 ~ file: test.js ~ line 228 ~ curried ~ args", args)
//     if (args.length >= fn.length) {
//       return fn.apply(this, args)
//     }

//     return function (...args2) {
//       console.log("🚀 ~ file: test.js ~ line 234 ~ args2", args2)
//       return curried.apply(this, args.concat(args2))
//     }
//   }
// }


// console.log("🚀 ~ file: test.js ~ line 254 ~ aa", aa)

// setTimeout(()=>{
//   console.log('setTimeout1')
//   Promise.resolve().then(()=>{
//     console.log('Promise1')
//     setTimeout(()=>{
//       console.log('setTimeout3')
//       Promise.resolve().then(()=>console.log('Promise3'))
//     },0)
//   })
// },0)
// Promise.resolve().then(()=>{
//   console.log('Promise4')
//   setTimeout(()=>{
//     console.log('setTimeout4')
//     Promise.resolve().then(()=>console.log('Promise5'))
//   },0)
// })
// setTimeout(()=>{
//   console.log('setTimeout2')
//   Promise.resolve().then(()=>console.log('Promise2'))
// },0)

// console.log('end')


// for (var i = 0; i < 5; i++) {
//   setTimeout(function() {
//       console.log(new Date().getTime(), i);
//   }, 1000);
// }

// console.log(new Date().getTime(), i);
/**
1633353029961 5
1633353030966 5
1633353030967 5
1633353030967 5
1633353030967 5
1633353030967 5
 */

// 用箭头表示其前后的两次输出之间有 1 秒的时间间隔，而逗号表示其前后的两次输出之间的时间间隔可以忽略
// for (var i = 0; i < 5; i++) {
//   setTimeout(function() {
//       console.log(",", i);
//   }, 1000);
// }

// console.log("->", i);
/**
循环执行过程中，几乎同时设置了 5 个定时器，一般情况下，这些定时器都会在 1 秒之后触发，而循环完的输出是立即执行的
-> 5
, 5
, 5
, 5
, 5
, 5
 */


// for (var i = 0; i < 5; i++) {
//   setTimeout(function(j) {
//       console.log(",", j);
//   }, 1000, i);
// }

// console.log("->", i);
/**
-> 5
, 0
, 1
, 2
, 3
, 4
 */

// 代码执行时，立即输出 0，之后每隔 1 秒依次输出 1,2,3,4，循环结束后在大概第 5 秒的时候输出 5

// 模拟其他语言中的 sleep，实际上可以是任何异步操作
// const sleep = (time) => new Promise((resolve)=>setTimeout(resolve, time))

// const fn = async () =>{
//   for(var i = 0; i < 5; i++){
//     await sleep(1000)
//     console.log(",", i);
//   }
//   await sleep(1000)
//   console.log("=>", i);
// }

// apply
/**
 * 将函数设为对象的属性
 * 执行该函数
 * 删除该函数
 */

// const apply = (fn, context=window, args=[]) => {
//   const sym = Symbol()
//   context[sym] = fn
//   const res = context[sym](...args)
//   delete context[sym]
//   return res;
// }

// var foo = {
//   value: 1
// };

// function bar(name, age) {
//   console.log(name)
//   console.log(age)
//   console.log(this.value);
// }
// apply(bar,foo,['kevin', 18])


// bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数
/**
 * 返回一个函数
 * 可以传入参数
 */
// function bind(fn, context, ...args) {
//   return function (...args2) {
//     return fn.apply(context, args.concat(args2))
//   }
// }
// var value = 2;
// var foo = {
//     value: 1,
//     bar: bind(bar,null)
// };

// function bar() {
//     console.log(this.value);
// }

// foo.bar()


// new
// const newFn = (fn,...arg) => {
//   const obj = Object.create(fn.prototype)
//   fn.apply(obj,arg)
//   return obj;
// }

// function Otaku (name, age) {
//   this.strength = 60;
//   this.age = age;

//   return 'handsome boy';
// }

// var person = newFn(Otaku,'Kevin', '18');

// console.log(person.name) // undefined
// console.log(person.habit) // undefined
// console.log(person.strength) // 60
// console.log(person.age) // 18

// const deepClone = source => {
//   let clone = Object.assign({}, source);
//   Object.keys(clone).forEach(
//     key => (clone[key] = typeof source[key] === 'object' ? deepClone(source[key]) : source[key])
//   );
//   return clone;
// }
// let data = {
//   name:'axuebin',
//   a:{
//     b:'aaa',
//   },
//   sayHello:function(){
//     console.log('Hello World');
//   }
// }
// // 测试循环引用
// data.a.b = data


// const isObject = (obj) =>{
//   return Object.prototype.toString.call(obj) === '[object Object]'
// }
// const isArray = (arr) => {
//   return Object.prototype.toString.call(arr) === '[object Array]'
// }
// function deepClone(target) {
//   const map = new Map()
//   function clone (target) {
//       if (isObject(target)) {
//           let cloneTarget = isArray(target) ? [] : {};
//           if (map.get(target)) {
//               return map.get(target)
//           }
//           map.set(target,cloneTarget)
//           for (const key in target) {
//               cloneTarget[key] = clone(target[key]);
//           }
//           return cloneTarget;
//       } else {
//           return target;
//       }
//   }
//   return clone(target)
// };

// const aa = deepClone(data)
// console.log("🚀 ~ file: test.js ~ line 431 ~ aa", aa)

const url = 'https://www.google.com.hk/search?q=%E5%B0%BE%E9%80%92%E5%BD%92%E4%BC%98%E5%8C%96&oq=weidigui&aqs=chrome.2.69i57j0i512l9.12356j0j7&sourceid=chrome&ie=UTF-8';
// const parmas = new URLSearchParams(url.split('?')[1])
// console.log("🚀 ~ file: test.js ~ line 471 ~ parmas", parmas.get('q'))

// const urlSearch = (url) => {
//   const search = url.split('?')[1];
//   const getKeyValue = search.split('&').reduce((pre,kv)=>{
//     const [k,v] = kv.split('=')
//     pre[k] = pre[k] ? [...pre[k],v]: v;
//     return pre;
//   },{})
//   return getKeyValue
// }
// // { a: '1', b: ['2,'3'] }
// const parmas = urlSearch("?a=1&b=&b=3&b=4")
// // const parmas = urlSearch(url)
// console.log("🚀 ~ file: test.js ~ line 478 ~ parmas", parmas)


// var a = 1
// function getNum() {
//   a = 4
// }
// var getNum = function() {
//   a = 2
// }
// function getNum() {
//   a = 3
// }
// console.log(a)
// getNum()
// console.log(a)



// var x=1
// switch(x++)
// {
//   case 0: ++x
//   case 1: ++x
//   case 2: ++x
// }
// console.log(x) // 4

// 后缀版的自增运算符会在语句被求值后才发生，所以x会仍以1的值去匹配case分支，那么显然匹配到为1的分支，此时，x++生效，x变成2，再执行++x，变成3，因为没有break语句，所以会进入当前case后面的分支，所以再次++x，最终变成4



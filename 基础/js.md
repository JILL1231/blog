# 一、JS执行机制
* Q: JS代码是按顺序执行的吗？
* A: JS代码执行过程中，需要先做变量提升，而之所以需要实现变量提升是因为JS代码在执行之前需要先编译
* Q: JS代码在执行之前做了什么？
* A: JS会进入一个作用域并创建一个执行上下文，将代码解析为AST，期间遇到声明语句就会在当前作用域中创建一个绑定（闭包）并初始化为undefined，之后执行时，变量的赋值和读取就会从作用域中查找绑定，如果没有找到就向上查找

## 1、变量提升
变量和函数声明会被存放到变量环境中，变量的默认值会被设置为`undefined`

```js
var scope = 'global scope'
function a(){
  // 3、顶层变量环境声明了scope初始化为undefined
  function b(){ 
    // 2、b函数的上层作用域是a，向上找scope
    console.log(scope)
  }
  return b;
  // 1、虽然声明在return语句后面，依然会提升到a函数作用域的顶层
  var scope = 'local scope'
}
a()() // undefined
```
### 1.1、同名处理
* 同名函数，选择最后声明的
* 变量和函数同名，选择函数


```js
var a = 1
// 函数表达式不提升
var getNum = function() {
  a = 2
}
function getNum() {
  a = 3
}
getNum()
console.log(a) // 2
// 变量和函数同名选择提升函数，函数提升包含初始化和赋值，接着执行函数，var声明的getNum被赋值为一个函数执行完成更改变量a为2
```

上面的代码经过变量提升：

```js
var a
var getNum
function getNum() {
  a = 3
}
a = 1
getNum = function() {
  a = 2
}
getNum()
console.log(a) // 2
```

`getNum`同名变量赋值覆盖前面的，所以最终`getNum`是`a=2`

### 1.2、提升阶段
|    |  创建  |  初始化  |  赋值  |
|   ----   |  ----   |   ----   |  ----   |
| let|  提升  |  x  |  x  |
| var|  提升  |  提升  |  x  |
|function|  提升  |  提升  |  提升  |

在块作用域内，let声明的变量仅在创建时被提升，在初始化之前使用变量，就会形成一个暂时性死区

```js
var name = 'World'
;(function () {
  if (typeof name === 'undefined') {
    var name = "HuaMu"; 
    console.info('Goodbye ' + name)
  } else {
    console.info('Hello ' + name)
  }
})()
// if分支内的name会被提升到外层，且同全局变量同名，则访问不到外层的name，var仅创建和初始化，并未赋值，则值为undefined，满足if条件
// Goodbye HuaMu
```
## 2、调用栈
在执行上下文创建完成后，JS引擎会将执行上下文压入栈中，通常把这种用来管理执行上下文的栈称为执行上下文，又称调用栈

### 2.1、函数调用
* JS引擎会为函数创建执行上下文，并将其压入调用栈
* JS引擎执行函数代码
* 执行完毕后，JS引擎将该函数的执行上下文弹出栈

### 2.2、栈溢出
当分配的调用栈空间被占满时，会引发“栈溢出”问题。即超过了最大栈容量或最大调用深度

#### 2.2.1、场景

函数递归会创建很深的调用栈，容易导致栈溢出，对于函数递归节省内存的优化方法通常是改写为尾递归，例如：

```js
function sum(...nums) {
  if(nums.length === 0) return 0
  const head = nums[0]
  const result = head + sum(...nums.slice(1))
  return result
}
sum(1,2,3) // 6
```

每次递归都需要保留执行上下文，因为head变量还在使用无法释放，需要等sum函数执行完成，调用栈深度会随递归次数增加

改写为尾递归：

```js
// 对数组做右折叠计算(foldr)，将结果折叠堆积到最右
function sum(...nums) {
  if(nums.length === 1) return nums[0]
  const head = nums[0]
  const next = nums[1]
  return sum(...nums.slice(2), head + next)
}
sum(1,2,3) // 6
```

`head`和`next`变量做`+`运算后就会释放，作为`sum`函数参数给到下一个递归，所以不需要保留执行上下文，调用栈深度只有1

## 3、作用域
作用域就是变量与函数的可访问范围，即作用域控制着变量和函数的可见性和生命周期。主要有全局作用域、函数作用域以及块级作用域，其中函数作用域是动态作用域

* 当前作用域与上层作用域有同名变量时，无法访问和影响上层变量
```js
let a = 1
function b(a) {
  a = 2
  console.log(a)
}
b(a) // 2
console.log(a) // 1
```

## 4、作用域链
通过作用域查找变量的链条称为作用域链，而作用域链是通过词法作用域来确定的。词法作用域由函数声明的位置来决定，是静态的，即在代码阶段就决定好了，和函数是怎么调用的没有关系

```js
// 连等操作是从右向左执行的，相当于b = 10、let a = b，相当于隐式创建为一个全局变量b 
let a = b = 10; 
;(function(){ 
  // 跟着作用域链查找到全局变量b，并修改为20
  // 由于重新声明了，a变量只是局部变量，不影响全局变量a
  let a = b = 20 
})()
console.log(a) // 10
console.log(b) // 20
```

函数只会在第一次执行的时候被编译，因此编译时变量环境和词法环境最顶层数据已确定

```js
var i = 1
function b() {
  console.log(i)
}
function a() {
  var i = 2
  b()
}
// 由于a函数在全局作用域被定义，即便b函数在a函数内执行，它也只能访问到全局的作用域
a() // 1

```


## 5、闭包
一个作用域引用着一个本该被销毁的作用域，称之为闭包。即一个函数引用着父作用域的变量，在父函数执行结束后依然进行调用
```ts
var number = 5; 
var obj = {
    number: 3, 
    fn1: (function () {
        var number;
        this.number *= 2; 
        number = 3; 
        return function () {
            var num = this.number; 
            this.number *= 2;
            console.log(num);  
            number *= 3;  // 注意这里喔，闭包
            console.log(number);
        }
    })()
}
var fn1 = obj.fn1;
fn1.call(null); //this->window  10 9
obj.fn1(); //this->obj 3 27
console.log(window.number);  // 20
```
## 6、this
`this`是函数执行上下文对象，是动态变化的值，它没有作用域的限制，嵌套函数中的`this`不会从外层函数中继承，可通过箭头函数、`self`处理
### 6.1、类型
* 全局执行上下文中的this: `window`
* 函数执行上下文中的this: 严格模式 ? `undefined`: `window`

```js
var v_out = 'v_out';
const c_out = 'c_out';
var inner = {
  v_out: 'v_in',
  c_out: 'c_in',
  v_func: function () {
    return this.v_out
  },
  c_func: function () {
    return this.c_out
  },
  func:()=>{
    return this.v_out
  }
};
// 获取对象作用域内的函数，在全局环境下调用 this 指向 window
const v_method = inner.v_func;
const c_method = inner.c_func; 
// 顶层 v_out 变量会提升挂载到 window 
v_method(); // 'v_out'
// 在块作用域内，const声明的变量不会挂载到 window，且父作用域不能访问子作用域
c_method(); // undefined

// 赋值表达式和逗号表达式会返回最后一个值本身，即inner.v_func函数本身，调用位置是全局环境
(inner.v_func, inner.v_func)();  // 'v_out'
(inner.v_func = inner.v_func)(); // 'v_out'

// 对象的方法调用，this指向该对象
inner.v_func()   // 'v_in'
(inner.v_func)() // 'v_in'

// 箭头函数没有自己的执行上下文，它继承调用函数的this，在这里是window
inner.func() // 'v_out'
```
### 6.2、更改this指向
绑定优先级为：new > 显示绑定(call、apply、bind) > 隐式绑定(调用函数对象) > 默认绑定(window)

#### 6.2.1、通过函数的call、apply、bind方法设置
```js
c_method.call(inner)
c_method.apply(inner)
c_method.bind(inner)()
```

##### 简单实现：call、apply

* 将当前函数链接到指定的上下文中，即将函数设置为对象属性
* 当前函数在context上下文中执行
* 移除context中已执行的当前函数

```js
/**
 * 简单实现apply
 * @param {Function} fn 当前运行的函数
 * @param {Object} context 指定的上下文
 * @param {Array} args 参数集合
 * @returns 
 */
const apply = (fn,context=window,args=[])=>{
  // Symbol是es6增加的第六个基本类型，对于对象属性就是uuid
  const id = Symbol();
  // 将当前函数链接到指定的上下文中
  context[id] = fn;
  // 当前函数在context上下文中执行
  const res = context[id](...args)
  // 移除context中已执行的当前函数
  delete context[id]
  return res;
}

const call = (fn,context,...args) => apply(fn, context, args)

// -------test------- //
const context = {
  value:1
}

function fn (name,isGirl){
  console.log("🚀 ~ ", name,isGirl,this.value) 
}

apply(fn,context,['huamu',true]) // 🚀 ~  huamu true 1
```
##### 简单实现：bind
* 与`call、apply`不一样的点是`bind`返回一个新函数
```js
const bind = (fn, context = window, ...arg) => {
  const id = Symbol()
  context[id] = fn
  return (...args) => {
    context[id](...arg, ...args)
    delete context[id]
  }
}
```

#### 6.2.2、通过调用函数对象：指向对象本身

this的绑定是**函数真正执行的位置**

#### 6.2.3、通过构造函数
```js
function Foo() {
  getName = function () { console.log(1) }
  return this
}
Foo.getName = function () { console.log(2) }
Foo.prototype.getName = function () { console.log(3) }
var getName = function () { console.log(4) }
function getName() { console.log(5) }

// 执行Foo函数的静态方法
Foo.getName() // 2
// 函数getName提升并赋值，执行getName函数表达式
getName() // 4
// 在全局环境下执行Foo函数，this指向window，执行函数内的getName方法，覆盖了全局环境下的getName
Foo().getName() // 1
getName() // 1
// new用于调用函数，即 new Foo.getName() 相当于 new (Foo.getName)()，执行了Foo函数的静态方法
new Foo.getName() // 2
// new 和 . 的优先级一样高，从左往右执行，相当于 (new Foo()).getName()，new会创建一个新对象，执行新对象的getName方法，在新对象本身找不到该方法，因此向原型找
new Foo().getName() // 3
new new Foo().getName()
```

##### 简单实现：new

* 创建一个新对象，并指向函数原型
* 绑定`this`到新对象
* 返回对象

```js
const newFn = (fn, ...arg) => {
  const obj = Object.create(fn.prototype);
  fn.apply(obj,arg)
  return obj
}
```
`Object.create`方法会创建一个对象，并且将该对象的`__proto__`属性指向传入的对象

```js
// 跳过构造函数法，直接绑定原型(原型链指向原型)
function Object_create(prototype) {
  const obj = {
    __proto__: prototype
  }
  return obj
}

// 替换构造函数法
function Object_create(prototype) {
  const ctor = function () {}
  ctor.prototype = prototype
  return new ctor()
}
```

实例：

```js
const person = {
 address: {
  country:"China"
 },
 number: 111,
 say: function () {
  console.log(`it's ${this.name}, from ${this.address.country}, nums ${this.number}`)
 },
 setCountry:function (country,number) {
  this.address.country=country
  this.number = number
 }
}
// 1、p1、p2 的原型对象指向了同一个对象
const p1 = Object.create(person)
const p2 = Object.create(person)

// 2、添加属性
p1.name = "huahua"
// 3、在原型上找到setCountry函数，并且找到引用值address和原始值numbe属性，引用值会在所有实例共享
p1.setCountry("shenzhen",666)

p2.name = "mumu"
// 4、p2 的修改值会覆盖 p1的，最终country的值都为beiji
p2.setCountry("beiji",999)

p1.say() // it's huahua, from beiji, nums 666
p2.say() // it's mumu, from beiji, nums 999
```

#### 6.2.4、更改this实例
```js
const value = 1;
const objContext = {
  value : 2, 
  getThis:function() {
    // 嵌套函数中的`this`不会从外层函数中继承
    function fn1() {
      console.log("🚀 ~ fn1",this.value) // undefined
    }
    fn1()

    // 把 this 保存为一个 self 变量，再利用变量的作用域机制传递给嵌套函数
    const self = this;
    function fn2() {
      console.log("🚀 ~ fn2 self",self.value) // 2
    }
    fn2()

    // 箭头函数没有自己的执行上下文，会继承调用函数中的 this
    const fn3 = () => {
      console.log("🚀 ~ fn3 箭头函数",this.value) // 2
    }
    fn3()

    // 箭头函数不会绑定局部变量，所有涉及它们的引用都会沿袭向上查找外层作用域链来处理，因此this的绑定只有一次
    function fn4() {
      return () => {
          return () => {
            return () => {
              console.log("🚀 ~ fn4 箭头函数",this.value) // 42
            };
          };
      };
    }
    fn4.call( { value: 42 } )()()()

    // 构造函数优先级最高
    function fn5(value) {
      this.value = value
    }
    const fn = new fn5(100)
    console.log("🚀 ~ fn5 构造函数", fn.value, this.value) // 100 2 
  }
}

```

## 7、原型
### 7.1、函数对象 & 普通对象
通过 `new Function` 创建的对象称之为函数对象，其他则为普通对象，普通对象的构造函数是 `Object`
```js
// 函数对象
function fn(){};
const fn = () =>{};
const fn = new Function('str')

// 普通对象
const obj = {}
const obj = new Object()
const obj = new fn()
```
每个对象都有内置`__proto__`属性，指向创建它的构造函数的原型对象，但只有函数对象才有`prototype`属性，指向函数的原型对象

### 7.2、原型对象
这么绕的点，从一个例子启程吧
```ts
function Cat() {}
const cat = new Cat()
```

![](https://oscimg.oschina.net/oscnet/up-81662f5df17b7c9dbba416f706547027177.jpg)

* 每个原型对象默认拥有一个`constructor`指针，指向`prototype`属性所在的函数

```ts
Cat.prototype.constructor === Cat
```
* 每个对象都有内置`__proto__`属性，指向创建它的构造函数的原型对象

```ts
cat.__proto__ === Cat.prototype
```

* 所有函数对象的__proto__都指向Function.prototype，它是一个空函数
```ts
Cat.__proto__ === Function.prototype
Function.__proto__ === Function.prototype
Object.__proto__ === Function.prototype

// 8个可访问构造器 同 Object 指向 Function.prototype
// Number、Boolean、String、Function、Array、RegExp、Error、Date

// 2个以对象形式存在的内置构造对象， 其 __proto__ 指向 Object.prototype
// Math、JSON、Reflect
```

* 实例原型是个普通对象，其构造函数是 Object
```ts
Cat.prototype.__proto__ === Object.prototype
Function.prototype.__proto__ === Object.prototype
```

* Object.prototype 处于 原型链的顶端，为null
```ts
Object.prototype.__proto__ === null
```

## 8、继承
* 原型继承
实例上找不到属性会去`__proto__`原型上找

```js
function Dog(name) {
  this.name = name
}
// 设置原型为Animal实例，这会导致所有实例共享以下属性
Dog.prototype = new Animal("Dog")
```

* 构造函数继承

劫持父类的构造方法来初始化子类属性，多继承就多 call 几个

> 只能继承构造属性，不能继承原型属性
> 不能实现函数复用，每个子例都会拷贝一份
> 实例不是父类实例，调用 instanceof(父类)会输出 false

```js
function Cat(name) {
  Animal.call(this, name)
}
```

* 实例继承

> 为父类实例添加属性后返回，类似工厂函数
> 实例是父类实例，不是子类实例，不能多继承

```js
function Pig(name) {
  const instance = new Animal(name)
  return instance
}
```

* 拷贝继承
效率低，不可访问不可枚举方法

```js
function Chick(name) {
  const instance = new Animal(name)
  Object.assign(Chick.prototype, instance)
}
```

* 组合继承

即构造继承 + 原型继承

```js
function Cow(name) {
  Animal.call(this, name)
}
// 调用了两次构造函数！(子类优先级高，屏蔽父类属性)
Cow.prototype = new Animal()
// 上面重写了prototype！所以一定记得修复丢失的constructor
Cow.prototype.constructor = Cow
```

* 寄生组合继承

思路：去掉第二次构造函数调用

```js
function Horse(name) {
  Animal.call(this, name)
}
// Horse.prototype = Object.create(Animal.prototype)
// 修复因重写prototype丢失的constructor
Horse.prototype.constructor = Horse
;(function() {
  // 用一个空的构造函数替换掉父类构造函数就行了
  const Super = function() {}
  Super.prototype = Animal.prototype
  Horse.prototype = new Super()
})()
```

* class 继承：主要依靠extends、super（让JavaScript引擎去实现原来需要我们自己编写的原型链代码）

```js
class Animal {
  constructor(){}
}
class Horse extends Animal {
  constructor(){
    super()
  }
}
```

## 9、模块
### 9.1、模块化的意义
若不采用模块化，则引入js文件时**必须**确保引入顺序正确，否则无法运行。在文件数量大、依赖关系不明确的情况很难保证，因此出现了模块化

### 9.2、CommonJS & AMD
在ES6以前，JS没有模块体系。只有社区指定的一些模块加载方案，如用于服务器端同步加载的`CommonJS`和用于浏览器端异步加载的`AMD`、`CMD`

#### 9.2.1、CommonJS(Node.js)
一个文件就是一个模块，有自己的作用域，只向外暴露特定的变量和函数。拥有四个重要变量：`module`、`exports`、`require`、`global`

>`exports`本身是一个变量对象，指向`module.exports`的`{}`模块，只能通过`.`语法向外暴露变量。而`module.exports`既可通过`.`也可使用`=`赋值，其中`exports`是`module`的属性，指向`{}`模块

```js
//在这里写上需要向外暴露的函数、变量
module.exports = { 
  add,
  update
}

// 引用自定义模块必须加./路径，不加的话只会去node_modules文件找
var math = require('./math')
// 引用核心模块时，不需要带路径
var http = require('http')
```

#### 9.2.2、AMD(require.js)、CMD(sea.js)
虽然都是并行加载js文件，但`AMD`推崇依赖前置、提前执行，即预加载，`CMD`推崇依赖就近、延迟执行，即懒加载。拥有三个重要变量：指定引用路径的`require.config`、定义模块的`definde`以及加载模块的`require`

```js
/** AMD写法 **/
define(["a", "b", "c", "d", "e", "f"], function(a, b, c, d, e, f) { 
     // 在最前面声明并初始化了要用到的所有模块
    a.doSomething();
    if (false) {
        // 即便没用到某个模块 b，但 b 还是提前执行了
        b.doSomething()
    } 
});

/** CMD写法 **/
define(function(require, exports, module) {
    //在需要时申明
    var a = require('./a'); 
    a.doSomething();
    if (false) {
        var b = require('./b');
        b.doSomething();
    }
});
```


### 9.3、ESM
`CommonJS`和`AMD`输出的是对象，引入时需查找对象属性，只能在运行时确定模块的依赖关系以及输入输出变量，即运行时加载，而`ES6`模块的设计思想，是尽量的静态化，它导出的不是对象，而是一个个接口，使得编译时就能确定模块的依赖关系和输入输出变量，即静态加载

### 9.4、require和import的区别
* `CommonJS` 模块化方案 `require/exports` 是为服务器端开发设计的。服务器模块系统**同步**读取模块文件内容，编译执行后得到模块接口。而`ES6` 模块化方案 `import/export` 是为浏览器设计的，浏览器模块系统**异步**加载脚本文件
* `require/exports` 是运行时动态加载，，`import/export` 是静态编译
* `require/exports` 输出的是一个值的拷贝，`import/export` 模块输出的是值的引用，即文件引用的模块值改变，`require` 引入的模块值不会改变，而 `import` 引入的模块值会改变
* 用法不同
 * `ES6` 模块可以在 `import` 引用语句前使用模块，`CommonJS` 则需要先引用后使用
 * `import/export` 只能在模块顶层使用，不能在函数、判断语句等代码块之中引用，而`require/exports`可以
 * `import/export` 默认采用严格模式
```js
// require/exports
const fs = require('fs')
exports.fs = fs
module.exports = fs

// import/export
import fileSystem, {readFile} from 'fs' // 引入 export default 导出的模块不用加 {},引入非 export default 导出的模块需要加 {}
```

## 10、babel
对源码字符串进行 `parse`，生成 `AST`，把对代码的修改转为对 `AST` 的增删改，转换完 `AST` 之后再打印成目标代码字符串

### 10.1、babel插件开发的API
#### 10.1.1、parse 阶段
使用`@babel/parser` 把源码转成 `AST`
```js
require('@babel/parser').parse(source, {
  sourceType: 'module', // 解析 es module 语法
  plugins: ['jsx'], // 指定jsx 等插件来解析对应的语法
});
```
#### 10.1.2、transform 阶段
使用 `@babel/traverse` 遍历 `AST`，并调用 `visitor` 函数修改 `AST`，`@babel/types` 用于创建、判断 `AST` 节点，提供了 `isX`、`assertX` 等 api，若批量创建，则可使用`@babel/template`
```js
require('@babel/traverse').default(ast, {
  // do something
})
```
#### 10.1.3、generate 阶段
使用`@babel/generate` 把 `AST` 打印为目标代码字符串，同时生成 `sourcemap`，`@babel/code-frame` 用于错误时打印代码位置
```js
const { code,map } = generator(ast, { sourceMaps: true }) 
```




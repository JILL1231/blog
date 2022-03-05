中间件其实不仅仅是专利，在`Node`框架中也有应用，比如`koa`，这里我们简单的默认为`Redux` 中间件

## 一、中间件与面向切面编程(AOP)
AOP的本质是在主逻辑前后做包装处理，实现无侵入式增加逻辑。即Before 入参处理 -> 主逻辑处理 -> After 结果处理。比如处理一个通用性很强，业务性很弱的日志追溯需求：要求在每个`Action`被派发后，打出一个`console.log`记录这个动作

![](https://oscimg.oschina.net/oscnet/up-5c4a6b4fe5984b704e3479898fe3091c3d9.png)

AOP会将扩展逻辑在工作流中的执行节点视为一个单独“切点”，形成一个可以拦截前序逻辑的“切面”，它与业务逻辑是分离的。通过“即插即用”的方式自由的组织自己想要扩展的功能（异步工作流、性能打点、日志追溯等），它是典型的“非侵入式”的逻辑扩展思路，提升了组织逻辑的灵活度与干净度，规避逻辑冗余、逻辑耦合的问题

## 二、中间件的引入

阅读过[数据如何在React组件间流动？](https://my.oschina.net/jill1231/blog/4995027 "数据如何在React组件间流动？")这篇文章的童鞋，是可以肯定`redux`本身是只有**同步**操作的，当`dispatch action` 时，`reducer` 立即执行，`state`随之更新。若需要引入异步数据流，[Redux 官方](https://cn.redux.js.org/docs/advanced/AsyncFlow.html)则建议使用中间件来增强`createStore`的能力，它对外暴露了`applyMiddleware`函数，接受任意个中间件作为入参，返回作为`createStore`的入参的值

```js
import { createStore } from 'redux';
 // applyMiddleware 返回作为`createStore`的入参的值
const store = createStore(reducer, initial_state, applyMiddleware(middleware1, middleware2, ...));
```

## 三、中间件的机制

任何中间件都可以用自己的方式解析`dispatch`的内容，并继续传递`actions` 给下一个中间件。但注意喔，最后一个中间件开始 `dispatch action` 时，`action` **必须**是一个普通对象，这是同步式的 `Redux` 数据流 开始的地方

### 1、applyMiddleware源码分析
* 接收多个中间件数组，通过运算符`...`将入参收敛为一个数组
* 返回`createStore`闭包函数，其`args `入参为 `reducer` 和 `preloadedState`
* 在闭包函数里，创建一个新的`store`，为了避免在接下来中间件的串联过程中，dispatch 被调用，即 不允许在构建中间件时进行调度
```js
function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
      const store = createStore(...args)
      let dispatch = () => {
          throw new Error(`Dispatching while constructing your middleware is not allowed. ` + `Other middleware would not be applied to this dispatch.`)
      }

      ......这里代码下面分析......

  }
}
```
### 2、applyMiddleware改写dispatch
#### 2.1、冲突？
* 当`dispatch action` 时，`action` 必须是一个普通对象
* 使用`redux`时，`action` 却允许是函数，为何？

#### 2.2、改写
>在高阶函数中，习惯将原函数称为“外层函数”，将 return 出来的函数称为 “内层函数”
##### 2.2.1、获取“内层函数”组成的数组
以 `middlewareAPI` 作为中间件的入参，逐个调用传入的中间件，获取一个由“内层函数”组成的数组 `chain`

```js
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }

    const chain = middlewares.map(middleware => middleware(middlewareAPI))
```
##### 2.2.2、组合“内层函数”并传入dispatch作为参数执行
通过 `compose` 函数将 `chain` 中的 “内层函数” 逐个组合起来，并调用最终组合出来的函数，传入 `dispatch` 作为入参

```js
    dispatch = compose(...chain)(store.dispatch)
```
##### 2.2.3、返回被改写的store对象
返回一个新的 `store` 对象，这个 `store` 对象的 `dispatch` 已经被改写过了

```js
    return {
      ...store,
      dispatch
    }
```
#### 2.3、通用合成函数
`compose`合成函数是函数式编程中一个通用的概念，解剖一下实现
* 接收一个数组作为入参，利用运算符`... `将入参收敛为数组格式
* 前置边界处理
	* 处理数组为空的边界情况
	* 若只有一个函数，也就谈不上组合，直接返回
* 调用 reduce 方法来实现函数的组合
```js
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }
  if (funcs.length === 1) {
    return funcs[0]
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```
##### 2.3.1、reduce实现模拟
`reduce` 会将数组中的每个元素执行指定的逻辑，并将结果汇总为单个返回值

`compose(f1,f2,f3,f4)` -被组合成-> `(...args) => f1(f2(f3(f4(...args))))` 

即`f1,f2,f3,f4`这 4 个中间件的内层逻辑会被组合到一个函数中去，当这个函数被调用时，中间件会依次被调用

## 四、中间件的工作模式

![](https://oscimg.oschina.net/oscnet/up-8ee61a48aaa9a6a5e5aa7fcebec47e56285.png)

中间件的执行前提是`applyMiddleware`函数对`dispatch`函数进行改写，使得`dispatch`触发`reducer`之前，执行`Redux`中间件的链式调用，中间件的执行时机是在`action`被分发之后 `reducer`触发之前

### 1、[redux-thunk](https://github.com/reduxjs/redux-thunk/blob/master/src/index.js)源码解析
`redux-thunk`主要做一件事：拦截到`action`后，检查它是否是一个函数

- 若是函数，则执行它并返回执行的结果
- 若不是函数，则直接调用`next`继续往下走
```js
/**
 * 创建 thunk
 * @param extraArgument 
 * @returns 返回一个 thunk 函数
 */
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === 'function') {  // 函数，则执行 action
      return action(dispatch, getState, extraArgument);
    }
    return next(action);  // 非函数，流程继续
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```

### 2、模拟付款情景

#### 2.1、需求
感知每一次付款请求的发送和响应，并处理请求的结果

#### 2.2、引入redux-thunk
```js
import axios from 'axios'
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers';

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);
```
#### 2.3、dispatch 一个action函数
```js
store.dispatch(payMoney(payInfo));
```
#### 2.4、返回payMoney函数
```js
const payMoney = (payInfo) => (dispatch) => {
  dispatch({ type: 'payStart' })
  fetch().then(res => { dispatch() }) // 付款前发出准备信号

  return axios.post('/api/payMoney', {
    userName: huamu,
    password: xxx,
    count: 1000000
  })
    .then(function (response) {
      dispatch({ type: 'paySuccess' }) // 付款成功信号 
    })
    .catch(function (error) {
      dispatch({ type: 'payError' }) // 付款失败信号
    });
}
```


### 3. 双缓冲处理
`Redux Listeners `利用 `next` 和 `current` 两个队列将 `listener` 的读写进行分离。解决一个队列时，当 `dispatch` 同时发生了 `subscribe`的情况，遍历过程中 `currentListener` 长度会被改变导致读取发生异常

```js
let nextListeners = []; // 负责写入
let currentListeners = []; // 只读

function subscribe(listener) {
  if (nextListeners === currentListeners) {
    nextListeners = currentListeners.slice(); // 拷贝一次，解引用
  }
  nextListeners.push(listener);
}

function dispatch(action) {
  const listeners = (currentListeners = nextListeners); // 更新并读取currentListeners
  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    listener();
  }
}
```



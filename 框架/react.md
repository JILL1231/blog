react原理之lane优先级和diff更新

`React 16`中处理优先级的模型是`expirationTime`，它使用一个时间长度来描述任务的优先级。而`React 17`则使用`Lane`模型来处理任务的优先级，它通过将不同优先级赋值给一个位，通过31位的位运算来操作优先级，能够覆盖更多的边界条件。简言之：使用二进制数来表示任务的优先级。

# 1. Schedule

## 1.1 创建更新任务

在首次渲染和用户触发事件时会创建一个更新任务，并分配一个优先级，接着放入 `fiber.updateQueue` 更新对列中，交给 `Scheduler` 调度更新

`fiber.updateQueue` 是一个环形结构 `pending` 指针指向最后一个 `update`，新的 `update` 插入过程：

```js
const pending = sharedQueue.pending
if (pending === null) {
  // 第一个 update 进入队列，创建一个环形结构
  update.next = update
} else {
  // 最新的update插入到首尾中间
  update.next = pending.next
  pending.next = update
}
// pending 指向最新的 update
sharedQueue.pending = update
```

创建环形结构是为了能一次找到首节点和尾节点

## 1.2 优先级

优先级本质就是比较大小，对于区间优先级，`react` 使用了二进制运算来判断是否处于区间中，最多有 31 位，每一位都是一条车道，

如判断 lane 是否在一个区间中：

```js
// 0b0000000001111111111111111000000 & 0b0000000000000000000000001000000 === 0b0000000000000000000000001000000
export function isSubsetOfLanes(set: Lanes, subset: Lanes | Lane) {
  return (set & subset) === subset
}
```

合并 lane：

```js
// 0b0000000000000000000000010000000 ｜ 0b0000000000000000000000100000000 === 0b0000000000000000000000110000000
export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
  return a | b
}
```

## 1.3 updateQueue 执行

* 遍历 `updateQueue` 链表，收集在当前更新任务区间的任务，即计算 `lane` 是否在当前区间内，若不满足条件，则放进 `newFirstBaseUpdate...newLastBaseUpdate` 中推迟执行。
* 执行 `update` ，即通过 `getStateFromUpdate` 计算新的 `state`，将其结果存到 `newState`，剩余 `update` 插入到 `lastBaseUpdate` 后面
* 当 `updateQueue` 都处理完成后，将最后结果存入 `baseState`

## 1.4 通过时间分片实现并发

通过时间切片的方式，即将任务分解为多个工作单元。每完成一个工作单元，判断是否有高优作业，若有，则让浏览器中断渲染

可使用 `requestIdleCallback` 简单实现时间分片效果：

```js
function workLoop(deadline: IdleDeadline) {
  // 如果存在空闲时间
  while (workInProgress && deadline.timeRemaining() > 0) {
    workInProgress = performUnitOfWork(workInProgress)
  }
}

// 当js线程空闲时执行
requestIdleCallback(workLoop)
```

为了减少`commit`执行(这过程用户可感知)，`react`设计了跟踪 `fiber root`，也被称为 `progress root` 或者 `wipRoot`，一旦完成所有的工作，即没有下一个工作单元时，才将 `fiber` 提交给 `dom`。

# 2. Diff

## 2.1 构建树

通过 `CreateElement` 函数生成 `element` 节点

```js
/**
 * @param {string} type    HTML标签类型 或 函数组件
 * @param {object} props   具有JSX属性中的所有键和值
 * @param {string | array} children JSX子节点列表
 */
function CreateElement(type, props, ...children) {
  return {
    $$typeOf, // ReactElement, FragmentElement...
    tag, // ClassComponent, FunctionComponent, HostComponent...
    type, // "div", [[Function]], [[constructor]]...
    props: {
      ...props,
      children,
    },
    ...
  }
}
```

常见的 `JSX` 节点有如下几点

* 函数组件，其生成的`element` 节点为：
```js
{
  $$typeOf: ReactElement,
  tag: FunctionComponent,
  type: 函数本身
}
```
* Class 组件，其生成的`element` 节点为：
```js
{
  $$typeOf: ReactElement,
  tag: ClassComponent,
  type: class 构造函数
}
```
* 原生标签或文本节点，其生成的`element` 节点为：
```js
{
  $$typeOf: ReactElement,
  tag: HostComponent,
  type: "div"或"text"
}
```
### 2.1.1 模拟`CreateElement` 函数执行的过程

下面的函数组件对于开发过`react`的同学应该不陌生，我们就以它为例子，学习学习

```jsx
function App(props) {
  return <h1 title="el_title">Hi {props.name}</h1> // HTML标签类型
}
const element = <App name="foo" /> // FC
```

转换为 `CreateElement` 函数调用

```js
function App(props) {
 return CreateElement("h1", {title:"el_title"}, "Hi ", props.name)
}
const element = CreateElement(App, {name:"foo"})
```
执行并生成的 `element` 节点

```js
[
  {
    "type": App, // 函数组件本身
    "props": {
      "name": "foo"            // key-value
      "children": [] // 函数组件执行结果
    },
  {
    "type": "h1",
    "props": {
      "title": "el_title"            // key-value
      "children": ["Hi", props.name] // 注意喔，是数组类型
    }
  }
]
```
注意喔，函数组件的 `children`是来自于函数的运行结果而不是`props`， 即 `children = type(props)`

在这个过程中，返回的`TreeNode`树结构为`[{...},{...}]`，是一棵普通的树结构，基于递归遍历，无法实现断点回溯，而构建的`Fiber链表`，其每个 `fiber` 节点都有 3 个指针 ，链接到其第一个子节点 `child`，下一个兄弟姐妹节点 `sibling` 和父节点 `return`，且每个 `fiber` 都将成为一个工作单元


## 2.2 更新、删除

当我们需要实现 更新 和 删除 节点时，即调用`setState`，则需将 `render` 函数中收到的元素与提交给 `dom` 的最后的 `FiberTree` 进行比较。因此，我们需要保存最后一次提交给 `FiberTree` 的引用 `currentRoot`，同时，为每个`fiber`添加`alternate`属性，记录上一阶段提交的`old fiber`

```js
let currentRoot = null
function Render(el, container) {
  wipRoot = {
    alternate: currentRoot,
  }
}

function CommitRoot() {
  currentRoot = wipRoot
  wipRoot = null
}
```
注意喔，子代创建的过程伴随着比对，即为元素的子代创建`fiber`的同时，将`old fiber`与`new fiber`进行比对

- 如果`old fiber`与`new fiber`具有相同的`type`，保留`dom`节点并更新其`props`，并设置标签`effectTag`为`UPDATE`

- 若`type`不同，且为`new fiber`，意味着要创建新的`DOM`节点，设置标签`effectTag`为`PLACEMENT`；若为`old fiber`，则需要删除节点，设置标签`effectTag`为`DELETION`

为了快速检测到变化，`React` 使用了 `key`。使其
更快速的检测到子元素何时更改了在元素数组中的位置`key->fiber`

# 3. commit 阶段

## 3.1 创建操作

提交创建操作会进行真实 `dom` 生成和 `ref` 初始化：

```js
const stateNode = document.createElement(fiber.type)
fiber.stateNode = stateNode // 保存dom节点
fiber.props.ref(stateNode) // 执行props中的ref函数，传入dom节点
```

## 3.2 更新操作

更新阶段会将 `props` 设置到 `dom`

```js
const oldProps = fiber.alternate.props
const newProps = fiber.props
// 对比oldProps和newProps，找到变化的key value然后设置到dom
```

## 3.3 替换操作

利用旧的节点找到父节点，然后替换 `dom` 节点为新的 `dom` 节点

```js
const parent = fiber.alternate.return.stateNode
const oldDom = fiber.alternate.stateNode
const newDom = fiber.stateNode
parent.replaceChild(newDom, oldDom)
```

## 3.4 删除操作

新节点不存在，说明当前节点被删除

```js
const oldDom = fiber.alternate.stateNode
oldDom.remove()
```

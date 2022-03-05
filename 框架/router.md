每个技术点的出现，都是为了解决当前的某一些问题。前端路由的出现，解决了页面刷新资源时重复请求的问题，它利用了浏览器路由，记录`API` 和`JS` 实现虚拟切换 `URL`，达到页面切换无刷新的效果

![](https://oscimg.oschina.net/oscnet/up-a307c2ff02832c759246cca4580325cc162.png)

## 1、SPA痛点
`SPA`单页面在解决页面刷新资源时重复请求的问题上，遇到两个核心的痛点：
* 刷新页面，浏览器会根据当前`URL`对资源重新定位，即回到最初的状态，导致前进后退操作无法被记录
* 对于服务器而言，`SPA`是单页面，是一个`URL`、一个资源，怎么影射为多个视图？

## 2、SPA对策
### 2.1、拦截事件，避免盲目响应
`SPA`本身是单页面，资源是同一个，因此可以拦截掉跳转或者阻止默认路由切换事件，从而避免服务端返回不符合预期的资源内容

### 2.2、感知`URL`的变化
前端给`URL`做些不会影响其本身性质的微小处理，不会影响服务器对它的识别，只有前端能感知到，进而通过`JS`去生成不同的内容，比如监听 `hash` 变化

## 3、SPA实践
浏览器用于页面定位的方案主要有`hash`，而操作其历史的有`history API`，不妨试试？

### 3.1、hash模式
`https://my.oschina.net/jill1231/#blog`中的`#blog`就是`hash`，访问含有`#blog`的路由时，页面会定位到` id`为`blog`的元素。因此，可通过增加和改变`hash`从而让页面感知到路由变化，这也正是`hash`模式

那么，在`hash`模式下，`JS`是如何捕获到哈希值的内容呢？
#### 3.1.1、捕获hash
通过监听`hashchange`事件来捕捉`hash`变化
```js
window.addEventListener('hashchange',()=>{
    // 根据hash值的变化更新内容
},false)
```
#### 3.1.2、更改hash 
通过`location`暴露出来的属性，直接修改当前`URL`的`hash`
```js
window.location.hash = 'index';
```

### 3.2、history模式
点击浏览器的前进后退会触发`hash`的感知，同时，浏览器的`history API`也给我们提供了接口来操作它的历史
#### 3.2.1、前进
```js
window.history.forward() // 前进到下一页
window.history.go(2) // 前进两页
```
#### 3.2.2、后退
```js
window.history.back()  // 后退到上一页
window.history.go(-2) // 后退两页
```
#### 3.2.3、新增
```js
history.pushState(data[,title][,url])  // 向浏览历史中追加一条记录
```
#### 3.2.4、更新
更新路由栈记录不会增加路由栈长度
```js
history.replaceState(data[,title][,url]) // 更新当前页在浏览历史中的信息
```
#### 3.2.5、popstate
`popstate` 只有浏览器前进后退事件才会触发，`push` 事件需要靠自定义事件发布订阅实现，即`forward`、`back`和`go`方法的调用会触发`popstate`，但`pushState`和`replaceState`不会

需通过自定义事件和全局事件总线来触发事件，进而每当浏览历史发生改变时，`popstate`事件都会被触发

```js
window.addEventListener('popstate',(e)=>{  // 监听history变化
    console.log(e)
},false)
```

## 4、React-Router

### 4.1、三大核心角色

#### 4.1.1、导航
导航包含`Link`、`NavLink` 和 `Redirect`

* `Link`负责触发路径的改变，简单实现`Link`
```tsx
const Link = ({ to }) => {
  return (
    <a
      onClick={(event) => {
        event.preventDefault(); // 阻止默认跳转事件
        history.push(to); // 主动触发自定义事件
      }}
    />
  );
};
```
* `NavLink` 是一个常用的自动根据路由高亮的组件，简单实现 `NavLink`
```tsx
function NavLink({
  activeStyle,
  isActive: isActiveProp,
  style: styleProp,
  to,
  ...rest
}: NavLink) {
  // 这里省略读取context代码
  const currentLocation = context.location;
  const { pathname } = currentLocation;
  // 判断路由是否匹配当前link指向
  const isActive = to === pathname;
  // 如果匹配就显示高亮的样式
  const style = isActive ? activeStyle : styleProp;
  return <Link style={style} to={to} />;
}
```
#### 4.1.2、路由
路由包含`Route`和`Switch`
* `Route`负责定义路径与组件之间的映射关系
```tsx
const Route = ({ component: FC, ...options }) => {
  // 判断当前path是否和route匹配
  if (matchPath(location.pathname, options)) {
    return <FC />;
  }
};
```
#### 4.1.3、路由器
负责感知路由的变化并作出反应的路由器，是整个路由系统中最为重要的一环。其中`MemoryRouter`一般不会体现到 `URL `上，多用于 `webview app`，`StaticRouter` 则用于服务端渲染时匹配路径。

`React-Router`中支持的是`BrowserRouter`和`HashRouter`，它们会根据`Route`定义出来的映射关系，为新的路径匹配它对应的逻辑

### 4.2、揭秘ReactRouter
#### 4.2.1、[HashRouter](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/HashRouter.js)源码

![](https://oscimg.oschina.net/oscnet/up-b69199cc652e2e01c6302ba49798aba507d.png)

##### HashRouter的背后是hash
 `HashRouter` 调用了 `createHashHistory`，[createHashHistory](https://github.com/ReactTraining/history/blob/master/packages/history/index.ts) 通过使用 `hash tag(#)` 来处理形如`https://www.huamu.com/#index `的 URL，即通过 URL 的 `hash` 属性来控制路由跳转

![](https://oscimg.oschina.net/oscnet/up-4d7ff21c6acb3615645f811998c7497a7a3.png)

#### 4.2.2、[BrowserRouter](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/BrowserRouter.js)源码

![](https://oscimg.oschina.net/oscnet/up-523f5137cecc198c2f81fe4e2747be0d816.png)

##### BrowserRouter的背后是history
`BrowserRouter`调用了 `createBrowserHistory`，`createBrowserHistory`通过 `HTML 5` 的` history API `来控制路由跳转

### 4.3、MemoryRouter和StaticRouter的背后都是history

#### 4.3.1、MemoryRouter
`MemoryRouter`调用了`createMemoryHistory`，`createMemoryHistory`生成的 `history` 对象在路由 `push` 时直接触发事件，不会改变 `url`

#### 4.3.2、StaticRouter
`StaticRouter` 不会调用 `createHistory`，它会生成一个**空的 history** 对象

```tsx
function StaticRouter({
  basename,
  children,
  location = '/',
}: StaticRouterProps) {
  // 服务端渲染时没有hash和history，所以直接生成一个noop对象
  let staticNavigator = {
    push(to: To) {},
    replace(to: To) {},
    go(delta: number) {},
    back() {},
    forward() {},
  };

  return (
    <Router
      basename={basename}
      children={children}
      location={location}  // 根据location path匹配出组件进行渲染
      navigationType={action}
      navigator={staticNavigator}
      static={true}
    />
  );
}
```
### 4.4、createHistory
 `createHistory` 函数生成一个 `history` 对象统一接口，抹平 `hash` 和 `browser api` 的 差异。`Router` 本质就是利用 `Context` 将自定义的 `history` 对象向下传递给 `Route`、`Link` 组件使用

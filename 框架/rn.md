
本文以 `0.59.10` 版本的 `React Native` 为分析对象
## 一、架构设计
`React Native` 架构上由 `JS` 、 `Native` 以及连接两者的 `Bridge` 三部分组成
* JS     部分：由 `JSX` 实现的视图 以及 调用 `Native` 能力实现的业务逻辑组成
* Native 部分：管理 `UI` 更新即交互
* Bridge 部分：桥接 `JS` 和 `Native`的通讯交互

>注意：`0.59.10`版本虽已引入了`JSI`，但通讯依旧通过`Bridge`进行桥接

### 1、当前架构
![](https://oscimg.oschina.net/oscnet/up-79d5a9b583f877f9911dc3397024395a6a9.png)

#### 1.1、线程模型
* JS thread：负责处理逻辑层。Metro（打包工具）将 `React` 打包成单一`JS`文件，传递给`JSC`执行
> `JSC` (JavascriptCore) 是 `JS` 代码的运行环境，真正执行 `JS` 代码的是 `RCTJSCExecutor` 对象，执行完成后返回一个数组

* Native thread(Main Thread/UI Thread)：负责原生渲染和提供原生能力
> `NativeModules`在启动阶段全部加载，生成一张映射表，可在两端调用方法时精准地找到对应的方法

* Shadow Thread：负责布局计算和构造 `UI` 界面。创建 `Shadow Tree` 来模拟 `React` 结构树，类似于虚拟dom
> `RN`使用的`Flexbox`布局原生不支持，通过`Yoga`转换为原生平台支持的布局方式

#### 1.2、模拟通讯
1. 当 `JS thread` 收到 `React` 源码时，需对其序列化，生成一条消息发送给`Bridge`

```js
// 序列化前
<View style={{ "width":200 }}/> 
// 序列化后
UIManager.createView([343,"RCTView",31,{"width":200}])
```
2. `Bridge`收到消息后转发给`Shadow Thread`
3. 当 `Shadow Thread` 收到信息后，需对其反序列化，创建`Shadow Tree`，流传给 `Yoga` 生成布局信息后发送给 `Bridge`
4. `Bridge`收到消息后转发给`Native thread`
5. `Native thread` 收到信息后，同样先反序列化，根据布局信息进行绘制

#### 1.3、`Bridge`的特点及不足
##### 1.3.1、异步
消息队列是异步的，其好处是不阻塞，但由于三个线程的数据无法共享，需各自保存、各自维护。任何交互都需`Bridge`进行异步处理，因无法保证处理时间，可能会出现空白的问题，比如瀑布流滚动

##### 1.3.2、序列化
序列化设计可保证所有 `UI` 都可相互转换，甚至可以让`JS` 代码运行在任意的 `JS` 引擎上。但每次都需经历序列化和反序列化，开销极大
##### 1.3.3、批处理
对`Native`调用进行排队，批量处理

### 2、新架构
从当前的架构中，不难看出两端封闭的交互方式已触及性能的瓶颈了，优化的手段集中于 `Bridge`，进而官方推出了新架构，这儿，没有了 `Bridge`的烦恼 🚀🚀🚀

![](https://oscimg.oschina.net/oscnet/up-0aacced82a624940feeeeb39714a1d1e690.png)

#### 2.1、JavascriptInterface(JSI)
`JSI` 是 一个可运行于多种 `JS` 引擎的中间适配层，可实现 `JS` 直接调用 `c++` 层的对象和方法。有了 `JSI`，`RN` 应用不仅可以运行于 `JSC`，还可以执行于 `Chrome` 的`V8` 或 `hermes` 引擎，提高了解析执行的速度

>划重点：有了`JSI`后，`JS`可以直接调用其他线程，实现**同步通信**机制，另外数据可以**直接引用**，不需要拷贝

#### 2.2、Fabric
`Fabric` 是新架构的渲染系统，能够在 `UI` 线程上同步调用`JS`代码，对应新架构图 `Renderer` 和 `Shadow Thread`

>划重点：有了`Fabric`后，可支持**优先级渲染**，比如 `React Concurrent`的中断渲染功能 和 允许开发者在 `React` 中更合理的组织请求数据代码的 `Suspense` 模式

#### 2.3、TurboModules
`TurboModules` 主要和原生应用能力相关，对应新架构图上的`Native Modules`，其带来的性能提升是`Native`模块懒加载

>划重点：有了`TurboModules`后，可以实现按需加载`Native`模块，减少启动时间，提高性能

## 二、启动&渲染
### 1、启动阶段

#### 1.1、创建 App 根视图及JS执行对象
##### 1.1.1、创建RCTRootView会同时创建RCTBridge，适用未拆包应用
`RCTRootView` 是 `RN` 的根容器，承载着所有子视图的功能，其子视图`RCTRootContentView`直接承载视图的对象
```js
// initWithBundleURL：`jsbundle`的路径  moduleName：启动应用的名称 initialProperties：初始化参数 launchOptions：App启动参数

[[RCTRootView alloc] initWithBundleURL:[NSURL fileURLWithPath:panelPath] moduleName:@"Demo" initialProperties:initialProps launchOptions:launchOptions];
RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
```
##### 1.1.2、创建RCTBridge再创建RCTRootView，适用分包/特殊处理的应用
若是分包的应用 或 需提取 `RCTBridge` 参数/方法 的话，可以先创建 `RCTBridge` 再创建 `RCTRootView`。其中参数 `moduleProvider` 可配置 `Bridge` 具体访问哪些 `NativeModules` 在需控制权限的应用作用比较大
```js
RCTBridge *bridge = [[RCTBridge alloc] initWithBundleURL:[[NSBundle mainBundle]	URLForResource:@"main" withExtension:@"jsbundle"] moduleProvider:nil 	launchOptions:launchOptions];

RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"Demo"
```   


#### 1.2、batchedBridge初始化RN环境
`RCTBridge` 初始化时会保存 `initWithBundleURL`，并创建一个 `RCTCxxBridge` 的实例 `batchedBridge` 去初始化 `RN` 环境 
* `batchedBridge`启动后发送加载通知
* `batchedBridge`初始化生成模块配置表
* `batchedBridge`创建并初始化JS线程
* `batchedBridge`注册NativeModules
* `batchedBridge`开始加载JS代码

#### 1.3、执行JS代码
加载得到的代码是`jsbundle`，主要由三部分组成

![](https://oscimg.oschina.net/oscnet/up-755fbaeb52936ca79a199c78fc3a1bc9722.png)

##### 1.3.1、环境变量及方法定义
* 第一行定义了运行时环境变量，用于表明所运行的node环境处于生产环境以及记录脚本启动的时间
* 第二到十行全局定义了RN环境启动的基本方法

##### 1.3.2、RN框架及业务代码定义
第十一行开始进入 `RN` 框架、第三方库以及个人代码定义部分，这部分调用了全局 `__d` 方法对代码中的方法和变量进行定义，其接受三个参数
* r：该模块的定义，即代码逻辑
* n：模块的moduleId，打包系统默认按照数字的递增的形式来定义该id
* i：依赖数组

##### 1.3.3、引用与启动入口
倒数两行调用了全局 `__r` 方法将 `RN` 应用运行起来，其接受`moduleId`一个参数
* 若该模块没有被初始化，则尝试加载并初始化
* 若未找到该模块，则抛出错误 'Requiring unkonwn module xxx'

执行完 `batchedBridge`发送加载完成通知，`RCTRootView`接收到通知，创建`RCTRootContentView` 立即调用 `AppRegistry.runApplication`，通过 `JSC` 以消息的形式将业务启动参数发送给 `batchedBridge` 的消息队列 `MessageQueue`

### 2、渲染阶段
#### 2.1、渲染视图信息
* `JS` 线程将视图信息传递给 `Shadow` 线程
* 创建 `Shadow Tree` 映射 `React`组件树，流传给 `Yoga`
* `Yoga`将 `flexbox` 布局生成原生布局信息
* `Shadow` 线程将通过一系列计算的完整视图信息传递给 `Native`线程
* `Native`线程将匹配到的组件按层级渲染到`RCTRootContentView`上
* 完成渲染
#### 2.2、渲染事件信息
* `Native`线程将相关信息打包成事件消息传递到 `Shadow` 线程
* 根据 `Shadow Tree` 建立的映射关系生成相应元素的指定事件
* 将事件传递到 `JS` 线程，执行对应的 `JS` 回调函数
                                           
## 三、通讯逻辑
### 1、通讯共识
#### 1.1、通讯基础 RCTBridgeModule
`RCTBridgeModule` 协议允许注册模块以及模块方法，在模块注册时会在原生端和`JS`端**同时**生成一份配置文件 `remoteModuleConfig`，它是一张映射表，可在两端调用方法时精准地找到对应的引用

##### 1.1.1、`JS`端可通过 `__fbBatchedBridgeConfig` 查看 `remoteModuleConfig`
```js
{
  "remoteModuleConfig":{
    [
      "RCTPushNotificationManager",  // 模块名称
      {
        "initialNotification": null, // 属性对象
      },
      [
        "fn1",                      // 方法列表
        "fn2",
        ...
      ],
      [2, 7],                       // 异步方法索引
      [1, 4],                       // 同步方法索引
    ]
  }
}
```

#### 1.2、异步通讯 MessageQueue
`MessageQueue` 主要承担异步事件交互通知的任务，所有的通讯和交互事件都会推进池中，再通过规则对池子进行读取和刷新。默认情况下 `MessageQueue` 每 `5ms` 会进行一次 `flush` 操作，`flush` 时发现新的消息会按照消息的参数进行逻辑的执行

>由于 `MessageQueue` 是被动接收数据，主动定时刷新的形式，因此在调用原生方法时，原生端并不会立即执行
### 2、事件通知
事件通知即发送通知和注册监听，可通过以下 API 进行注册和发送通知
* NativeAppEventEmitter 
* DeviceEventEmitter
* NativeEventEmitter 

### 3、原生端暴露原生事件
`JS`端可调用原生端的关键是两端都实现了 `RCTBridgeModule` 协议，原生端在需要暴露给`JS`端的方法前面加宏`RCT_EXPORT_METHOD`修饰
![](https://oscimg.oschina.net/oscnet/up-20032163662a6568af36c4d279ad6d2fcda.png)

### 4、JS端调用原生事件
* `JS` 端实现需调用`Native` 方法
* 查找 `JS thread` 中的方法配置表 `remoteModuleConfig`，将要执行的任务写入 `MessageQueue` 异步队列
* `Bridge` 执行队列任务
* `Native thread` 根据参数匹配配置，进而找到对应的原生模块及方法，执行原生实现的逻辑，将执行结果打包成消息传递给 `Bridge`
* `JS` 端根据返回的 `id` 找到执行的方法，执行并返回结果



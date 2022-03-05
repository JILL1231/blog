让用户感觉这个站点很「快」有两层含义：一层是**真的快**，另一层是**觉得快**
* 真的快：是客观衡量的指标，比如说访问时间，响应时间
* 觉得快：是主观感知的性能，比如通过视觉引导转移等待时间

做好这两方面都能提升用户的体验，但在优化的过程中需要注意权衡取舍，做出适合当前项目的选择

## 一、权衡取舍
假设将两个依赖数量完全不同的站点，都用`依赖统一打成vendor包`的方式优化，会发生什么问题呢？

### 1、对于依赖不多的A站点
* 可优化首屏请求数有助于提升加载速度
* 可有效利用 `304` 缓存 或 利用浏览器 `GET` 强缓存

### 2、对于依赖很多的B站点
* 在弱网下就会严重拖慢了页面展示

#### 2.1、权衡合适的方式
* 对`vendor`包进行拆解，拆解到 `CDN` 或 页面上
* 通过 `webpack` 优化选项 `optimization` 中 `splitChunks` 配置拆分规则、动态 `import` 加载资源

## 二、真的快
### 1、客观衡量的指标

|  指标  |  全称  |  描述  |  备注  |
|   ----   |  ----   |   ----   |  ----   |
| FCP | First Contentful Paint | 白屏时间 | 第一个文本绘制的时间前 |
| SI  | Speed Index            | 首屏时间 | 第一个文本绘制的时间后 |
| TTI | Time To Interactive    | 第一次可交互的时间||
| RTT | Round Trip Time    | 往返时延 | 当使用 TCP 协议传输一个文件时，这个数据并不是一次传输到服务端的，而是需要拆分成一个个数据包来回多次进行传输的 |

### 2、性能评分依据
* 通过`Chrome`浏览器`network`/`doc`分析`SSR`初次从请求到渲染的时间，`DOMContentLoaded`时间表示`DOM`渲染完成时间，`Load`表示所有资源请求完成时间，`Finish`表示所有资源请求并渲染完成时间
* `FCP`首屏渲染最好限制在`3`秒内完成，基于网络平均`338KB/s(2.71Mb/s)`,所以首屏资源不应超过`1014KB`
* 通过 `hiper` 性能调试工具

### 3、浏览器加载页面三阶段
浏览器呈现一个页面需经过 **加载**、**交互** 以及 **关闭** 三个阶段，由于关闭阶段可优化手段不多，我们重点分析加载和交互阶段

### 3.1、加载阶段 
即从发出请求到渲染出完整页面的过程，其中影响页面首次渲染的三大核心因素有
1. 关键资源个数
2. 关键资源大小
3. 请求关键资源需要多少个 RTT


|  资源      |  描述  |  🌰  |
|   ----     |  ----   |   ----   |
|  关键资源   | 阻塞网页首次渲染的资源 | JS脚本 、 首次请求的 HTML 资源文件 |
|  非关键资源 | 不会阻塞页面首次渲染的资源 | 图片、音频、视频等 |


因此，在加载阶段核心的优化原则是：优化关键资源的体积，减少关键资源的个数，降低关键资源的 RTT 次数

#### 3.1.1、优化关键资源的体积
* 排查并移除冗余依赖、静态资源

将`public`的静态资源移入`assets`，`public`只会单纯的复制到`dist`，应该放置不经`webpack`处理的文件

* 构建时压缩图片 `image-webpack-loader`
```js
// 图片压缩处理
const imgRule = config.module.rule('images')
imgRule
    .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
    .use('image-webpack-loader')
    .loader('image-webpack-loader')
    .options({ bypassOnDebug: true })
    .end()
```

* 按需加载
    * 使用`babel`启用按需引入
    * 使用`transform-runtime`插件抽离公共代码
    * UI组件库 使用`babel-plugin-import`

* 对关键资源启用`gzip`压缩，适当合并分散资源
* 对于异步执行的js文件请求启用`async/defer`转为非关键资源

#### 3.1.2、减少关键资源的个数
* 首屏渲染的css样式采用内联

* 通过 `webpack splitChunks`代码分割设置minSize，控制分割单元大小，合并分散资源


#### 3.1.3、降低关键资源的 RTT 次数
* 优化分包策略 `webpack splitChunks`

```js
config.optimization.splitChunks({
    name: true, // 语义化，拆分出的chunk使用cacheGroups.xx.name
    minSize: 30000, // 单位bytes
    cacheGroups: {
        echarts: { // 例如echarts库拆分出来
            name: 'echarts',
            test: /[\\/]node_modules[\\/](echarts)[\\/]/, // 正则匹配哪些资源需要被分离
        },
        vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/, // node_modules下的全部分离到vendors
        },
    },
})
```
> 在Nextjs等SSR应用中，默认按页面分割代码

* 优化路由(分组)懒加载
SPA中一个很重要的提速手段就是路由懒加载，当打开页面时才去加载对应文件
```js
{
    path: 'register',
    name: 'register',
    component: () => import(/* webpackChunkName: "user" */ '@/views/user/register'),
}
```

* 开启HTTP2.O
HTTP2的多路复用避开了资源并发限制。以往的域名分片、资源合并有什么不足呢？
    * 当资源合并后，如果其中一个文件更改了就会导致整个资源包指纹改变，然后重新下载，而使用HTTP2.O就可以`chunk`单独更新。
    * 多域名会导致DNS解析次数增加（每个cdn都去解析DNS，可以使用dns-prefetch预解析），增加RTT时间

* Gzip压缩传输 (针对文本文件时通常能减少2/3的体积)
请求头的`Accept-Encoding`会列出客户端支持的编码格式。当响应头的 `Content-Encoding`指定了gzip时，浏览器则会进行对应解压

* Prefetch、Preload
`preload`预先获取一次资源，若可缓存，则当需要的时候直接从浏览器缓存读取执行,`prefetch`类似，但在空闲时请求资源

* 托管至OSS + CDN加速
	* OSS，对象存储：海量，安全，低成本，高可靠的云存储服务。可以通过简单的REST接口，在任何时间、任何地点上传和下载数据，也可以使用WEB页面对数据进行管理
	* CDN，内容分发网络
	CDN加速原理是把提供的域名作为源站，将源内容缓存到边缘节点。当客户读取数据时，会从最适合的节点（一般来说就近获取）获取缓存文件，以提升下载速度

* 启用`Keep-Alive`复用连接通道，减少`TCP`握手连接重建次数

### 1.2、 交互阶段
即从页面加载完成到用户交互的整合过程。由于渲染进程渲染帧的速度决定了交互的流畅度，因此在交互阶段的核心的优化原则是：尽量减少一帧的生成时间


#### 1.2.1、让单个帧的生成速度变快
* 尽量使用异步执行，减少首屏渲染时的`dom`操作，js执行代码复杂度优化
* 避免强制同步布局
* 避免布局抖动，比如：首屏css内联，或使用css in js方案
* 尽量采用 CSS 的合成动画，比如：发生动画的属性设置`will-change`，设置`transform：translateZ(0)`触发GPU渲染
* 避免频繁的垃圾回收，适当使用全局变量，减少闭包，变量复用
* `dom`操作合并、`dom`事件代理

# 二、觉的快
#### 1、白屏时的loading动画
比如使用：`antd spin`

#### 2、首屏的骨架加载
比如使用：`antd sketch`

#### 3、路由跳转Loading动画
比如使用：`nprogress`库

#### 4、渐进加载图片
一般来说，图片加载有两种方式，一种是自上而下扫描，一种则是先加载小图，模糊化渲染，图片加载完成后替换为原图

## 一、 webpack设计思想

* 从入口文件解析依赖树
* loader转换每个文件节点
* plugin监听编译事件

### 1、webpack从入口文件到产物输出中间过程

* 读取webpack config文件，与内置参数合并，得到webpack启动初始参数，并初始化compiler
* 加载所有plugin插件，注册监听事件
* 从启动参数获取entry入口，开始执行编译
* 根据rules中匹配到的loaders，对文件进行转换处理
* loaders首先从左到右执行pitch方法，然后从右到左执行normal方法，完成文件节点的转换处理
* 所有文件处理完成后得到一颗文件依赖树即文件转换后的内容和它的依赖节点，然后合并处理打包输出到一个文件中
* 在以上过程特殊时机会触发内置事件，plugin可以通过apply方法中进行注册监听

### 2、loader原理

loader就是一个转换函数，输入原始文本，输出转换后的文本，例如简单实现ts-loader

```ts
const ts = require('typescript')

// normal方法
module.exports = (source) => {
  return ts.transpile(source).outputText
}

// pitch方法
module.exports.pitch = (source) => {
  // 这里如果返回了值，就会停止向右pitch，开始向左执行normal
  // return source
}
```

### 3、plugin原理

webpack本身就是基于事件机制的，包含了很多内置插件，这些插件都是基于事件订阅来执行的。一个简单的插件如下：

```ts
class MyHtmlPlugin {
  constructor(options) {
    // 从参数拿到html模板
    this.templateContent = options.templateContent
  }

  apply(compiler){
    const self = this
    // 监听emit事件
    compiler.hooks.emit.tapAsync('MyHtmlPlugin', (compilation, callback) => {
      // 往assets列表添加一个index.html
      compilation.assets['index.html'] = {
        source() {
          return self.templateContent
        },
        size() {
          // 返回文件字节大小
          return this.source().length
        }
      }
      callback()
    })
  }
}
module.exports = MyHtmlPlugin;
```

#### 3.1、常用事件：

* afterPlugins: 启动一次新的编译
* compile: 创建compilation对象之前
* compilation:	compilation对象创建完成
* emit: 资源生成完成，输出之前
* afterEmit: 资源输出到目录完成
* done: 完成编译

## 二、基本要素

### 1、Entry/Output

#### 1.1、单入口配置

```js
module.exports = {
  entry: './src/index.js', // 打包的入口文件
  output: './dist/main.js', // 打包的输出
};
```

#### 1.2、多入口配置

```js
const path = require('path');

module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js',
  },
  output: {、
    filename: '[name].[hash].js', //通过占位符确保文件名称的唯一，可选择设置hash
    path: path.join(__dirname, 'dist'),
    // publicPath用于设置加载静态资源的baseUrl，例如prod模式下指向cdn，dev模式下指向本地服务
    publicPath: process.env.NODE_ENV === 'production' ? `//cdn.xxx.com` : '/',  // 
  },
};
```

### 2、Loaders
`Loaders`函数接收文件类型作为参数，返回转换的结果。目前`webpack`支持的两种类型分别为`JS`和`JSON`，其它类型均需转换
#### 2.1、通配Loaders
```js
module:{
  rules:[
    {test:/.\(js|jsx|ts|tsx)$/,use:'ts-loader'} // 例如ts使用ts-loader
  ]
},
```
#### 2.2、内联Loaders
`Loaders` 还可以直接内联到代码中使用：

```js
import 'style-loader!css-loader!less-loader!./style.less';
```
#### 2.3、多个Loaders
多个 `Loaders` 之间执行顺序是和 `rules` 配置相反的，即从右向左执行

##### 2.3.1、[源码逻辑](https://github.com/saber2pr-forks/webpack/blob/81c5ff9229f4b68aa6963962d3c63d453e47ac3b/lib/NormalModuleFactory.js#L491-L498 "源码逻辑")
`loader` 先进后出，对应出栈顺序从右向左
```js
if (matchResourceData === undefined) {
  for (const loader of loaders) allLoaders.push(loader);
  for (const loader of normalLoaders) allLoaders.push(loader);
} else {
  for (const loader of normalLoaders) allLoaders.push(loader);
  for (const loader of loaders) allLoaders.push(loader); // 入栈
}
for (const loader of preLoaders) allLoaders.push(loader); // pre loaders入栈
```
##### 2.3.2、更改顺序
通过配置 `enforce` 改变执行顺序，`enforce`有四个枚举值，其执行顺序是`pre`、`normal`、`inline`、`post`

```js
module:{
  rules:[
     {
        test:/\.less$/,
        loader:'less-loader',
        enforce:'pre' // 预处理
    },
    {
        test: /\.less$/,
        loader:'css-loader',
        enforce:'normal' // 默认是normal
    },
    {
        test: /\.less$/,
        loader:'style-loader',
        enforce:'post' // 后处理
    },
  ]
},
```

### 3、Plugins
`Plugins`负责优化`bundle`文件、资源管理和环境变量注入，`webpack` 内置了很多 `plugin`。例如 `DefinePlugin` 全局变量注入插件、`IgnorePlugin` 排除文件插件、`ProgressPlugin` 打包进度条插件等

```js
plugins: [new HtmlwebpackPlugin({ template: './src/index.html' })];
```


### 4、Mode
指定当前的构建环境，有三个选项，分别是：`production`、`development`和`none`，当 `mode` 是 `production` 时会启用内置优化插件，比如`TreeShaking`、`ScopeHoisting`、压缩插件等
```js
module.exports = {
  mode: 'production', // 会写入到环境变量NODE_ENV
};
```
也可以通过 `webpack cli` 参数设置
```sh
webpack --mode=production  
```

## 三、热更新

### 1、更新流程

![热更新的原理](https://oscimg.oschina.net/oscnet/639c66aad2790b50e1f67a38bac73f7637e.jpg)

#### 1.1、启动阶段 `1 －> 2 -> A -> B`

- 通过`WebpackCompile`将`JS`文件进行编译成`Bundle`
- 将`Bundle`文件运行在`Bundle Server`，使得文件可通过`localhost://xxx`访问
- 接着构建输出`bundle.js`文件给到浏览器

#### 1.2、热更新阶段 `1 －> 2 -> 3 -> 4`

- `WebpackCompile`将`JS`文件进行编译成`Bundle`
- 将`Bundle`文件运行在`HMR Server`
- 一旦磁盘里面的文件修改，就将有修改的信息输出给`HMR Runtime`
- 接着`HMR Runtime`局部更新文件的变化

### 2、配置方式

#### 2.1、WDS + HotMoudleReplacementPlugin

##### 2.1.1、WDS(webpack-dev-server)

`WDS` 提供了 `bundle server` 的能力，不输出文件，而是放在内存中，即生成的 `bundle.js` 文件可以通过 `localhost://xxx` 的方式去访问，同时它提供的`livereload`能力，使得浏览器能够自动刷新

```js
// package.json
"scripts":{
  "dev":"webpack-dev-server --open"
}
```

##### 2.1.2、HotMoudleReplacementPlugin 插件
`HotMoudleReplacementPlugin`插件给 `WDS` 提供了热更新的能力，源自它拥有局部更新页面能力的`HMR Runtime`。一旦磁盘里面的文件修改，`HMR Server`就将有修改的`js module`信息发送给`HMR Runtime`

```js
// webpack.dev.js  仅在开发环境使用
module.exports = {
  mode: 'development',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: './dist', //服务基础目录
    hot: true, //开启热更新
  },
};
```
##### 2.1.3、交互逻辑
监听到文件修改时，`HotMoudleReplacementPlugin` 会生成一个 `mainifest`和 `update file`，其中 `mainifest`描述了发生变化的 `modules` ，紧接着`webpack-dev-server`通过 `websocket` 通知 `client` 更新代码，`client` 使用 `jsonp` 请求 `server` 获取更新后的代码

#### 2.2、WDM(webpack-dev-middleware)

`WDM` 将 `webpack` 输出的文件传输给服务器，适用于灵活的定制场景

```js
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }),
);

app.listen(3000, function () {
  console.log('listening on port 3000');
});
```

## 四、文件指纹

文件指纹主要用于版本管理，表现于打包后文件名的后缀，如`xxx//xxx_51773db.js`中的`51773db`

### 1、三种类型

| 类型        | 含义                                                                     |
| :---------- | :----------------------------------------------------------------------- |
| Hash        | 和整个项目的构建相关，只要项目文件有修改，整个项目构建的 hash 值就会更改 |
| Chunkhash   | 和 webpack 打包的 chunk 有关，不同的 entry 会生成不同的 chunkhash 值     |
| Contenthash | 根据文件内容来定义 hash，文件内容不变，则 contenthash 不变               |

### 2、常用场景

- 设置`output`的`filename`，使用`[chunkhash]`

```js
filename: '[name][chunkhash:8].js';
```

- 设置`MiniCssExtractPlugin`的`filename`，使用`[contenthash]`

```js
new MiniCssExtractPlugin({
  filename: `[name][contenthash:8].css`,
});
```

- 设置`file-loader`的`name`，使用`[hash]`

```js
rules: [
  {
    test: /\.(png|svg|jpg|gif)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: 'img/[name][hash:8].[ext]',
        },
      },
    ],
  },
];
// 占位符解释：[name]:文件名称，[ext]：资源后缀名
```

>注意喔：hash是由代码和路径生成的。因此相同的代码在多台机器打包部署 hash 会不同，导致资源加载 404。一般通过一台机器打包，分发部署到不同机器

## 五、SourceMap
### 1、开启配置
开发环境开启，线上环境关闭。线上排查问题的时候可以将 `source map` 上传到错误监控系统
```js
module.exports = {
  devtool: 'source-map',
};
```
### 2、类型
| 类型  |  说明 |  
| ------------ | ------------ |
| cheap-source-map  |  没有列号，只有行号，速度快 | 
| cheap-module-source-map  |  优化后的 cheap-source-map，避免 babel 等编译过代码行号对不上 |   
| eval  | 通过内联代码 eval 函数 baseURL 确定代码路径  |
| eval-source-map  | sourcemap 放在 eval 函数后  |
|  inline-source-map  | 放在打包代码最后  |

### 3、文件格式
利用 `mappings` 映射表和 `names`、`sourcesContent` 就可以还原出源码字符串

```json
{
  "version": 3, // Source Map版本
  "file": "out.js", // 输出文件（可选）
  "sourceRoot": "", // 源文件根目录（可选）
  "sources": ["foo.js", "bar.js"], // 源文件列表
  "sourcesContent": [null, null], // 源内容列表（可选，和源文件列表顺序一致）
  "names": ["src", "maps", "are", "fun"], // mappings使用的符号名称列表
  "mappings": "A,AAAB;;ABCDE;" // 带有编码映射数据的字符串
}
```

## 六、TreeShaking
- 代码不会被执行，不可到达
- 代码执行的结果不会被用到
- 代码只会影响死变量(只写不读)

`TreeShaking`会将以上视为废弃的代码在`uglify`阶段消除

>当 `mode` 设置为 `production`的情况下，是默认开启的。通过在`.babelrc`里设置`modules:false`进行取消

`TreeShaking`是利用 `ES6` 模块的特点进行清除
- `import` 只能作为模块顶层的语句出现，且模块名只能是字符串常量

`import` 导入模块是静态加载，其获取的是变量引用，即当模块内部变更时，`import`出的变量也会变更。因此 `import` 不能出现在条件、函数等语句中(` export`类似)，而 `commonjs` 中 `require` 获取的是模块的缓存

- `import binding`是`immutable`的


## 七、模块机制

`webpack`打包后，会给模块加上一层包裹，`import` 会被转换成`__webpack_require`

![webpack模块转换](https://oscimg.oschina.net/oscnet/92e972d524be349b9befa9ebe13c2635899.jpg 'webpack模块转换')

### 1、匿名闭包

`webpack`打包后是一个匿名闭包，接收的参数 `modules` 是一个数组，每一项是一个模块初始化函数。通过`__webpack_require`加载模块，并返回`modules.exports`，

![webpack的模块机制](https://oscimg.oschina.net/oscnet/513293c72de72fc4dd98e27d812710d4043.jpg 'webpack的模块机制')

`modules` 的每个模块成员都是用 `__webpack_require__` 加载的，`installedModules` 是加载模块的缓存，如果已经`__webpack_require__`加载过无需再次加载。

### 2、ScopeHoisting

构建后的代码存在大量的闭包代码，导致运行时创建的函数作用域增多，内存开销大，`ScopeHoisting` 将所有模块的代码按照引用顺序放在一个函数作用域里，然后适当的重命名一些变量以防止变量名冲突，从而减少函数声明代码和内存开销


## 八、SSR

对`SEO`友好的服务端渲染`SSR`的核心是减少请求，从而减少白屏时间。其实现原理是：服务端通过`react-dom/server`的`renderToString`方法将`React`组件渲染成字符串，返回路由对应的模版。协助的客户端通过打包，生成针对服务端的组件

`renderToString` 携带有 `data-reactid` 属性可配合 `hydrate` 使用，会复用之前节点只进行事件绑定从而优化首次渲染速度。类似的方法还有 `renderToStaticMarkup`

### 1、兼容问题

#### 1.1、浏览器的全局变量

- `node.js`中没有 `document` 和 `window`，需通过打包环境进行适配

在 `react ssr` 应用中，读取 `document` 和 `window` 可以在 `useEffect` 或 `componentDidMount` 中进行，当 `nodejs` 渲染时就会跳过这些执行，避免报错
  
- 使用`isomorphic-fetch` 或 `axios` 替换 `fetch`和 `xhr`

#### 1.2、样式问题

- `node.js` 无法解析 `css`，可使用`ignore-loader`忽略 css 的解析

对于 `antd` 组件库，在`babel-plugin-import` 设置 `style` 为`false`
  
- 使用 `isomorphic-style-loader` 替换 `style-loader`

### 2、两端协作

使用打包后的`HTML`为模板，服务端获取数据后替换占位符

```html
<body>
  <div id="root">
    <!--HTML_PLACEHOLDER-->
  </div>
  <!--INITIAL_DATA_PLACEHOLDER-->
</body>
```

## 九、常见优化措施

### 1、代码压缩

#### 1.1、JS 文件的压缩

* 内置了`uglifyjs-webpack-plugin`

* `CommonsChunkPlugin` 提取 `chunks` 中的公共模块减少总体积

#### 1.2、CSS 文件的压缩

* 使用`optimize-css-assets-webpack-plugin`，同时使用`cssnano`

* `extract-text-webpack-plugin`将 `css` 从产物中分离。

#### 1.3、html 文件的压缩

`html-webpack-plugin` 通常用来定义 `html` 模板，也可以设置压缩 `minify` 参数（`production` 模式下自动设置 `true`）

#### 1.4、图片压缩

使用`image-webpack-loader`

### 2、自动清理构建目录

利用 `CleanWebpackPlugin` 自动清理 `output` 指定的输出目录

### 3、静态资源内联
首屏渲染的样式尽量选择内联或使用 `styled-components`。资源内联可减少请求数，可避免首屏页面闪动，可进行相关上报打点，可初始化脚本

#### 3.1、代码层面

- raw-loader：js/html 内联
- style-loader： css 内联

#### 3.2、请求层面

- url-loader：小图片或字体内联

- file-loader：可以解析项目中的 url 引入路径，修改打包后文件引用路径，指向输出的文件。

### 4、基础库分离

#### 4.1、HtmlWebpackExternalsPlugin

将基础包通过`cdn`，而不压缩进`bundle`中

```js
plugins: [
  new HtmlWebpackExternalsPlugin({
    externals: [
      {
        module: 'react',
        entry: '//11.url.cn/now/lib/15.1.0/react-with-addons.min.js?_bid=3123',
        global: 'React',
      },
    ],
  }),
];
```

#### 4.2、SplitChunksPlugin

可将公共脚本、基础包以及页面公共文件分离

```js
splitChunks:{
  chunks:'async',// async:异步引入的库进行分离(默认)  initial:同步引入的库进行分离 all:所有引入的库进行分离(推荐)
  ...
  cacheGroups:{
    // 1、公共脚本分离
    vendors:{
      test:/[\\/]node_modules[\\/]/,
      priority:-10
    },
    // 2、基础包分离
    commons:{
      test:/(react|react-dom)/,
      name:'vendors',
      chunks:'all'
    },
    // 3、页面公共文件分离
    commons:{
      name:'commons',
      chunks:'all',
      minChunks:2
    }
  }
}
```

#### 4.3、分包

```js
plugins: [
  // 使用DLLPlugin进行分包
  new webpack.DLLPlugin({
    name: '[name]',
    path: './build/library/[name].json',
  }),
  // DllReferencePlugin 对 manifest.json引用
  new webpack.DllReferencePlugin({
    manifest: require('./build/library/manifest.json'),
  }),
];
```

### 5、多进程多实例构建

多进程多实例构建，换句话说就是：每次`webpack`解析一个模块，将它及它的依赖分配给`worker`线程中，比如`HappyPack`、`ThreadLoader`

![HappyPack工作流程](https://oscimg.oschina.net/oscnet/f95bd14172e26926d250922616fb08c0b0f.jpg 'HappyPack工作流程')

### 6、缓存

- 开启缓存：`babel-loader`、`terser-webpack-plugin`
- 使用`cache-loader`、`hard-source-webpack-plugin`

### 7、缩小构建目标、减少文件搜索范围

* 合理配置 `loader` 的 `test`，使用 `include` 来缩小 `loader` 处理文件范围
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/, // 尾部补充$号表示尾部匹配
        use: ['babel-loader?cacheDirectory'], // babel-loader 通过 cacheDirectory 选项开启缓存
        include: path.resolve(__dirname, 'src'), // 只处理src目录下代码，极大提升编译速度。（如果node_modules下有未编译过的库，这里不建议开启）
      },
    ],
  },
};
```

* 优化 resolve 配置:

```js
module.exports = {
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')], // 使用绝对路径指明第三方模块存放的位置，以减少搜索步骤
    extensions: ['.js', '.json'], // extensions尽量少，减少文件查找次数
    noParse: [/\.min\.js$/], // noParse可以忽略模块的依赖解析，对于min.js文件一般已经打包好了
  },
};
```

## 十、可维护的 webpack 构建配置

### 1、多个配置文件管理不同环境的 webpack 配置

![构建包功能设计](https://oscimg.oschina.net/oscnet/b75abbc724ad81046c80c0afd76bac10d46.jpg '构建包功能设计')

#### 1.1、通过`webpack-merge`合并配置

```js
merge = require('webpack-merge');
module.exports = merge(baseConfig, devConfig);
```

### 2、webpack 构建分析

#### 2.1、日志分析

在`package.json`文件的构建统计信息字段添加`stats`

```js
"scripts":{
  "build:stats":"webpack --env production --json > stats.json"
}
```

#### 2.2、速度分析

利用 `speedMeasureWebpackPlugin`分析整个打包总耗时和每个插件和`loader`的耗时情况

```js
const speedMeasureWebpackPlugin = require("speed-measure-webpack-plugin")
const smp = new speedMeasureWebpackPlugin()
const webpackConfig = smp.wrap({
  plugins:[
    new MyPlugin()
    ...
  ]
})
```

#### 2.3、体积分析

利用`bundleAnalyzerPlugin`分析依赖的第三方模块文件大小和业务里面的组件代码大小，构建完成后会在 8888 端口展示

```js
const bundleAnalyzerPlugin = require('webpack-bundle-analyzer');
module.exports = {
  plugins: [
    new bundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: 'localhost',
      analyzerPort: 8888, // 端口号
      reportFilename: 'report.html',
      defaultSizes: 'parsed',
      openAnalyzer: true,
      generateStatsFile: false, // 是否输出到静态文件
      statsFilename: 'stats.json',
      statsOptions: null,
      logLevel: 'info',
    }),
  ],
};
```

#### 2.4、编译时进度分析

利用`ProgressPlugin`分析编译进度和模块处理细节

```js
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.ProgressPlugin({
      activeModules: false,
      entries: true,
      handler(percentage, message, ...args) {
        // 打印实时处理信息
        console.info(percentage, message, ...args);
      },
      modules: true,
      modulesCount: 5000,
      profile: false,
      dependencies: true, // 显示正在进行的依赖项计数消息
      dependenciesCount: 10000,
      percentBy: null,
    }),
  ],
};
```

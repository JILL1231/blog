Node.js 10+ 版本后 在运行结果上与浏览器是一致的，但两者在原理上一个是基于libuv库上，一个是基于浏览器。浏览器的核心是宏任务和微任务，而 Node.js 还有阶段性任务执行。

事件循环就类似一个无限的while循环，假设我们要开发一个业务涉及到while循环，我们可能需要思考以下几个问题：
* 循环条件是什么？首次循环由什么启动？
* 循环执行的任务是什么？
* 任务是否存在优先级？
* 循环有没有终点？

带着这些问题，我们来瞧瞧 Node.js 10+ 官网的事件循环原理的核心流程图

### 一、Node.js事件循环原理

![](https://oscimg.oschina.net/oscnet/up-a022b914c75db293be31e4a696b845012dc.png)

##### 1. timers
该阶段执行由setTimeout()和setInterval()这两个函数启动的回调函数

##### 2. pending callbacks
该阶段执行某些系统操作的回调函数，如TCP错误类型

##### 3. idle prepare
仅系统内部使用

##### 4. poll
主要处理异步 I/O(网络 I/O和文件 I/O)的回调函数，以及其它回调函数

##### 5.check
该阶段执行setImmediate()的回调函数。setImmediate并不是立马执行，而是当事件循环 poll 中没有新的事件处理时才执行该部分，即先执行回调函数，再执行setImmediate

##### 6.close callbacks
执行一些关闭的回调函数，如 socket.on('close',...)

### 二、运行起点
Node.js事件循环的发起点有如下四个：
* 1、Node.js启动后
* 2、setTimeout 回调函数
* 3、setInterval 回调函数
* 4、I/O后的回调函数

换句话说：当Node.js 进程启动后，就发起了一个新的事件循环，即事件循环的起点。可为何？下面的代码在执行时先输出2再输出1呢？
```
setTimeout(() => {
    console.log('1'); // 该回调函数是新一轮事件循环的起点
}, 0);
console.log('2');
```
这里有个小点需要注意，当Node.js启动后，会初始化事件循环，处理已提供的输入脚本，它可能会先调用一些异步的API、调度定时器，或者 process.nextTick()，然后再处理事件循环

### 三、Node.js事件循环
Node.js事件循环有一个核心的主线程，它的执行阶段主要处理三个核心逻辑：
*  同步代码
* 将异步任务插入到微任务队列或宏任务队列中
* 执行微任务或宏任务的回调函数。在主线程处理回调函数的同时，也需判断是否插入微任务和宏任务
![](https://oscimg.oschina.net/oscnet/up-bbcc9659ee21bd3f113f73a84feff5a9023.png)

```
const fs = require('fs');
// 主流程执行完成后，超过1ms时，会将setTimeout回调函数逻辑插入到待执行回调函数 poll 队列中
setTimeout(() => { 
    console.log("setTimeout100")
    // 文件 I/O
    fs.readFile('./test.conf', {encoding: 'utf-8'}, (err, data) => {
        if (err) throw err;
        console.log('read file sync100 success');
    });
}, 100);

// setTimeout 如果不设置时间或者设置时间为0，则会默认为1ms
setTimeout(() => { 
    console.log("setTimeout0")
    // 文件 I/O
    fs.readFile('./test.conf', {encoding: 'utf-8'}, (err, data) => {
        if (err) throw err;
        console.log('read file sync0 success');
    });
}, 0);

// 文件 I/O 优先级高于 setTimeout，但处理事件长于1ms
fs.readFile('./test.conf', {encoding: 'utf-8'}, (err, data) => {
    if (err) throw err;
    console.log('read file success');
});

// 微任务
Promise.resolve().then(()=>{
    console.log('Promise callback');
});

// 微任务，process.nextTick 优先级高于 Promise
process.nextTick(()=>{
    console.log("process callback")
})

// 主流程 
console.log('start');
```
* 第一个事件循环主线程发起，先执行同步代码，所以输出 start
* 再从上往下分析，遇到微任务，插入微任务队列，遇到宏任务，插入宏任务队列。微任务队列包含：Promise.resolve 和 process.nextTick。宏任务队列包含：setTimeout(100)、setTimeout(0) 和 fs.readFile。
* 先执行微任务，根据优先级，先执行 process.nextTick 再执行 Promise.resolve，因此先输出process callback再输出Promise callback。
* 再执行宏任务队列，根据宏任务插入先后顺序执行 setTimeout(100)，接着执行setTimeout(0)，最后执行fs.readFile。由于setTimeout(100)延迟100ms，因此先执行setTimeout(0)和fs.readFile，由于fs.readFile优先级高于setTimeout(0)，先执行fs.readFile，但其处理时间大于1ms，因此可能会先执行setTimeout(0)，输出setTimeout0，而它新产生的宏任务将插入宏任务队列
* 最后执行宏任务 setTimeout(100)，并等待其完成后的回调

####  1、循环没有终点
当所有的微任务和宏任务都清空的时候，即当前没有任务可执行，也无法代表循环结束，可能存在当前还未回调的异步I/O，因此该循环时没有终点的，只要进程在，且新的任务存在，就会去执行 

####  2、主线程会因回调函数的执行而被阻塞
假设我们在setTimeout中新增一个阻塞逻辑，只有等待当前事件循环结束后，才执行fs.readFile回调函数
```
const fs = require('fs');

setTimeout(() => { 
    // 新的事件循环的起点
    console.log('1'); 
    sleep(10000)
    console.log('sleep 10s');
}, 0);

// 将会在 poll 阶段执行
fs.readFile('./config/test.conf', {encoding: 'utf-8'}, (err, data) => {
    if (err) throw err;
    console.log('read file success');
});
// 阻塞逻辑
function sleep ( n ) { 
    var start = new Date().getTime() ;
    while ( true ) {
        if ( new Date().getTime() - start > n ) {
            break;
        }
    }
}
```
![](https://oscimg.oschina.net/oscnet/up-47368dce3f0305868b2106f3b8cc7e88d1c.png)

从输出现象会发现，fs.readFile虽已处理完且通知回调到主线程，但主线程由于在处理回调时被阻塞了，导致无法处理fs.readFile。接下来，我们来印证一下，将 setTimeout 的时间更改为 10ms，则输出

![](https://oscimg.oschina.net/oscnet/up-07f40d3e84270ce217d9fe2a236fad4c10f.png)

你会优先看到fs.readFile的回调函数，这是因为fs.readFile执行完成了，还没启动下一个事件循环

### 四、异步事件驱动的好处
Node.js不善于处理CPU密集型的业务，易导致性能问题，我们分别执行主线程和异步I/O处理一个耗时CPU的计算(计算从0到1,000,000,000之间的和)，比对各自的效果

#### 1、主流程执行

![](https://oscimg.oschina.net/oscnet/up-57981c2eae3b3fb0da8a1008a0f97940754.png)

执行时间 total为1.084-1.090
#### 2、异步网络I/O
![](https://oscimg.oschina.net/oscnet/up-5264c88f296ea4604cd9bfa82a5f248807c.png)

执行时间 total为 0.562-0.597

#### 3、响应分析
异步网络I/O充分利用了Node.js的异步事件驱动能力，将耗时CPU计算逻辑分配给其它进程处理，因此主线程可直接处理其它请求逻辑，而在主流程执行耗时CPU计算，导致其无法处理其他逻辑，进而影响性能，因此上面服务的执行时间相差甚远

#### 4、单线程/多线程
遍历Node.js事件循环当前事件是在主线程，而主线程是单线程执行的，而异步I/O事件、setTimeout以及垃圾回收、内存优化等则是多线程执行。

### 五、应用场景
基于Node.js事件循环的原理，我们在使用Node.js时应减少或者避免在Node.js主线程中被阻塞以及进行一些大内存(V8 内存上限三1.4G)和CPU密集的场景，比如图片处理、大字符串、大数组类处理、大文件读写处理等等。

Node.js的优势在于其异步事件驱动能力较强，能够处理更高的并发，因此我们可以寻找网络I/O处理多、CPU计算少，业务复杂度高的服务

#### 1、业务网关
处理业务相关的通用逻辑，比如通用的协议转化、通用的鉴权处理以及其他一些业务安全处理

![](https://oscimg.oschina.net/oscnet/up-98b1707ffa486280ad7fb8e551ea93ce7ef.png)

在上面开放API的应用场景中，粉色框内的功能都是基于缓存来处理业务逻辑，大部分是网络I/O，并未涉及CPU密集逻辑。因此这类轻CPU运算服务在技术选型上可考虑Node.js作为服务端语言

#### 2、运营系统
运营系统往往逻辑复杂，需根据业务场景进行多次迭代、优化，并发高，但可不涉及底层数据库的读写，更多的是缓存数据的处理，如投票活动

#### 3、中台服务
中台的概念是将应用中一些通用的业务服务进行集中，其着重关注：网络I/O(高低都可)、并发(高低都可)、通用性(必须好)以及业务复杂度，一般情况下不涉及复杂的CPU运算(低运算)，比如常见的中台业务系统

|  系统                 |  通用性            | CPU计算       | 网络I/O           | 并发               |
| :------------:   | :------------: |:------------: | :------------: |:------------: | 
|  前端配置系统 |  是                    |  否                  |  低                  |  高                  |
| 反馈系统          |  是                    |  否                  |  高                  |  低                  |
| 推送系统          |   是                   |  否                  |  低                  |  低                  |
|  系统工具         |   是                   |  否                  |  低                  |  低                  |

这样的系统在Node.js主线程中，可快速处理各类业务场景，不会存在阻塞的情况


```js
setTimeout(function() {
  console.log(1)
}, 0)
new Promise(function(resolve) {
  console.log(2)
  for( var i=0 ; i<10000 ; i++ ) {
    i == 9999 && resolve()
  }
  console.log(3)
}).then(function() {
  console.log(4)
})
console.log(5)
```

js是一门单线程的语言，但是为了执行一些异步任务时不阻塞代码，以及避免等待期间的资源浪费，js存在事件循环的机制，单线程指的是执行js的线程，称作主线程，其他还有一些比如网络请求的线程、定时器的线程，主线程在运行时会产生执行栈，栈中的代码如果调用了异步api的话则会把事件添加到事件队列里，只要该异步任务有了结果便会把对应的回调放到【任务队列】里，当执行栈中的代码执行完毕后会去读取任务队列里的任务，放到主线程执行，当执行栈空了又会去检查，如此往复，也就是所谓的事件循环。

异步任务又分为【宏任务】（比如setTimeout、setInterval）和【微任务】（比如promise），它们分别会进入不同的队列，执行栈为空完后会优先检查微任务队列，如果有微任务的话会一次性执行完所有的微任务，然后去宏任务队列里检查，如果有则取出一个任务到主线程执行，执行完后又会去检查微任务队列，如此循环。

回到这题，首先整体代码作为一个宏任务开始执行，遇到setTimeout，相应回调会进入宏任务队列，然后是promise，promise的回调是同步代码，所以会打印出2，for循环结束后调用了resolve，所以then的回调会被放入微任务队列，然后打印出3，最后打印出5，到这里当前的执行栈就空了，那么先检查微任务队列，发现有一个任务，那么取出来放到主线程执行，打印出4，最后检查宏任务队列，把定时器的回调放入主线程执行，打印出1


```js
console.log('1');

setTimeout(function() {
  console.log('2');
  process.nextTick(function() {
    console.log('3');
  });
  new Promise(function(resolve) {
    console.log('4');
    resolve();
  }).then(function() {
    console.log('5');
  });
}); 

process.nextTick(function() {
  console.log('6');
});

new Promise(function(resolve) {
  console.log('7');
  resolve();
}).then(function() {
  console.log('8');
});

setTimeout(function() {
  console.log('9');
  process.nextTick(function() {
    console.log('10');
  }) 
  new Promise(function(resolve) {
    console.log('11');
    resolve();
  }).then(function() {
    console.log('12')
  });
})
```
这道题和上一题差不多，但是出现了process.nextTick，所以显然是在node环境下，node也存在事件循环的概念，但是和浏览器的有点不一样，nodejs中的宏任务被分成了几种不同的阶段，两个定时器属于timers阶段，setImmediate属于check阶段，socket的关闭事件属于close callbacks阶段，其他所有的宏任务都属于poll阶段，除此之外，只要执行到前面说的某个阶段，那么会执行完该阶段所有的任务，这一点和浏览器不一样，浏览器是每次取一个宏任务出来执行，执行完后就跑去检查微任务队列了，但是nodejs是来都来了，一次全部执行完该阶段的任务好了，那么process.nextTick和微任务在什么阶段执行呢，在前面说的每个阶段的后面都会执行，但是process.nextTick会优先于微任务，一图胜千言

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHpicYrciafd3U8o83thyl6lpgBSlmhTCIO0wVmrK8zBUEZgbYMaCErpOhfFPRlxuJ8MGGMf7gNU1zaA/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

理解了以后再来分析这道题就很简单了，首先执行整体代码，先打印出1，setTimeout回调扔进timers队列，nextTick的扔进nextTick的队列，promise的回调是同步代码，执行后打印出7，then回调扔进微任务队列，然后又是一个setTimeout回调扔进timers队列，到这里当前节点就结束了，检查nextTick和微任务队列，nextTick队列有任务，执行后打印出6，微任务队列也有，打印出8，接下来按顺序检查各个阶段，check队列、close callbacks队列都没有任务，到了timers阶段，发现有两个任务，先执行第一个，打印出2，然后nextTick的扔进nextTick的队列，执行promise打印出4，then回调扔进微任务队列，再执行第二个setTimeout的回调，打印出9，然后和刚才一样，nextTick的扔进nextTick的队列，执行promise打印出11，then回调扔进微任务队列，到这里timers阶段也结束了，执行nextTick队列的任务，发现又两个任务，依次执行，打印出3和10，然后检查微任务队列，也是两个任务，依次执行，打印出5和12，到这里是有队列都清空了








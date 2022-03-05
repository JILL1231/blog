互联网中的数据是通过数据包来传输的，`IP`通过`DNS`查询`IP地址`进而把数据包送达目的主机，`UDP`接过数据包，通过端口号把数据包送往具体的应用，而使用`TCP`可保证数据的**完整性**

当传输层`TCP/IP`协议将数据传输到网络上时，浏览器可通过`HTTP`协议进行文本传输，物联网可通过`MQTT`协议进行交互

![](https://oscimg.oschina.net/oscnet/up-41de2e6d5caf8f3f8d687eb907114a0f089.png)

## 一、UDP
`UDP`传输非常快，适合在线视频、互动游戏这类强交互的场景

![](https://oscimg.oschina.net/oscnet/up-d4bf6f55e0d02c067b2ec02a9cae90f9b8c.png)

对于数据可靠性有要求的场景则不太适合，它有个大缺点：不能保证数据可靠性
* 不提供重发机制，直接丢弃当前的包
* 发送之后不售后，无法确认是否到达目的地
* 无法还原数据包成完整的文件

但它的兄弟`TCP`可以代劳

## 二、TCP
`TCP`是一种面向连接的、可靠的、基于字节流的传输层通信协议。解决了丢失数据包的问题，并且提供了组装数据包的能力。这不得不感谢发送端不仅给它提供了源端口号和目标端口号，还提供了序列号，引入了数据包排列机制

![](https://oscimg.oschina.net/oscnet/up-8783c5690b01c72da364f437b7c5e73478b.png)

### 1、连接过程
#### 1.1、建立连接
`TCP`是面向连接的，在数据通信之前就做好两端的准备工作，在客户端和服务端通过三个数据包来确认连接的建立
![](https://oscimg.oschina.net/oscnet/up-7cd87d79a0eee04aed19562a5069004774f.png)

* 一开始，客户端和服务端都处于 `close`状态，接着服务端主动监听某个端口，处于`listen`状态
* 客户端生成初始序列号`client_isn`置于`TCP`首部的序列号中，同时更改`SYN`标志为`1`向服务器发起连接，之后处于`SYN-SENT`状态
* 服务端收到`SYN`报文同样生成初始序列号`server_isn`置于`TCP`首部的序列号中，并将客户端序列号`+1`置于`TCP`首部的确认应答号中，同时更改`SYN`和`ACK`标志为`1`，发送`SYN + ACK`报文并更改状态为`SYN_RCVD`
* 客户端收到`SYN + ACK`报文，将服务端序列号`+1`填入确认应答号并回复`ACK`应答报文变更状态为`established`
* 服务器收到应答后也进入`established`状态

>只有第三次握手可以携带数据，前面两次是不可携带数据的

#### 1.2、为什么三次握手？
* 通过三次握手能防止历史连接的建立，能减少双方不必要的资源开销，能帮助双方同步初始化序列号
* 两次握手无法仿制历史连接的建立，会造成双方资源的浪费，也无法可靠的同步双方序列号
* 四次握手：三次握手就已经理论上最少可靠连接建立，因此不需要使用更多的通信次数

### 2、传输数据
* `TCP`是可靠的，接收端必须对每个数据包进行确认操作，即重发机制

当发送端发送了一个数据包之后，在规定时间内没有接收到反馈的确认信息，则判断数据包丢失，触发重发机制

* `TCP`是基于字节流的，接收端可通过`TCP`提供的序号进行排序，进而保证数据的完整性，即排列机制

### 3、断开过程
#### 3.1、断开连接
![](https://oscimg.oschina.net/oscnet/up-1fa76cd0c1eaa79fc5d73f1b3c3fc2d9c66.png)

* 客户端主动关闭连接，发送`FIN`报文，即更改`FIN`标志为`1`同时进入`FIN_WAIT_1`状态
* 服务端收到报文后发出`ACK`应答报文，接着进入`CLOSED_WAIT`状态
* 客户端收到报文后，进入`FIN_WAIT_2`状态
* 服务器处理完成后发出`FIN`报文，并进入`LAST_ACK`状态
* 客户端收到报文后发出`ACK`应答报文，接着进入`TIME_WAIT`状态
* 服务器收到`ACK`应答报文后完成连接关闭
* 客户端 等待**两倍**报文最大生存时间(MSL)后 自动进入`close`状态，完成连接关闭

>主动关闭连接的，才有`TIME_WAIT`状态
#### 3.2、为什么四次挥手？
* 关闭连接时，客户端向服务端发送`FIN`时，仅代表客户端不再发送数据但能接收数据
* 服务端接收到`FIN`时，回复一个`ACK`，仅代表收到报文，但服务器可能还有数据需要处理和发送，确保不再发送数据时才发送`FIN`给到客户端表示同意现在关闭连接

## 三、HTTP

`HTTP` 协议以 `ASCII` 码传输，构建于 `TCP/IP` 协议之上的应用层协议，默认端口号是 `80`，它是无连接无状态的超文本传输协议

### 1、HTTP 报文
#### 1.1、请求报文
规范把 `HTTP` 请求分为三个部分：请求行、请求头 和 消息主体
```js
[method] [url] [version]
[headers]

[body] 
```
`HTTP` 中的`GET`、`POST`、`PUT`、`DELETE`对应着资源的查、增、改、删4个操作

##### 1.1.1、GET
只读操作，是安全且幂等的
* 安全：请求方法不会破坏服务器上的资源
* 幂等：多次执行相同的操作，结果都是相同的
##### 1.1.2、POST
读写操作，是不安全且不幂等的

##### 1.1.3、PUT
不同于`POST`，`PUT`是幂等的

##### 1.1.4、OPTIONS
用以从服务器获取更多信息
#### 1.2、响应报文
同样`HTTP`响应分为三个部分：状态行、响应头 和 响应正文
```js
[version] [status code] [status msg]
[headers]

[body]
```
* 常见的状态码有

|  状态码  |  状态描述  |  备注  |
|   ----   |  ----   |   ----   |
| 206 | Partial Content | 范围响应，主体包含所请求的数据区间<br/>断点续传时通过 `Range` 指定区间 |
| 301 | Moved Permanently | 请求永久重定向 |
| 302 | Moved Temporarily | 请求临时重定向 |
| 304 | Not Modified | 未修改，使用缓存文件(协商缓存) |
| 400 | Bad Request | 客户端请求有语法错误 |
| 401 | Unauthorized | 请求未经授权(同`WWW-Authenticate`一起使用)<br/>在后续请求中携带 `Authorization`用于验证用户代理身份的凭证|
| 403 | Forbidden | 服务器拒绝提供服务，通常在响应正文给出原因|
| 404 | Not Found | 请求资源不存在|
| 500 | Internal Server Error | 服务器发生不可预期的错误 |
| 503 | Service Unavailable | 服务器当前无法处理请求，需等待服务器恢复正常|

### 2、HTTP 演变
![](https://oscimg.oschina.net/oscnet/up-2905e2a457f186646127b30c974df9e0d30.jpg)

|  版本  |  核心诉求  |  新增特性  |
|   ----   |  ----   |   ----   |
| HTTP/1.0 | 支持多种类型的文件下载 | 引入请求头、响应头、状态码|
| HTTP/1.1 | 提高对带宽的利用率 | 1、持久连接(每个域名最多同时维护 6 个 TCP 持久连接) <br/> 2、使用 CDN 实现域名分片机制<br/> 3、提供虚拟主机的支持(Host 字段)<br/> 4、增加缓存策略<br/> 5、安全机制(CORS)|
| HTTP/2.0 | 提升网络速度 | 1、多路复用<br/>2、设置请求的优先级 <br/>3、服务器推送<br/> 4、头部压缩<br/>5、二进制格式|
| HTTP/3.0 | 构建高效网络 | 1、甩掉TCP、TLS 的包袱，使用UDP协议<br/>2、QUIC协议|
| HTTPS| 构建安全HTTP | 1、引入SSL<br/>混合加密<br/>摘要算法<br/>数字证书 |

#### 2.1、持久连接
`HTTP/1.1` 中增加了持久连接的方法，即在一个 `TCP` 连接上可以传输多个 `HTTP` 请求，只要浏览器或者服务器没有明确断开连接，那么该 `TCP` 连接会一直保持，提升了整体 `HTTP` 的请求时长。目前浏览器中对于同一个域名，默认允许同时建立 6 个 TCP 持久连接
```js
Connection: Keep-Alive;  // HTTP/1.1默认使用持久连接，如需关闭，请求头Connection设置为close
Keep-Alive: timeout=5, max=100; // HTTP 长连接不可能一直保持，timeout=5 表示这个TCP通道可以保持5秒，max=100，表示这个长连接最多接收100次请求就断开
```
#### 2.2、使用 CDN 实现域名分片机制
![](https://oscimg.oschina.net/oscnet/up-781f979322378b49154b3cc4b2cf39a3498.png)

#### 2.3、提供虚拟主机的支持
`Host`表示当前的域名地址，服务器可以根据不同的 `Host` 值做不同的处理
```js
Host: <host>:<port>; // host: 服务器的域名（用于虚拟主机） port: 服务器监听的 TCP 端口号
```
#### 2.4、缓存策略
![缓存策略](https://oscimg.oschina.net/oscnet/up-d18a2ff7d638e0b460f05e88ddddb3795b7.png)

#### 2.5、安全机制
##### 2.5.1、会话跟踪
`HTTP`是无状态协议，即浏览器对于事务的处理没有记忆能力，可通过`Cookie`和`JWT`机制来进行会话跟踪

* `Cookie`机制

服务端第一次收到请求时创建`session`对象生成对应的`sessionID`，将其放进`Set-Cookie`发送给客户端，下一次访问时，客户端携带`sessionID`请求服务端，服务端可通过`sessionID`识别用户信息
![](https://oscimg.oschina.net/oscnet/up-66c4249befef69a89af8b2c1c763872352f.png)

`Cookie` 的过期时间、域、路径、有效期、适用站点都可以根据需要来指定
|  功能  |  属性  |  例子  | 补充说明|
|   ----   |  ----   |   ----   |   ----   |
| 定义 Cookie 的生命周期 | Expires <br/> Max-Age|Set-Cookie: key=value; Expires=Wed, 21 Oct 2022 07:28:00 GMT|设定的日期和时间只与客户端相关，会话期 Cookie 仅在会话期内有效|
|限制访问 Cookie|HttpOnly<br/>Secure|Set-Cookie: key=value; Secure; HttpOnly|HttpOnly:仅作用于服务器<br/>Secure仅适用于 HTTPS 协议加密过的请求|
|Cookie 的作用域|Domain<br/>Path |Set-Cookie:Domain=mozilla.org;Path=/docs|Domain 指定了哪些主机可以接受 Cookie<br/>Path 指定了主机下的哪些路径可以接受 Cookie|
|SameSite|None<br/>Strict<br/>Lax|Set-Cookie: key=value; SameSite=Strict|None:浏览器会在同站请求、跨站请求下继续发送 cookies(旧版本浏览器默认选项)<br/>Strict:浏览器将只在访问相同站点时发送 cookie<br/>Lax:与 Strict 类似，但用户从外部站点导航至URL时除外(新版本浏览器默认选项)|

* `JWT`机制 (JSON Web Token)

`Cookies` 只适用于单节点的域 或 节点的子域，若通过第三个节点访问会被禁止。而`JWT`机制则支持跨域认证，可通过多个节点进行用户认证

服务端第一次收到请求时，进行认证后生成一个 `Token`(签名后的`JSON` 对象)发送给客户端。客户端可将收到的`jwt`存储在`Cookie`或`localStorage`上，之后每次与服务端通信都携带上，可通过`Cookie`自动发送，但这种方式不能跨域，比较推荐通过 `POST` 请求的数据体 或 `Authorization`进行传递

>注意喔，JWT 的 Cookie 信息存储在客户端，即服务端是无状态的

##### 2.5.2、跨源资源共享(CORS)
![CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/cors_principle.png)

规范要求那些可能产生副作用的请求，浏览器必须首先使用`OPTIONS`方法发起一个预检请求，从而获知服务端是否允许跨域请求。服务器确认允许后才发起实际的`HTTP`请求。在预检请求的返回中，服务端可通知客户端是否需要携带身份凭证

* 简单请求

若请求满足下述所有条件，则称之为简单请求，它不会触发预检请求

1、使用`GET`、`HEAD`和`POST`请求方法
2、`Content-Type`的值仅限于`text/plain`、`multipart/form-data`和`application/x-www-form-urlencoded`
3、请求中没有注册任何事件监听器，没有使用 `ReadableStream` 对象

```js
// 附带身份凭证的简单请求
withCredentials:true; // 向服务器发送 Cookies
Access-Control-Allow-Credentials: true; // 服务端允许附带身份凭证
```
* 复杂请求
![](https://oscimg.oschina.net/oscnet/up-4bb25e9e22d49719da31e1efabeb5b4812b.png)

|  响应头  |  例子  |  说明  | 
|   ----   |  ----   |   ----   |
|`Access-Control-Allow-Origin`|`Access-Control-Allow-Origin: <origin> | *`<br/>`Vary: Origin`|origin：指定允许访问该资源的URI<br/>若指定了具体的域名，则`Vary`的值必须包含`Origin`，表明服务端按URI返回对应内容|
|`Access-Control-Expose-Headers`|`Access-Control-Expose-Headers: X-My-Custom-Header`|服务器把允许浏览器访问的头放入白名单|
|`Access-Control-Allow-Credentials`|`Access-Control-Allow-Credentials: true`|指定了`credentials:true`时是否允许浏览器读取 `response` 的内容<br/>在预检请求的响应时，指定实际的请求是否可以使用 `credentials`|
|`Access-Control-Max-Age`|`Access-Control-Max-Age: 86400`|预检请求的结果在多少秒内有效|
|`Access-Control-Allow-Methods`|`Access-Control-Allow-Methods: <method>[, <method>]*`|预检请求的响应，指明了实际请求所允许使用的 HTTP 方法|
|`Access-Control-Allow-Headers`|`Access-Control-Allow-Headers: <field-name>[, <field-name>]*`|预检请求的响应，指明了实际请求中允许携带的首部字段|


#### 2.6、支持动态生成内容
服务器会将数据分割成若干个任意大小的数据块，每个数据块发送时会附上上个数据块的长度，最后使用一个**零长度**的块作为发送数据完成的标志，因此对于下载请求来说，是没有办法实现进度的
```js
Transfer-Encoding: gzip, chunked;  // 分块：chunked 压缩算法：compress、deflate、gzip
```
#### 2.7、多路复用
一个域名只使用一个`TCP`长连接来传输数据，这样整个页面资源的下载过程只需要一次慢启动，避免了多个 `TCP` 连接竞争带宽的问题。移除了串行请求，顺应的解决了队头阻塞问题

#### 2.8、设置请求的优先级
每个数据流都标记着独一无二的编号，客户端可以指定数据流的优先级

#### 2.9、服务器推送
服务端**主动**向客户端发送消息，即：当用户请求一个 `HTML` 页面之后，服务器知道该 `HTML` 页面会引用几个重要的 `JavaScript` 文件和 `CSS` 文件，那么在接收到 `HTML` 请求之后，附带将要使用的 `CSS` 文件和 `JavaScript` 文件一并发送给浏览器，这样当浏览器解析完 `HTML` 文件之后，就能直接拿到需要的 `CSS` 文件和 `JavaScript` 文件，大大提升了页面首次渲染速度

#### 2.10、头部压缩
`HTTP/2.0`引入`HPACK`算法：在客户端和服务器同时维护一张头信息表，所有字段都会存入这个表生成一个索引号，相同字段只发送对应的索引号，即：同时发出多个请求，请求头一样或相似，则协议会将重复部分消除

#### 2.11、二进制格式
`HTTP/2.0` 全面采用二进制格式，头信息和数据体都是二进制，统称为「帧」提高了数据传输的效率
![](https://oscimg.oschina.net/oscnet/up-8fb00f20e00b9775b38d8c27b8e6d671537.png)

#### 2.12、QUIC协议
* 实现了类似 `TCP` 的流量控制、传输可靠性的功能
  * 
* 集成了 `TLS` 加密功能，减少了握手所花费的 `RTT` 个数
* 实现了 `HTTP/2` 中的多路复用功能
> 不同于 TCP，QUIC 实现了在同一物理连接上可以有多个独立的逻辑数据流，实现了数据流的单独传输，避免了 TCP 中队头阻塞的问题
* 实现了快速握手功能，基于 `UDP` 的 `QUIC` 可使用 `0-RTT`|`1-RTT` 来建立连接

### 3、HTTPS
`HTTPS`在`HTTP`和`TCP`之间加了一层用于加解密的`SSL/TLS`协议，通过信息加密、校验机制 和 身份证书 保证通信的安全性

![](https://oscimg.oschina.net/oscnet/up-ea9055735f89eb3a66b2d1acb66e350811b.png)

* 客户端 发送 对称加密套件列表、非对称加密套件列表 和 客户端随机数 给到服务端
* 服务端 保存 客户端随机数 和 私钥，回复 选中的对称加密套件、非对称加密套件 和 服务端随机数 以及 数字证书
* 客户端向 `CA`机构验证数字证书，证实服务端身份并获取公钥
* 客户端利用两端的随机数计算出`pre-master`，并用获取到的公钥进行加密，发送加密后的`pre-master`
* 服务端拿出私钥进行解密，得到`pre-master`
* 服务端和客户端使用这三组随机数生成会话密钥，并返回确认消息
* 之后使用对称加密进行通讯

#### 3.1、混合加密
`HTTPS`通过非对称加密交换「会话密钥」后续通信使用对称加密，这是由于
* 非对称加密使用两个密钥：公钥和私钥，公钥可保存在`CA`机构同时保存私钥。可以安全的进行密钥交换，但速度慢
* 对称加密只使用一个密钥，无法做到安全的密钥交换，但速度快

#### 3.2、摘要算法
摘要算法通过生成唯一的指纹，用于校验数据的完整性。客户端在进行通信前会通过摘要算法得出明文的指纹，请求时将指纹和明文一并加密，服务端收到密文后进行解密，比对携带的指纹和当前计算的指纹是否一致，一致则说明数据完整

#### 3.3、数字证书
权威机构`CA`签发认证的数字证书【包含了公钥、组织信息、CA信息、有效时间、证书序列号、CA生成的数字签名等】这些信息是明文的，同时可向浏览器证明服务器的身份

## 四、MQTT

`MQTT`是基于二进制消息的发布/订阅编程模式的消息协议，非常适合需要低功耗和网络带宽有限的IoT场景

* 设备连接

设备通过`MQTT`协议连接到物联网云服务，进而可以进行设备管理及数据管理
![](https://oscimg.oschina.net/oscnet/up-d2b0a1ca7d9f4a6aea282c4e83840d24c12.png)



* 消息类型

`MQTT`拥有`14`种不同的消息类型，比如`CONNECT`表示客户端连接到MQTT代理，`CONNACK`表示连接确认


* 主题

`MQTT`提供了主题对消息进行分类，消息是一个`UTF-8`的字符串，通过类似正则的规则进行匹配分类，比如：`+`可以过滤一个层级，`*`可以过滤任意级别的层级(必须在主题最后)

* 服务质量

`MQTT`提供`级别0`、`级别1`和`级别2`三种服务质量

|  服务质量  |  消息可靠性  |  解释  |
|   ----   |  ----   |   ----   |
| 级别0 | 尽力而为 | 不提供重发 |
| 级别1 | 至少一次 | 提供重发，并发可能造成重复消息|
| 级别2 | 恰好一次 | 不丢失不重复，但增加延时减少并发|



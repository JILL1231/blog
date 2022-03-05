# 透过浏览器缓存淘汰策略学习LRU算法

浏览器的缓存，即保存在本地的资源副本，当缓存容量达到上限时，则需进行缓存淘汰策略，常见的有先进先出的`FIFO`、最少使用`LFU`以及最近最少使用`LRU`

### LRU 算法原理
核⼼思想：若数据最近被访问，则将来被访问的概率会很高，因此在写入数据之前移除最久未访问的数据，从而为新数据留出空间

* 访问`A`时，判断缓存中是否存在，若存在，则将`A`从缓存中移除，并作为最新访问重新推入
* 不存在则缓存`A`，若超出缓存大小则移除`cache[0]`

### [LRU 缓存](https://leetcode-cn.com/problems/lru-cache/)
根据上面的知识，设计一个 `LRU` (最近最少使用) 缓存机制，它支持以下操作：获取数据 get 和写入数据 put 
* get(key) - 若 `key` 存在于缓存，则取其对应的值，否则返回-1
* put(key, value) - 若`key`存在，则变更`value`，若`key`不存在，则写入，写入导致`key`数量超过`capacity`，则逐出 最久未使用的`key`

```js
示例：
// 输入
["LRUCache", "put", "put",   "get", "put",  "get", "put",   "get", "get", "get"]
[[2],        [1, 1], [2, 2], [1],   [3, 3], [2],   [4, 4],  [1],   [3],   [4]]
// 输出
[null, null, null, 1, null, -1, null, -1, 3, 4]

// 解释
const lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // 缓存是 {1=1}
lRUCache.put(2, 2); // 缓存是 {1=1, 2=2}
lRUCache.get(1);    // 返回 1
lRUCache.put(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
lRUCache.get(2);    // 返回 -1 (未找到)
lRUCache.put(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}
lRUCache.get(1);    // 返回 -1 (未找到)
lRUCache.get(3);    // 返回 3
lRUCache.get(4);    // 返回 4
```
思路：
* 利⽤ `Map` 
> 任何值(对象或者原始值) 都可以作为`Map`的`key`、`value`，且它能够记住键的原始插入顺序，即有序的。`Map`的`key`与内存地址绑定，只要内存地址不一样，则视为两个键
* 存在即更新，不存在则推入
* 超过容量大小则移除最久未访问的`key`
```js
var LRUCache = function (capacity) {
  this.capacity = capacity || 2;
  this.map = new Map();
}

LRUCache.prototype.get = function (key) {
  let res = -1;
  // 存在即更新
  if (this.map.has(key)) {
    res = this.map.get(key);
    this.map.delete(key)
    this.map.set(key, res)
  }
  return res;
}

LRUCache.prototype.put = function (key, value) {
  // 存在即更新
  if (this.map.has(key)) {
    this.map.delete(key)
  } else if (this.map.size >= this.capacity) {
    // 超出则移除最久未使用 this.map.keys().next().value 
    this.map.delete(this.map.keys().next().value)
  }
  this.map.set(key, value)
}
```




哈希函数(散列算法、散列函数)能够将任意长度的输入值转换为固定长度的散列值输出，输出值通常为字母和数字组合。在密码学中，散列函数具有**不可逆性**

### 1、一个较好的哈希函数
* 易于计算：易于计算，且不能成为算法本身
* 统⼀分布：不导致群集，在哈希表中提供统一分布
* 抗碰撞：减少冲突，即较少的产生相同哈希值

### 2、常见冲突解决
⽆论哈希函数有多健壮，都必然会发⽣冲突，常见的解决冲突的方法有：
* 开放寻址法
当`key`通过哈希函数计算出来的哈希值，其地址被占用了，则需对地址进行探测再哈希，比如往后移动地址，若超出最大长度，可对总长度取余。这里移动的地址是产生冲突时的增列序量
![](https://oscimg.oschina.net/oscnet/up-465c555b378f41f39fd21ca8290b09a0e62.png)
* 链地址法
当`key`通过哈希计算后落在同一个地址上的哈希值，做一个链表
![](https://oscimg.oschina.net/oscnet/up-38bc58a5fc0a5acc6d4026d0e4d4b8edfed.png)
* 再哈希法
产生冲突后，使⽤`key`的其他部分继续计算地址，如果还是有冲突，则继续使⽤其他部分再计算地址
* 建⽴⼀个公共溢出区
建⽴⼀个公共溢出区，当地址存在冲突时，把新的地址放在公共溢出区⾥

## 二、leetcode 最常见相关题型
### 1、[存在重复元素](https://leetcode-cn.com/problems/contains-duplicate/)
给定一个整数数组，判断是否存在重复元素

思路：
* 遍历数组，将每一项元素都往map中添加
* 剩下的就是具体逻辑啦

```ts
const containsDuplicate = function(nums) {
    let map = new Map();
    for(let i of nums){
        if(map.has(i)){
            return true;
        }else{
            map.set(i, 1);
        }
    }
    return false;
};
```
### 2、[字符串中的第一个唯一字符](https://leetcode-cn.com/problems/first-unique-character-in-a-string/)
给定一个字符串，找到它的第一个不重复的字符，并返回它的索引。如果不存在，则返回 -1
```
  s = "leetcode" // 返回 0
  s = "loveleetcode" // 返回 2
```

思路：
* 用一个对象{}来记数，出现过一次就+1
* 再次遍历字符串，看它们在之前记录的对象里的值，是否是1，是就返回下标，不是返回-1

```ts
var firstUniqChar = function(s) {
  const map = {}
  for(let v of s) {
    map[v] = (map[v] || 0) + 1
  }
  for(let i = 0; i < s.length; i++) if(map[s[i]] === 1) return i;
  return -1;
}
```
### 3、[有效的字母异位词](https://leetcode-cn.com/problems/valid-anagram/)
若 s 和 t 中每个字符出现的次数都相同，则称 s 和 t 互为字母异位词
```
输入: s = "anagram", t = "nagaram"
输出: true
```
思路：
* 声明计数器，一个对象 const obj = {}
* 遍历s字符串，假设遍历到'a'字符，判断obj[a]是否存在，若存在+1，否则初始化obj[a]=1
* t字符串同理，它每次-1，初始化为obj[a]=-1
* 最后判断obj的value是否都为0

```ts
var isAnagram = function(s, t) {
  const slen = s.length;
  const tlen = t.length;
  if (slen !== tlen) return;  
  
  const obj = {};
  for(let i = 0; i< slen; i++) {
    obj[s[i]] = obj[s[i]] ? obj[s[i]] + 1 : 1;
    obj[t[i]] = obj[t[i]] ? obj[t[i]] - 1 : -1;
  }
  return Object.values(obj).every(v=>v===0);
}
```

### 4、[多数元素](https://leetcode-cn.com/problems/majority-element/)
给定一个大小为 n 的数组，找到其中的多数元素。多数元素是指在数组中出现次数 大于 ⌊ n/2 ⌋ 的元素，假设数组是非空的，并且给定的数组总是存在多数元素

```
  输入: [3,2,3]
  输出: 3
```

思路：
* 声明计数器，一个对象 const result = {}
* 遍历数组，若存在+1，否则初始化为1
* 同时，判断当前元素出现的次数 是否大于 数组总长度/2

```ts
var majorityElement = function(nums) {
    const result = {};
    const n = nums.length >> 1;
    for(let i of nums) {
        result[i] = result[i] ? result[i]+1: 1;
        if(result[i] > n) return i
    }
}
```
### 5、[只出现一次的数字](https://leetcode-cn.com/problems/single-number/)
给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素
```
  输入: [3,2,3]
  输出: 2
```
思路：
* 前置知识
```
异或(^)运算
1、任何数和自己做异或运算，结果为 0，1^1=0
2、任何数和 0 做异或运算，结果还是自己，1^0=1
3、异或运算中，满足交换律和结合律， 1^2^1 = 1^1 ^2 = 1^(1^2 )=2
```
* 即每个元素均出现两次，即异或运算得0
* 出现一次的元素则异或运算得自己
* 因满足交换律和结合律，异或运算后只留下出现一次的元素

```ts
var singleNumber = function(nums) {
  let num = nums[0]
  for(let i = 1; i < nums.length; i++){
      num ^= nums[i]
  }
  return num
};
```

### 6、[O(1) 时间插入、删除和获取随机元素](https://leetcode-cn.com/problems/insert-delete-getrandom-o1/)
设计⼀个⽀持在平均 时间复杂度 O(1) 下，执⾏以下操作的数据结构
* insert(val) ：当元素 val 不存在时，向集合中插⼊该项
* remove(val) ：元素 val 存在时，从集合中移除该项
* getRandom ：随机返回现有集合中的⼀项。每个元素应该有 相同的概率 被返回
```md
输入
["RandomizedSet", "insert", "remove", "insert", "getRandom", "remove", "insert", "getRandom"]
[[], [1], [2], [2], [], [1], [2], []]
输出
[null, true, false, true, 2, true, false, 2]
```
思路：
* 利用Map()
* 利用Set()
```js
var RandomizedSet = function () {
  this.set = new Set()
};

/** 
* @param {number} val
* @return {boolean}
*/
RandomizedSet.prototype.insert = function (val) {
  if (this.set.has(val)) return false;
  this.set.add(val)
  return true;
};

/** 
* @param {number} val
* @return {boolean}
*/
RandomizedSet.prototype.remove = function (val) {
  if (!this.set.has(val)) return false;
  this.set.delete(val)
  return true
};

/**
* @return {number}
*/
RandomizedSet.prototype.getRandom = function () {
  const random = parseInt(Math.random() * (this.set.size))
  return [...this.set][random]
};
```

### 2、[第⼀个只出现⼀次的字符](https://leetcode-cn.com/problems/di-yi-ge-zhi-chu-xian-yi-ci-de-zi-fu-lcof/)
在字符串 s 中找出第⼀个只出现⼀次的字符。如果没有，返回⼀个单空格。 s 只包含⼩写字⺟
```
输入：s = "abaccdeff"
输出：'b'
```
思路：
* 扫描每个字符，记录到 map 中，若已有则直接记录2
* 再次扫描 map.keys() ，获取 map 中第一个值为1的字符
```js
var firstUniqChar = function(s) {
    const map = new Map()
    for(let k of s) {
        map.set(k,map.has(k)? 2 : 1)
    }
    for(let c of map.keys()) {
        if(map.get(c)===1)return c
    }
    return ' '
};
```
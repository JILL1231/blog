队列是先进先出的有序集合
### 1、队列
队头出队，队尾进队
![](https://oscimg.oschina.net/oscnet/up-00b58b3ac1e1a2e5b9698fbece554b334d8.png)
#### 常见操作
* 进队: `items.push(i)`
* 出队: `items.shift()`

### 2、双端队列
队头、队尾都可以进队出队
![](https://oscimg.oschina.net/oscnet/up-ed86117a659bee898cdc8e2969bb72c0770.png)
#### 创建操作
* 队头进队: `items.unshift(i)`
* 队头出队: `items.shift()`
* 队尾进队: `items.push(i)`
* 队尾出队: `items.pop()`

## 二、leetcode 最常见相关题型
### 1、[用栈实现队列](https://leetcode-cn.com/problems/implement-queue-using-stacks/)
请你仅使用两个栈实现先入先出队列。队列应当支持一般队列支持的所有操作（push、pop、peek、empty）
实现 MyQueue 类：
* void push(int x) 将元素 x 推到队列的末尾
* int pop() 从队列的开头移除并返回元素
* int peek() 返回队列开头的元素
* boolean empty() 如果队列为空，返回 true ；否则，返回 false

```md
输入：["MyQueue", "push", "push", "peek", "pop", "empty"]
     [[], [1], [2], [], [], []]
输出：[null, null, null, 1, 1, false]
```
思路：
* 栈是后进先出的有序集合，队列是先进先出的有序集合
* 可通过栈1出栈，栈2进栈模拟序列倒置
```js
var MyQueue = function() {
    this.stack1 = []
    this.stack2 = []
};

MyQueue.prototype.push = function(x) { this.stack1.push(x) };

// 队列开头的元素并移除
MyQueue.prototype.pop = function() {
    if(this.stack2.length) return this.stack2.pop()
    if(!this.stack1.length) return -1
    while(this.stack1.length){
        this.stack2.push(this.stack1.pop())
    }
    return this.stack2.pop()
};

// 队列开头的元素
MyQueue.prototype.peek = function() {
    if(this.stack2.length) return this.stack2[this.stack2.length-1]
    if(!this.stack1.length) return -1
    while(this.stack1.length){
        this.stack2.push(this.stack1.pop())
    }
    return this.stack2[this.stack2.length-1]
};

MyQueue.prototype.empty = function() { return this.stack1.length === 0 && this.stack2.length ===0 };

```

### 2、[翻转字符串⾥的单词](https://leetcode-cn.com/problems/reverse-words-in-a-string/)
给你一个字符串 s，逐个翻转字符串中的所有单词，单词是由非空格字符组成的字符串。s 中使用至少一个空格将字符串中的 单词 分隔开。请你返回一个翻转 s 中单词顺序并用单个空格相连的字符串
* 输入字符串 s 可以在前面、后面或者单词间包含多余的空格。
* 翻转后单词间应当仅用一个空格分隔。
* 翻转后的字符串中不应包含额外的空格
```md
示例：
  输入：s = "  hello  world  "
  输出："world hello" // 输入字符串可以在前面或者后面包含多余的空格，但是翻转后的字符不能包括
```
思路：
* 使用正则+API
```js
var reverseWords = function (s) {
  return s.match(/[\w!,]+/g).reverse().join(' ')
}
```
* 双端队列支持从队列头部插入的方法，因此我们可以沿着字符串一个一个单词处理，然后将单词压入队列的头部，再将队列转成字符串即可
```js
var reverseWords = function (s) {
  let left = 0
  let right = s.length - 1
  let queue = []
  let word = ''
  while (s.charAt(left) === ' ') left++
  while (s.charAt(right) === ' ') right--
  while (left <= right) {
    let char = s.charAt(left)
    if (char === ' ' && word) {
      queue.unshift(word)
      word = ''
    } else if (char !== ' ') {
      word += char
    }
    left++
  }
  queue.unshift(word)
  return queue.join(' ')
}
```
### 3、[⽆重复字符的最⻓⼦串](https://leetcode-cn.com/problems/longest-substring-without-repeating-characters/)
给定一个字符串 s ，请你找出其中不含有重复字符的 最长子串 的长度
```md
输入: s = "abcabcbb"
输出: 3 // 因为无重复字符的最长子串是 "abc"，所以其长度为 3
```
思路：
* 利用双端队列，滑动窗口存储当前非重复字符
* 窗口队列若存在字符A与当前字符一致，则将[队头～A]的字符全部出队
* 扫描过程，不断更新滑动窗口，并比较最大值
```js
var lengthOfLongestSubstring = function (s) {
  const deque = [];
  let max = 0
  for (let i = 0; i < s.length; i++) {
    // 找到相同元素的下标，出队
    const includes = deque.indexOf(s[i])
    includes > -1 && deque.splice(0, includes + 1)
    deque.push(s[i])
    max = Math.max(max, deque.length)
  }
  return max
}
```
### 4、[滑动窗⼝最⼤值](https://leetcode-cn.com/problems/sliding-window-maximum/)
给你一个整数数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。返回 滑动窗口中的最大值 

```md
输入：nums = [1,3,-1,-3,5,3,6,7], k = 3
输出：[3,3,5,5,6,7]
解释：
滑动窗口的位置                  最大值
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
```
思路：
* 利用双端队列，存储窗口可见值的**索引**
* 扫描nums，若队尾的值小于当前扫描值，则出队，以此保证双端队列队头永远最大
* 从第K次扫描开始，依次把**最大值**。即队头添加到结果中

```js
var maxSlidingWindow = function(nums, k) {
    const deque = [];
    const res = [];
    for(let i = 0; i < nums.length; i++) {
        // 超出窗口，队头出队
        if(i - deque[0] >= k) deque.shift();
        // 队尾元素小于当前值，队尾出队，保证新的队头依旧最大
        while(nums[deque[deque.length-1]] <= nums[i]) deque.pop();
        deque.push(i)
        if(i >= k-1){
            res.push(nums[deque[0]])
        }
    }
    return res;
};
```
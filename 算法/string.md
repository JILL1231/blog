ECMAScript中的字符串是不可变的(immutable)，即⼀旦创建，它们的值就不能变了。要修改某个变量中的字符串值，必须先销毁原始的字符串，然后将包含新值的另⼀个字符串保存到该变量

## 一、知识点
* 模版字面量: 会保持反引号内部的空格
```js
let templateStr = `
first line
second line`
console.log(templateStr[0] === '\n') // true
```

* 字符串插值: 所有插⼊的值都会使⽤`toString()`强制转型为字符串
```js
const val = 5
const exponent = 'second'
console.log(`${val} to thr ${exponent} power is ${val * val}`) // 5 to the second power is 25
```

* 模板字⾯量标签函数: 通过标签函数可以⾃定义插值⾏为
```js
const a = 1, b = 2;
function simpleTag(...args) {
  console.log("🚀 ~ args", args) // [ [ '', ' + ', ' = ', '' ], 1, 2, 3 ]
  return 'huamuo'
}
let taggedRsult = simpleTag`${a} + ${b} = ${a + b}`; // 'huamuo'
```

* 原始字符串: 获取原始的模板字⾯量内容，⽽不是被转换后的字符
```js
console.log(`\u00A9`) // © ->非原始
console.log(String.raw`\u00A9`) // \u00A9 ->原始
```

## 二、leetcode 最常见相关题型

### 1、[最⻓公共前缀](https://leetcode-cn.com/problems/longest-common-prefix/submissions/)
编写一个函数来查找字符串数组中的最长公共前缀。如果不存在公共前缀，返回空字符串 ""
```md
输入：strs = ["flower","flow","flight"]
输出："fl"
```
思路：
* 上一个公共前缀的每一个字符与当前元素的每一个字符进行匹配，不同则跳出循环

```js
var longestCommonPrefix = function(strs) {
    let same = strs[0]
    strs.map(str=>{
        for(let i = 0;i<same.length;i++){
            if(same[i] !== str[i]) {
                same = same.substr(0,i)
                break
            }
        }
    })
    return same;
};
```

### 2、[实现str()](https://leetcode-cn.com/problems/implement-strstr/)
给你两个字符串 haystack 和 needle ，请你在 haystack 字符串中找出 needle 字符串出现的第一个位置（下标从 0 开始）。如果不存在，则返回  -1
>当 needle 是空字符串时我们应当返回 0 。这与 C 语言的 strstr() 以及 Java 的 indexOf() 定义相符
```md
输入：haystack = "hello", needle = "ll"
输出：2
```
思路：
* 遍历字符串看是否有和需要找的字符串第一个字母相同
* 如果相同，就截取字符串跟需要找的字符串相同长度的字符串对比
* 相同就返回下标，不同就继续遍历原字符串

```js
var strStr = function (haystack, needle) {
  if (!needle) return 0;
  for (let i = 0; i < haystack.length; i++) {
    if (haystack[i] === needle[0] && haystack.substr(i, needle.length) === needle) return i
  }
  return -1
};
```

### 3、[回⽂字符串](https://leetcode-cn.com/problems/valid-palindrome/)
给定一个字符串，验证它是否是回文串，只考虑字母和数字字符，可以忽略字母的大小写
```md
输入: "A man, a plan, a canal: Panama"
输出: true  // "amanaplanacanalpanama" 是回文串
```
思路：
* 只考虑字母和数字字符，可以忽略字母的大小写，因此用正则匹配一下不是字母和数字的 : \W：匹配非 字母、数字、下划线。等价于 '[^A-Za-z0-9_]'
* 前后指针进行扫描，若有不一致的，则不是回文
```js
var isPalindrome = function (s) {
  const str = s.toLocaleLowerCase().replace(/[\W|_]/g, '')
  for (let i = 0; i < str.length >> 1; i++) {
    if (str[i] !== str[str.length - 1 - i]) return false
  }
  return true
};
```

### 4、[⽆重复字符的最⻓⼦串](https://leetcode-cn.com/problems/longest-substring-without-repeating-characters/)
给定一个字符串 s ，请你找出其中不含有重复字符的 最长子串 的长度
```md
输入: s = "abcabcbb"
输出: 3 // 因为无重复字符的最长子串是 "abc"，所以其长度为 3
```
思路：
* 定义一个 map 数据结构存储 (k, v)，其中 key 值为字符，value 值为字符位置 +1，加 1 表示从字符位置后一个才开始不重复
* 定义不重复子串的开始位置为 start，结束位置为 end
  * 随着 end 不断遍历向后，会遇到与 [start, end] 区间内字符相同的情况，此时将字符作为 key 值，获取 value 值，并更新 start，此时 [start, end] 区间内不存在重复字符
  * 无论是否更新 start，都会更新其 map 数据结构和结果 ans

```js
var lengthOfLongestSubstring = function (s) {
  const map = new Map()
  let ans = 0;
  for (let start = 0, end = 0; end < s.length; end++) {
    // 更新不重复子串的开始位置
    if (map.has(s[end])) {
      start = Math.max(map.get(s[end]) + 1, start)
    }
    // 结束位置 - 开始位置，则是不重复字串的长度
    ans = Math.max(ans, end - start + 1)
    // 更新、插入数据
    map.set(s[end], end)
  }
  return ans
}
```

### 5、[字符串相加](https://leetcode-cn.com/problems/add-strings/)
给定两个字符串形式的非负整数 num1 和num2 ，计算它们的和并同样以字符串形式返回。你不能使用任何內建的用于处理大整数的库（比如 BigInteger）， 也不能直接将输入的字符串转换为整数形式
```md
输入：num1 = "11", num2 = "123"
输出："134"
```
思路：
* 相加的问题注意几个点
  * 两数相加取其个数：`sum % 10`
  * 两数相加取其进制：`Math.floor(sum / 10)`
  * 强转数字`~~`

```js
var addStrings = function (num1, num2) {
  let carry = 0;
  const arr1 = num1.split(''), arr2 = num2.split('');
  const res = []
  while (arr1.length || arr2.length || carry) {
    const sum = ~~arr1.pop() + ~~arr2.pop() + carry
    res.push(sum % 10)
    carry = Math.floor(sum / 10)
  }
  return res.reverse().join('')
};
```

### 6、[字符串相乘](https://leetcode-cn.com/problems/multiply-strings/)
给定两个以字符串形式表示的非负整数 num1 和 num2，返回 num1 和 num2 的乘积，它们的乘积也表示为字符串形式
```md
输入: num1 = "23", num2 = "456"
输出: "10488"
```
![](https://oscimg.oschina.net/oscnet/up-4cd012331523ba491b433de6969d56ee904.png)
思路：
* 两个数M和N相乘的结果可以由 M 乘上 N 的每⼀位数的和得到

```js
var multiply = function (num1, num2) {
  if (num1 === '0' || num2 === '0') return "0"
  const arr1 = num1.split('')
  const arr2 = num2.split('')
  const res = [];
  for (let i = arr1.length - 1; i >= 0; i--) {
    for (let j = arr2.length - 1; j >= 0; j--) {
      // 判断结果集索引位置是否有值
      let pos = res[i + j + 1] ? res[i + j + 1] + arr1[i] * arr2[j] : arr1[i] * arr2[j]
      // 赋值给当前索引位置
      res[i + j + 1] = pos % 10
      // 是否进位 这样简化res去除不必要的"0"
      pos >= 10 && (res[i + j] = res[i + j] ? res[i + j] + Math.floor(pos / 10) : Math.floor(pos / 10));
    }
  }
  return res.join("");
}
```


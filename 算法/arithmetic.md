算法这块前端的份额不多，特别是js解析的，因此自己整理了一下，和卷友们分享一下自己刷过的题，有更好的解决方案留言给我丫

## 一、哈希表 + 计数类型  

看到计数字眼：`唯一`、`第一个`、`出现的次数`，Map走起！！！

### 1、[存在重复元素](https://leetcode-cn.com/problems/contains-duplicate/)
```
问题简介：
给定一个整数数组，判断是否存在重复元素
```
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
```
问题简介：
给定一个字符串，找到它的第一个不重复的字符，并返回它的索引。如果不存在，则返回 -1

示例：
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
```
问题简介：
若 s 和 t 中每个字符出现的次数都相同，则称 s 和 t 互为字母异位词
示例 1:
  输入: s = "anagram", t = "nagaram"
  输出: true

示例 2:
  输入: s = "rat", t = "car"
  输出: false

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
```
问题简介：
给定一个大小为 n 的数组，找到其中的多数元素。多数元素是指在数组中出现次数 大于 ⌊ n/2 ⌋ 的元素

假设数组是非空的，并且给定的数组总是存在多数元素

示例 1:
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
```
问题简介：
给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

看到这，我们已经条件反射了，map走起，但朋友，不急，再看看题目限制🔽

你的算法应该具有线性时间复杂度。 你可以不使用额外空间来实现吗？

示例 1:
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

## 二、哈希表 + 映射功能 

### 1、[两数之和](https://leetcode-cn.com/problems/two-sum/ "两数之和")
```
问题简介：
给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target  的那 两个 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案

示例 1:
  输入: nums = [2,7,11,15], target = 9
  输出: [0,1] // 因为 nums[0] + nums[1] == 9 ，返回 [0, 1]
```
思路：
* 用 hashMap 存储遍历过的元素和对应的索引
* 每遍历一个元素，看看 hashMap 中是否存在满足要求的目标数字
```js
var twoSum = function(nums, target) {
    let map = {}
    for(let i = 0; i < nums.length; i++) {
      if(map[target - nums[i]]) {
          return [map[target - nums[i]]-1,i]
      }else {
         map[nums[i]] = i+1
      }
    }
};
```
### 2、[两个数组的交集](https://leetcode-cn.com/problems/intersection-of-two-arrays/)
```
问题简介：
给定两个数组，编写一个函数来计算它们的交集

示例:
  输入: nums1 = [1,2,2,1], nums2 = [2,2]
  输出: [2]
```
思路：
* 方案一：可通过 new Set 去重，接着过滤得到交集
* 方案二：通过哈希表映射：
* 用一个map去存nums1数组里的每一项，类似map[nums1[i]] = true
* 然后去遍历nums2，如果在map中已经有的值，类似map[nums2[i]], 就把它push到一个数组里
* 并且将map[nums2[i]]设为false，后面有相同的值就不push到数组了
```js
// 简洁方案
var intersection = function(nums1, nums2) {
    return result =[...new Set(nums1)].filter(item=>new Set(nums2).has(item))
};
// 
```
## 三、找规律

### 1、[罗马数字转整数](https://leetcode-cn.com/problems/roman-to-integer/)
```
问题简介：
罗马数字包含以下七种字符: I， V， X， L，C，D 和 M。

字符          数值
I             1
V             5
X             10
L             50
C             100
D             500
M             1000

特殊的规则只适用于以下六种情况：
I 可以放在 V (5) 和 X (10) 的左边，来表示 4 和 9。
X 可以放在 L (50) 和 C (100) 的左边，来表示 40 和 90。 
C 可以放在 D (500) 和 M (1000) 的左边，来表示 400 和 900。

示例:
  输入: "LVIII"
  输出: 58  // L = 50, V= 5, III = 3.

  输入: "MCMXCIV"
  输出: 1994  // M = 1000, CM = 900, XC = 90, IV = 4
```
思路：
* 从题目我们可以本能的获取到一个映射表
```js
const map = {
    I: 1,
    V: 5,
    IV: 4,
    IX: 9,
    X: 10,
    XL: 40,
    XC: 90,
    L: 50,
    C: 100,
    CD: 400,
    CM: 900,
    D: 500,
    M: 1000,
}
```
* 由于key有可能一位，也可能两位，因此，我们需要创建一个cur_index记录当前的索引
* 两位优先原则，遍历s
```js
var romanToInt = function(s) {
    const len = s.length;
    let cur_index = 0;
    let sum = 0;
    while(len > cur_index) {
        if(map[s.slice(cur_index,cur_index+2)]) {
            sum += map[s.slice(cur_index,cur_index+2)];
            cur_index += 2
        } else {
            sum += map[s.slice(cur_index,cur_index+1)];
            cur_index += 1
        }
    }
    return sum
};
```
### 2、[最长公共前缀](https://leetcode-cn.com/problems/longest-common-prefix "最长公共前缀")
```
问题简介：
编写一个函数来查找字符串数组中的最长公共前缀，如果不存在公共前缀，返回空字符串 ""

示例:
  输入: strs = ["flower","flow","flight"]
  输出: "fl"
```
思路：
* 遍历除第一个元素外的数组
* 上一个公共前缀的每一个字符与当前元素的每一个字符进行匹配，不同则跳出循环
* 截取字符串长度 j 的字符即为最长公共前缀
```js
var longestCommonPrefix = function(strs) {
    let common = strs[0];
    for(let i = 1; i<strs.length;i++){
        let j = 0;
        for(;j<common.length && j< strs[i].length; j++){
            if(strs[i][j] !== common[j]){
                break
            }
        }
        common = common.substring(0, j)
    }
    return common;
};
```
### 3、[合并两个有序链表](https://leetcode-cn.com/problems/merge-two-sorted-lists "合并两个有序链表")
```
问题简介：
将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的
```
![](https://assets.leetcode.com/uploads/2020/10/03/merge_ex1.jpg)
```
示例:
  输入: l1 = [1,2,4], l2 = [1,3,4]
  输出: [1,1,2,3,4,4]
```
思路：
* 判断有序链表是否为空
* 判断哪个链表小，取哪个
```js
var mergeTwoLists = function(l1, l2) { 
    if (l1 === null) {
        return l2
    } else if (l2 === null) {
        return l1
    } else if (l1.val < l2.val) {
        l1.next = mergeTwoLists(l1.next, l2)
        return l1
    } else {
        l2.next = mergeTwoLists(l1, l2.next)
        return l2
    }
};

```

### 4、[实现str()](https://leetcode-cn.com/problems/implement-strstr/)
```
问题简介：
给你两个字符串 haystack 和 needle ，请你在 haystack 字符串中找出 needle 字符串出现的第一个位置（下标从 0 开始）。如果不存在，则返回  -1 

示例:
  输入: haystack = "aaa", needle = "aaaa"
  输出: -1
  输入: haystack = "", needle = ""
  输出: 0
```
思路：
* 遍历字符串看是否有和需要找的字符串第一个字母相同
* 如果相同，就截取字符串跟需要找的字符串相同长度的字符串对比
* 相同就返回下标，不同就继续遍历原字符串
```js
var strStr = function(haystack, needle) {
    if(!needle) return 0;

    let ret = -1;
    for(let i = 0; i < haystack.length; i++) {
        if(haystack[i] === needle[0] && haystack.substring(i,i+needle.length)=== needle){
            ret = i;
            break;
        }
    }
    return ret
};
```
### 5、[杨辉三角](https://leetcode-cn.com/problems/pascals-triangle/)
```
问题简介：
给定一个非负整数 numRows，生成「杨辉三角」的前 numRows 行。
在「杨辉三角」中，每个数是它左上方和右上方的数的和
```
![](https://oscimg.oschina.net/oscnet/up-109eea1abbc46d9021eee3377150c849b11.gif)
```
示例:
  输入: numRows = 5
  输出: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
```
思路：
* 生成杨辉三角numRows行，数组就有numRows行
* 每一行，它的数组第一个位置和最后一个位置都是1
* 每一行，除了第一个和最后一个位置，其它位置的值等于上一行的两个值相加
```js
var generate = function(numRows) {
    let result = Array.from(new Array(numRows),()=>[])
    for(let i = 0; i < numRows; i++) {
        result[i][0] = 1;
        result[i][i] = 1;
        for(let j = 1;j < i; j++){
            result[i][j] = result[i-1][j-1]+result[i-1][j]
        }
    }
    return result
};
```

### 6、[反转链表](https://leetcode-cn.com/problems/reverse-linked-list/ "反转链表")
```
问题简介：
给你单链表的头节点 head ，请你反转链表，并返回反转后的链表
```
![](https://assets.leetcode.com/uploads/2021/02/19/rev1ex1.jpg)
```
示例:
  输入: head = [1,2,3,4,5]
  输出: [5,4,3,2,1]
```
思路：
*  给个中间商，并声明当前执行的链表
* 通过指针的偏移，维持prev的倒序链表
  * 记录下一个节点
  * 将当前的下一个节点设置为上一个节点
  *  将当前节点赋值给 prev
  * 向后走一个节点
```js
var reverseList = function(head) {
    let prev = null;
    let cur = head;
    while(cur){
        let next = cur.next
        cur.next = prev
        prev = cur
        cur = next
    }
    return prev
};
```
## 四、双指针
### 1、[删除数组中的重复项](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array/ "删除数组中的重复项")
```
问题简介：
给你一个有序数组 nums ，请你 原地 删除重复出现的元素，使每个元素 只出现一次 ，返回删除后数组的新长度。

不要使用额外的数组空间，你必须在 原地 修改输入数组 并在使用 O(1) 额外空间的条件下完成

示例:
  输入: nums = [1,1,2]
  输出: 2, nums = [1,2] // 函数应该返回新的长度 2 ，并且原数组 nums 的前两个元素被修改为 1, 2 。不需要考虑数组中超出新长度后面的元素。
```
思路：
* 声明慢指针cur，快指针prev
* 若快指针的值等于慢指针，则两个元素是相同的，快指针继续走，慢指针不动
* 若快指针的值不等于慢指针，则两个元素是不相同的，慢指针将快指针的值设置为下一个值，并快慢指针继续走
* 即保证慢指针和它前面的值都是不重复的，快指针就是一个遍历器
```js
var removeDuplicates = function(nums) {
    let cur = 0
    for(let prev = 1; prev<nums.length; prev++) {
        if(nums[cur] !== nums[prev]) {
            nums[cur+1] = nums[prev]
            cur++;
        }
    }
    return cur + 1
};

```
### 2、[合并两个有序数组](https://leetcode-cn.com/problems/merge-sorted-array/ "合并两个有序数组")
```
问题简介：
给你两个按 非递减顺序 排列的整数数组 nums1 和 nums2，另有两个整数 m 和 n ，分别表示 nums1 和 nums2 中的元素数目。
请你 合并 nums2 到 nums1 中，使合并后的数组同样按 非递减顺序 排列

注意：最终，合并后数组不应由函数返回，而是存储在数组 nums1 中。为了应对这种情况，nums1 的初始长度为 m + n，其中前 m 个元素表示应合并的元素，后 n 个元素为 0 ，应忽略。nums2 的长度为 n

示例:
  输入: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
  输出: [1,2,2,3,5,6] // 需要合并 [1,2,3] 和 [2,5,6]  合并结果是 [1,2,2,3,5,6]
```
思路：
* 前提条件：有序数组、第一个数组正好满足第二数组的空间
* 所以这里可以采取双指针来解答，从后往前遍历
```js
var merge = function(nums1, m, nums2, n) {
    let len = m+n;
    while(len) {
        if(nums1[m-1]>nums2[n-1] || n < 1){
            nums1[len-1] = nums1[m-1];
            m--;
        }else {
            nums1[len-1] = nums2[n-1];
            n--;
        }
        len--;
    }
    return nums1;
};
```
### 3、[验证回文串](https://leetcode-cn.com/problems/valid-palindrome/ "验证回文串")
```
问题简介：
给定一个字符串，验证它是否是回文串，只考虑字母和数字字符，可以忽略字母的大小写。

说明：本题中，我们将空字符串定义为有效的回文串。

示例:
  输入: "A man, a plan, a canal: Panama"
  输出: true // "amanaplana c analpanama" 是回文串
```
思路：
* 题目强调了：只考虑字母和数字字符，可以忽略字母的大小写，因此用正则匹配一下不是字母和数字的 : \W：匹配非 字母、数字、下划线。等价于 '[^A-Za-z0-9_]'
* 前后双指针遍历
```js
var isPalindrome = function(s) {
    s = s.replace(/\W|_/g, '').toLowerCase();
    let prev = 0;
    let last = s.length - 1;
    while(last > prev) {
        if(s[prev] === s[last]){
            prev++;
            last--;
        }else {
            return false;
        }
    }
    return true;
};
```
### 4、[回文链表](https://leetcode-cn.com/problems/palindrome-linked-list/ "回文链表")
```
问题简介：
给你一个单链表的头节点 head ，请你判断该链表是否为回文链表。如果是，返回 true ；否则，返回 false 
```
![](https://assets.leetcode.com/uploads/2021/03/03/pal1linked-list.jpg)
```
示例:
  输入: head = [1,2,2,1]
  输出: true
```
思路：
* 将链表丢进数据
* 设置前后双指针，前后指针理应相同，如果不同，不是回文
* 循环结束也没有返回false，说明是回文
```js
var isPalindrome = function(head) {
    // 将链表丢进数据
    const vals = []
    while (head) {
        vals.push(head.val)
        head = head.next
    }
    // 设置前后双指针
    let start = 0,
        end = vals.length - 1 
    while (start < end) {
        // 前后指针理应相同，如果不同，不是回文
        if (vals[start] != vals[end]) {
            return false
        }
        // 双指针移动
        start++
        end-- 
    }
    // 循环结束也没有返回false，说明是回文
    return true 
};
```
### 5、[删除链表中的节点](https://leetcode-cn.com/problems/delete-node-in-a-linked-list/ "删除链表中的节点")
```
问题简介：
请编写一个函数，使其可以删除某个链表中给定的（非末尾）节点。传入函数的唯一参数为 要被删除的节点 。
现有一个链表 -- head = [4,5,1,9]，它可以表示为:
```
![](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2019/01/19/237_example.png)
```
示例:
  输入: head = [4,5,1,9], node = 5
  输出: [4,1,9]
```
思路：
* 若首节点匹配上，则直接返回next
* 前后双指针遍历
```js
var deleteNode = function(head, val) {
    if(head.val == val) return head.next;
    let pre = head, cur = head.next;
    while (cur) {
      if (cur.val == val) {
        pre.next = cur.next;
        return head;
      }
      pre = cur;
      cur = cur.next;
    }
    return head;
};
```
### 6、[移动零](https://leetcode-cn.com/problems/move-zeroes/ "移动零")
```
问题简介：
给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序
```
![](https://oscimg.oschina.net/oscnet/up-b3aaaab187f3a85a59c6a490f26c1bd6dee.gif)
```
示例:
  输入: [0,1,0,3,12]
  输出: [1,3,12,0,0]
```
思路：
* 设置前后双指针
* 前指针遇到不为0时，前后指针交换值
```js
var moveZeroes = function(nums) {
    let prev = cur = 0;
    while(prev < nums.length) {
        if(nums[prev] !== 0) {
            [nums[cur],nums[prev]] = [nums[prev],nums[cur]]
            cur++;
        }
        prev++
    }
    return nums
};
```
### 7、两个数组的交集II
```
问题简介：
给定两个无序数组，编写一个函数来计算它们的交集

示例:
  输入: nums1 = [1,2,2,1], nums2 = [2,2]
  输出: [2,2]
```
思路：
* 方案1：找最小的数组进行遍历，在这里寻找大数组与之相同的值，若有，则删除它并将其存进返回的数组中
```
var intersect = function (nums1, nums2) {
  let result = []
  let [minArr,maxArr] = nums1.length > nums2.length ? [nums2,nums1] : [nums1,nums2];
  for (let i = 0; i < minArr.length; i++) {
    let maxIndex = maxArr.indexOf(minArr[i])
    if (maxIndex != -1) {
      result.push(maxArr.splice(maxIndex, 1)[0])
    }
  }
  return result
};
```
* 方案2：数组排序后，前后指针遍历
```js
var intersect = function (nums1, nums2) {
  const sort1 = nums1.sort((a,b)=>a-b);
  const sort2 = nums2.sort((a,b)=>a-b);
  let prev1 = prev2 = 0;
  let result = []
  while(prev1 < sort1.length && prev2 < sort2.length) {
      if(sort1[prev1] === sort2[prev2]) {
          result.push(sort1[prev1])
          prev1++
          prev2++
      } else if(sort1[prev1] < sort2[prev2]) {
          prev1++
      } else {
          prev2++
      }
  }
  return result;
};
```


## 五、二叉树（DFS）

### 1、前序遍历 - 深度优先遍历，先遍历左子树，再遍历右子树
![](https://oscimg.oschina.net/oscnet/up-5c455299221a4ca0ab6e202662fcb1bfc20.png)

思路：
* 声明两个数组，一个存储结果，一个作为临时压栈存储
* 先遍历左子树，再遍历右子树

```js
var Traversal = function(root) {
    const res = [];
    const stack = [];
    while(root || stack.length) {
        while(root){
            // 收集入栈元素
            res.push(root.val)
            stack.push(root)
            root = root.left
        }
        root = stack.pop()
        root = root.right
    }
    return res;
}
```
结合上图，分析一下代码遍历产生的压栈顺序：
* A、B、D 入栈
* D、B 出栈
* E 入栈
* E、A 出栈
* C 入栈
* C 出栈
* F 入栈
* F 出栈

入栈的元素按顺序排列：A、B、D、E、C、F
出栈的元素按顺序排列：D、B、E、A、C、F

入栈的元素按顺序排列，就是前序遍历的顺序
出栈的元素按顺序排列，就是中序遍历的顺序

### 2、中序遍历 - 收集出栈的元素

![](https://oscimg.oschina.net/oscnet/up-13d5d08639cc2dea894eade9b615a54ca20.png)

```js
var Traversal = function(root) {
    const res = [];
    const stack = [];
    while(root || stack.length) {
        while(root){
            stack.push(root)
            root = root.left
        }
        root = stack.pop()
        // 收集出栈元素
        res.push(root.val)
        root = root.right
    }
    return res;
}
```

### 3、后序遍历 - 先遍历右子树，再遍历左子树

![](https://oscimg.oschina.net/oscnet/up-d256893bc5938d802cd9247d00a32560245.png)

```js
var Traversal = function(root) {
    const res = [];
    const stack = [];
    while(root || stack.length) {
        while(root){
            stack.push(root)
            // 反序收集入栈元素
            res.unshift(root.val)
            root = root.right
        }
        root = stack.pop()
        root = root.left
    }
    return res;
}
```
同样结合上图，分析一下代码遍历产生的压栈顺序：
* A、C、F 入栈
* F、C、A 出栈
* B、E 入栈
* E、B 出栈
* D 入栈
* D 出栈

入栈的元素按顺序排列：A、C、F、B、E、D
出栈的元素按顺序排列：F、C、A、E、B、D

入栈的元素按反顺序排列：D、E、B、F、C、A ，就是后序遍历的顺序

### 4、[对称二叉树](https://leetcode-cn.com/problems/symmetric-tree/ "对称二叉树")
```
问题简介：
    1                                1
   / \                              / \
  2   2                            2   2
 / \ / \                            \   \
3  4 4  3                            3   3
二叉树 [1,2,2,3,4,4,3] 是对称的     二叉树 [1,2,2,null,3,null,3] 则不是镜像对称的
```
思路：
* 前置判断 NULL
* 两个指针当前节点是否相等
*  A 的左子树与 B 的右子树是否对称
*  B 的左子树与 A 的右子树是否对称

```js
function isSame(leftNode, rightNode){
    // 若左右节点都为null，对称，若只有一个节点为null，不对称
    if(!leftNode && !rightNode) return true;
    if(!leftNode || !rightNode) return false;
    // 两个指针当前节点是否相等 && A 的左子树与 B 的右子树是否对称 && B 的左子树与 A 的右子树是否对称
    return (leftNode.val === rightNode.val) && isSame(leftNode.left, rightNode.right) && isSame(leftNode.right, rightNode.left)
}
var isSymmetric = function(root) {
    // 如果传入的root就是null，对称
    if(!root) return true;
    return isSame(root.left, root.right);
};
```

### 5、[二叉树的最大深度](https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/)
```
问题简介：
二叉树的深度为根节点到最远叶子节点的最长路径上的节点数
    3
   / \
  9  20
    /  \
   15   7
它的最大深度 3 
```

思路：
* 声明最大记录深度变量，默认为1(root)
* 若节点无左右子树(到底了)，比较当前深度与记录深度哪个大，取大

```js
var maxDepth = function(root) {
    if(!root) return 0
    let ret = 1;
    function compareDepth(root,depth){
        if(!root.left && !root.right) ret = Math.max(ret,depth)
        if(root.left) compareDepth(root.left,depth+1)
        if(root.right) compareDepth(root.right,depth+1)
    }
    compareDepth(root,ret);
    return ret;
}
```

### 6、[将有序数组转化为二叉搜索树](https://leetcode-cn.com/problems/convert-sorted-array-to-binary-search-tree/)
```
问题简介：
输入一组升序的nums数组，请你将其转换为一棵 高度平衡 二叉搜索树，即满足每个节点的左右两个子树的高度差的绝对值不超过1的二叉树。

输入：nums = [-10,-3,0,5,9]
     0                                0
    / \                              / \
  -3   9                           -10   5
  /   /                               \   \
-10  5                                -3   9
输出：[0,-3,9,-10,null,5] || [0,-10,5,null,-3,null,9]
```
思路：
* 构建一颗树包括：构建root、构建 root.left 和 root.right
* 题目要求"高度平衡"，则构建 root 时候，选择数组的中间元素作为 root 节点值，即可保持平衡
* 递归函数可以传递数组，也可以传递指针，选择传递指针的时候：l r 分别代表参与构建BST的数组的首尾索引
```js
const toBST = function(nums, l, r){
    if( l > r) return null;
    const mid = l + r >> 1;
    const root = new TreeNode(nums[mid]);
    root.left = toBST(nums, l, mid - 1);
    root.right = toBST(nums, mid + 1, r);
    return root;
}
var sortedArrayToBST = function(nums) {
    return toBST(nums,0,nums.length - 1)
};
```


### 7、[二叉树的直径](https://leetcode-cn.com/problems/diameter-of-binary-tree "二叉树的直径")

```
问题简介：
一棵二叉树的直径长度是任意两个结点路径长度中的最大值，长度是以它们之间边的数目表示

          1
         / \
        2   3
       / \     
      4   5    

返回 3, 它的长度是路径 [4,2,1,3] 或者 [5,2,1,3]
```
思路：
* 获取左右子树的深度
* 左子树深度(节点个数) + 右子树深度（节点个数） + 1个根节点 便是这株二叉树从最左侧叶子节点到最右侧叶子节点的最长路径
* 已知根节点的左右子树的深度，则左右子树深度的最大值 + 1，便是以根节点为树的最大深度
```js

var diameterOfBinaryTree = function(root) {
    // 默认为1是因为默认了根节点自身的路径长度
    let ans = 1
    function depth(rootNode) {
        if (!rootNode) return 0;
        // 递归，获取左子树的深度
        let left = depth(rootNode.left) // rootNode 依次为[2,4,5]、[4]
        // 递归，获取右子树的深度
        let right = depth(rootNode.right) // rootNode 依次为[3]、[5]
        // 二叉树从最左侧叶子节点到最右侧叶子节点的最长路径
        ans = Math.max(ans, left + right + 1)
        // 以根节点为树的最大深度
        return Math.max(left, right) + 1 // [0,0] [0,0],[1,1],[0,0],[2,1]
    }
    depth(root)
    // 由于depth函数中已经默认加上数节点的自身根节点路径了，故此处需减1
    return ans - 1
};
```
结合题目的二叉树，分析一下代码遍历产生的深度以及路径
```
rootNode 依次 root[1,2,3,4,5] left[2,4,5] right[3] left[4] right[5]
```
递归执行过程，类似于函数调用栈，先压栈，再出栈
|     | 左🌲深度  | 右🌲深度  | 最大深度  | 最长路径 + 1  |
|  ----  | ----  | ----  | ----  | ----  |
| `left[4]`   | 0 | 0 | 0 | 1 |
| `right[5]` | 0 | 0 | 0 | 1 |
| `left[2,4,5]`  | 1 | 1 | 2 | 3 |
| `right[3]`  | 0 | 0 | 0 | 3 |
| `root[1,2,3,4,5]`  | 2 | 1 | 3 | 4 |


### 8、[合并二叉树](https://leetcode-cn.com/problems/merge-two-binary-trees/ "合并二叉树")
```
问题简介：
将两株二叉树合并为一株新的二叉树。合并的规则是
1、合并必须从两个树的根节点开始
2、若两个节点重叠，将他们的值相加作为节点合并后的新值，否则不为 NULL 的节点将直接作为新二叉树的节点
输入: 
	Tree 1                     Tree 2                  
          1                         2                             
         / \                       / \                            
        3   2                     1   3                        
       /                           \   \                      
      5                             4   7                  
输出: 
合并后的树:
	     3
	    / \
	   4   5
	  / \   \ 
	 5   4   7
```
思路：
* 前置判断，若只有一株，直接返回
* 遍历合并每个节点

```js
var mergeTrees = function(root1, root2) {
    // 若只存在一个链表，则直接返回
    if (root1 == null && root2) {
        return root2
    } else if (root2 == null && root1) {
        return root1
    } 
    // 若两个链表都存在，则遍历合并
    else if (root1 && root2) {
        root1.val = root1.val + root2.val
        //递归合并每一个节点
        root1.left = mergeTrees(root1.left, root2.left)
        root1.right = mergeTrees(root1.right, root2.right)
    }
    return root1
};
```
### 9、[路径总和](https://leetcode-cn.com/problems/path-sum "路径总和")
```
问题简介：
给你二叉树的根节点 root 和一个表示目标和的整数 targetSum ，判断该树中是否存在 根节点到叶子节点 的路径，这条路径上所有节点值相加等于目标和 targetSum 。
```
![](https://assets.leetcode.com/uploads/2021/01/18/pathsum1.jpg)
```
示例:
  输入: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22
  输出: true // 5+4+11+2 = 22
```
思路：
* 根节点为null，返回false
* 根结点=目标和，返回true
* 拆分成两个子树，目标值减去当前节点值
```js
var hasPathSum = function(root, targetSum) {
    // 根节点为null，返回false
    if(root == null) {
        return false
    }
    // 根结点=目标和，返回true
    if(root.left == null && root.right == null){
        return (root.val - targetSum === 0)
    }
    // 拆分成两个子树，目标值减去当前节点值
    return (
        hasPathSum(root.left, targetSum - root.val) ||
        hasPathSum(root.right, targetSum - root.val)
    )
};
```

## 六、栈
先进后出的数据结构
### 1、[有效的括号](https://leetcode-cn.com/problems/valid-parentheses "有效的括号")
```
问题简介：
给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效

有效字符串需满足：
    左括号必须用相同类型的右括号闭合
    左括号必须以正确的顺序闭合

示例：
    输入：s = "([)]"
    输出：false
    输入：s = "()[]{}"
    输出：true
```
思路：
* 有效括号字符串的长度，一定是偶数
* 右括号必定有对应的左括号才能抵消
* 把左括号放进栈中，发现右括号比对栈顶元素是否相匹配，不匹配则返回false
```js
var isValid = function(s) {
    if(!s || s.length % 2) return false;
    const map = { '{': '}', '(': ')', '[': ']' };
    const stack = [];
    // for in是遍历（object）键名，for of是遍历（array）键值
    for(let i of s) {
        if(map[i]) {
            stack.push(map[i])
        } else {
            let pop = stack.pop()
            if(pop !== i) return false;
        }
    }
    return stack.length === 0;
};
```
### 2、[最小栈](https://leetcode-cn.com/problems/min-stack/)
```
问题简介：
设计一个支持 push ，pop ，top 操作，并能在常数时间内检索到最小元素的栈。

push(x) —— 将元素 x 推入栈中。
pop() —— 删除栈顶的元素。
top() —— 获取栈顶元素。
getMin() —— 检索栈中的最小元素

示例
    MinStack minStack = new MinStack();
    minStack.push(-2);
    minStack.push(0);
    minStack.push(-3);
    minStack.getMin();   --> 返回 -3.
    minStack.pop();
    minStack.top();      --> 返回 0.
    minStack.getMin();   --> 返回 -2

```
思路：
* 声明一个数组，进行 push ，pop 很好理解，top 则把栈顶，即数组最后一项元素返回
* 而每次都保证获取到栈中最小元素，需要一个辅助栈来记录

|   元素栈    |  辅助栈  |
|  :----:  | :----:  |
| ... | ... |
| -8 | -8 |
| 4 | -9 |
| -9 | -9 |

* 元素栈每 push 一个元素，都与辅助栈栈顶比对大小，若大了，则辅助栈 push 栈顶元素，否则，将新元素 push 进去
```ts
var MinStack = function() {
    this.stack = []
    this.min_stack = []
};

MinStack.prototype.push = function(val) {
    this.stack.push(val)
    // 设置无穷大作为初始比对值，保证末尾值都为当时最小的
    const min = this.min_stack[this.min_stack.length - 1]??Infinity
   this.min_stack.push(Math.min(val,min))
}

MinStack.prototype.pop = function() {
    this.stack.pop()
    this.min_stack.pop()
};

MinStack.prototype.top = function() {   
    return this.stack[this.stack.length -1]
};

MinStack.prototype.getMin = function() {
    return this.min_stack[this.min_stack.length -1]
};
```
## 七、动态规划
重点在于获取到动态转移方程

### 1、[最大子序和](https://leetcode-cn.com/problems/maximum-subarray/)
```
问题简介：
给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和

示例
    输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
    输出：6
    解释：连续子数组 [4,-1,2,1] 的和最大，为 6 
```
思路：
* 捋出动态转移方程：
* 声明 sum 表示包括下标i之前的最大连续子序和
* 若 sum 之前为负数，则不必再相加，直接返回sum= num[i]，因任何数值加上负数都比自身更小
* 若 sum 之前为正数，则加上num[i]，因此时相加的结果定比num[i]大
```js
var maxSubArray = function(nums) {
    if(nums.length <= 1) return nums;
    let max = nums[0]
    let sum = 0
    for (const num of nums) {       
        if (sum > 0) {
            sum += num
        } else {
            sum = num
        }
        max = Math.max(max, sum)
    }
    return max
};
```
### 2、[爬楼梯](https://leetcode-cn.com/problems/climbing-stairs "爬楼梯")

```
问题简介：
假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？

示例：
    输入： 2
    输出： 2  //  1 阶 + 1 阶 、2 阶
    输入： 3
    输出： 3  //  1 阶 + 1 阶 + 1 阶 、1 阶 + 2 阶、 2阶 + 1 阶
```
思路：
* 捋出动态转移方程：
* 假设 4 阶到楼顶，爬到 2 阶，再爬 2 个台阶就到了，或者再爬 1个台 阶，到达 3 阶，再爬 1 个台阶也能到，即 climb[4] = climb[3] + climb[2] 
* 延伸一下climb[n] = climb[n-1] + climb[n-2]
* 不难发现，只要有更高的台阶，之前的台阶的可能性会被反复计算，导致空间浪费，因此，可将计算好的可能性，存进数组
```js
var climbStairs = function(n) {
    // 数组下标映射n，0 阶 和 1 阶 的可能性均为 1
    let climb = [];
    climb[0] = 1;
    climb[1] = 1;
    for(let i = 2; i<= n; i++) {
        climb[i] = climb[i-1] + climb[i-2];
    }
    return climb[n]
};
```
## 八、数学问题
### 1、[加一](https://leetcode-cn.com/problems/plus-one/)
```
问题简介：
给定一个由 整数 组成的 非空 数组所表示的非负整数，在该数的基础上加一
    最高位数字存放在数组的首位， 数组中每个元素只存储单个数字
    你可以假设除了整数 0 之外，这个整数不会以零开头
    
    示例
    输入：digits = [1,2,3]
    输出：[1,2,4]  // 输入数组表示数字 123
    输入：digits = [1,2,9]
    输出：[1,3,0]  // 输出数组表示数字 130
```
思路：
* 声明一个进位 carry 变量，若需进位，则为1，否则为0
* 创建临时变量 sum 计算当前位数相加的值，若大于9，则 carry 设置为1，且取 sum 个位数
* 遍历完成后，需检查首位是否需要进位
```js
var plusOne = function(digits) {
    let carry  = 1;
    for(let i = digits.length - 1; i >= 0; i--) {
        const sum = digits[i] + carry;
        carry  = (sum / 10) | 0;  // ｜0 将整除后的结果转为二进制进行或运算
        digits[i] = sum % 10;
    }
    // 若首位需进位，则设置为1
    carry && digits.unshift(carry)
    return digits
};
```
### 2、[x的平方根](https://leetcode-cn.com/problems/sqrtx/)
```
问题简介：
计算并返回 x 的平方根，其中 x 是非负整数，结果只保留整数的部分

示例
    输入: 8
    输出: 2  //  8 的平方根是 2.82842...
```
思路：
* 二分法找一个平方与x相近的数
* 取整，因此取小
```js
var mySqrt = function(x) {
    let [l, r] = [0, x];
    while(l <= r) {
        let mid = (l + r) >> 1;
        if(mid*mid > x) {
            r = mid - 1
        } else if(mid*mid < x) {
            l = mid + 1
        } else {
            return mid
        }
    }
    return r
};
```
### 3、[Excel表序列号](https://leetcode-cn.com/problems/excel-sheet-column-number/)
```
问题简介：
给你一个字符串 columnTitle ，表示 Excel 表格中的列名称。返回该列名称对应的列序号

列名称对应的列序号：
    A -> 1
    B -> 2
    C -> 3
    ...
    Y -> 25
    Z -> 26
    AA -> 27
    AB -> 28 
    ...

示例
   输入: columnTitle = "ZY"
   输出: 701  // 26*26+25
   输入: columnTitle = "FXSHRXW"
   输出: 2147483647 // 
```
思路：
* A-Z 26个字母，相当于26进制，每26个数进一位
* 每遍历一位，则 carry = carry * 26 + num
* num 表示字母对应的序号，字母间隔为1，可通过 charCodeAt 获取，其中 A 表示 1，减一加一，可得对应字母的序号
```js
var titleToNumber = function(columnTitle) {
    let carry = 0
    for(let i = 0; i < columnTitle.length; i++) {
        carry = carry * 26 + (columnTitle[i].charCodeAt() - 'A'.charCodeAt() + 1)
        console.log(carry)
    }
    return carry
};
```
### 4、[阶乘后的零](https://leetcode-cn.com/problems/factorial-trailing-zeroes/)
```
问题简介：
给定一个整数 n，返回 n! 结果尾数中零的数量

示例
    输入: 3
    输出: 0  // 3! = 6, 尾数中没有零
    输入: 5
    输出: 1 // 5*4*3*2*1 = 120, 尾数中有 1 个零
```
思路：
* 找尾数中有零的最小粒度，即 5 * 2 = 10 、10 * 1 = 10，能达到这两个粒度的阶乘最小是 5!，接着是10!
* 找5的倍数，找5的指数
```js
var trailingZeroes = function(n) {
    let zeroes = 0;
    while(n >= 5) { // 5的指数
        n = (n / 5) | 0;  // 5的倍数
        zeroes += n;
    }
    return zeroes
}
```
### 5、颠倒二进制位
```
问题简介：
颠倒给定的 32 位无符号整数的二进制位

示例
    输入：n = 00000010100101000001111010011100
    输出：       00111001011110000010100101000000
```
思路：
* 二进制，位运算走起！
```
位运算前置知识：
1、在执行位运算之前，JavaScript 将数字转换为 32 位有符号整数，操作之后，将结果转换回 64 位 JavaScript 数
2、& 运算：只有1&1=1
3、<< 1、>>1 运算：左移乘2，右移除2
4、>>>0 ：有符号转化为无符号
```
* 循环32位，而不是32 位有符号整数，确保前进后退一致
* 每循环一次，n后退一步，result前进一步，并补充上末位值
```js
var reverseBits = function(n) {
    let result = 0
    for(let i = 0; i< 32; i++){
        result = (result << 1) + (n & 1)
        n = n >> 1
    }
    return result >>> 0
};
```
### 6、[位1的个数](https://leetcode-cn.com/problems/number-of-1-bits/)
```
问题简介：
编写一个函数，输入是一个无符号整数（以二进制串的形式），返回其二进制表达式中数字位数为 '1' 的个数（也被称为汉明重量）

示例
    输入：00000000000000000000000000001011
    输出：3
```
思路：
* 二进制，位运算走起！
* 换个思维思考这道题，假设让你去掉二进制位置最靠后的1?
* 是不是删除了多少个1，恰恰就有多少个1
```js
var hammingWeight = function(n) {
    let count = 0
    while(n) {
        n = n & (n - 1); //删除最后一个1
        count++
    }
    return count
};
```
### 7、[丢失的数字](https://leetcode-cn.com/problems/missing-number/)
```
问题简介：
给定一个包含 [0, n] 中 n 个数的数组 nums ，找出 [0, n] 这个范围内没有出现在数组中的那个数

示例
    输入：[0,1,3]
    输出：2
```
思路：
* 遇到这类题，先找出表达式，即[0, n]总和有什么规律，不难发现，其等于  (1 + nums.length) * nums.length / 2
* 循环遍历，依次减去当前元素，即可找到丢失的数字
```js
var missingNumber = function(nums) {
    let sum = (1 + nums.length) * nums.length / 2
    for(let i of nums) {
        sum -= i
    }
    return sum;
};
```
### 8、[整数反转](https://leetcode-cn.com/problems/reverse-integer/ "整数反转")
```
问题简介：
给你一个 32 位的有符号整数 x ，返回将 x 中的数字部分反转后的结果。
如果反转后整数超过 32 位的有符号整数的范围 [−231,  231 − 1] ，就返回 0。
假设环境不允许存储 64 位整数（有符号或无符号）

示例
    输入：x = -123
    输出：-321
```
思路：
* 涉及到数字的反转，且是十进制，即，目标值增十倍，传入值减十倍
```
123%10  3
12%10    32
1%10      321
```
* 整数的范围可通过Math.pow()处理
```js
var reverse = function(x) {
    let result = 0
    while(x) {
        result = result * 10 + x % 10;
        // 溢出判断
        if(result > Math.pow(2,31) || result < Math.pow(-2,31)) return 0;
        // 10的倍数
        x = x / 10 | 0; 
    }
    return result;
};
```
## 九、环
### 1、[环形链表](https://leetcode-cn.com/problems/linked-list-cycle/)
```
问题简介：
给定一个链表，判断链表中是否有环。
如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。如果链表中存在环，则返回 true 。 否则，返回 false 。

进阶：
你能用 O(1)（即，常量）内存解决此问题吗？
示例
```
![](https://oscimg.oschina.net/oscnet/up-c771d24bd4fc0c586cd9f5e02d337d60d34.png)
```
输入：head = [3,2,0,-4], pos = 1 // 为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。注意：pos 不作为参数进行传递，仅仅是为了标识链表的实际情况
输出：true  // 链表中有一个环，其尾部连接到第二个节点
```
思路：
* 采用标记法，给遍历过的节点打标记
* 若遍历过程中遇到有打标记的，则说明有环
```JS
var hasCycle = function(head) {
    let node = head
    while(node) {
        if(node.hasPos) return true;
        node.hasPos = true
        node = node.next;     
    }
    return false;
};
```
### 2、[相交链表](https://leetcode-cn.com/problems/intersection-of-two-linked-lists/ "相交链表")
```
问题简介：
给你两个单链表的头节点 headA 和 headB ，请你找出并返回两个单链表相交的起始节点。如果两个链表没有交点，返回 null 。
题目数据 保证 整个链式结构中不存在环。
注意，函数返回结果后，链表必须 保持其原始结构 
示例
```
![](https://oscimg.oschina.net/oscnet/up-390a136b3f7e286d273d544228272a7b225.png)
```
    输入：intersectVal = 8, listA = [4,1,8,4,5], listB = [5,0,1,8,4,5], skipA = 2, skipB = 3   // 从各自的表头开始算起，链表 A 为 [4,1,8,4,5]，链表 B 为 [5,0,1,8,4,5]。
在 A 中，相交节点前有 2 个节点；在 B 中，相交节点前有 3 个节点
    输出：Intersected at '8'  // 相交节点的值为 8 （注意，如果两个链表相交则不能为 0）
```
思路：
* 从交叉点后开始相同，即有两种情况
   * 链表长度相等，若没有交点，则遍历一次 hA、hB 都返回 null
   * 链表长度不相等，若没有交点，则遍历两次 hA、hB 都返回 null，因为第二次遍历时，链表总有相等的时刻
* 采用双指针方式，同步遍历 A、B 链表 hA 、 hB ，直到遍历完其中一个短链表（如上图，A为短链表，B为长链表）那么此时 A、B 两链表的长度差就为 hB 到链尾的长度（4->5），此时可以把 hA 指向长链表的表头 headB ，继续同步遍历，直到遍历完长链表
* 此时，headB 到 hA 的长度就为两链表的长度差，hA 到链表的长度与 headA 到链尾的长度一致
* 此时，可将 hB 指向 headA ，然后同步遍历 hB 及 hA ，直到有相交节点，返回相交节点，否则返回 null
```
                            A、B 两链表的长度差      把 hA 指向长链表的表头 headB    直到遍历完长链表，长度差一致
hA：4-1-8-4-5                                            -null-5                                             -0-1->8-4-5
hB：5-0-1-8-4-5                                                -null                                         -4-1->8-4-5
```
* 一旦链表不存在，则不可能有相交点
* 函数返回结果后，链表必须 保持其原始结构，即需复制新的链表
```JS
var getIntersectionNode = function(headA, headB) {
    if(!headA||!headB) return null;
    let hA = headA,
        hB = headB;
    while(hA !== hB){
        hA = hA === null? headB : hA.next;
        hB = hB === null? headA : hB.next;
    }
    return hA;
};
```
### 3、快乐数
```
问题简介：
编写一个算法来判断一个数 n 是不是快乐数，如果 n 是快乐数就返回 true ；不是，则返回 false 
「快乐数」定义为：
1、对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和。
2、然后重复这个过程直到这个数变为 1，也可能是 无限循环 但始终变不到 1。
3、如果 可以变为  1，那么这个数就是快乐数。

示例
    输入：19
    输出：true 
1^ + 9^ = 82
8^ + 2^ = 68
6^ + 8^ = 100
1^ + 0^ + 0^ = 1
```
思路：
* 一个数按照快乐数定义的方式分别每个数字平方，会有两种情况
    * 得到1，返回true
    * 无限循环，返回false，可通过哈希表来看是否循环
```JS
function getNext(n){
    let sum = 0;
    for(let num of String(n)){
        sum = sum + Math.pow(+num, 2);
    }
    return sum;
}
var isHappy = function(n) {
    // 哈希表来看是否循环
    const map = {};
    while( n !== 1 ){
        map[n] = true;
        n = getNext(n)
        if(map[n]) return false
    }
    return true
};
```

## 十、常见排序
### 1、插入排序  
![插入排序](https://oscimg.oschina.net/oscnet/7299dd6be28ddce13051804c19ec11bbca3.jpg "插入排序")

- 依次将每个记录插入到一个已排好序的有序表中去，从而得到一个新的、记录数增加1的有序表
- 时间复杂度：`O(n2) `
- 空间复杂度：`O(1)`  
- 稳定

```js
let inserSort = (arr) => {
    // 从第二个记录开始插入
    for (let i = 1; i<= arr.length; i++) {
        // 第i个记录复制为岗哨
        let target = arr[i]
        let j = i-1;
        while (target < arr[j]){
            arr[j+1]=arr[j]
            j--
        }
        arr[j+1] = target
    }
    return arr
}
```

>记录target有两个作用：  
1、进入查询循环之前，它保存了arr[i]的值，使得不至于因记录的后移而丢失arr[i]中的内容  
2、起岗哨作用，在while循环中“监视”数组下标变量j是否越界，一旦越界，target自动控制while循环的结束，从而避免了在while循环中每一次都要检测j是否越界，使得测试循环条件的时间大约减少一半


---
## 二、交换排序 
比较两个记录键值的大小，如果这两个记录键值大小出现逆序，则交换这两个记录


### 1、冒泡排序 
- 在起泡过程中，键值较小的记录向上漂浮，键值较大的记录向下沉，因为每趟都有一个最大键值的记录沉到水底，所以整个排序过程至少需要n-1趟起泡
- 时间复杂度：`O(n2)` 
- 空间复杂度：`O(1)`  
- 稳定

```
let bubbleSort = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        // 定义一个整型变量endsort，在每次排序之前，先将它置为0，若在一趟起泡中交换了记录，则将它置为1.当一次循环结束时，再检查endsort，若为0便终止算法
        let endsort = 0
        for(let j = 0; j < arr.length-i; j++) {
            // 逆序则交换记录
            if (arr[j] > arr[j+1]){
                let temp = arr[j]
                arr[j] = arr[j+1]
                arr[j+1] = temp
                endsort = 1
            }
        }
        if (endsort === 0) break
    }
}
```


### 2、快速排序
- 选择一个目标值，比目标值小的放左边，比目标值大的放右边，目标值的位置已排好，将左右两侧再进行快排，以达到整个序列有序 
- 时间复杂度：平均`O(nlogn)` 、最坏 `O(n2)`
- 空间复杂度：`O(logn)`  （递归调用消耗）
- 不稳定

![快速排序](https://oscimg.oschina.net/oscnet/36a977276946c782fb9451b7cd3094b2ee4.jpg "快速排序")

```
// 右找小，左找大
let quickSort = (arr,low,high) => {
    if quickSorthigh - low) < 1) return
    // 设置初始值
    let init = arr[low]
    while(low < high) {
        // 自尾端进行比较，将比init键值小的记录移到低端
        while((low<high) && (arr[high] >= init)) high--
        arr[low] = arr[high]

        // 自首端进行比较，将比init键值大的记录移到高端
        while((low<high) && (arr[low] <= init)) low++
        arr[high] = arr[low]
    }
    // 一趟快速排序结束，将init移到其最终位置
    arr[low] = init
    quickSort(arr,low,low-1)
    quickSort(arr,low+1,high)
    return arr
}
```

-----

## 三、选择排序
每一次在`n-i+1`个记录中选取键值最小的记录作为有序序列的第i个记录

![选择排序](https://oscimg.oschina.net/oscnet/2aa2f1dfbef7e64b09dca1e0cda48ef44cf.jpg "选择排序")

### 1、直接选择排序
- 每次循环选取一个最小的数字放到前面的有序序列中
- 时间复杂度：`O(n2)`
- 空间复杂度：`O(1)`  
- 不稳定
```
let selectSort = (arr) => {
    for(let i = 0; i< arr.length; i++) {
        // 固定一个i，当j每一次循环结束后，只要将第i个记录和当前最小键值的记录进行交换，其他记录保持不动
        let min = i
        for (let j = i+1; j < arr.length; j++) {
            // 记录键值较小记录的下标
            if (arr[j] < arr[min]){
                min = j
            }
        }
        // 交换位置
        if (min !== i) {
            [arr[min],arr[i]] = [arr[i],arr[min]]
        }
    }
    return arr
}
```

### 2、堆排序
- 若有一个关键字序列`{k1,k2,...,kn}`满足`ki <= k2i && ki <= k2i+1`，其中`i=1,2...,n/2[向下取整]`,则称这个n个键值的序列`{k1,k2,...,kn}`为最小堆，因此，最小堆可以看成一棵以`k1`为根的完全二叉树，在这棵二叉树中，任一结点的值都不大于它的两个孩子的值。因此，如果`{k1,k2,...,kn}`序列是最小堆，则`k1`是堆中最小的元素，并且这种二叉树的任一子树就是一个最小堆

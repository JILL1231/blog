在Chrome V8中，JSArray 继承 JSObject，内部以 key-value 形式存储数据，因此JS数组可存放不同类型的值。它有两种存储方式：使用连续内存空间的快数组 和 以哈希表形式的慢数组。初始化空数组时使用快数组，数组长度达到最大时 JSArray 进行扩容，当数组中 hole 太多时会转变为慢数组，以节省内存空间，使得JS数组可以动态增长

## 一、常用数组方法封装
### 1、扁平化
```js
const flattenDeep = (array) => array.flat(Infinity)
```

### 2、去重
```js
const unique1 = (array) => Array.from(new Set(array))
const unique2 =  arr => [...new Set(arr)]
const unique3 = arr => {
  return arr.sort().reduce((pre, cur) => {
    if (!pre.length || pre[pre.length - 1] !== cur) {
      pre.push(cur)
    }
    return pre
  }, [])
}
const unique4 = arr => {
  return arr.filter((el, index, array) => array.indexOf(el) === index)
}
```
### 3、排序
ES 规范并没有指定 `Array.prototype.sort()` 具体的算法，在 V8 引擎中
* `7.0` 版本之前，数组⻓度⼩于10时，使⽤的是插⼊排序，否则⽤快速排序(最坏情况时间复杂度`O(n2)`)
* `7.0` 版本之后，采⽤了⼀种混合排序的算法：`TimSort`，在数据量⼩的⼦数组中使⽤插⼊排序，然后再使⽤归并排序将有序的⼦数组进⾏合并排序，时间复杂度为 `O(nlogn)`
```js
const sort = (array) => array.sort((a, b) => a-b)
```

### 4、函数组合
```js
const compose = (...fns) => (initValue) => fns.reduceRight((y, fn) =>fn(y), initValue)

// 组合后函数
const flatten_unique_sort = compose( sort, unique, flattenDeep)
// 测试
var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ]] ], 10]
console.log(flatten_unique_sort(arr)) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
```
### 5、交集
```js
const intersection = function (nums1, nums2) {
  return [...new Set(nums1.filter((el) => nums2.includes(el)))]
};
```
> Set 是不重复的值的集合(其认为NaN等于自身)，向 Set 加入值的时候，不会发生类型转换，其键名就是键值
## 二、常用数组方法实现
### 1. map实现

map方法是纯函数，且不改变数组长度

```js
Array.prototype.myMap = function(callbackfn, thisArg) {
  const newArr = []
  for (let i = 0; i < this.length; i++) {
    newArr.push(callbackfn.call(thisArg, this[i], i, this))
  }
  return newArr
}
console.log([1, 2, 3].myMap(i => i * i))
```

### 2. reduce实现

reduce方法是纯函数，多用于将数组转换为对象、数字字符串等其他类型

```js
Array.prototype.myReduce = function(callbackfn, initialValue = null) {
  for (let i = 0; i < this.length; i++) {
    initialValue = callbackfn(initialValue, this[i], i, this)
    // initialValue = callbackfn.call(thisArg, initialValue, this[i], i, this)
  }
  return initialValue
}
console.log([1, 2, 3].myReduce((pre, cur) => pre + cur))
```

### 3. filter实现

reduce方法是纯函数，会改变数组长度

```js
Array.prototype.myFilter = function(callbackfn, thisArg) {
  const newArr = []
  for (let i = 0; i < this.length; i++) {
    callbackfn.call(thisArg, this[i], i, this) && newArr.push(this[i])
  }
  return newArr
}
console.log([1, 2, 3].myFilter(i => i >= 2))
```

## 三、leetcode 最常见相关题型
### 1、[合并两个有序数组](https://leetcode-cn.com/problems/merge-sorted-array/ "合并两个有序数组")

给你两个按 非递减顺序 排列的整数数组 nums1 和 nums2，另有两个整数 m 和 n ，分别表示 nums1 和 nums2 中的元素数目。请你 合并 nums2 到 nums1 中，使合并后的数组同样按 非递减顺序 排列。最终，合并后数组不应由函数返回，而是存储在数组 nums1 中，nums1 的初始长度为 m + n

```js
示例:
  输入: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
  输出: [1,2,2,3,5,6] // 需要合并 [1,2,3] 和 [2,5,6]  合并结果是 [1,2,2,3,5,6]
```
思路：
* 前提条件：有序数组、第一个数组正好满足第二数组的空间
* 创建 `num1` 与 `num2` 长度变量 `len1`、`len2` 以及总长 `len`
* 依次将`len1`、`len2` 对应的元素进行比较，较大者填入 `num1` 的 `len`位置，同时对应长度`-1`
* 当`len2 < 0`，即需要合并的 `num2` 已全部写入 `num1`，循环结束
* 当`len2 > 0`，而 `len1 < 0`，则 `num1` 的元素整体大于 `num2`，且已经写入，此时仅需把 `num2` 尚未合并的元素依次填入即可

```js
const merge = (num1, m, num2, n) => {
  let len = m + n - 1;
  let len1 = m - 1;
  let len2 = n - 1;
  while (len2 > -1) {
    if (len1 < 0) {
      num1[len--] = num2[len2--];
      continue;
    }
    num1[len--] = num1[len1] > num2[len2] ? num1[len1--] : num2[len2--]
  }
  return num1;
}
```

### 2、[两数之和](https://leetcode-cn.com/problems/two-sum/ "两数之和")
给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target 的那两个整数，并返回它们的数组下标。你可以假设每种输入**只会对应一个**答案。但是，数组中**同一个元素**在答案里**不能重复**出现，可按任意顺序返回答案
```js
示例:
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
### 3、[三数之和](https://leetcode-cn.com/problems/3sum/)
给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a ，b ，c  ，使得 a + b + c = 0 ？请你找出所有满足条件且**不重复**的三元组
```js
示例:
  输入: nums = [-1, 0, 1, 2, -1, -4]
  输出: [
          [-1, 0, 1],
          [-1, -1, 2]
        ]
```
思路：
* 首先数组排序
* 遍历有序数组：以`nums[i]`为第一个数`first`，并以`nums[first+1]`、`nums[nums.length - 1]`为第二`left`、第三`right`的初始值
* `left`、`right` 以双指针的形式进行判断：三数之和是否为`0`, 若 `< 0` 则 `left++`；`>0` 则 `right--`；`=0`则收集结果并指针对应移位。继续判断下一个元组，直至 `right > left` 结束循环，此时以`nums[i]`作为第一个数满足条件的元组都已写入
* 重复2、3步骤，继续遍历`nums[i]`，直至 `i === nums.length - 2`
* 最后，由于是不可重复的，因此在获取第一个元素以及添加了符合条件的元组后，进行对应的去重

```js
const threeSum = function (nums) {
  // 判空
  if (!nums || nums.length < 3) return [];
  // 排序
  nums.sort((a, b) => a - b);
  const res = [];
  for (let first = 0; first < nums.length - 2; first++) {
    // 去重
    if (first > 0 && nums[first] === nums[first - 1]) continue;
    let left = first + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[left] + nums[right] + nums[first];
      if (!sum) {
        res.push([nums[left], nums[right], nums[first]]);
        // 去重
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else {
        sum < 0 ? left++ : right--;
      }
    }
  }
  return res;
}
```
### 4、[有效三⻆形的个数](https://leetcode-cn.com/problems/valid-triangle-number/)
给定⼀个包含⾮负整数的数组，你的任务是统计其中可以组成三⻆形三条边的三元组个数
```js
示例：
  输入: nums = [2,2,3,4]
  输出: 3 // [2,3,4] (使用第一个 2) [2,3,4] (使用第二个 2) [2,2,3]
```
思路：
* 有个前提知识：三角形的任意两边之和大于第三边，任意两边之差小于第三边，若三边长从小到大为`a b c`，当且仅当`a + b > c` 这三条边能组成三角形
* 首先数组排序
* 同三数之和的思路，固定最长一边，另外两边通过双指针进行判断

```js
const triangleNumber = function (nums) {
  if (!nums || nums.length < 3) return []
  let count = 0
  nums.sort((a, b) => a - b)
  for (let c = nums.length - 1; c > 1; c--) {
    // 定义[0,c)内两个指针
    let [a, b] = [0, c - 1];
    while (a < b) {
      if (nums[a] + nums[b] > nums[c]) {
        // 那么b不动，a右边的各个数+b+c肯定满足 a+b>c，则有 b - a 个可能
        count += b - a;
        b--;
      } else {
        a++;
      }
    }
  }
  return count
}
```

### 5、[两个数组的交集II](https://leetcode-cn.com/problems/intersection-of-two-arrays-ii/)
给你两个整数数组 nums1 和 nums2 ，请你以数组形式返回两数组的交集。返回结果中每个元素出现的次数，应与元素在两个数组中都出现的次数一致（如果出现次数不一致，则考虑取较小值）。可以不考虑输出结果的顺序
```js
示例:
  输入: nums1 = [1,2,2,1], nums2 = [2,2]
  输出: [2,2]
```
思路：
* 同样可以通过前后指针的思路去解决，不一样的是两个指针分别置于两个数组
* 将两个数组进行排序，通过比对大小进行指针下移，当大小一致则推入值
* 遍历边界：任意指针超出所在数组
```js
var intersect = function (nums1, nums2) {
  let slow = 0;
  let fast = 0;
  const res = [];
  nums1.sort((a, b) => a - b)
  nums2.sort((a, b) => a - b)
  while (slow < nums1.length && fast < nums2.length) {
    if (nums1[slow] === nums2[fast]) {
      res.push(nums1[slow])
      fast++;
      slow++;
    } else if (nums1[slow] > nums2[fast]) {
      fast++
    } else {
      slow++
    }
  }
  return res;
};
```



### 6、[删除数组中的重复项](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array/ "删除数组中的重复项")

给你一个有序数组 nums ，请你**原地**删除重复出现的元素，使每个元素只出现一次，返回删除后数组的新长度。不要使用额外的数组空间，你必须在 原地 修改输入数组并在使用`O(1) `额外空间的条件下完成
```js
示例:
  输入: nums = [1,1,2]
  输出: 2, nums = [1,2] // 函数应该返回新的长度 2 ，并且原数组 nums 的前两个元素被修改为 1, 2 。不需要考虑数组中超出新长度后面的元素。
```
思路：
* 原地删除，且不能使用额外的空间，则只能在当前数组进行遍历且操作，可使用快慢指针，快指针作为一个遍历器，慢指针收集信息
* 若快指针不等于慢指针，则两个元素不同，此时慢指针前进一步，并将快指针的值设置为慢指针下一个值，否则慢指针不动
```js
var removeDuplicates = function (nums) {
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[slow] !== nums[fast]) {
      slow++;
      nums[slow] = nums[fast]
    }
  }
  return slow + 1;
}
```
### 7、[删除有序数组中的重复项 II](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array-ii/)
给你一个有序数组 nums ，请你 原地 删除重复出现的元素，使每个元素 最多出现两次 ，返回删除后数组的新长度。不要使用额外的数组空间，你必须在 原地 修改输入数组 并在使用 O(1) 额外空间的条件下完成

```js
示例：
  输入：nums = [1,1,1,2,2,3]
  输出：5, nums = [1,1,2,2,3]
```
思路：
* 数组是有序的，且要求相同元素最多出现两次而非一，因此需比对上上个被保留的元素，即 `num[2] === num[0]` 必然存在 `num[2] === num[1]`
* 利用快慢指针，快指针作为遍历器，慢指针为满足条件的元素
```js
var removeDuplicates = function(nums) {
  const len = nums.length;
  if(len < 3) return len;
  let fast = 2, slow = 2;
  while(fast < len) {
    // 符合条件，慢指针前进
    if(nums[slow-2] !== nums[fast]) {
      nums[slow] = nums[fast]
      slow++;
    }
    fast++
  }
  return slow
};
```

### 8、[移动零](https://leetcode-cn.com/problems/move-zeroes/ "移动零")
给定一个数组`nums`，编写一个函数将所有 0 移动到数组的末尾，同时**保持非零元素的相对顺序**

```js
示例:
  输入: [0,1,0,3,12]
  输出: [1,3,12,0,0]
```
思路：
* 利用快慢指针，快指针扮演遍历器角色
* 当快指针的值非0时，与慢指针交换位置，同时慢指针向前走一步
```js
var moveZeroes = function (nums) {
  let slow = 0;
  let fast = 0;
  while (fast < nums.length) {
    if (!!nums[fast]) {
      // 互换位置
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]]
      slow++;
    }
    fast++;
  }
  return nums
}
```
### 9、[加一](https://leetcode-cn.com/problems/plus-one/)

给定一个由 整数 组成的 非空 数组所表示的非负整数，在该数的基础上加一，最高位数字存放在数组的首位，数组中每个元素只存储单个数字，你可以假设除了整数 0 之外，这个整数不会以零开头

```md  
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

### 10、[最大子序和](https://leetcode-cn.com/problems/maximum-subarray/)
给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和
```
示例
    输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
    输出：6  // 连续子数组 [4,-1,2,1] 的和最大，为 6 
```
思路：
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

### 11、[丢失的数字](https://leetcode-cn.com/problems/missing-number/)
给定一个包含 [0, n] 中 n 个数的数组 nums ，找出 [0, n] 这个范围内没有出现在数组中的那个数
```
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
### 12、[整数反转](https://leetcode-cn.com/problems/reverse-integer/ "整数反转")
给你一个 32 位的有符号整数 x ，返回将 x 中的数字部分反转后的结果。如果反转后整数超过 32 位的有符号整数的范围 [−231,  231 − 1] ，就返回 0。假设环境不允许存储 64 位整数（有符号或无符号）

```
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

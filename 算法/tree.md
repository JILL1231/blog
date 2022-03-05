## 二叉树小科普
⼆叉树是最多仅有两个子节点的树，根据节点的分布情况可分为：
* 平衡二叉树: 每个结点的左右子树的高度相差不能大于1
* 满二叉树: 除了最底层的叶节点，每个结点都有左右子树
* 完全二叉树: 深度(1～H-1)的结点数达到最大个数，深度H的结点都连续集中在最左边，比如堆
* 二叉搜索树：每个节点必须满足：节点值`>=`左子节点，`<=`右子节点，其中序遍历就是有序序列

### 1、二叉搜索树
`n`个元素的二叉搜索树，理想情况下，查找、插入的时间复杂度是`O(logn)`，但在一直递增或递减的场景下进行插入，会导致所有的元素出现在树的左节点上，此时类似于链表结构，时间复杂度趋向于`O(n)`，因此诞生了
* 平衡二叉搜索树(AVL)：要求严格的平衡性控制，不会出现平衡因子超过1的情况
* 红黑树：查找、插⼊、删除操作在最坏情况下的时间复杂度不超过 `O(logn)`，并且有较⾼的插⼊和删除效率

#### 1.1、红黑树
红黑树是一种自平衡的二叉搜索树，任何不平衡都会在三次旋转内解决。它不仅满足搜索树的特点，而且满足：
* 黑根黑叶：根节点必须是黑色的、叶子节点均是值为`null`的黑节点
* 红结黑子：节点可红可黑，若是红色的，则它的两个子节点都是黑色的
* 任径同黑：从任一节点到达它的每个叶子节点的所有路径，都有相同数目的黑色节点

从而保证红黑树从根节点到达每个叶子节点的最长路径不会超过最短路径的2倍
![](https://oscimg.oschina.net/oscnet/up-e0c8d42d7c52c916e00625d720b0bb17ba2.png)

### 2、二叉树存储
* 链式存储法：⼀棵⼆叉树可以由根节点通过左右指针连接起来形成⼀个树
```js
function binaryTree() {
  let node = function (val) {
    this.val = val
    this.left = null
    this.right = null
  }
  let root = null
}
```
* 数组存储法：完全二叉树的所有节点满足：下标`i(i>=1)`的节点，父节点为`i/2`、左节点`2i` 和 右节点`2i+1`


## 二、leetcode 最常见相关题型
### 1、二叉树遍历
二叉树的遍历分为前序、中序及后序，其实，就是根放哪了，接着先左后右。解题思路有递归和迭代两种，递归的方式隐含地使用了系统的栈，因此可通过声明一个临时栈使用迭代实现

#### 1.1、[前序遍历也称深度优先遍历(DFS)](https://leetcode-cn.com/problems/binary-tree-preorder-traversal/): 根->左子树->右子树
![](https://oscimg.oschina.net/oscnet/up-5c455299221a4ca0ab6e202662fcb1bfc20.png)
* 递归
```js
var preorderTraversal = function (root) {
  const res = [];
  const recursion = root => {
    if (root) {
      res.push(root.val)
      recursion(root.left)
      recursion(root.right)
    }
  }
  recursion(root)
  return res;
};
```
* 迭代
```js
var preorderTraversal = function (root) {
  const res = [];
  const stack = [];
  while (root || stack.length) {
    while (root) {
      res.push(root.val) // 记录根节点
      stack.push(root) // 根节点入栈
      root = root.left;
    }
    root = stack.pop() // 左子树遍历完，出栈，继续右子树
    root = root.right;
  }
  return res
};
```
#### 1.2、[中序遍历](https://leetcode-cn.com/problems/binary-tree-inorder-traversal/)：左子树->根->右子树
![](https://oscimg.oschina.net/oscnet/up-13d5d08639cc2dea894eade9b615a54ca20.png)
* 递归
```js
var inorderTraversal = function (root) {
  const res = []
  const recursion = (root) => {
    if (root) {
      recursion(root.left) 
      res.push(root.val)
      recursion(root.right)
    }
  }
  recursion(root)
  return res
}
```
* 迭代
```js
var inorderTraversal = function (root) {
  const res = []
  const stack = [];
  while (root || stack.length) {
    while (root) {
      stack.push(root) // 左节点进栈
      root = root.left // 直至获取到最底层的左节点
    }
    root = stack.pop() // 左子树遍历完，出栈
    res.push(root.val) // 记录根节点
    root = root.right  // 继续遍历其右子树
  }
  return res
}
```

##### 拓展：[⼆叉搜索树中第K⼩的元素](https://leetcode-cn.com/problems/kth-smallest-element-in-a-bst/)
给定一个二叉搜索树的根节点 root ，和一个整数 k ，请你设计一个算法查找其中第 k 个最小元素（从 1 开始计数）
```md
输入：root = [5,3,6,2,4,null,null,1], k = 3
输出：3
```
思路：
* 中序遍历⼆叉搜索树，输出第 k 个
```js
var kthSmallest = function (root, k) {
  const stack = []
  while (root || stack.length) {
    while (root) {
      stack.push(root)
      root = root.left
    }
    root = stack.pop()
    if (--k === 0) {
      return root.val
    }
    root = root.right
  }
  return null
}
```


#### 1.3、[后序遍历](https://leetcode-cn.com/problems/binary-tree-postorder-traversal/)：左子树->右子树->根
![](https://oscimg.oschina.net/oscnet/up-d256893bc5938d802cd9247d00a32560243.png)
* 递归
```js
var postorderTraversal = function (root) {
  const res = []
  const recursion = root => {
    if (root) {
      recursion(root.left)
      recursion(root.right)
      res.push(root.val)
    }
  }
  recursion(root)
  return res
};
```
* 迭代
```js
var postorderTraversal = function (root) {
  const res = [];
  const stack = [];
  // 根进栈
  if (root) stack.push(root)
  while (stack.length) {
    root = stack.pop()
    // 前插，保证左右根
    res.unshift(root.val)
    // 先进左后进右，则先出右后出左
    if (root.left !== null) stack.push(root.left)
    if (root.right !== null) stack.push(root.right)
  }
  return res
};
```
#### 1.4、[层序遍历](https://leetcode-cn.com/problems/binary-tree-level-order-traversal/)：逐层地，从左到右访问所有节点
```js
    1
   / \
  2   3   =>得到二维数组=> [[1], [2, 3], [4, 5, 6], [7, 8, 9]]
 / \   \
4  5    6
  /    / \
 7    8   9
```
* 广度优先搜索 + 队列辅助

![](https://pic.leetcode-cn.com/94cd1fa999df0276f1dae77a9cca83f4cabda9e2e0b8571cd9550a8ee3545f56.gif)

利用广度优先搜索扫描每一层的节点，辅助队列区分节点处于哪一层，即在每一层扫描前，记录队列中的节点数量，接着一次性处理这一层的n个节点

```js
var levelOrder = function (root) {
  if (!root) return [];
  const res = [];
  let queue = [root]; // 根节点入队
  while (queue.length) {
    const path = [];  // 当前层节点
    const nextPath = []; // 下一层节点
    while (queue.length) {
      root = queue.shift(); // 队头出队
      path.push(root.val)
      if (root.left !== null) nextPath.push(root.left)
      if (root.right !== null) nextPath.push(root.right)
    }
    res.push(path);
    queue = nextPath;
  }
  return res
};

```

##### 拓展1、[层次遍历](https://leetcode-cn.com/problems/binary-tree-level-order-traversal-ii/): 从叶⼦节点所在层到根节点所在的层，逐层从左向右遍历
```js
    3
   / \
  9   20   =>得到二维数组=> [[15, 7], [9, 20], [3]] =>同上，结果反转一下即可 => res.reverse()
 / \
15  7
```

### 2、重构二叉树
重构二叉树，首先得找到可将左右子树划分开的根节点，其次是左右遍历的范围
* 划分左右子树的根节点
  * 前中、后中：根节点在中序遍历中把数组一分为二，且前序和后序的根节点分别是第一个元素和最后一个元素
  * 前后：前序的第二个节点为左子树的根P，在后序中找到P的位置index，则index前的元素就是左子树，后面的就是右子树(除去根节点)
  ![](https://oscimg.oschina.net/oscnet/up-629d887ff3cc1c91a7d321300bdfbe81c52.png)
* 左右遍历的范围
  * 前中：
    * 左子树：`[pre_start + 1, pre_start + 1 + (index - 1 - inorder_start)]`
    * 右子树：`[pre_start + 1 + (index - 1 - inorder_start) + 1, pre_end]`
  * 后中：
    * 左子树：`[post_start, post_start + (index - 1 - inorder_start)]`
    * 右子树：`[post_end - 1 - (inorder_end - (index + 1)), post_end - 1]`
  * 前后：
    * 左子树：`[pre_start + 1, pre_start + 1 + (index - post_start)]`
    * 右子树：`[pre_start + 1 + (index - post_start) + 1, pre_end]`

#### 2.1、[根据前序和后序遍历构造二叉树](https://leetcode-cn.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/)
给定两个整数数组，preorder 和 postorder ，其中 preorder 是一个具有 无重复 值的二叉树的前序遍历，postorder 是同一棵树的后序遍历，重构并返回二叉树。如果存在多个答案，您可以返回其中 任何 一个
```md
输入：preorder = [1,2,4,5,3,6,7], postorder = [4,5,2,6,7,3,1]
输出：[1,2,3,4,5,6,7]
```
```js
var constructFromPrePost = function (preorder, postorder) {
  if (!preorder.length) return null
  const head = new TreeNode(postorder.pop())
  let i = 0
  for (; i < postorder.length; i++) {
    if (postorder[i] === preorder[1]) break;
  }
  head.left = constructFromPrePost(preorder.slice(1, i + 2), postorder.slice(0, i + 1))
  head.right = constructFromPrePost(preorder.slice(i + 2), postorder.slice(i + 1))
  return head
};
```
#### 2.2、[从前序与中序遍历序列构造二叉树](https://leetcode-cn.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) / [从中序与后序遍历序列构造二叉树](https://leetcode-cn.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/)
给定两个整数数组 preorder 和 inorder ，其中 preorder 是二叉树的先序遍历， inorder 是同一棵树的中序遍历，请构造二叉树并返回其根节点

```md
输入: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
输出: [3,9,20,null,null,15,7]
```
* 前序队头出队作为根节点，在中序找到同根节点值的索引index
* 前序`index`前的元素和中序`index`前的元素都是左子树(`shift`之后前序少了根节点)
* 前序`index`后的元素和中序`index+1`后的元素都是右子树
```js
var buildTree = function (preorder, inorder) {
  if (!preorder.length) return null
  const head = new TreeNode(preorder.shift())
  const middleIndex = inorder.indexOf(head.val)
  head.left = buildTree(preorder.slice(0, middleIndex), inorder.slice(0, middleIndex))
  head.right = buildTree(preorder.slice(middleIndex), inorder.slice(middleIndex + 1))
  return head
}
```


### 3、二叉树实现
#### 3.1、[平衡二叉树](https://leetcode-cn.com/problems/balanced-binary-tree/)
给定一个二叉树，判断它是否是高度平衡的二叉树。一棵高度平衡二叉树定义为：一个二叉树每个节点的左右两个子树的高度差的绝对值不超过 1

思路：
* 类似于后序遍历，先判断左右子树是否平衡，再判断以当前节点为根节点的子树是否平衡
* 左右子树的高度绝对值差大于1，则返回-1，否则左右子树平衡，返回左右子树深度最大值作为当前树的深度
```js
const balanced = root => {
  if (!root) return 0;
  const left = balanced(root.left)
  const right = balanced(root.right)
  if (Math.abs(left - right) > 1 || left < 0 || right < 0) return -1;
  return Math.max(left, right) + 1
}
const isBalanced = root => {
  return balanced(root) !== -1
}
```
#### 3.2、[前序遍历构造二叉搜索树](https://leetcode-cn.com/problems/construct-binary-search-tree-from-preorder-traversal/)
给定一个整数数组，它表示BST(即 二叉搜索树 )的 先序遍历 ，构造树并返回其根
```md
输入：preorder = [8,5,1,7,10,12]
输出：[8,5,10,1,7,null,12]
```
思路：
* 先序遍历第一个元素即为根节点，进栈
* 扫描接下来的左右子树
  * 声明父节点，赋值栈顶元素，如果栈顶的元素值小于子节点的元素值，则将栈顶的元素弹出并作为新的父节点
  * 接着确定是左还是右节点，根据小于还是大于父节点判断是左节点还是右节点
```js
var bstFromPreorder = function (preorder) {
  if (!preorder.length) return null
  // 第一个元素为根节点
  const head = new TreeNode(preorder[0])
  const stack = [head]
  // 扫描左右子树
  for (let i = 1; i < preorder.length; i++) {
    // 栈顶元素作为父节点
    let root = stack[stack.length - 1]
    const cur = new TreeNode(preorder[i])
    // 如果栈顶的元素值小于子节点的元素值，则将栈顶的元素弹出并作为新的父节点
    while (stack.length && stack[stack.length - 1].val < cur.val) {
      root = stack.pop()
    }
    // 左右子树
    if (root.val < cur.val) {
      root.right = cur
    } else {
      root.left = cur
    }
    stack.push(cur)
  }
  return head
};

```
#### 3.3、[将有序数组转化为二叉搜索树](https://leetcode-cn.com/problems/convert-sorted-array-to-binary-search-tree/)
输入一组升序的nums数组，请你将其转换为一棵 高度平衡 二叉搜索树，即满足每个节点的左右两个子树的高度差的绝对值不超过1的二叉树
```md
输入：nums = [-10,-3,0,5,9]
     0                                0
    / \                              / \
  -3   9                           -10   5
  /   /                               \   \
-10  5                                -3   9
输出：[0,-3,9,-10,null,5] || [0,-10,5,null,-3,null,9]
```
思路：
* 有序数组，即中序遍历转二叉搜索树，结果不是唯一的，题目要求保证高度平衡，即从中间元素开始组装
* 以中间节点为父节点，其左为左子树，其右为右子树

```js
const toBST = (nums, l, r) => {
  if (l > r) return null;
  const mid = l + r >> 1;
  const root = new TreeNode(nums[mid])
  root.left = toBST(nums, l, mid - 1);
  root.right = toBST(nums, mid + 1, r)
  return root
}
var sortedArrayToBST = function (nums) {
  return toBST(nums, 0, nums.length - 1)
};
```
#### 3.4、[对称二叉树](https://leetcode-cn.com/problems/symmetric-tree/ "对称二叉树")
给你一个二叉树的根节点 root ， 检查它是否轴对称
![](https://oscimg.oschina.net/oscnet/up-fc6cb6c9df500059a3f499f316a216ff30f.png)
```md
输入：root = [1,2,2,3,4,4,3]
输出：true
```
思路：
* 对称，则左右子树是轴对称，即左子树的左节点=右子树的右节点，左子树的右节点=右子树的左节点
* 利用栈进行迭代
  * 首先根的左右子树进栈
  * 左右子树出栈，若对称，则将左子树的左节点、右子树的右节点、左子树的右节点和右子树的左节点依次入栈
  * 不断出栈左右节点进行比较，再进栈，直至栈为空
```js
var isSymmetric = function (root) {
  if (!root) return true
  const stack = [root.left, root.right]
  while (stack.length) {
    const right = stack.pop()
    const left = stack.pop()
    if (left && right) {
      if (right.val !== left.val) return false;
      stack.push(left.left)
      stack.push(right.right)
      stack.push(left.right)
      stack.push(right.left)
    } else if (left || right) {
      return false
    }
  }
  return true
};
```
#### 3.5、[合并二叉树](https://leetcode-cn.com/problems/merge-two-binary-trees/ "合并二叉树")
将两株二叉树合并为一株新的二叉树。合并的规则是
* 合并必须从两个树的根节点开始
* 若两个节点重叠，将他们的值相加作为节点合并后的新值，否则不为 NULL 的节点将直接作为新二叉树的节点

https://assets.leetcode.com/uploads/2021/02/05/merge.jpg
思路：
* 若有任一棵树为空，则返回不为空的那棵
* 扫描进行相同节点进行相加
```js
var mergeTrees = function (root1, root2) {
  if (root1 === null || root2 === null) return root2 || root1;
  root1.val = root2.val + root1.val;
  root1.left = mergeTrees(root1.left, root2.left)
  root1.right = mergeTrees(root1.right, root2.right)
  return root1
};
```

### 4、二叉树比较
#### 4.1、[二叉树的最大深度](https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/)
⼆叉树的深度为根节点到最远叶⼦节点的最⻓路径上的节点数

思路：
* 二叉树的最大深度即为`Math.max(l,r)+1`

```js
var maxDepth = function(root) {
    if(!root) return 0;
    return Math.max(maxDepth(root.left),maxDepth(root.right)) +1
};
```
#### 4.2、[⼆叉树的最小深度](https://leetcode-cn.com/problems/minimum-depth-of-binary-tree/)
最小深度是从根节点到最近叶子节点的最短路径上的节点数量
```md
输入：root = [2,null,3,null,4,null,5,null,6]
输出：2
```
思路：
* 叶子节点的定义是左右孩子都为null，即
  * 当 root 节点左右孩子都为空时，返回 1
  * 当 root 节点左右孩子有一个为空时，返回不为空的孩子节点的深度`left+right+1`
  * 当 root 节点左右孩子都不为空时，返回左右孩子较小深度的节点值`Math.min(left,right)+1`
```js
var minDepth = function (root) {
  if (!root) return 0;
  const left = minDepth(root.left)
  const right = minDepth(root.right)
  if (!root.left || !root.right) return left + right + 1
  return Math.min(left, right) + 1
};
```
#### 4.3、[二叉树的直径](https://leetcode-cn.com/problems/diameter-of-binary-tree "二叉树的直径")
给定一棵二叉树，你需要计算它的直径长度。一棵二叉树的直径长度是任意两个结点路径长度中的最大值。这条路径可能穿过也可能不穿过根结点
```js
          1
         / \
        2   3  =>返回 3=>它的长度是路径 [4,2,1,3] 或者 [5,2,1,3]
       / \     
      4   5
```
思路：
* 任意一个结点，都要记录以此结点为根的直径情况：左子树高度+右子树高度
```js
var diameterOfBinaryTree = function (root) {
  // 根节点自身的路径长度
  let max = 1
  const deps = (root) => {
    if (!root) return 0
    const left = deps(root.left);
    const right = deps(root.right);
    // 以当前节点为父节点的直径: left + right + 1
    max = Math.max(max, left + right + 1);
    // 返回以当前节点为父节点的最大高度
    return Math.max(left, right) + 1
  }
  deps(root)
  // 减去默认增加的自身根节点路径
  return max - 1;
};
```
#### 4.4、[路径总和](https://leetcode-cn.com/problems/path-sum "路径总和")
给你二叉树的根节点 root 和一个表示目标和的整数 targetSum 。判断该树中是否存在 根节点到叶子节点 的路径，这条路径上所有节点值相加等于目标和 targetSum 。如果存在，返回 true ；否则，返回 false 

![](https://assets.leetcode.com/uploads/2021/01/18/pathsum1.jpg)

思路：
* 不断递归递减当前节点的值，直至遇到叶子节点
* 叶子节点，一定要注意是没有左右节点的
```js
var hasPathSum = function (root, targetSum) {
  if (!root) return false
  // 叶子节点，判断sum是否等于该节点的值
  if (root.left === null && root.right === null) return root.val === targetSum;
  // 减去当前节点的值
  targetSum -= root.val;
  return (
    hasPathSum(root.left, targetSum) || hasPathSum(root.right, targetSum)
  )
}
```
#### 4.5、[⼆叉树的最近公共祖先](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-tree/)
给定一个二叉树, 找到该树中两个指定节点的**最近公共祖先**

* 祖先的定义： 若节点 pp 在节点 rootroot 的左（右）子树中，或 p = rootp=root ，则称 rootroot 是 pp 的祖先。

* 最近公共祖先的定义： 设节点 rootroot 为节点 p, qp,q 的某公共祖先，若其左子节点 root.leftroot.left 和右子节点 root.rightroot.right 都不是 p,qp,q 的公共祖先，则称 rootroot 是 “最近的公共祖先”


![](https://oscimg.oschina.net/oscnet/up-a9426c4f22f941f66b7890d299880c8d6ea.png)

思路：
* 若 root 为空、p｜q 中任意节点为root，则最近公共祖先为 root
* 否则递归左右子节点，返回值分别记为 left、right
  * left、right都不为空，则 p、q 分布在左右子树的根节点上，其最近公共祖先为 root
  * left为空、right不为空，则 p｜q 都不在 左子树，返回 right，right为空、left不为空的情况同理

```js
var lowestCommonAncestor = function (root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q)
  const right = lowestCommonAncestor(root.right, p, q)
  if (left === null) return right
  if (right === null) return left
  return root
};
```

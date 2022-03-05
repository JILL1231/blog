Hooks在Mount阶段和Update阶段的逻辑是不一样的

Mount阶段
* 初始化状态并返回状态和更新状态的方法`[hook.memoizedState, dispatch]`
* 区分管理每个Hooks
  * mountState调用mountWorkInProgressHook 来创建一个Hook节点，并把它添加到Hooks链表上
* 提供一个数据结构去存放更新逻辑，以便后续每次更新可以拿到最新的值
  * 使用queue链表来存放每一次的更新
  * 调用dispatchAction方法的时候，就会形成一个新的updata对象，添加到queue链表上，而且这个是一个循环链表
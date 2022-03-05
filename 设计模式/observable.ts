
/**
 * 拥有一些值得关注的状态的对象通常被称为目标， 
 * 由于它要将自身的状态改变通知给其他对象， 我们也将其称为发布者 （publisher）
 * 所有希望关注发布者状态变化的其他对象被称为订阅者 （subscribers）
 * 
 * 观察者模式：为发布者类添加订阅机制， 让每个对象都能订阅或取消订阅发布者事件流
 *  1） 一个用于存储订阅者对象引用的列表成员变量； 
 *  2） 几个用于添加或删除该列表中订阅者的公有方法。
 * */

// 观察者集合
const queued = new Set()
const observe = fn => queued.add(fn)

// Proxy方法拦截obj对象的属性赋值行为，触发充当观察者的各个函数
const observable = obj => new Proxy(obj, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    // queued.forEach(observe => observe());
    return result
  }
})

//  一个个可观察的对象
const person1 = observable({ name: 'hua', age: 10 });
const person2 = observable({ name: 'mu', age: 20 });

// 充当观察者的函数
const change = (arg) => {
  console.log("🚀 ~ arg", arg)
}
// 添加观察者函数
observe(change)

// 观察对象更改
person1.name = 'jill'

let data = {
    name: 'axuebin',
    a: {
        b: {},
    },
    sayHello: function () {
        console.log('Hello World');
    }
}
// 测试循环引用
data.a.b = data

function deepClone1(target) {
   return 
}

































const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]'
}
const isArray = (arr) => {
    return Object.prototype.toString.call(arr) === '[object Array]'
}
function deepClone(target) {
    const map = new Map()
    function clone(target) {
        if (isObject(target)) {
            let cloneTarget = isArray(target) ? [] : {};
            if (map.get(target)) {
                return map.get(target)
            }
            map.set(target, cloneTarget)
            for (const key in target) {
                cloneTarget[key] = clone(target[key]);
            }
            return cloneTarget;
        } else {
            return target;
        }
    }
    return clone(target)
};

const test = deepClone(data)
console.log("🚀  ~ line 683 ~ test", test)
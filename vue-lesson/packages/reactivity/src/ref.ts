import { activeEffect, trackEffects, triggerEffect } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";

/**
 * 创建一个响应式的 ref 对象
 * @param value - 初始值，可以是任意类型
 * @returns 返回一个带有 value 属性的 ref 对象
 */
export function ref(value) {
    return createRef(value)
}
/**
 * 创建 RefImpl 实例的工厂函数
 * @param value - 需要包装成 ref 的值
 * @returns RefImpl 实例
 */
function createRef(value) {
    return new RefImpl(value)
}
/**
 * Ref 实现类，用于包装基本类型的值使其具有响应性
 */
class RefImpl {
     public _v_isRef = true  // ref 对象标识符
    public _value: any      // 存储响应式值
    public dep: any         // 依赖收集容器
     /**
     * 构造函数
     * @param public rawValue - 原始值
     */
    constructor(public rawValue) {
        this._value = toReactive(rawValue)
    }
     /**
     * getter 访问器，用于获取 ref 的值
     * @returns 当前值
     */
    get value() {
        trackRef(this)
        return this._value
    }
    /**
     * setter 访问器，用于设置 ref 的值
     * @param newValue - 新值
     */
    set value(newValue) {
        // 只有当新值与旧值不同时才触发更新
        if (newValue !== this.rawValue) {
            this.rawValue = newValue
            this._value = newValue
            // 触发依赖更新
            triggerValueRef(this)
        }
    }
}
/**
 * 对象属性引用实现类，用于创建指向对象特定属性的 ref
 */
class ObjectRefImpl {
     /**
     * 构造函数
     * @param public object - 目标对象
     * @param public key - 目标属性键
     */
    constructor(public object, public key) { }
     /**
     * getter 访问器，获取目标对象指定属性的值
     * @returns 目标属性的值
     */
    get value() {
        return this.object[this.key]
    }
     /**
     * setter 方法，设置目标对象指定属性的值
     * @param value - 新值
     */
    set(value) {
        this.object[this.key] = value
    }
}
/**
 * 为 ref 收集依赖
 * @param ref - RefImpl 实例
 */
export function trackRef(ref) {
    // 只有在存在激活的 effect 时才进行依赖收集
    activeEffect && trackEffects(activeEffect, ref.dep = createDep(() => (ref.dep = undefined), 'undefined'))

}
/**
 * 触发 ref 的依赖更新
 * @param ref - RefImpl 实例
 */
export function triggerValueRef(ref) {
    // 只有当存在依赖时才触发更新
    ref.dep && triggerEffect(ref.dep)
}
/**
 * 创建指向对象指定属性的 ref
 * @param object - 目标对象
 * @param key - 属性键
 * @returns ObjectRefImpl 实例
 */
export function toRef(object, key) {
    return new ObjectRefImpl(object, key)
}
/**
 * 对象属性的引用集合
 * 将响应式对象的所有属性转换为 refs
 * @param object - 响应式对象
 * @returns 包含所有属性对应 refs 的对象
 */
export function toRefs(object) {
    const result = {}
    for (const key in object) {
        result[key] = toRef(object, key)
    }
    return result
}
/**
 * 将包含 refs 的对象转换为代理对象
 * 使得我们可以直接访问 ref 的值而不需要 .value
 * @param objectWithRefs - 包含 refs 的对象
 * @returns 代理对象
 */
export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
         /**
         * 拦截对象属性的读取操作
         * @param target - 目标对象
         * @param key - 属性键
         * @param receiver - 代理对象
         * @returns 属性值
         */
        get(target, key, receiver) {
            return Reflect.get(target, key, receiver)
        },
        /**
         * 拦截对象属性的设置操作
         * @param target - 目标对象
         * @param key - 属性键
         * @param value - 新值
         * @param redeceiver - 代理对象
         * @returns boolean 操作是否成功
         */
        set(target, key, value, redeceiver) {
            const oldValue = target[key]
            if (oldValue._v_isRef) {
                oldValue.value = value
                return true
            } else {
                return Reflect.set(target, key, value, redeceiver)
            }
        }
    })
}


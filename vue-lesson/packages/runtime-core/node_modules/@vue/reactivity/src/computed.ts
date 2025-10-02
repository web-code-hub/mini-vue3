import {isFunction} from "@vue/shared";
import {ReactiveEffect} from "./effect";
import {trackRef, triggerValueRef} from "./ref";

/**
 * ComputedRefImpl 类实现了计算属性的核心逻辑
 * 它通过 ReactiveEffect 来追踪依赖并缓存计算结果
 */
class ComputedRefImpl {
    public _value:number;         // 缓存计算结果的值
    public effect: ReactiveEffect;         // 响应式副作用，用于执行 getter 并收集依赖
    public dep;            // 依赖集合，用于存储订阅该计算属性的副作用

    /**
     * 构造函数初始化计算属性
     * @param getter - 计算属性的 getter 函数
     * @param setter - 计算属性的 setter 函数
     */
    constructor(public getter, public setter) {
        // 创建响应式副作用，当依赖更新时会触发调度器函数
        this.effect = new ReactiveEffect(() => getter(this._value), () => {
            // 当依赖变化时触发更新通知
            triggerValueRef(this)
        })
    }

    /**
     * 获取计算属性的值
     * 如果数据是脏的（_dirty 为 true），则重新计算并跟踪依赖
     * 否则直接返回缓存的值
     */
    get value() {
        if (this.effect._dirty) {
            // 执行计算获取新值
            this._value = this.effect.run();
            // 跟踪该计算属性的依赖
            trackRef(this)
        } else {
            // 返回缓存的值
            return this._value
        }
    }

    /**
     * 设置计算属性的值
     * 调用 setter 函数处理赋值操作
     * @param v - 要设置的新值
     */
    set value(v) {
        this.setter(v)
    }

}

/**
 * 创建一个计算属性
 * @param getterOrOptions - getter 函数或包含 get/set 的配置对象
 * @returns ComputedRefImpl 实例
 */
export function computed(getterOrOptions) {
    // 判断传入参数是否仅为 getter 函数
    const onlyGetter = isFunction(getterOrOptions)
    let getter, setter;
    
    if (onlyGetter) {
        // 如果只有 getter，则直接使用传入的函数作为 getter
        getter = getterOrOptions
        // 提供一个空函数作为 setter
        setter = () => {
        }
    } else {
        // 如果是配置对象，则分别提取 getter 和 setter
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    
    // 返回 ComputedRefImpl 实例
    return new ComputedRefImpl(getter, setter)
}
import {isFunction, isObject,isRef} from "@vue/shared";
import {ReactiveEffect} from "./effect";
/**
 * 监听响应式数据的变化
 * @param source 要监听的数据源，可以是一个 getter 函数或响应式对象
 * @param cb 回调函数，当数据变化时执行，接收新值和旧值作为参数
 * @param options 配置选项
 * @returns 返回一个用于停止监听的函数
 */
export function watch(source: any, cb: (newValue: any, oldValue: any) => void, options: {
    immediate?: boolean,
    deep?: boolean
} = {}) {
    return doWatch(source, cb, options)
}

/**
 * 立即执行传入的函数，并监听其依赖的响应式数据变化
 * @param getter 要执行的副作用函数，会自动追踪其依赖
 * @param options 配置选项
 * @returns 返回一个用于停止监听的函数
 */
export function watchEffect(getter: () => any, options: { deep?: boolean } = {}) {
    return doWatch(getter, null, options)
}

/**
 * 执行监听逻辑的核心函数
 * @param source 数据源，可以是 getter 函数或响应式对象
 * @param cb 回调函数，当数据变化时执行
 * @param options 配置参数，包括 immediate 和 deep 属性
 * @returns 返回一个用于停止监听的函数
 */
function doWatch(source: any, cb: ((newValue: any, oldValue: any,onCleanUp:(fn:()=>void)=>void) => void) | null, {immediate, deep}: {
    immediate?: boolean,
    deep?: boolean
}) {
    // 创建响应式数据获取器，用于处理深度监听逻辑
    const reactiveGetter = (source: any) => traverse(source, (deep === false ? 1 : undefined))

    // 根据数据源类型确定最终的 getter 函数
    let getter: () => any
    // 如果数据源是对象类型，则使用 reactiveGetter 处理深度监听
    if (isObject(source)) {
        getter = () => reactiveGetter(source)
    }
    // 如果数据源是 Ref 类型，则获取其内部值
    if (isRef(source)) {
        getter = () => source.value
    }
    // 如果数据源本身就是函数，则直接使用
    if (isFunction(source)) {
        getter = source
    }


    // 用于存储旧值和清理函数
    let oldValue: any
    let clean: (() => void) | undefined;
    
    // 注册清理函数的回调
    const onCleanUp = (fn: () => void) => {
        clean = () => {
            fn()
            clean = undefined
        }
    }
    
    // 定义副作用函数执行的任务
    const job = () => {
        // 比较新旧值，如果不相等则触发回调
        if (cb) {
            // 执行 getter 获取新值
            let newValue = effect.run()
            // 执行清理函数（如果存在）
            if (clean) clean()
            // 执行回调函数，传入新值、旧值和清理函数注册器
            cb(newValue, oldValue, onCleanUp)
            // 更新旧值
            oldValue = newValue
        } else {
            // watchEffect 的情况，直接执行 getter
            effect.run()
        }
    }

    // 创建响应式副作用，传入 getter 和调度器 job
    const effect = new ReactiveEffect(getter, job)

    // 根据是否有回调函数处理不同的初始化逻辑
    if (cb) {
        if (immediate) {
            // 如果设置了 immediate，则立即执行一次回调
            job()
        } else {
            // 否则先获取初始值
            oldValue = effect.run()
        }
    } else {
        // watchEffect 的情况，直接执行
        effect.run()
    }

    // 返回停止监听的函数
    return () => {
        effect.stop()
    }
}

/**
 * 遍历对象或数组，建立响应式依赖关系
 * @param source 数据源，可以是对象或数组
 * @param depth 遍历深度，控制遍历的层级，undefined 表示无限深度
 * @param currentDepth 当前遍历深度，默认为 0
 * @param seen 已遍历的对象集合，用于防止循环引用导致的无限循环
 * @returns 返回原始数据源
 */
function traverse(source: any, depth?: number, currentDepth = 0, seen = new Set()) {
    // 如果不是对象直接返回，不建立响应式依赖
    if (!isObject(source)) return source

    // 如果设置了深度且已达到指定深度，则返回，不再深入遍历
    if (depth !== undefined) {
        if (currentDepth >= depth) {
            return source
        }
        currentDepth++
    }

    // 防止循环引用导致的无限循环
    if (seen.has(source)) {
        return source
    }

    // 将当前对象加入已遍历集合
    seen.add(source)

    // 递归遍历所有属性，建立完整的依赖关系
    for (const key in source) {
        traverse(source[key], depth, currentDepth, seen)
    }

    return source
}
import { isObject } from "@vue/shared";
import { mutabaleHandlers, ReactiveFlags } from "./baseHandle";
const reactiveMap = new WeakMap(); // key:target value:proxy


export function reactive(target) { // 响应式函数
    return createReactive(target);
}
function createReactive(target) { // 创建响应式函数
    !isObject && target // 不是对象直接返回
    target[ReactiveFlags.IS_REACTIVE] && target // 已经是响应式对象直接返回

    const existingProxy = reactiveMap.get(target) // 已经被代理过直接返回
    existingProxy && existingProxy // 缓存中有直接返回

    const proxy = new Proxy(target, mutabaleHandlers) // 创建代理
    reactiveMap.set(target, proxy) // 缓存代理
    return proxy // 返回代理
}
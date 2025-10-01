import {isObject} from "@vue/shared";
import {track, trigger} from "./reactiveEffect";
import {reactive} from "./reactive";
import {ReactiveFlags} from "./constants";


/**
 * 创建代理对象
 */
export const mutabaleHandlers: ProxyHandler<object> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) true // 响应式标识
        const result = Reflect.get(target, key, receiver) // 获取属性值


        track(target, key) // 收集依赖
        if (isObject(result)) reactive(result) // 如果属性值是对象就进行代理
        return result // 通过Reflect获取值
    },
    set(target, key, value, recetiver) { // 设置值
        // 触发更新
        const oldValue = target[key]
        const result = Reflect.set(target, key, value, recetiver) // 通过Reflect设置值
        if (oldValue !== value) {
            trigger(target, key) // 触发更新
        }
        return result
    },
    deleteProperty(target: object, key: string): boolean {
        const had = key in target     // ① 真正判断 key 是否存在
        delete target[key]            // ② 删值
        if (had) {
            console.log('[delete trigger]', key)   // 调试用
            trigger(target, key)
        } // ③ 存在才触发
        return true
    }
}
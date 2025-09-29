import { track, trigger } from "./reactiveEffect";

export enum ReactiveFlags { // 响应式标识
    IS_REACTIVE = '__v_isReactive'
}
export const mutabaleHandlers: ProxyHandler<object> ={
    get(target,key,receiver){
        if(key === ReactiveFlags.IS_REACTIVE){ // 判断是否是响应式对象
            return true
        }
        // 依赖收集
        track(target,key)
        return Reflect.get(target,key,receiver) // 通过Reflect获取值
    },
    set(target,key,value,recetiver){ // 设置值
        // 触发更新
        const oldValue = target[key]
        const result = Reflect.set(target,key,value,recetiver) // 通过Reflect设置值
        if(oldValue !== value){
            trigger(target,key) // 触发更新
        }
        return result
    }
}
import { create } from "domain";
import { activeEffect, trackEffects, triggerEffect } from "./effect";
const targetMap = new WeakMap() // 存储依赖

export const  createDep = (cleanDep,key) =>{
    const dep = new Map() as any
    dep.cleanDep = cleanDep
    dep.name = key
    return dep;
}
export function track(target, key) {
    if (activeEffect) { // 有激活的effect才收集依赖
        let depsMap = targetMap.get(target) // 获取对象的依赖
        if (!depsMap) { // 没有依赖就创建一个
            targetMap.set(target, depsMap = new Map()) // 创建对象的依赖
        }
        let dep = depsMap.get(key) // 获取属性的依赖           
        if (!dep) { // 没有依赖就创建一个
            depsMap.set(
                key, 
                dep = createDep(() => depsMap.delete(key), key) // 创建属性的依赖
            )
        }
        trackEffects(activeEffect,dep) // 收集依赖
    }else {
        return false
    }
}

export function trigger(target,key){
    const depsMap = targetMap.get(target) // 获取对象的依赖
    if(!depsMap) return false; // 没有依赖直接返回
    const dep = depsMap.get(key) // 获取属性的依赖
    if(!dep) return false; // 没有依赖直接返回  
    triggerEffect(dep) // 触发更新
}

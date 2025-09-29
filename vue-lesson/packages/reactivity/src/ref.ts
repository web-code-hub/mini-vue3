import { activeEffect, trackEffects, triggerEffect } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";

/**
 * 
 * @param value //值
 * @returns    // ref对象
 */
export function ref(value) {
    return createRef(value)
}
function createRef(value) {
    return new RefImpl(value)
}
class RefImpl {
    public _v_isRef = true
    public _value;
    public dep
    constructor(public rawValue) {
        this._value = toReactive(rawValue)
    }
    get value() {
        trackRef(this)
        return this._value
    }
    set value(newValue) {
        if (newValue !== this.rawValue) {
            this.rawValue = newValue
            this._value = newValue
            triggerRef(this)
        }
    }
}
class ObjectRefImpl {
    constructor(public object, public key) { }
    get value() {
        return this.object[this.key]
    }
    set(value) {
        this.object[this.key] = value
    }
}
function trackRef(ref) {
    activeEffect && trackEffects(activeEffect, ref.dep = createDep(() => (ref.dep = undefined), 'undefined'))

}
function triggerRef(ref) {
    ref.dep && triggerEffect(ref.dep)
}

export function toRef(object, key) {
    return new ObjectRefImpl(object, key)
}

export function toRefs(object) {
    const result = {}
    for (const key in object) {
        result[key] = toRef(object, key)
    }
    return result
}

export function proxyRefs(objectWhthRefs){
    return new Proxy(objectWhthRefs,{
        get(target,key,receiver){
            return Reflect.get(target,key,receiver)
        },
        set(target,key,value,redeceiver){
            const oldValue = target[key]
            if(oldValue._v_isRef){
                oldValue.value = value
                return true
            }else{
                return Reflect.set(target,key,value,redeceiver)
            }
        }
    })
}


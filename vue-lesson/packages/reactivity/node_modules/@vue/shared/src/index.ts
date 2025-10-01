export function isObject(value){
    return typeof value === 'object' && value !== null
}
export function isFunction(value){
    return typeof value === 'function'
}
export function isRef(value){
    return value && value._v_isRef
}
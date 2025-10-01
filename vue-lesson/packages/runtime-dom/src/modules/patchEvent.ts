/**
 * 创建事件调用器
 * @param value 事件处理函数
 * @returns 返回一个可调用的事件处理函数
 */
function createInvoker(value) {
    const invoker = (e) => {
        invoker.value(e)
    }
    invoker.value = value
    return invoker
}

/**
 * 更新DOM元素的事件监听器
 * @param el 目标DOM元素
 * @param name 事件名称（如onClick）
 * @param value 事件处理函数，如果为null则移除事件监听器
 */
export default function patchEvent(el, name, value) {
    // 获取或初始化元素上的事件调用器存储对象
    const invokers = el._vei || (el._vei = {})
    
    // 从属性名中提取事件名（去除on前缀并转为小写）
    const eventName = name.slice(2).toLowerCase()
    
    // 获取已存在的事件调用器
    const existingInvoker = invokers[name]
    
    if (value && existingInvoker) {
        // 如果新值存在且已有调用器，则更新调用器的值
        existingInvoker.value = value
    }
    else {
        // 否则创建新的调用器并添加事件监听器
        const invoker = invokers[name] = createInvoker(value)
        el.addEventListener(eventName, invoker)
    }
    
    // 如果值为null，移除事件监听器
    if (value === null) {
        el.removeEventListener(eventName, existingInvoker)
        invokers[name] = undefined
    }
}
/**
 * 更新元素的样式
 * @param el - 目标DOM元素
 * @param key - 样式属性名
 * @param prev - 旧的样式值
 * @param value - 新的样式值
 */
export default function patchStyle(el, key, prev, value) {
    const style = el.style
    // 应用新的样式值
    for (const key in value) {
        style[key] = value[key]
    }
    // 如果存在旧样式，则遍历并更新
    if (prev) {
        for (const key in prev) {
            // 如果新样式值为null，则将该样式属性设为null（即移除该样式）
            value[key] === null && (style[key] = null)
        }
    }
}
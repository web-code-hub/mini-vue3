export const nodeOptions = {
    /**
     * 在父节点的指定位置插入元素
     * @param el 需要插入的元素
     * @param parent 父节点
     * @param anchor 插入位置的参考元素
     */
    insert: (el, parent, anchor) => parent.insertBefore(el, anchor|| null),

    /**
     * 创建指定标签名的元素
     * @param el 标签名
     * @returns 新创建的元素
     */
    createElement: (el) => document.createElement(el),

    /**
     * 创建文本节点
     * @param text 文本内容
     * @returns 新创建的文本节点
     */
    createTextNode: (text) => document.createTextNode(text),

    /**
     * 获取元素的下一个兄弟元素
     * @param el 当前元素
     * @returns 下一个兄弟元素
     */
    nextElementSibling: (el) => el.nextElementSibling,

    /**
     * 获取元素的父节点
     * @param el 当前元素
     * @returns 父节点
     */
    parentNode: (el) => el.parentNode,


    /**
     * 创建文本节点
     * @param text 文本内容
     * @returns 新创建的文本节点
     */
    createText: (text) => document.createTextNode(text),

    /**
     * 设置文本节点的内容
     * @param el 文本节点
     * @param text 新的文本内容
     */
    setText: (el, text) => el.nodeValue = text,
    /**
     * 设置元素的文本内容（与setTextContent功能相同）
     * @param el 元素
     * @param text 文本内容
     */
    setElementText: (el, text) => el.textContent = text,

    /**
     * 从DOM中移除元素
     * @param el 需要移除的元素
     */
    remove: (el) => el.parentNode&& el.parentNode.remove(),

    /**
     * 根据选择器查询元素
     * @param selector CSS选择器
     * @returns 匹配的第一个元素
     */
    querySelector: (selector) => document.querySelector(selector),
}
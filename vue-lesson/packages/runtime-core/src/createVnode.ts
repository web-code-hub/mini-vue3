import {isString, ShapeFlags} from "@vue/shared";

/**
 * 创建虚拟节点的核心函数
 * @param type - 节点类型
 * @param props - 节点属性
 * @param children - 子节点
 * @returns 虚拟节点对象
 */
export function createVnode(type, props, children?) {
    // 根据节点类型确定shapeFlag
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0

    // 创建虚拟节点对象
    const vnode = {
        __v_isVnode: true,           // 标识为虚拟节点
        type,                        // 节点类型
        props,                       // 节点属性
        key: props?.key,             // 节点key值，用于diff算法优化
        children,                    // 子节点
        el: null,                    // 对应的真实DOM元素引用
        shapeFlag                    // 节点类型标记
    }

    // 处理子节点并设置对应的shapeFlag
    if (children) {
        if (Array.isArray(children)) {
            // 数组子节点
            vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
        } else {
            // 文本子节点
            children = String(children)
            vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
        }
    }

    return vnode
}
import {isObject} from "@vue/shared";
import {createVnode} from "./createVnode";

/**
 * 创建虚拟节点(VNode)的工厂函数
 * @param type - 节点类型，可以是HTML标签名或组件
 * @param propsOrChildren - 属性对象或子节点
 * @param children - 子节点数组
 * @returns 虚拟节点对象
 */
export function h(type, propsOrChildren?, children?) {
    // 获取参数长度，用来判断调用方式
    const l = arguments.length;

    // 处理两种参数的情况
    if (l === 2) {
        // 如果第二个参数是对象且不是数组
        if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
            // 如果是虚拟节点，则将其作为子节点数组处理
            if (isVnode(propsOrChildren)) {
                return createVnode(type, null, [propsOrChildren])
            }
            // 否则作为属性对象处理
            return createVnode(type, propsOrChildren)
        }
        // 将第二个参数作为子节点处理
        return createVnode(type, null, propsOrChildren)
    } else {
        // 处理超过三种参数的情况，将第三个及之后的参数合并为子节点数组
        if (l > 3) {
            children = Array.from(arguments).slice(2)
        }

        // 处理三种参数的情况，将第三个参数包装为数组作为子节点
        if (l === 3 && isVnode(children)) {
            children = [children]
        }
        return createVnode(type, propsOrChildren, children)
    }
}

/**
 * 判断值是否为虚拟节点
 * @param value - 待检测的值
 * @returns 如果是虚拟节点返回true，否则返回false
 */
function isVnode(value) {
    return value?.__v_isVnode
}


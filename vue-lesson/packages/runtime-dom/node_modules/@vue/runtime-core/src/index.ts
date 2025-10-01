import {ShapeFlags} from "@vue/shared";

export function createRenderer(renderOptions) {
    // 解构出所有平台特定的渲染方法
    const {
        insert: hostInsert,
        createElement: hostCreateElement,
        createTextNode: hostCreateTextNode,
        nextElementSibling: hostNextElementSibling,
        parentNode: hostParentNode,
        createText: hostCreateText,
        setText: hostSetText,
        setElementText: hostSetElementText,
        remove: hostRemove,
        patchProp: hostPatchProp,
        querySelector: hostQuerySelector,
    } = renderOptions

    // 挂载子节点
    const mountChildren = (el, children) => {
        for (let i = 0; i < children.length; i++) {
            patch(null, children[i], el)
        }
    }

    // 挂载元素节点
    const mountElement = (vnode, container) => {
        const {type, props, children, shapeFlag} = vnode
        // 创建元素节点
        const el = vnode.el = hostCreateElement(type)
        
        // 根据子节点类型进行不同处理
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 文本子节点
            hostSetElementText(el, children)
        } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
            // 数组子节点
            mountChildren(el, children)
        }
        
        // 处理元素属性
        if(props){
            for (const key in props) {
                hostPatchProp(vnode, key, null, props[key])
            }
        }
        
        // 将元素插入到容器中
        hostInsert(el, container)
    }

    // 比较并更新节点
    const patch = (n1, n2, container) => {
        // 如果是相同节点，直接返回
        if (n1 === n2) {
            return
        }
        
        // 如果是新节点，则挂载
        if (n1 === null) {
            mountElement(n2, container)
        }
        // TODO: 实现节点更新逻辑
    }

    // 渲染函数
    const render = (vnode, container) => {
        // 执行patch操作，比较新旧节点并更新DOM
        patch(container._vnode || null, vnode, container)
        // 保存当前vnode用于下次比较
        container._vnode = vnode
    }
    
    // 返回渲染器对象
    return {
        render
    }
}

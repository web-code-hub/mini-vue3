// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isString(value) {
  return typeof value === "string";
}

// packages/runtime-core/src/createVnode.ts
function createVnode(type, props, children) {
  const shapeFlag = isString(type) ? 1 /* ELEMENT */ : 0;
  const vnode = {
    __v_isVnode: true,
    // 标识为虚拟节点
    type,
    // 节点类型
    props,
    // 节点属性
    key: props?.key,
    // 节点key值，用于diff算法优化
    children,
    // 子节点
    el: null,
    // 对应的真实DOM元素引用
    shapeFlag
    // 节点类型标记
  };
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
    } else {
      children = String(children);
      vnode.shapeFlag |= 8 /* TEXT_CHILDREN */;
    }
  }
  return vnode;
}

// packages/runtime-core/src/h.ts
function h(type, propsOrChildren, children) {
  const l = arguments.length;
  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        return createVnode(type, null, [propsOrChildren]);
      }
      return createVnode(type, propsOrChildren);
    }
    return createVnode(type, null, propsOrChildren);
  }
  if (l > 3) {
    children = Array.from(arguments).slice(2);
    return createVnode(type, propsOrChildren, children);
  }
  if (l === 3) {
    children = [children];
    return createVnode(type, propsOrChildren, children);
  }
  return createVnode(type, null, propsOrChildren);
}
function isVnode(value) {
  return value?.__v_isVnode;
}

// packages/runtime-core/src/render.ts
function createRenderer(renderOptions) {
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
    querySelector: hostQuerySelector
  } = renderOptions;
  const mountChildren = (el, children) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el);
    }
  };
  const mountElement = (vnode, container) => {
    const { type, props, children, shapeFlag } = vnode;
    const el = vnode.el = hostCreateElement(type);
    if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      hostSetElementText(el, children);
    } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      mountChildren(el, children);
    }
    if (props) {
      for (const key in props) {
        hostPatchProp(vnode, key, null, props[key]);
      }
    }
    hostInsert(el, container);
  };
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      return;
    }
    if (n1 === null) {
      mountElement(n2, container);
    }
  };
  const render = (vnode, container) => {
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  return {
    render
  };
}
export {
  createRenderer,
  createVnode,
  h
};
//# sourceMappingURL=runtime-core.esm.js.map

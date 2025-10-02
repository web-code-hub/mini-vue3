// packages/runtime-dom/src/nodeOptions.ts
var nodeOptions = {
  /**
   * 在父节点的指定位置插入元素
   * @param el 需要插入的元素
   * @param parent 父节点
   * @param anchor 插入位置的参考元素
   */
  insert: (el, parent, anchor) => parent.insertBefore(el, anchor || null),
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
  remove: (el) => el.parentNode && el.parentNode.remove(),
  /**
   * 根据选择器查询元素
   * @param selector CSS选择器
   * @returns 匹配的第一个元素
   */
  querySelector: (selector) => document.querySelector(selector)
};

// packages/runtime-dom/src/modules/patchEvent.ts
function createInvoker(value) {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = value;
  return invoker;
}
function patchEvent(el, name, value) {
  const invokers = el._vei || (el._vei = {});
  const eventName = name.slice(2).toLowerCase();
  const existingInvoker = invokers[name];
  if (value && existingInvoker) {
    existingInvoker.value = value;
  } else {
    const invoker = invokers[name] = createInvoker(value);
    el.addEventListener(eventName, invoker);
  }
  if (value === null) {
    el.removeEventListener(eventName, existingInvoker);
    invokers[name] = void 0;
  }
}

// packages/runtime-dom/src/modules/patchClass.ts
function patchClass(el, value) {
  value === null ? el.removeAttribute("class") : el.className = value;
}

// packages/runtime-dom/src/modules/patchStyle.ts
function patchStyle(el, prev, value) {
  let style = el.style;
  for (const key in value) {
    style[key] = value[key];
  }
  if (prev) {
    for (const key in prev) {
      value[key] === null && (style[key] = null);
    }
  }
}

// packages/runtime-dom/src/modules/patchAttr.ts
function patchAttr(el, key, value) {
  value == null ? el.removeAttribute(key) : el.setAttribute(key, value);
}

// packages/runtime-dom/src/patchProp.ts
function patchProp(el, key, oldProps, newProps) {
  if (key === "style") {
    return patchStyle(el, oldProps, newProps);
  }
  if (key === "class") {
    return patchClass(el, newProps);
  }
  if (/^on[^a-z]/.test(key)) {
    return patchEvent(el, key, newProps);
  }
  return patchAttr(el, key, newProps);
}

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
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    }
    if (l === 3 && isVnode(children)) {
      children = [children];
    }
    return createVnode(type, propsOrChildren, children);
  }
}
function isVnode(value) {
  return value?.__v_isVnode;
}

// packages/runtime-core/src/render.ts
function createRenderer(renderOptions2) {
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
  } = renderOptions2;
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  };
  const mountElement = (vnode, container) => {
    const { type, props, children, shapeFlag } = vnode;
    const el = hostCreateElement(type);
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      hostSetElementText(el, children);
    } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      mountChildren(children, el);
    }
    hostInsert(el, container);
  };
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      return;
    }
    if (n1 === null) {
      if (isString(n2)) {
        throw new Error("\u5FC5\u987B\u662F\u4E00\u4E2A\u865A\u62DF\u8282\u70B9");
      }
      mountElement(n2, container);
    }
  };
  const render2 = (vnode, container) => {
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  };
  return {
    render: render2
  };
}

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign({ patchProp }, nodeOptions);
var render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  createRenderer,
  createVnode,
  h,
  render,
  renderOptions
};
//# sourceMappingURL=runtime-dom.esm.js.map

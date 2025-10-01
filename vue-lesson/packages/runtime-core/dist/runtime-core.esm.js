// packages/runtime-core/src/index.ts
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
  createRenderer
};
//# sourceMappingURL=runtime-core.esm.js.map

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isFunction(value) {
  return typeof value === "function";
}

// packages/reactivity/src/effect.ts
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    // 是否激活
    this._trackId = 0;
    // effect标识
    this._depsLength = 0;
    // 依赖长度
    this._running = false;
    this.deps = [];
    // 依赖集合
    this._dirty = 4 /* Dirty */;
  }
  get _dirtyLeave() {
    return this._dirty === 4 /* Dirty */;
  }
  set _dirtyLeave(value) {
    this._dirty = value ? 4 /* Dirty */ : 0 /* NoDirty */;
  }
  run() {
    this._dirty = 0 /* NoDirty */;
    if (!this.active) this.fn();
    let lastActiveEffect = activeEffect;
    try {
      activeEffect = this;
      perCleanupEffect(this);
      this._running = true;
      return this.fn();
    } finally {
      postCleanupEffect(this);
      this._running = false;
      activeEffect = lastActiveEffect;
    }
  }
  stop() {
    if (this.active) {
      perCleanupEffect(this);
      perCleanupEffect(this);
      this.active = false;
    }
  }
};
function perCleanupEffect(effect2) {
  effect2._depsLength = 0;
  effect2._trackId++;
}
function postCleanupEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
      cleanEffect(effect2.deps[i], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
function cleanEffect(dep, effect2) {
  dep.delete(effect2);
  if (dep.size === 0) dep.cleanDep();
}
var activeEffect;
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  if (options) {
    Object.assign(_effect, options);
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
function trackEffects(effect2, dep) {
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanEffect(oldDep, effect2);
      }
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
  }
}
function triggerEffect(dep) {
  for (const effect2 of dep.keys()) {
    if (effect2._dirty < 4 /* Dirty */) {
      effect2._dirty = 4 /* Dirty */;
    }
    if (!effect2._running) {
      if (effect2.scheduler) {
        effect2.scheduler();
      }
    }
  }
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
var createDep = (cleanDep, key) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanDep = cleanDep;
  dep.name = key;
  return dep;
};
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(
        key,
        dep = createDep(() => depsMap.delete(key), key)
        // 创建属性的依赖
      );
    }
    trackEffects(activeEffect, dep);
  } else {
    return false;
  }
}
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return false;
  const dep = depsMap.get(key);
  if (!dep) return false;
  triggerEffect(dep);
}

// packages/reactivity/src/baseHandle.ts
var mutabaleHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) true;
    const result = Reflect.get(target, key, receiver);
    track(target, key);
    if (isObject(result)) reactive(result);
    return result;
  },
  set(target, key, value, recetiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, recetiver);
    if (oldValue !== value) {
      trigger(target, key);
    }
    return result;
  },
  deleteProperty(target, key) {
    const had = key in target;
    delete target[key];
    if (had) {
      console.log("[delete trigger]", key);
      trigger(target, key);
    }
    return true;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  return createReactive(target);
}
function createReactive(target) {
  !isObject && target;
  target["__v_isReactive" /* IS_REACTIVE */] && target;
  const existingProxy = reactiveMap.get(target);
  existingProxy && existingProxy;
  const proxy = new Proxy(target, mutabaleHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

// packages/reactivity/src/ref.ts
function ref(value) {
  return createRef(value);
}
function createRef(value) {
  return new RefImpl(value);
}
var RefImpl = class {
  // 依赖收集容器
  /**
   * 构造函数
   * @param public rawValue - 原始值
   */
  constructor(rawValue) {
    this.rawValue = rawValue;
    this._v_isRef = true;
    this._value = toReactive(rawValue);
  }
  /**
   * getter 访问器，用于获取 ref 的值
   * @returns 当前值
   */
  get value() {
    trackRef(this);
    return this._value;
  }
  /**
   * setter 访问器，用于设置 ref 的值
   * @param newValue - 新值
   */
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = newValue;
      triggerValueRef(this);
    }
  }
};
var ObjectRefImpl = class {
  /**
   * 构造函数
   * @param public object - 目标对象
   * @param public key - 目标属性键
   */
  constructor(object, key) {
    this.object = object;
    this.key = key;
  }
  /**
   * getter 访问器，获取目标对象指定属性的值
   * @returns 目标属性的值
   */
  get value() {
    return this.object[this.key];
  }
  /**
   * setter 方法，设置目标对象指定属性的值
   * @param value - 新值
   */
  set(value) {
    this.object[this.key] = value;
  }
};
function trackRef(ref2) {
  activeEffect && trackEffects(activeEffect, ref2.dep = ref2.dep || createDep(() => ref2.dep = void 0, "undefined"));
}
function triggerValueRef(ref2) {
  ref2.dep && triggerEffect(ref2.dep);
}
function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}
function toRefs(object) {
  const result = {};
  for (const key in object) {
    result[key] = toRef(object, key);
  }
  return result;
}
function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    /**
     * 拦截对象属性的读取操作
     * @param target - 目标对象
     * @param key - 属性键
     * @param receiver - 代理对象
     * @returns 属性值
     */
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },
    /**
     * 拦截对象属性的设置操作
     * @param target - 目标对象
     * @param key - 属性键
     * @param value - 新值
     * @param redeceiver - 代理对象
     * @returns boolean 操作是否成功
     */
    set(target, key, value, redeceiver) {
      const oldValue = target[key];
      if (oldValue._v_isRef) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, redeceiver);
      }
    }
  });
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  // 依赖集合，用于存储订阅该计算属性的副作用
  /**
   * 构造函数初始化计算属性
   * @param getter - 计算属性的 getter 函数
   * @param setter - 计算属性的 setter 函数
   */
  constructor(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this.effect = new ReactiveEffect(() => getter(this._value), () => {
      triggerValueRef(this);
    });
  }
  /**
   * 获取计算属性的值
   * 如果数据是脏的（_dirty 为 true），则重新计算并跟踪依赖
   * 否则直接返回缓存的值
   */
  get value() {
    if (this.effect._dirty) {
      this._value = this.effect.run();
      trackRef(this);
    } else {
      return this._value;
    }
  }
  /**
   * 设置计算属性的值
   * 调用 setter 函数处理赋值操作
   * @param v - 要设置的新值
   */
  set value(v) {
    this.setter(v);
  }
};
function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions);
  let getter, setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}

// packages/runtime-dom/src/nodeOptions.ts
var nodeOptions = {
  /**
   * 在父节点的指定位置插入元素
   * @param el 需要插入的元素
   * @param parent 父节点
   * @param anchor 插入位置的参考元素
   */
  insert: (el, parent, anchor) => parent.insertBefore(el, anchor),
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
   * 设置元素的文本内容
   * @param el 元素
   * @param text 文本内容
   */
  setTextContent: (el, text) => el.textContent = text,
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
  remove: (el) => el.remove(),
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
function patchStyle(el, key, prev, value) {
  const style = el.style;
  for (const key2 in value) {
    style[key2] = value[key2];
  }
  if (prev) {
    for (const key2 in prev) {
      value[key2] === null && (style[key2] = null);
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
    return patchStyle(el, key, oldProps, newProps);
  }
  if (key === "class") {
    return patchClass(el, newProps);
  }
  if (/^on[^a-z]/.test(key)) {
    return patchEvent(el, key, newProps);
  }
  return patchAttr(el, key, newProps);
}

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign({ patchProp }, nodeOptions);
export {
  ReactiveEffect,
  activeEffect,
  computed,
  effect,
  proxyRefs,
  reactive,
  ref,
  renderOptions,
  toReactive,
  toRef,
  toRefs,
  trackEffects,
  trackRef,
  triggerEffect,
  triggerValueRef
};
//# sourceMappingURL=runtime-dom.esm.js.map

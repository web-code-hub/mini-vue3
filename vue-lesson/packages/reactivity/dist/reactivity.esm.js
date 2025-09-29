// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/effect.ts
var ReactiveEffect = class {
  // 依赖集合
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    // 是否激活
    this._trackId = 0;
    // effect标识
    this._depsLength = 0;
    // 依赖长度
    this.deps = [];
  }
  run() {
    if (!this.active) this.fn();
    let lastActiveEffect = activeEffect;
    try {
      activeEffect = this;
      perCleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = lastActiveEffect;
    }
  }
};
function perCleanupEffect(effect2) {
  effect2._depsLength = 0;
  effect2._trackId++;
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
    effect2.scheduler && effect2.scheduler();
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
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, recetiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, recetiver);
    if (oldValue !== value) {
      trigger(target, key);
    }
    return result;
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
export {
  activeEffect,
  effect,
  reactive,
  trackEffects,
  triggerEffect
};
//# sourceMappingURL=reactivity.esm.js.map

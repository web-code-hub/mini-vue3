class ReactiveEffect {
    public active = true // 是否激活
    public _trackId = 0; // effect标识
    public _depsLength = 0; // 依赖长度
    public deps = [] // 依赖集合
    constructor(public fn, public scheduler?) { }
    run() {
        if (!this.active) this.fn() // 非激活状态直接执行函数
        let lastActiveEffect = activeEffect // 备份上一个激活的effect
        try {
            activeEffect = this // 当前激活的effect
            perCleanupEffect(this) // 清除依赖
            return this.fn()
        } finally {
            activeEffect = lastActiveEffect // 恢复上一个激活的effect
        }
    }
}

function perCleanupEffect(effect) {
    effect._depsLength = 0
    effect._trackId++;
}// 清除依赖

function cleanEffect(dep, effect) {
    dep.delete(effect)
    if(dep.size === 0) dep.cleanDep()

} // 清除依赖

export let activeEffect; // 当前激活的effect
export function effect(fn: Function, options?) { // 创建effect
    const _effect = new ReactiveEffect(fn, () => { // 调度器
        _effect.run() // 执行effect
    })
    _effect.run() // 立即执行
}

export function trackEffects(effect, dep) {
    if(dep.get(effect)!==effect._trackId){ // 避免重复收集
        dep.set(effect,effect._trackId) // 添加依赖
        const oldDep = effect.deps[effect._depsLength] // 获取老的依赖
        if(oldDep !== dep){ // 避免重复添加
            if(oldDep){ // 清理老的依赖
                cleanEffect(oldDep,effect)
            }
            effect.deps[effect._depsLength++] = dep // 重新添加依赖
        }else{
            effect._depsLength++ // 依赖长度自增
        }
    }
}

export function triggerEffect(dep) {
    for (const effect of dep.keys()) {
        effect.scheduler && effect.scheduler()  // 触发更新
    }
}

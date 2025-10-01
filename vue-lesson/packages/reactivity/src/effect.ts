import {DirtyLeave} from "./constants";

export class ReactiveEffect {
    public active = true // 是否激活
    public _trackId = 0; // effect标识
    public _depsLength = 0; // 依赖长度
    public _running = false;
    public deps = [] // 依赖集合
    public _dirty = DirtyLeave.Dirty

    constructor(public fn, public scheduler?) {
    }

    public get _dirtyLeave() {
        return this._dirty === DirtyLeave.Dirty
    }

    public set _dirtyLeave(value) {
        this._dirty = value ? DirtyLeave.Dirty : DirtyLeave.NoDirty
    }

    run() {
        this._dirty = DirtyLeave.NoDirty
        if (!this.active) this.fn() // 非激活状态直接执行函数
        let lastActiveEffect = activeEffect // 备份上一个激活的effect
        try {
            activeEffect = this // 当前激活的effect
            perCleanupEffect(this) // 清除依赖
            this._running = true
            return this.fn()
        } finally {
            postCleanupEffect(this)
            this._running = false
            activeEffect = lastActiveEffect // 恢复上一个激活的effect
        }
    }
}


/**
 *
 * @param effect // effect实例
 */
function perCleanupEffect(effect) {
    effect._depsLength = 0
    effect._trackId++;
}// 清除依赖

/**
 *
 * @param effect 激活的effect
 */
function postCleanupEffect(effect) { // 恢复依赖
    if (effect.deps.length > effect._depsLength) { // 删除多余的依赖
        for (let i = effect._depsLength; i < effect.deps.length; i++) {
            cleanEffect(effect.deps[i], effect)
        }
        effect.deps.length = effect._depsLength // 截取依赖
    }
}

/**
 *
 * @param dep // 要删除的依赖
 * @param effect // 删除的依赖的effect
 */
function cleanEffect(dep, effect) {
    dep.delete(effect)
    if (dep.size === 0) dep.cleanDep()

} // 清除依赖

export let activeEffect; // 当前激活的effect

/**
 *
 * @param fn // 要执行的函数
 * @param options // 选项
 */
export function effect(fn: Function, options?) { // 创建effect
    const _effect = new ReactiveEffect(fn, () => { // 调度器
        _effect.run() // 执行effect
    })
    _effect.run()
    if (options) {
        Object.assign(_effect, options)
    }
    const runner = _effect.run.bind(_effect) // 创建 runner
    runner.effect = _effect // 绑定effect
    return runner // 返回 runner
}

/**
 *
 * @param effect // effect 实例
 * @param dep  // 依赖
 */

export function trackEffects(effect, dep) {
    if (dep.get(effect) !== effect._trackId) { // 避免重复收集
        dep.set(effect, effect._trackId) // 添加依赖
        const oldDep = effect.deps[effect._depsLength] // 获取老的依赖
        if (oldDep !== dep) { // 避免重复添加
            if (oldDep) { // 清理老的依赖
                cleanEffect(oldDep, effect)
            }
            effect.deps[effect._depsLength++] = dep // 重新添加依赖
        } else {
            effect._depsLength++ // 依赖长度自增
        }
    }
}

/**
 *
 * @param dep 依赖
 */

export function triggerEffect(dep) {
    for (const effect of dep.keys()) {
        if(effect._dirty < DirtyLeave.Dirty){
            effect._dirty = DirtyLeave.Dirty
        }
        if (!effect._running) {
            if (effect.scheduler) {
                effect.scheduler()
            }
        }
    }
}

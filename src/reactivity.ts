let activeEffect: (() => void) | undefined
export function effect(fn: () => void) {
    activeEffect = fn;
    fn();
    activeEffect = undefined;
}
const targetMap = new WeakMap();
export function track(target: object, key: string | symbol) {
    if(!activeEffect) return;
    let  depsMap =targetMap.get(target);
    if(!depsMap){
        depsMap = targetMap.set(target,(depsMap = new Map()))
    }
    let  dep = depsMap.get(key);
    if(!dep){
        depsMap.set(key,(dep = new Map()))
    }
    return targetMap
}

export function trigger(target:object,key:string){
    const depsMap = targetMap.get(target)
    if(!depsMap) return ;
    const dep = depsMap.get(key)
    if(!dep) return;
    for (const effect of dep) {
        effect && effect()
    }

}
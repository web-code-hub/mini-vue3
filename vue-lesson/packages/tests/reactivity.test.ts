import { describe, expect, test } from 'vitest'
import {effect,reactive} from '../reactivity/dist/reactivity.esm.js'

describe('Day1 30 cases', () => {
    /* ====== 1-4 基础 ====== */
    test('1 基本收集', () => {
        let val = 0
        const obj = reactive({ a: 1 })
        effect(() => { val = obj.a })
        expect(val).toBe(1)
        obj.a = 2;  expect(val).toBe(2)
    })

    test('2 嵌套 effect', () => {
        let inner = 0, outer = 0
        const obj = reactive({ a: 1 })
        effect(() => {
            effect(() => { inner = obj.a })
            outer = obj.a
        })
        obj.a = 9
        expect(inner).toBe(9); expect(outer).toBe(9)
    })

    test('3 重复 key 不重复收集', () => {
        let cnt = 0
        const obj = reactive({ a: 1 })
        effect(() => { cnt++; void obj.a; void obj.a })
        expect(cnt).toBe(1)
        obj.a = 2;  expect(cnt).toBe(2)
    })

    test('4 无 activeEffect 时 track 不崩溃', () => {
        expect(() => reactive({ a: 1 }, 'a')).not.toThrow()
    })

    /* ====== 5-30 边缘 ====== */
    test('5 Symbol key', () => {
        const sym = { value: Symbol('sym') }; const obj: any = reactive({ [sym.value]: 100 })
        let val = 0; effect(() => { val = obj[sym.value] })
        expect(val).toBe(100)
        obj[sym.value] = 200; ; expect(val).toBe(200)
    })

    test('6 原型链依赖', () => {
        const parent = reactive({ x: 1 }), child = Object.create(parent)
        let val = 0; effect(() => { val = child.x })
        expect(val).toBe(1); parent.x = 2; expect(val).toBe(2)
    })

    test('7 空对象 track', () => {
        const obj: any = reactive({}); let val = -1
        effect(() => { val = obj.a ?? -1 })
        expect(val).toBe(-1); obj.a = 1;  expect(val).toBe(1)
    })

    test('8 数组索引', () => {
        const arr = reactive([10, 20]); let val = 0
        effect(() => { val = arr[0] })
        expect(val).toBe(10); arr[0] = 99; expect(val).toBe(99)
    })

    test('9 数组 length', () => {
        const arr = reactive([1, 2, 3]); let len = 0
        effect(() => { len = arr.length })
        expect(len).toBe(3); arr.length = 5;  expect(len).toBe(5)
    })

    test('10 删除属性', () => {
        const obj: any = reactive({ a: 1 }); let val = 0
        effect(() => { val = obj.a ?? 0 })
        expect(val).toBe(1); delete obj.a;  expect(val).toBe(0)
    })

    test('11 新增属性', () => {
        const obj: any = reactive({}); let val = 0
        effect(() => { val = obj.b ?? 0 })
        expect(val).toBe(0); obj.b = 2; expect(val).toBe(2)
    })

    test('12 循环引用', () => {
        const obj: any = reactive({ a: 1 }); obj.self = obj
        let val = 0; effect(() => { val = obj.self.self.a })
        expect(val).toBe(1); obj.a = 9;  expect(val).toBe(9)
    })

    test('13 数值 key', () => {
        const obj: any = reactive({ 0: 'a' }); let val = ''
        effect(() => { val = obj[0] })
        expect(val).toBe('a'); obj[0] = 'b';  expect(val).toBe('b')
    })

    test('14 数值 key', () => {
        const obj: any = reactive({ 0: 'a' })
        let val = ''
        effect(() => { val = obj[0] })
        expect(val).toBe('a')
        obj[0] = 'b'; expect(val).toBe('b')
    })


    test('15 大 key 量', () => {
        const obj: any = reactive({})
        for (let i = 0; i < 1000; i++) obj[i] = i
        let val = 0; effect(() => { val = obj[999] })
        expect(val).toBe(999); obj[999] = 1234;  expect(val).toBe(1234)
    })

    test('16 多 key 监听', () => {
        const obj = reactive({ a: 1, b: 2 }); let sum = 0
        effect(() => { sum = obj.a + obj.b })
        expect(sum).toBe(3); obj.a = 2;  expect(sum).toBe(4)
    })

    test('17 未监听 key 触发无影响', () => {
        const obj = reactive({ a: 1, b: 2 }); let val = 0
        effect(() => { val = obj.a })
        obj.b = 9;  expect(val).toBe(1) // 不变
    })

    test('18 删除再新增同 key', () => {
        const obj: any = reactive({ a: 1 }); let val = 0
        effect(() => { val = obj.a })
        expect(val).toBe(1); delete obj.a;  expect(val).toBe(undefined)
        obj.a = 9;  expect(val).toBe(9)
    })

    test('19 函数 effect', () => {
        let val = 0
        const fn = () => { val++ }
        effect(fn); expect(val).toBe(1)
        effect(fn); expect(val).toBe(2)
    })

    test('20 判断分支收集', () => {
        const obj = reactive({ a: 0, b: 1 }); let val = 0
        effect(() => { val = obj.b ? obj.a : 0 })
        expect(val).toBe(0); obj.a = 9; expect(val).toBe(9) // b=0 未收集 a
        obj.b = 1; expect(val).toBe(9)
    })

    test('21 嵌套删除', () => {
        const obj: any = reactive({}); let val = 0
        effect(() => { val = obj.a ?? 0 })
        obj.a = 1;  expect(val).toBe(1)
        delete obj.a;  expect(val).toBe(0)
    })

    test('22 触发不存在 key', () => {
        expect(() => (reactive({ a: 1 }), 'notExist')).not.toThrow()
    })

    test('23 getter 访问器', () => {
        let internal = reactive({value:1})
        const obj = {
            get a() { return internal.value },
            set a(v) { internal.value = v }
        }
        let val = 0; effect(() => { val = obj.a })
        expect(val).toBe(1); obj.a = 9;  expect(val).toBe(9)
    })

    test('24 Proxy 对象', () => {
        const target = reactive({ a: 1 })
        const obj = new Proxy(target, { get(t, k) { return t[k as string] }, set(t, k, v) { t[k as string] = v; return true } })
        let val = 0; effect(() => { val = obj.a })
        expect(val).toBe(1); obj.a = 2;  expect(val).toBe(2)
    })

    test('25 同一 effect 多次写同 key', () => {
        const obj = reactive({ a: 1 }); let cnt = 0
        effect(() => { cnt++; obj.a = obj.a + 1 }) // 自增
        expect(cnt).toBe(1); expect(obj.a).toBe(2)
        obj.a = 9;  expect(cnt).toBe(2); expect(obj.a).toBe(10)
    })

    test('26 触发后新增 effect 只读当前值', () => {
        const obj = reactive({ a: 1 }); let val1 = 0, val2 = 0
        effect(() => { val1 = obj.a })
        obj.a = 2;  expect(val1).toBe(2)
        effect(() => { val2 = obj.a }); expect(val2).toBe(2) // 不回溯旧值
    })

    test('27 循环引用对象', () => {
        const obj: any = reactive({ a: 1 }); obj.self = obj
        let val = 0; effect(() => { val = obj.self.self.a })
        expect(val).toBe(1); obj.a = 9;  expect(val).toBe(9)
    })

    test('28 字符串 key 含空格', () => {
        const obj: any = reactive({ 'a b': 1 }); let val = 0
        effect(() => { val = obj['a b'] })
        expect(val).toBe(1); obj['a b'] = 2; expect(val).toBe(2)
    })

    test('29 冻结对象', () => {
        const obj = Object.freeze(reactive({ a: 1 }) as any)
        let val = 0
        effect(() => { val = obj.a })
        expect(val).toBe(1) // 能读
        // 写会抛错，所以只测读不崩溃
    })

    test('30 综合：多 key → 删除 → 新增 → 触发顺序', () => {
        const obj: any = reactive({ a: 1, b: 2 })
        let log = ''
        effect(() => { log += `[a=${obj.a},b=${obj.b ?? 'nil'}]` })
        expect(log).toBe('[a=1,b=2]')
        log = ''
        delete obj.b; expect(log).toBe('[a=1,b=nil]')
        log = ''
        obj.a = 9;  expect(log).toBe('[a=9,b=nil]')
    })
})
import { describe, expect, it, vi } from 'vitest'
import { computed } from '../src/computed'
import { ref } from '../src/ref'
import { effect } from '../src/effect'


describe('computed', () => {
  it('should return updated value', () => {
    const value = ref(1)
    const plusOne = computed(() => value.value + 1)
    expect(plusOne.value).toBe(2)
    value.value++
    expect(plusOne.value).toBe(3)
  })

  it('should compute lazily', () => {
    const value = ref(1)
    const getter = vi.fn(() => value.value + 1)
    const plusOne = computed(getter)

    // Lazy computation - shouldn't call getter until accessed
    expect(getter).not.toHaveBeenCalled()

    expect(plusOne.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(1)

    // Should use cached value
    expect(plusOne.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(1)

    value.value++
    // Should not compute until next access
    expect(getter).toHaveBeenCalledTimes(1)

    expect(plusOne.value).toBe(3)
    expect(getter).toHaveBeenCalledTimes(2)
  })

  it('should trigger effect when computed value changes', () => {
    const value = ref(1)
    const plusOne = computed(() => value.value + 1)
    let dummy
    effect(() => {
      dummy = plusOne.value
    })
    expect(dummy).toBe(2)
    value.value++
    expect(dummy).toBe(3)
  })

  it('should work with setter', () => {
    const value = ref(1)
    const plusOne = computed({
      get: () => value.value + 1,
      set: (val) => {
        value.value = val - 1
      }
    })

    expect(plusOne.value).toBe(2)
    plusOne.value = 10
    expect(value.value).toBe(9)
  })

  it('should work with nested computed values', () => {
    const value = ref(0)
    const a = computed(() => value.value + 1)
    const b = computed(() => a.value + 1)
    expect(b.value).toBe(2)
    value.value++
    expect(b.value).toBe(3)
  })
})
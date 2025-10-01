export default function patchAttr(el, key, value) {
    value == null ? el.removeAttribute(key) : el.setAttribute(key, value)
}
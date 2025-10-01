export default function patchClass(el, value) {
    value === null ? el.removeAttribute('class') : el.className = value
}
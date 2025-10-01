import pathcEvent from "./modules/patchEvent";
import patchClass from "./modules/patchClass";
import patchStyle from "./modules/patchStyle";
import patchAttr from "./modules/patchAttr";
export default function patchProp(el, key, oldProps, newProps) {
    if(key === 'style'){
        return patchStyle(el,key,oldProps,newProps);
    }
    if(key === 'class'){
        return patchClass(el,newProps);
    }
    if(/^on[^a-z]/.test(key)){
        return pathcEvent(el,key,newProps);
    }
    return patchAttr(el,key,newProps);

}

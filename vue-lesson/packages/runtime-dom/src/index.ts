import {createRenderer} from "@vue/runtime-core";
import {nodeOptions} from './nodeOptions'
import patchProp from "./patchProp";
export const renderOptions = Object.assign({patchProp},nodeOptions)
export const  render = (vnode,container)=>{
    return createRenderer(renderOptions).render(vnode,container)
}
export * from '@vue/runtime-core'

import minimist from 'minimist'
import {resolve,dirname} from 'path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import esbuild from 'esbuild'
import { log } from 'node:console'
const args = minimist(process.argv.slice(2)) // 解析命令行参数
const target = args._[0] || 'reactivity' // 获取第一个参数，默认为 reactivity
const format = args.f || 'iife' // 获取 -f 参数，默认为 iife
const fileName = fileURLToPath(import.meta.url) // 获取当前文件路径
const __dirname = dirname(fileName) // 获取当前文件所在目录
const require = createRequire(import.meta.url) // 创建 require 函数 
const pkg = require(resolve(__dirname,`../packages/${target}/package.json`)) // 读取目标包的 package.json
const entry = resolve(__dirname,`../packages/${target}/src/index.ts`) // 入口文件路径
esbuild.context({
    entryPoints:[entry], // 入口文件
    outfile:resolve(__dirname,`../packages/${target}/dist/${target}.${format}.js`), // 输出文件路径
    bundle:true, // 是否打包依赖
    format,
    globalName:pkg.buildOptions?.name, // 全局变量名称
    sourcemap:true, // 是否生成 source map 文件
    platform:'browser', // 代码运行平台 
}).then(ctx=>{
    console.log('监听中...');
    return ctx.watch();
})


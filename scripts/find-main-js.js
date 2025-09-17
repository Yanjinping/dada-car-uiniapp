// scripts/find-main-js.js
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const SUBPKG_ROOTS = new Set(['pkg-order','pkg-wallet','pkg-benefit','pkg-auth','pkg-biz'])

function walk(dir, acc=[]) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      if (['node_modules','.git','unpackage','dist'].includes(name)) continue
      if (SUBPKG_ROOTS.has(name)) continue
      walk(p, acc)
    } else if (/\.(js|ts|mjs|cjs)$/.test(name)) {
      acc.push(p.replace(ROOT + path.sep,''))
    }
  }
  return acc
}

const mainJs = walk(ROOT)
  .filter(p => !p.startsWith('pkg-'))

console.log('\n仍位于主包根目录的 JS 文件：')
mainJs.forEach(p => console.log(' -', p))
console.log('\n建议：把仅供分包使用的文件移动到对应分包目录。\n')

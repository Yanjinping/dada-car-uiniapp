// node check-big-files.js
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LIMIT_IMG = 200 * 1024;   // 200KB
const LIMIT_ANY = 2 * 1024 * 1024; // 2MB

const IMAGE_EXT = new Set(['.png','.jpg','.jpeg','.webp','.gif','.svg']);
function scan(dir, list=[]) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) scan(p, list);
    else list.push({ p, size: st.size, ext: path.extname(p).toLowerCase() });
  }
  return list;
}
const files = scan(ROOT);
const overAny = files.filter(f => f.size > LIMIT_ANY);
const overImg = files.filter(f => IMAGE_EXT.has(f.ext) && f.size > LIMIT_IMG);

function fmt(n){ return (n/1024).toFixed(1)+'KB'; }

console.log('\n> 超过 2MB 的文件：');
overAny.forEach(f => console.log(fmt(f.size).padStart(10), f.p));

console.log('\n> 图片超过 200KB 的文件：');
overImg.forEach(f => console.log(fmt(f.size).padStart(10), f.p));

console.log('\n共扫描', files.length, '个文件\n');

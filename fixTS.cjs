const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('d:/app/APP/src', filePath => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove unused React imports
  content = content.replace(/import\s+React\s+from\s+['"]react['"];?\n?/, '');
  content = content.replace(/import\s+React,\s*\{/g, 'import {');

  // 2. Fix FormEvent type imports
  content = content.replace(/import\s*\{\s*([^}]*FormEvent[^}]*)\s*\}\s*from\s+['"]react['"];?/g, (match, p1) => {
    if (p1.trim() === 'FormEvent') {
      return `import type { FormEvent } from 'react';`;
    }
    const others = p1.replace('FormEvent', '').replace(/,\s*,/g, ',').trim().replace(/(^,)|(,$)/g, '');
    return `import { ${others} } from 'react';\nimport type { FormEvent } from 'react';`;
  });

  // 3. Fix framer-motion type error in Hero.tsx
  if (filePath.endsWith('Hero.tsx')) {
    // Remove unused useEffect, text1, text2
    content = content.replace(/import\s*\{\s*useEffect\s*\}\s*from\s+['"]react['"];?\n?/, '');
    content = content.replace(/const\s+text1\s*=\s*.*?;\n?/, '');
    content = content.replace(/const\s+text2\s*=\s*.*?;\n?/, '');
    
    // Fix transition type: 'string' error. Framer Motion expects type: "spring" to be typed properly.
    // Let's cast type: "spring" as const or just remove it if it's dynamic and failing.
    // "type: string" is usually because someone did `type: someVariable` or `type: 'spring'` but TS inferred string.
    content = content.replace(/type:\s*['"]spring['"]/g, 'type: "spring" as const');
    content = content.replace(/type:\s*['"]tween['"]/g, 'type: "tween" as const');
    content = content.replace(/type:\s*['"]inertia['"]/g, 'type: "inertia" as const');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  }
});

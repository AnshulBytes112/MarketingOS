const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const dirs = [
  'packages/auth/src',
  'packages/tenant/src',
  'packages/rbac/src',
  'packages/ui/src',
  'packages/database/src'
];

dirs.forEach(dir => {
  const files = walk(dir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let o = c;
    
    // Auth package fixes
    if (dir === 'packages/auth/src') {
      c = c.replace(/from '\.\.\/db\/index'/g, "from '@abge/database'");
      c = c.replace(/from '\.\.\/db\/repository'/g, "from '@abge/tenant'");
      // Because we moved rbac out
      c = c.replace(/from '\.\/rbac'/g, "from '@abge/rbac'");
    }
    
    // Tenant package fixes
    if (dir === 'packages/tenant/src') {
      c = c.replace(/from '\.\/index'/g, "from '@abge/database'");
    }
    
    if (c !== o) {
      fs.writeFileSync(f, c);
      console.log('Fixed imports in:', f);
    }
  });
});

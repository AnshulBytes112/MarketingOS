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

const files = walk('packages/ui/src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let o = c;
  c = c.replace(/from ['"]@\/lib\/utils['"]/g, "from '@abge/ui/lib/utils'");
  c = c.replace(/from ['"]@\/components\/ui\/button['"]/g, "from '@abge/ui/components/ui/button'");
  if (c !== o) {
    fs.writeFileSync(f, c);
    console.log('Fixed', f);
  }
});

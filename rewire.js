const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
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

const dirsToSearch = ['apps/web/src', 'apps/web/tests'];

dirsToSearch.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = walk(dir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  
  files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let original = c;
    
    // UI components
    c = c.replace(/from '@\/components\/ui\/([^']+)'/g, "from '@abge/ui/components/ui/$1'");
    // Utils
    c = c.replace(/from '@\/lib\/utils'/g, "from '@abge/ui/lib/utils'");
    // Database
    c = c.replace(/from '@\/lib\/db'/g, "from '@abge/database'");
    c = c.replace(/from '@\/lib\/db\/index'/g, "from '@abge/database'");
    c = c.replace(/from '\.\.\/\.\.\/src\/lib\/db\/index'/g, "from '@abge/database'");
    // Tenant
    c = c.replace(/from '@\/lib\/db\/repository'/g, "from '@abge/tenant'");
    // RBAC
    c = c.replace(/from '@\/lib\/auth\/rbac'/g, "from '@abge/rbac'");
    c = c.replace(/from '\.\.\/\.\.\/src\/lib\/auth\/rbac'/g, "from '@abge/rbac'");
    // Auth (all other guards/sessions)
    c = c.replace(/from '@\/lib\/auth\/(guard|session|platform-guard|platform-session|totp)'/g, "from '@abge/auth'");
    c = c.replace(/from '\.\.\/\.\.\/src\/lib\/auth\/(guard|session|platform-guard|platform-session|totp)'/g, "from '@abge/auth'");
    
    if (c !== original) {
      fs.writeFileSync(f, c);
      console.log(`Updated imports in ${f}`);
    }
  });
});


const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add test scripts if they don't exist
if (!packageJson.scripts.test) {
  packageJson.scripts.test = 'vitest';
}
if (!packageJson.scripts['test:ui']) {
  packageJson.scripts['test:ui'] = 'vitest --ui';
}
if (!packageJson.scripts['test:coverage']) {
  packageJson.scripts['test:coverage'] = 'vitest --coverage';
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Test scripts added to package.json');

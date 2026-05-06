const fs = require('fs');
const path = require('path');

const IGNORES = new Set([
  'node_modules',
  '.git',
  'dist',
  '.vercel',
  'supabase/.temp',
  'config/skills-lock.json',
  '.agents',
]);

const patterns = [
  { name: 'OpenRouter / OpenAI secret key', regex: /sk-(?:or-v1|live|test|[A-Za-z0-9_-]{24,})/g },
  { name: 'Supabase anon/service key', regex: /sb_(?:publishable|service_role|[A-Za-z0-9_-]{10,})/g },
  { name: 'Supabase URL', regex: /https:\/\/[a-z0-9-]+\.supabase\.co/g },
  { name: 'Firebase API key', regex: /AIza[0-9A-Za-z\-_]{35}/g },
  { name: 'JWT secret or service key name', regex: /(JWT_SECRET|SUPABASE_SERVICE_ROLE_KEY|NEXTAUTH_SECRET|OPENAI_API_KEY|OPENROUTER_API_KEY|STRIPE_SECRET_KEY)/gi },
];

const textFile = (filename) => {
  const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.gz', '.woff', '.woff2', '.ttf'];
  return !binaryExtensions.some((ext) => filename.endsWith(ext));
};

const scanFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex);
    const found = content.match(regex);
    if (found) {
      for (const match of found) {
        matches.push({ pattern: pattern.name, match });
      }
    }
  }

  if (matches.length > 0) {
    console.log(`\n[SECRET SCAN] ${filePath}`);
    for (const item of matches) {
      console.log(`  - ${item.pattern}: ${item.match}`);
    }
  }

  return matches.length > 0;
};

const scanDirectory = (dirPath) => {
  let found = false;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const name = entry.name;
    const relativePath = path.relative(process.cwd(), path.join(dirPath, name));
    if (IGNORES.has(relativePath) || IGNORES.has(name)) continue;

    if (entry.isDirectory()) {
      found = scanDirectory(path.join(dirPath, name)) || found;
    } else if (entry.isFile() && textFile(name)) {
      found = scanFile(path.join(dirPath, name)) || found;
    }
  }
  return found;
};

const root = process.cwd();
const hasFindings = scanDirectory(root);

if (hasFindings) {
  console.error('\nSecret scan found potential sensitive values. Remove or relocate them to ignored environment files before committing.');
  process.exit(1);
}

console.log('\nSecret scan passed. No obvious secrets found in scanned files.');

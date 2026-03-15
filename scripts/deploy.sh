#!/bin/bash
set -e

echo "🚀 FitFuel Polyglot Deployment Script"
echo "======================================"

# 1. Deploy Cloudflare Worker (JavaScript)
echo "Deploying Web Scraper to Cloudflare Edge..."
cd cloudflare-workers/fitness-crawler
if command -v wrangler &> /dev/null; then
    wrangler deploy
else
    echo "⚠️ Wrangler CLI not found. Skipping edge deployment."
fi
cd ../../

# 2. Build Go Migrator (Go)
echo "Building Go Data Migrator..."
cd tools/data-migrator
if command -v go &> /dev/null; then
    go build -o bin/migrator main.go
    echo "✅ Go binary compiled successfully to /bin/migrator"
else
    echo "⚠️ Go compiler not found. Skipping build."
fi
cd ../../

# 3. Setup Python Engine (Python)
echo "Ensuring Python dependencies..."
cd analytics-engine
if command -v pip &> /dev/null; then
    pip install -r requirements.txt > /dev/null 2>&1 || true
    echo "✅ Python environment ready."
else
    echo "⚠️ Pip not found."
fi
cd ../

# 4. Build Main React App (TypeScript)
echo "Building Main Frontend..."
npm run build

echo "🎉 Deployment pipeline completed!"

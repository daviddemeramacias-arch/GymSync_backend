#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
[ -f .env ] || cp .env.example .env
echo "[1/3] Installing dependencies..."
npm install
echo "[2/3] Building TypeScript..."
npm run build
echo "[3/3] Starting server..."
node dist/main.js
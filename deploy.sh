#!/bin/bash

SERVER_ALIAS="tandur"
SERVER_ADMIN_PATH="/home/deploy/admin-panel"
BACKEND_PATH="/home/deploy/app"

echo "📦 Building..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting."
  exit 1
fi

echo "📤 Uploading to server..."
scp -r out/* $SERVER_ALIAS:$SERVER_ADMIN_PATH/

echo "🔁 Restarting Nginx..."
ssh $SERVER_ALIAS "cd $BACKEND_PATH && docker compose restart nginx"

echo "✅ Done!"
echo "   Open: http://178.104.44.54"

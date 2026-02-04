#!/bin/bash
# Deploy to Vercel and update both aliases

echo "🚀 Deploying to Vercel..."
DEPLOY_URL=$(npx vercel --prod --force 2>&1 | grep -o 'https://[^[:space:]]*\.vercel\.app' | tail -1)

if [ -n "$DEPLOY_URL" ]; then
  echo "✅ Deployed: $DEPLOY_URL"

  echo "🔗 Updating flowstate-swl.vercel.app alias..."
  npx vercel alias "$DEPLOY_URL" flowstate-swl.vercel.app

  echo "✅ Done! Live at:"
  echo "   - https://swl-flowstate.vercel.app"
  echo "   - https://flowstate-swl.vercel.app"
else
  echo "❌ Deployment failed"
  exit 1
fi

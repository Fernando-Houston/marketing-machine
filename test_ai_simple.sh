#!/bin/bash

echo "🚀 Testing Houston Marketing Machine AI..."
echo "📡 Sending test request to API..."

response=$(curl -s -X POST http://localhost:3000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Houston Heights real estate investment",
    "contentType": "market_update", 
    "platform": "instagram"
  }' 2>&1)

if [ $? -eq 0 ]; then
  echo "✅ API Response received!"
  echo "$response" | jq . || echo "$response"
else
  echo "❌ API call failed: $response"
  echo "Trying basic connection test..."
  curl -v http://localhost:3000 2>&1 | head -10
fi

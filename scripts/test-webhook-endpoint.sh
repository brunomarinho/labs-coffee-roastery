#!/bin/bash

# Test if webhook endpoint is accessible
echo "Testing webhook endpoint accessibility..."
echo ""

# Test 1: Basic GET request (should return 405 Method Not Allowed)
echo "Test 1: GET request (expecting 405):"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://mamelucacafe.com.br/api/webhooks/stripe
echo ""

# Test 2: POST request without signature (should return 400)
echo "Test 2: POST without signature (expecting 400):"
curl -s -X POST https://mamelucacafe.com.br/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# Test 3: Check if endpoint exists
echo "Test 3: HEAD request to check endpoint exists:"
curl -s -I https://mamelucacafe.com.br/api/webhooks/stripe | head -n 3
echo ""

echo "If you see 404 errors above, the webhook endpoint is not deployed correctly."
echo "If you see 405 or 400 errors, the endpoint exists and is working."
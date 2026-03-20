#!/bin/bash

# Prompt for base URL with default
read -p "Base URL [https://etlstats.stiba.lol]: " baseUrl
baseUrl=${baseUrl:-https://etlstats.stiba.lol}

# Prompt for purge token (hidden input)
read -s -p "Purge token: " purgeToken
echo

# Make the request
echo "Nuking cache..."
response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: Bearer ${purgeToken}" \
  "${baseUrl}/cache/nuke")

# Extract status code and body
httpCode=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

# Show result
if [ "$httpCode" = "200" ]; then
  echo "Success! Response:"
  echo "$body"
else
  echo "Failed with HTTP $httpCode"
  echo "$body"
  exit 1
fi

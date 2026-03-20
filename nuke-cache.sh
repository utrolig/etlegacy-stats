#!/bin/sh

# Prompt for base URL with default
printf "Base URL [https://etlstats.stiba.lol]: "
read -r baseUrl
baseUrl=${baseUrl:-https://etlstats.stiba.lol}

# Prompt for purge token (visible input, portable)
printf "Purge token: "
read -r purgeToken

# Make the request
printf "Nuking cache...\n"
response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: Bearer ${purgeToken}" \
  "${baseUrl}/cache/nuke")

# Extract status code and body
httpCode=$(printf '%s' "$response" | tail -n1)
body=$(printf '%s' "$response" | sed '$d')

# Show result
if [ "$httpCode" = "200" ]; then
  printf "Success! Response:\n"
  printf '%s\n' "$body"
else
  printf "Failed with HTTP %s\n" "$httpCode"
  printf '%s\n' "$body"
  exit 1
fi

#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
ASTRO_ENV_FILE="${SCRIPT_DIR}/../astro-server/.env"

if [ -f "${ASTRO_ENV_FILE}" ]; then
  # shellcheck disable=SC1090
  . "${ASTRO_ENV_FILE}"
fi

BASE_URL="${BASE_URL:-http://localhost:8080}"
PURGE_TOKEN="${PURGE_TOKEN:-${CACHE_PURGE_TOKEN:-}}"
PURGE_ENDPOINT="${BASE_URL%/}/cache"

if [ -z "${PURGE_TOKEN}" ]; then
  printf 'PURGE_TOKEN/CACHE_PURGE_TOKEN is not set.\n' >&2
  exit 1
fi

purge_root() {
  curl -fsS \
    -X DELETE \
    -H "Authorization: Bearer ${PURGE_TOKEN}" \
    "${PURGE_ENDPOINT}/"
  printf '\n'
}

purge_match() {
  match_id="$1"

  curl -fsS \
    -X DELETE \
    -H "Authorization: Bearer ${PURGE_TOKEN}" \
    "${PURGE_ENDPOINT}/${match_id}"
  printf '\n'
}

printf 'Select purge action:\n'
printf '1) Purge root /\n'
printf '2) Purge specific match\n'
printf '> '
read -r selection

case "${selection}" in
  1)
    purge_root
    ;;
  2)
    printf 'Enter match id: '
    read -r match_id

    if [ -z "${match_id}" ]; then
      printf 'Match id cannot be empty.\n' >&2
      exit 1
    fi

    purge_match "${match_id}"
    purge_root
    ;;
  *)
    printf 'Invalid selection.\n' >&2
    exit 1
    ;;
esac

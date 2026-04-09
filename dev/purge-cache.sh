#!/bin/sh
set -eu

# VARNISH_URL should point at the Varnish container (default: localhost:80)
VARNISH_URL="${VARNISH_URL:-http://localhost:80}"

if [ -z "${PURGE_TOKEN:-}" ]; then
  printf 'PURGE_TOKEN is not set.\n' >&2
  exit 1
fi

purge_root() {
  curl -fsS -X PURGE \
    -H "Authorization: Bearer ${PURGE_TOKEN}" \
    "${VARNISH_URL}/"
  printf '\n'
}

purge_match() {
  match_id="$1"
  curl -fsS -X PURGE \
    -H "Authorization: Bearer ${PURGE_TOKEN}" \
    "${VARNISH_URL}/matches/${match_id}"
  printf '\n'
  purge_root
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
    ;;
  *)
    printf 'Invalid selection.\n' >&2
    exit 1
    ;;
esac

#!/bin/sh
# Polls GitHub every 5 minutes; exits (and prints) as soon as a branch has a « Statut : PRÊT » hand-off.
cd "$(dirname "$0")/../.." || exit 1
while true; do
  out=$(sh docs/handoff/check.sh | grep 'compte rendu : docs/')
  [ -n "$out" ] && { echo "PRÊT :"; echo "$out"; exit 0; }
  sleep 300
done

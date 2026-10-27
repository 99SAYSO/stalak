#!/bin/sh
# Lists the GitHub branches whose hand-off says « Statut : PRÊT » and that are not merged into main yet (used by the Chef de projet).
cd "$(dirname "$0")/../.." || exit 1
git fetch -q origin '+refs/heads/*:refs/remotes/origin/*' 2>/dev/null
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin | grep -v -e '^origin/main$' -e '^origin/HEAD$' -e '^origin$'); do
  ahead=$(git rev-list --count origin/main.."$b" 2>/dev/null)
  [ "$ahead" = "0" ] && continue
  f=$(git diff --name-only origin/main..."$b" -- docs/handoff 2>/dev/null | grep -v README | grep '\.md$' | while read p; do git show "$b:$p" | LC_ALL=C grep -qiE 'Statut *: *PR.{1,2}T' && echo "$p"; done | head -1)
  echo "${b#origin/} | ${ahead} commit(s) en avance | compte rendu : ${f:-aucun (pas encore prêt)}"
done

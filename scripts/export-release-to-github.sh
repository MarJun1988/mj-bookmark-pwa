#!/usr/bin/env bash
set -e

TAG="$CI_COMMIT_TAG"
[ -z "$TAG" ] && echo "No tag, exit" && exit 0

PRIVATE_REPO_DIR="$CI_PROJECT_DIR"
WORKDIR="/tmp/github-release"
GITHUB_REPO="git@github.com:MarJun1988/mj-bookmark-pwa.git"

rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"

cd "$WORKDIR"
git init
git config user.name "CI Release Bot"
git config user.email "ci@mj-bookmark-pwa.local"
git remote add origin "$GITHUB_REPO"

cd "$PRIVATE_REPO_DIR"
git fetch --tags --force
git checkout "$TAG"

rsync -a --delete \
  --exclude ".git" \
  --exclude ".gitlab" \
  --exclude ".gitlab-ci.yml" \
  --exclude "node_modules" \
  --include ".env.example" \
  --exclude ".env*" \
  ./ "$WORKDIR/"

cd "$WORKDIR"
git add .
git commit -m "Release $TAG"
git branch -M main
git tag -f "$TAG"

git push origin main --force --tags

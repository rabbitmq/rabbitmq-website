#!/bin/bash -e
# git status
# sleep 5
commit_message="$1"
git pull
git add . -A
git commit -m "$commit_message"
git push
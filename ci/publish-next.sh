#!/bin/sh

set -ex

cd rabbitmq-website
COMMIT_MESSAGE="$(git log -1 --pretty=%B)"
echo $COMMIT_MESSAGE

cd ../rabbitmq-website-next

mkdir -p docs
mv docs/CNAME ./CNAME
rm -rf docs/*

mv ./CNAME docs/CNAME
touch docs/.nojekyll

cp -r ../generated/* docs/

if [ -z "$(git status --porcelain)" ];
then
    echo "Nothing to commit"
else
    git config user.name "rabbitmq-ci"
    git config user.email "rabbitmq-ci@users.noreply.github.com"
    git add docs
    git commit -m "$COMMIT_MESSAGE"
    git push origin
fi

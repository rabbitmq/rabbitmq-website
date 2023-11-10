#!/bin/sh

set -ex

MESSAGE=$(git log -1 --pretty=%B)

cd ../rabbitmq-website-next

mkdir -p docs
mv docs/CNAME ./CNAME
rm -rf docs/*

mv ./CNAME docs/CNAME
touch docs/.nojekyll

cp -r rabbitmq-website/generated/* docs/

if [ -z "$(git status --porcelain)" ];
then
    echo "Nothing to commit"
else
    git config user.email "$RABBITMQ_CI_EMAIL"
    git config user.name "$RABBITMQ_CI_USERNAME"

    git add docs
    git commit -m "$MESSAGE"
    git push origin
fi

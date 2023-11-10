#!/bin/sh

set -ex

echo $PWD

git config user.email "rabbitmq-ci"
git config user.name "rabbitmq-ci@users.noreply.github.com"


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
    git config user.email "rabbitmq-ci"
    git config user.name "rabbitmq-ci@users.noreply.github.com"

    git add docs
    git commit -m "$MESSAGE"
    git push origin
fi

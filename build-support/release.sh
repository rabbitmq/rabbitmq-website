#!/bin/sh

if [ -n "`hg status`" ]
then
    echo >&2 "Changes detected... aborting release";
    echo >&2 "Please record the changes below and try again:"
    hg status >&2
    exit 1
else
    echo Enter details of new tag:
    read TAGNAME
    hg tag "$TAGNAME"
    echo
    echo "Don't forget to push the new tag upstream!"
fi

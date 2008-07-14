#!/bin/sh

if CHANGES=`darcs whatsnew --look-for-adds`
then
    echo >&2 "Changed detected... aborting release";
    echo >&2 "Please record the changes below and try again:"
    echo >&2 $CHANGES
    exit 1
else
    echo Last version was `darcs changes | grep tagged | head -1`
    echo Enter details of new tag:
    darcs tag -i
    darcs push
fi

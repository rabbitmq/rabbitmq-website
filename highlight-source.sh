#!/bin/sh
enscript -o - -Ejava -w html "$@" | perl -pe 's:(</?[A-Z]+):lc($1):eg'

#!/bin/sh

set -e

if test $# -ne 1; then
	echo "Usage: $(basename "$0") <rabbitmq-server>"
	exit 1
fi

umbrella="$1"

if test -z "$MAKE"; then
	if command -v gmake; then
		MAKE=gmake
	else
		MAKE=make
	fi
fi

rabbit="$umbrella/deps/rabbit"
$MAKE -C "$rabbit" web-manpages
			
srcdir="$rabbit/docs"
destdir=$(dirname "$0")

for src in "$srcdir"/*.html; do
	name=$(basename "$src" .html)
	dest="$destdir/$name.md"
	echo "src=$src" "dest=$dest" "name=$name"

	cat <<EOF > "$dest"
---
title: $name
---
EOF

	tidy5 -qi --wrap 0 \
		--asxhtml \
		--show-body-only yes \
		--drop-empty-elements yes \
		--drop-empty-paras yes \
		--enclose-block-text yes \
		--enclose-text yes "$src" \
		| \
	awk '
	/<h[1-6]/ {
		if ($0 ~ /<h1/) {
			level = "#";
		} else if ($0 ~ /<h2/) {
			level = "##";
		} else if ($0 ~ /<h2/) {
			level = "##";
		} else if ($0 ~ /<h3/) {
			level = "###";
		} else if ($0 ~ /<h4/) {
			level = "####";
		} else if ($0 ~ /<h5/) {
			level = "#####";
		} else if ($0 ~ /<h6/) {
			level = "######";
		}

		id = $0;
		sub(/.*(id|name)="/, "", id);
		sub(/".*/, "", id);

		title = $0;
		sub(/ *<\/.*/, "", title);
		sub(/.*> */, "", title);

		print level, title, "{#" id "}";
		next;
	}
	/dt id="/ {
		id = $0;
		sub(/.*(id|name)="/, "", id);
		sub(/".*/, "", id);

		line = $0;
		sub(/id="[^"]*"/, "", line);
		print line;

		next;
	}
	/a class="permalink"/ {
		title = $0;
		sub(/ *<a [^>]*>/, "", title);
		sub(/<\/a>/, "", title);
		sub(/<br[^>]*>/, "", title);
		gsub(/>\*</, ">\\&ast;<", title);

		print level "#", title, "{#" id "}";
		next;
	}
	{
		line = $0;
		gsub(/{/, "\\&lcub;", line);
		gsub(/<li>/, "<li>\n", line);
		gsub(/<\/li>/, "\n</li>", line);
		gsub(/<\/ul>/, "</ul>\n", line);
		gsub(/<br[^>]*>/, "<br/>", line);
		gsub(/<\/div>]/, "</div>\n]", line);
		gsub(/style="[^"]*"/, "", line);
		print line;
		next;
	}
	' > "$dest"
done

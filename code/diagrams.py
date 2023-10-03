#!/usr/bin/env python
HELP = """
The Magical Diagram Pre-Processing Script

Usage %(name)s <src file> [png dir] [temporary dir]

This script pre-processes given src file, looks for a magical block
using mighty regular expression. It generates a shiny 'dot' diagram
for every matching <div> block.

Sample usage:
%(name)s site/tutorial-one-python.md

This script catches blocks like that:

<div class="diagram">
  <img src="/img/tutorials/abc.png" height="59" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      X [label="X", fillcolor="#3333CC"];
      Q1 [label="{||||}", fillcolor="red", shape="record"];
      C1 [label="C", fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      // (empty lines forbidden due to broken md parser)
      P1 -&gt; X -&gt; Q1 -&gt; C1;
      Q1 -&gt; C2;
    }
  </div>
</div>
"""

import hashlib
import os
import sys
import re


regexp = re.compile(
    """
<div\s*class="diagram"\s*>
\s*
<img\s*src="(?P<src>[^"]*)"\s*height="(?P<height>[0-9]*)"\s*/>
\s*
<div\s*class="diagram_source"\s*>
\s*
(?P<dot>.*?)   # The question mark stands for non greedy.
\s*
</div>
\s*
</div>
""",
    re.MULTILINE | re.DOTALL | re.VERBOSE,
)


def extract(data):
    return [m.groupdict() for m in regexp.finditer(data)]


def main(src_file, img_dir, tmp_dir):
    diagrams = extract(file(src_file, "r").read())

    for diagram in diagrams:
        png_filename = os.path.split(diagram["src"])[1]
        png = os.path.join(img_dir, png_filename)
        dot = os.path.join(tmp_dir, png_filename + ".dot")

        data = "# height %s\n%s" % (
            diagram["height"],
            diagram["dot"].replace("&gt;", ">").replace("&lt;", "<"),
        )

        if os.path.exists(dot) and os.path.exists(png):
            if (
                hashlib.md5(file(dot, "r").read()).hexdigest()
                == hashlib.md5(data).hexdigest()
            ):
                continue

        if os.path.exists(png):
            os.remove(png)
        file(dot, "w").write(data)

        cmd = """dot -Gsize="10,%.3f" -Tpng -o%s %s""" % (
            int(diagram["height"]) / 96.0,
            png,
            dot,
        )
        print(cmd)
        os.system(cmd)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(HELP % {"name": sys.argv[0]})
        sys.exit()
    src_file = sys.argv[1]
    img_dir = sys.argv[2] if len(sys.argv) > 2 else "site/img/tutorials"
    tmp_dir = sys.argv[3] if len(sys.argv) > 3 else "/tmp"

    main(src_file, img_dir, tmp_dir)

from lxml import etree
import re
import os
import os.path
import markdown
import sys
import importlib
import tempfile

importlib.reload(sys)

try:
    from mod_python import apache
except ImportError:

    class StubApache:
        def __init__(self):
            self.HTTP_NOT_FOUND = 404
            self.HTTP_INTERNAL_SERVER_ERROR = 500
            self.OK = 0

    apache = StubApache()

SITE_DIR = "define_me_before_use"

DEBUG_FILE_PATH = os.path.join(
    tempfile.gettempdir(), "rabbitmq_site_last_rendered_page"
)


def preprocess_markdown(fpath):
    contents = open(fpath, encoding="utf-8").read()

    # Markdown will treat the whole file as markdown, whereas
    # we want to only transform the body text.

    title = re.search("^#\\s*(\\s.*\\s)\\s*$", contents, re.M)
    if title is None:
        title = "(Untitled)"
    else:
        contents = contents[0 : title.start()] + contents[title.end() :]
        title = title.group(1)

    entities = open(os.path.join(SITE_DIR, "rabbit.ent"), encoding="utf-8").read()
    entities = "\n".join(entities.split("\n")[1:])

    nosyntax = re.search("NOSYNTAX", title)
    if nosyntax:
        title = re.sub("NOSYNTAX", "", title)

    suppressRHS = re.search("SUPPRESS-RHS", title)
    if suppressRHS:
        title = re.sub("SUPPRESS-RHS", "", title)

    pre = (
        """<?xml-stylesheet type="text/xml" href="page.xsl"?>
<!DOCTYPE html [
%s
<!ENTITY nbsp "&#160;">
]>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:xi="http://www.w3.org/2003/XInclude">"""
        % entities
    )

    head = """<head><title>%s</title></head>
  <body%s>
""" % (
        title,
        suppressRHS and ' suppress-rhs="true"' or "",
    )

    post = """</body>
</html>
"""
    if nosyntax:
        extensionsArg = ["tables"]
        extensionsConfigArg = {}
    else:
        extensionsArg = ["codehilite", "tables"]
        extensionsConfigArg = {"codehilite": {"css_class": "highlight"}}

    processed = markdown.markdown(
        contents, extensions=extensionsArg, extension_configs=extensionsConfigArg
    )

    # Unfortunately we can't stop markdown escaping entities. Unescape them.
    processed = re.sub(r"&amp;([a-z0-9-_.:]+);", r"&\1;", processed)

    tutorial = re.search(r"tutorials/(tutorial-[a-z]*)-[a-z]*(-[a-z]*)?.md$", fpath)
    if tutorial is not None:
        tutorial_head = """<div id="left-content" class="tutorial">"""
        tutorial_foot = """
   <xi:include href="site/tutorials/disclaimer.xml.inc"/>
   <xi:include href="site/tutorials/getting_help.xml.inc"/>
   <xi:include href="site/tutorials/contribute.xml.inc"/>
</div>
<div id="right-nav" class="{0}">
   <xi:include href="site/tutorials/tutorials-menu.xml.inc"/>
</div>""".format(
            tutorial.group(1)
        )
        processed = tutorial_head + processed + tutorial_foot

    utf8_parser = etree.XMLParser(encoding="utf-8")
    s = (pre + head + processed + post).encode("utf-8")
    try:
        return etree.fromstring(s, parser=utf8_parser).getroottree()
    except Exception as e:
        print(
            "\n\nFailed to render file {0} due to an exception. Problematic line(s) below.".format(
                fpath
            )
        )
        all_lines = s.splitlines()
        m = re.search(re.compile("line\\s(\\d+)"), e.msg)
        n = int(m[1])
        relevant_lines = all_lines[n - 5 : n + 5]
        print("\n\n")
        for l in relevant_lines:
            print(l.decode("utf-8"))
        print("\n\n")
        write_to_debug_file(DEBUG_FILE_PATH, s)
        print("See {0} for a complete rendered file".format(DEBUG_FILE_PATH))
        print("\n\n")
        raise e


def write_to_debug_file(path, contents):
    f = open(path, "w+b")
    f.truncate(0)
    f.write(contents)
    f.close()


def parse(fpath):
    class MissingFeedResolver(etree.Resolver):
        def resolve(self, url, id, context):
            if "://" not in url and not os.path.exists(url):
                print("Ignoring missing file {}".format(url))
                return self.resolve_empty(context)
            return None  # Defer to other resolvers

    # TODO cache the blog feed and revert to no_network = True
    parser = etree.XMLParser(ns_clean=True, no_network=False)
    parser.resolvers.add(MissingFeedResolver())
    try:
        return etree.parse(fpath, parser)
    except Exception as e:
        print("\n\nException rendering {0}".format(fpath))
        raise e


MARKUPS = {".xml": parse, ".md": preprocess_markdown}


class Error404(Exception):
    pass


class Error500(Exception):
    pass


def render_page(page_name, site_mode, version=None):
    """
    look for the xml file with this name. if found,
    look inside the xml file for a stylesheet processing
    instruction, apply the transformation and return the
    transformed document.
    """

    # Simple security check to prevent walking the filesystem
    if page_name.find("../") != -1:
        raise Error404

    match = re.match("/(.*?)(\\.html)?$", page_name)
    if match:
        page_name = match.group(1)
        page_id = match.group(1)
    else:
        raise Error404

    if page_name == "":
        page_name = "index"

    xml_doc = read_file(page_name)
    xml_doc.xinclude()
    query = "/processing-instruction('xml-stylesheet')"
    xslt_file_name = xml_doc.xpath(query)[0].get("href")
    xslt_doc = parse(os.path.join(SITE_DIR, xslt_file_name))
    params = {
        "page-name": "'/%s.html'" % page_name,
        "site-mode": "'%s'" % site_mode,
        "page-id": "'%s'" % page_id,
    }
    transform = etree.XSLT(xslt_doc)
    xhtml_doc = transform(xml_doc, **params)
    if version:
        xslt_rebase = parse(os.path.join(SITE_DIR, "rebase.xsl"))
        param = {"link-prefix": "'%s'" % version}
        transform = etree.XSLT(xslt_rebase)
        result = transform(xhtml_doc, **param)
    else:
        result = xhtml_doc
    return str(result)


def read_file(page_name):
    for ext in MARKUPS:
        preprocess = MARKUPS[ext]
        file_name = page_name + ext
        fpath = os.path.join(SITE_DIR, file_name)
        if os.path.exists(fpath):
            return preprocess(fpath)
    raise Error404(page_name)


def handler(req, site_mode):
    req.content_type = "text/html; charset=utf-8"

    uri = getattr(req, "path", req.uri)

    try:
        req.write(render_page(uri, site_mode))

    except Error404:
        req.status = apache.HTTP_NOT_FOUND
        req.write(render_page("/404", site_mode))
    except Error500:
        req.status = apache.HTTP_INTERNAL_SERVER_ERROR
        req.write(render_page("/500", site_mode))

    return apache.OK

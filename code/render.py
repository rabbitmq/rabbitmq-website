import libxml2
import libxslt
import re
import os
import markdown

try:
    from mod_python import apache
except ImportError:
    class StubApache:
        def __init__(self):
            self.HTTP_NOT_FOUND = 404
            self.HTTP_INTERNAL_SERVER_ERROR = 500
            self.OK = 0
    apache = StubApache()

SITE_DIR='/srv/www.rabbitmq.com/site/'

def preprocess_markdown(fpath):
    contents = open(fpath).read()

    ## Markdown will treat the whole file as markdown, whereas
    ## we want to only transform the body text.

    title = re.search("^#\s*(\S.*\S)\s*$", contents, re.M)
    contents = contents[0:title.start()] + contents[title.end():]

    entities = open(os.path.join(SITE_DIR, 'rabbit.ent')).read()
    entities = '\n'.join(entities.split('\n')[1:])

    pre = """<?xml-stylesheet type="text/xml" href="page.xsl"?>
<!DOCTYPE html PUBLIC "bug in xslt processor requires fake doctype"
"otherwise css isn't included" [
%s
]>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:xi="http://www.w3.org/2003/XInclude">""" % entities

    head = """<head>
    <title>%s</title>
  </head>
  <body>
""" % (title.group(1),)

    post = """</body>
</html>
"""
    processed = markdown.markdown(contents, ["codehilite(css_class=highlight)"])
    # Unfortunately we can't stop markdown escaping entities. Unescape them.
    processed = re.sub(r'&amp;([a-z-]+);', r'&\1;', processed)

    whole = pre + head + processed + post
    return libxml2.createMemoryParserCtxt(whole, len(whole))

MARKUPS=[
    ('.xml', libxml2.createFileParserCtxt),
    ('.md', preprocess_markdown)
]

class Error404(Exception):
    pass

class Error500(Exception):
    pass

def render_page(page_name):
    """
    look for the xml file with this name. if found,
    look inside the xml file for a stylesheet processing
    instruction, apply the transformation and return the
    transformed document.
    """

    # Simple security check to prevent walking the filesystem
    if page_name.find("../") != -1:
        raise Error404

    match = re.match('/(.*?)(\.html)?$', page_name)
    if match:
        page_name = match.group(1)
    else:
        raise Error404

    if page_name == '':
        page_name = 'index'

    xml_doc = find_parse_file(page_name)

    for child in xml_doc.children:
        if child.name == 'xml-stylesheet':
            match = re.compile('.*href="(.*)"').match(child.getContent())
            if match:
                xslt_file_name = match.group(1)
                xslt_doc = libxml2.parseFile(os.path.join(SITE_DIR, xslt_file_name))
                xslt_trans = libxslt.parseStylesheetDoc(xslt_doc)
                html_doc = xslt_trans.applyStylesheet(xml_doc, {'page_name': "'%s'" % page_name})                
                result = xslt_trans.saveResultToString(html_doc)
                return result
    raise Error500

def create_xml_context(page_name):
    for (ext, ctxt_maker) in MARKUPS:
        file_name = page_name + ext
        fpath = os.path.join(SITE_DIR, file_name)
        if os.path.exists(fpath):
            return (fpath, ctxt_maker(fpath))
    raise Error404, page_name

def find_parse_file(page_name):
    (path, xml_ctxt) = create_xml_context(page_name)
    xml_ctxt.ctxtUseOptions(libxml2.XML_PARSE_NOENT)
    xml_ctxt.parseDocument()
    xml_doc = xml_ctxt.doc()
    xml_doc.setBase(path)
    xml_doc.xincludeProcess()
    return xml_doc

def handler(req):
    req.content_type = "text/html; charset=utf-8"

    uri = getattr(req, "path", req.uri)

    try:
        req.write(render_page(uri))

    except Error404:
        req.status = apache.HTTP_NOT_FOUND
        req.write(render_page('/404'))
    except Error500:
        req.status = apache.HTTP_INTERNAL_SERVER_ERROR
        req.write(render_page('/500'))

    return apache.OK

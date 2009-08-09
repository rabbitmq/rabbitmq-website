
import libxml2
import libxslt
import re
import os

from mod_python import apache

SITE_DIR='/srv/www.rabbitmq.com/site/'

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

    xml_file_name = page_name + '.xml'
    fpath = os.path.join(SITE_DIR, xml_file_name)

    if not os.path.exists(fpath):
        raise Error404, page_name

    xml_doc = libxml2.parseFile(fpath)
    for child in xml_doc.children:
        if child.name == 'xml-stylesheet':
            match = re.compile('.*href="(.*)"').match(child.getContent())
            if match:
                xslt_file_name = match.group(1)
                xslt_doc = libxml2.parseFile(os.path.join(SITE_DIR, xslt_file_name))
                xslt_trans = libxslt.parseStylesheetDoc(xslt_doc)
                html_doc = xslt_trans.applyStylesheet(xml_doc, {'page_name': "'%s'" % page_name})               
                result = html_doc.serialize(None,  1)
                return result
    raise Error500


def handler(req):
    req.content_type = "text/html"
    try:
        req.write(render_page(req.uri))
    except Error404:
        req.status = apache.HTTP_NOT_FOUND
        req.write(render_page('/404'))
    except Error500:
        req.status = apache.HTTP_INTERNAL_SERVER_ERROR
        req.write(render_page('/500'))

    return apache.OK


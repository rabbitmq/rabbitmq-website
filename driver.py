#!/usr/bin/env python

import BaseHTTPServer
import SimpleHTTPServer
import StringIO
import os

import sys
sys.path.insert(0, 'code')
import xsl ## from the ./code/ subdirectory
xsl.SITE_DIR = './site/'

class StubReq:
    def __init__(self, uri):
        self.uri = uri
        self.wfile = StringIO.StringIO()
        self.content_type = None
        self.status = 200

    def write(self, s):
        self.wfile.write(s)

class ReqHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_POST(self):
        self.do_GET()
    def do_GET(self):
        lowerpath = self.path.lower()
        if lowerpath.endswith('/') or \
                lowerpath.endswith('.xml') or \
                lowerpath.endswith('.html') or \
                lowerpath.endswith('.xsl'):
            p = self.path
            if p[-1] == '/':
                p = p + 'index.html'
            r = StubReq(p)
            xsl.handler(r)
            self.send_response(r.status)
            self.send_header("Content-type", r.content_type)
            self.end_headers()
            self.wfile.write(r.wfile.getvalue())
        else:
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

    def translate_path(self, path):
        if path[0] == '/':
            path = path[1:]
        result = os.path.join(xsl.SITE_DIR, path)
        return result

if __name__ == '__main__':
    addr = ('0.0.0.0', 8191)
    httpd = BaseHTTPServer.HTTPServer(addr, ReqHandler)
    print 'Serving on', addr
    httpd.serve_forever()

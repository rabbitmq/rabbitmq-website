#!/usr/bin/env python

import BaseHTTPServer
import SimpleHTTPServer
import StringIO
import os

import sys
sys.path.insert(0, 'code')
import render ## from the ./code/ subdirectory
render.SITE_DIR = './site/'
global site_mode
site_mode = 'www'

class StubReq:
    def __init__(self, uri, queryPos):
        self.uri = uri
        if queryPos == -1:
            self.path = uri
        else:
            self.path = uri[:queryPos]
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
        queryPos = self.path.find("?")
        if queryPos != -1:
            lowerpath = lowerpath[:queryPos]
        if lowerpath.endswith('/') or \
                lowerpath.endswith('.xml') or \
                lowerpath.endswith('.html') or \
                lowerpath.endswith('.xsl'):
            p = self.path
            if p[-1] == '/':
                p = p + 'index.html'
            r = StubReq(p, queryPos)
            render.handler(r, site_mode)
            self.send_response(r.status)
            self.send_header("Content-type", r.content_type)
            self.end_headers()
            self.wfile.write(r.wfile.getvalue())
        else:
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

    def translate_path(self, path):
        if path[0] == '/':
            path = path[1:]
        result = os.path.join(render.SITE_DIR, path)
        return result

if __name__ == '__main__':
    if len(sys.argv) > 1:
        site_mode = sys.argv[1]
    addr = ('0.0.0.0', 8191)
    httpd = BaseHTTPServer.HTTPServer(addr, ReqHandler)
    print 'Serving on', addr
    httpd.serve_forever()

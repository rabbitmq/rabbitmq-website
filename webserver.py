#!/usr/bin/env python
#source: http://fragments.turtlemeat.com/pythonwebserver.php
# Copyright Jon Berg , turtlemeat.com


import os
import sys
import mimetypes
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

def generate_handler(webdir):
    class MyHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            try:
                fullpath = os.path.join(webdir, os.path.normpath(os.path.join('/',self.path))[1:])
                f = open(fullpath)
                self.send_response(200)
                self.send_header('Content-type', mimetypes.guess_type(self.path))
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
            except IOError:
                self.send_error(404,'File Not Found: %s' % self.path)
    return MyHandler

PORT=7777
HOST="127.0.0.1"

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "Usage: %s [http_directory]"
        sys.exit(1)
    webdir=os.path.normpath(sys.argv[1])
    try:
        server = HTTPServer((HOST, PORT), generate_handler(webdir))
        print "Listening on %s:%s, serving data from %r" % (HOST, PORT, webdir)
        server.serve_forever()
    except KeyboardInterrupt:
        server.socket.close()


#!/usr/bin/env python3

import socketserver
import http.server
import io
import os
import sys

sys.path.insert(0, "code")
# see ./code
import render

render.SITE_DIR = "./site/"
global site_mode
site_mode = "www"


class StubReq:
    def __init__(self, uri, queryPos):
        self.uri = uri
        if queryPos == -1:
            self.path = uri
        else:
            self.path = uri[:queryPos]
        self.wfile = io.StringIO()
        self.content_type = None
        self.status = 200

    def write(self, s):
        self.wfile.write(s)


class ReqHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        self.do_GET()

    def do_GET(self):
        lowerpath = self.path.lower()
        queryPos = self.path.find("?")
        if queryPos != -1:
            lowerpath = lowerpath[:queryPos]
        if (
            lowerpath.endswith("/")
            or lowerpath.endswith(".xml")
            or lowerpath.endswith(".html")
            or lowerpath.endswith(".xsl")
        ):
            p = self.path
            if p[-1] == "/":
                p = p + "index.html"
            r = StubReq(p, queryPos)
            render.handler(r, site_mode)
            self.send_response(r.status)
            self.send_header("Content-type", r.content_type)
            self.end_headers()
            self.wfile.write(r.wfile.getvalue().encode("utf-8"))
        else:
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def translate_path(self, path):
        if path[0] == "/":
            path = path[1:]
        result = os.path.join(render.SITE_DIR, path)
        return result


if __name__ == "__main__":
    if len(sys.argv) > 1:
        site_mode = sys.argv[1]

    addr = ("localhost", 8191)
    with socketserver.TCPServer(addr, ReqHandler) as httpd:
        vi = sys.version_info
        print(
            f"Serving on http://{addr[0]}:{addr[1]}, running on Python {vi.major}.{vi.minor}.{vi.micro}"
        )
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping...")
            httpd.shutdown()
            httpd.server_close()

import http.server
import socketserver
import sys

PORT = 8890

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/home/runner/work/newclaw/newclaw', **kwargs)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving test pages at port {PORT}")
    print("Accessible URLs:")
    print("- http://localhost:8890/test-extension.html (Extension test)")
    print("- http://localhost:8890/test-frontend.html (Frontend test)")
    print("- http://localhost:8890/dist/control-ui/ (Control UI)")
    httpd.serve_forever()
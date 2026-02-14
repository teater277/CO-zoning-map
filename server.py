#!/usr/bin/env python3
"""
HTTP server with proper range request support for PMTiles.
"""

import http.server
import socketserver
import re

class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler with Range request support."""

    def end_headers(self):
        """Add CORS headers and cache control."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_GET(self):
        """Handle GET with Range support."""
        # Handle range requests
        range_header = self.headers.get('Range')
        if range_header:
            self.handle_range_request(range_header)
        else:
            super().do_GET()

    def handle_range_request(self, range_header):
        """Handle HTTP Range requests."""
        try:
            # Parse range header (e.g., "bytes=0-1023")
            match = re.match(r'bytes=(\d+)-(\d*)', range_header)
            if not match:
                self.send_error(400, "Invalid range header")
                return

            start = int(match.group(1))
            end_str = match.group(2)

            # Get the file
            path = self.translate_path(self.path)
            try:
                f = open(path, 'rb')
            except OSError:
                self.send_error(404, "File not found")
                return

            # Get file size
            f.seek(0, 2)
            file_size = f.tell()
            f.seek(0)

            # Calculate range
            end = int(end_str) if end_str else file_size - 1
            end = min(end, file_size - 1)

            if start >= file_size or start > end:
                self.send_error(416, "Range not satisfiable")
                f.close()
                return

            # Send headers
            self.send_response(206)  # Partial Content
            self.send_header('Content-Type', self.guess_type(path))
            self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
            self.send_header('Content-Length', str(end - start + 1))
            self.end_headers()

            # Send content
            f.seek(start)
            bytes_to_send = end - start + 1
            self.wfile.write(f.read(bytes_to_send))
            f.close()

        except Exception as e:
            print(f"Error handling range request: {e}")
            self.send_error(500, "Internal server error")

PORT = 8000

print(f"Starting HTTP server with Range request support on port {PORT}...")
print(f"Open http://localhost:{PORT} in your browser")
print("Press Ctrl+C to stop")

with socketserver.TCPServer(("", PORT), RangeHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")

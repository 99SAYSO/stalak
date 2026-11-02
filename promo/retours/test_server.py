"""A static file server with HTTP Range support (video seeking), for the local test only."""
import http.server, os, re, sys
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path): return super().send_head()
        try: f = open(path, "rb")
        except OSError: self.send_error(404); return None
        size = os.fstat(f.fileno()).st_size
        ctype = "video/mp4" if "/_blob/vid" in self.path else ("image/jpeg" if "/_blob/strip" in self.path else self.guess_type(path))
        rng = self.headers.get("Range")
        if rng:
            m = re.match(r"bytes=(\d*)-(\d*)", rng); a = int(m.group(1) or 0); b = int(m.group(2)) if m.group(2) else size - 1
            b = min(b, size - 1); f.seek(a)
            self.send_response(206); self.send_header("Content-Range", "bytes %d-%d/%d" % (a, b, size)); n = b - a + 1
        else:
            self.send_response(200); n = size
        self.send_header("Content-Type", ctype); self.send_header("Accept-Ranges", "bytes"); self.send_header("Content-Length", str(n)); self.end_headers()
        self._left = n
        return f
    def copyfile(self, src, dst):
        left = getattr(self, "_left", None)
        while True:
            chunk = src.read(min(65536, left) if left is not None else 65536)
            if not chunk: break
            try: dst.write(chunk)
            except (BrokenPipeError, ConnectionResetError): break
            if left is not None:
                left -= len(chunk)
                if left <= 0: break
os.chdir(sys.argv[1]); http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[2])), H).serve_forever()

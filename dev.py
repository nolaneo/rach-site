#!/usr/bin/env python3
"""
dev.py — local preview with auto-rebuild and live-reload. No dependencies.

Run it:

    python3 dev.py            # then open http://localhost:8000

It builds index.html, serves the folder, and watches content.json, the
template, CSS and JS. When any of them change it rebuilds automatically and
tells the open browser tab to refresh itself. Stop with Ctrl+C.

This is a DEV-ONLY server. The live-reload script is injected on the fly and is
never written into the built index.html, so it can't leak into production.
"""

import functools
import http.server
import socketserver
import threading
from pathlib import Path

import build

ROOT = Path(__file__).resolve().parent
PORT = 8000

# Source files whose changes should trigger a rebuild + reload.
WATCH = [
    ROOT / "content.json",
    ROOT / "template.html",
    ROOT / "css" / "styles.css",
    ROOT / "js" / "main.js",
    ROOT / "build.py",
]

_lock = threading.Lock()
_state = {"sig": None}


def signature():
    parts = []
    for f in WATCH:
        try:
            parts.append(str(f.stat().st_mtime_ns))
        except FileNotFoundError:
            parts.append("0")
    return "-".join(parts)


def ensure_built():
    """Rebuild index.html only when a watched source file has changed."""
    sig = signature()
    with _lock:
        if sig != _state["sig"]:
            build.build()
            _state["sig"] = sig


RELOAD_SNIPPET = """
<script>
/* dev-only live reload: poll the build signature and refresh on change */
(function () {
  var current = null;
  function poll() {
    fetch('/__livereload', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        if (current === null) { current = t; }
        else if (t !== current) { location.reload(); return; }
        setTimeout(poll, 700);
      })
      .catch(function () { setTimeout(poll, 1500); });
  }
  poll();
})();
</script>
"""


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Never cache in dev, so edits to CSS/JS/images show on reload.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def _send(self, body, content_type):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        ensure_built()
        path = self.path.split("?", 1)[0]

        if path == "/__livereload":
            self._send(signature().encode("utf-8"), "text/plain; charset=utf-8")
            return

        if path in ("/", "/index.html"):
            html = (ROOT / "index.html").read_text(encoding="utf-8")
            if "</body>" in html:
                html = html.replace("</body>", RELOAD_SNIPPET + "</body>", 1)
            else:
                html += RELOAD_SNIPPET
            self._send(html.encode("utf-8"), "text/html; charset=utf-8")
            return

        return super().do_GET()

    def log_message(self, *args):
        pass  # keep the console quiet except for our own prints


def main():
    build.build()
    _state["sig"] = signature()

    socketserver.ThreadingTCPServer.allow_reuse_address = True
    handler = functools.partial(Handler, directory=str(ROOT))
    with socketserver.ThreadingTCPServer(("", PORT), handler) as httpd:
        httpd.daemon_threads = True
        print(f"  Dev server running:  http://localhost:{PORT}")
        print("  Watching content.json, template.html, css, js — auto-reload is on.")
        print("  Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Stopped.")


if __name__ == "__main__":
    main()

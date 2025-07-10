from flask import Flask, render_template, send_from_directory
import os

# Set up Flask app with correct folders
app = Flask(
    __name__,
    static_folder="assets",        # All your static files (css, js, images, videos)
    template_folder="."            # index.html is in project root
)

# Serve the main page
@app.route("/")
def home():
    return render_template("index.html")

# Serve files from assets (css, js, images, videos)
@app.route("/assets/<path:filename>")
def assets_files(filename):
    return send_from_directory("assets", filename)

# Serve service worker at root
@app.route("/sw.js")
def service_worker():
    return send_from_directory(".", "sw.js", mimetype="application/javascript")

# Serve manifest.json at root
@app.route("/manifest.json")
def manifest():
    return send_from_directory(".", "manifest.json", mimetype="application/manifest+json")

# Serve files from data (like farmacie.csv)
@app.route("/data/<path:filename>")
def data_files(filename):
    return send_from_directory("data", filename)

# Optionally: serve README.md (not required for most sites)
@app.route("/README.md")
def readme():
    return send_from_directory(".", "README.md", mimetype="text/markdown")

if __name__ == "__main__":
    # Support Render's dynamic port (or default to 10000 locally)
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)

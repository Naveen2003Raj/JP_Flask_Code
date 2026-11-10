from flask import Flask, render_template, jsonify, request,session
from werkzeug.security import check_password_hash
import os
from db import db
from functools import wraps
from datetime import datetime, timezone
from bson import ObjectId

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")
app.json.ensure_ascii = False
from bson import ObjectId
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = db.users.find_one({"email": email})
    if (
        not user
        or not user.get("isActive")
        or not check_password_hash(user["passwordHash"], password)
    ):
        return jsonify({"error": "Invalid email or password"}), 401

    session.clear()
    session["user_id"] = str(user["_id"])
    session["role"] = user["role"]
    return jsonify({"ok": True, "email": user["email"], "role": user["role"]})

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/me")
def me():
    if "user_id" not in session:
        return jsonify({"loggedIn": False}), 401
    return jsonify({"loggedIn": True, "role": session.get("role")})
def clean(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, list):
        return [clean(v) for v in value]
    if isinstance(value, dict):
        return {k: clean(v) for k, v in value.items()}
    return value
def localize(doc, lang):
    en = (doc.get("translations") or {}).get("en") or {}
    if lang == "en" and en.get("title"):
        doc["title"] = en["title"]
        doc["excerpt"] = en.get("excerpt") or doc.get("excerpt")
        doc["displayDate"] = en.get("displayDate") or doc.get("displayDate")
        doc["lang"] = "en"
    else:
        doc["lang"] = "ta"
    return doc
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if session.get("role") != "admin":
            return jsonify({"error": "Login required"}), 401
        return fn(*args, **kwargs)
    return wrapper
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/works")
def works():
    return render_template("works.html")


@app.route("/gallery")
def gallery():
    return render_template("gallery.html")


@app.route("/podcast")
def podcast():
    return render_template("podcast.html")


@app.route("/video")
def video():
    return render_template("video.html")


@app.route("/article")
def article():
    return render_template("article.html")

@app.route("/admin")
def admin():
    return render_template("admin.html")

@app.route("/api/health")
def health():
    db.command("ping")          # asks MongoDB "are you alive?"
    return jsonify({"status": "ok"})

@app.route("/api/categories")
def categories():
    docs = db["categories"].find().sort("sortOrder", 1)
    return jsonify([clean(d) for d in docs])

@app.route("/api/contents")
def list_contents():
    lang = request.args.get("lang", "ta")
    limit = request.args.get("limit", type=int)
    cursor = db.contents.find({}, {"body": 0}).sort("publishedAt", -1)
    if limit:
        cursor = cursor.limit(limit)
    return jsonify(clean([localize(d, lang) for d in cursor]))

@app.route("/api/contents/<slug>")
def get_content(slug):
    doc = db.contents.find_one({"slug": slug})
    if doc is None:
        return jsonify({"error": "Not found"}), 404
    lang = request.args.get("lang", "ta")
    return jsonify(clean(localize(doc, lang)))
@app.route("/api/admin/contents", methods=["POST"])
@admin_required
def create_content():
    data = request.get_json(silent=True) or {}
    slug = (data.get("slug") or "").strip()
    title = (data.get("title") or "").strip()
    if not slug or not title:
        return jsonify({"error": "slug and title are required"}), 400
    if db.contents.find_one({"slug": slug}):
        return jsonify({"error": "slug already exists"}), 409

    now = datetime.now(timezone.utc)
    doc = {
        "slug": slug,
        "type": data.get("type", "article"),
        "status": data.get("status", "draft"),
        "title": title,
        "excerpt": data.get("excerpt", ""),
        "body": {"format": "plain_text", "text": data.get("bodyText", "")},
        "translations": data.get("translations", {}),
        "categoryIds": [],
        "tags": data.get("tags", []),
        "featured": False,
        "createdBy": ObjectId(session["user_id"]),
        "createdAt": now,
        "updatedAt": now,
    }
    if doc["status"] == "published":
        doc["publishedAt"] = now

    db.contents.insert_one(doc)
    return jsonify({"ok": True, "slug": slug}), 201
@app.route("/api/admin/contents/<slug>", methods=["DELETE"])
@admin_required
def delete_content(slug):
    result = db.contents.delete_one({"slug": slug})
    if result.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"ok": True, "deleted": slug})

@app.route("/api/admin/contents/<slug>", methods=["PUT"])
@admin_required
def update_content(slug):
    data = request.get_json(silent=True) or {}
    changes = {}

    for field in ("title", "excerpt", "status", "tags", "translations"):
        if field in data:
            changes[field] = data[field]

    if "bodyText" in data:
        changes["body"] = {"format": "plain_text", "text": data["bodyText"]}

    if not changes:
        return jsonify({"error": "Nothing to update"}), 400

    now = datetime.now(timezone.utc)
    changes["updatedAt"] = now

    existing = db.contents.find_one({"slug": slug}, {"publishedAt": 1})
    if existing is None:
        return jsonify({"error": "Not found"}), 404

    if changes.get("status") == "published" and not existing.get("publishedAt"):
        changes["publishedAt"] = now

    db.contents.update_one({"slug": slug}, {"$set": changes})
    return jsonify({"ok": True, "updated": slug})

@app.route("/api/admin/contents", methods=["GET"])
@admin_required
def admin_list_contents():
    docs = db.contents.find({"type": "article"}, {"body": 0}).sort("updatedAt", -1)
    return jsonify(clean(list(docs)))
if __name__ == "__main__":
    app.run(debug=True)
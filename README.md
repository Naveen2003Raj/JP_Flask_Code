# JP Portfolio (Flask + MongoDB)

A bilingual (Tamil / English) portfolio website for Jeeva Ponnuchamy. Content such as cinema essays is stored in MongoDB and served through a JSON API. The public pages load it dynamically, and a simple admin page manages articles.

## Features

- Bilingual content: Tamil is the main language, English is available through `?lang=en`
- Public pages: Home, About, Works, Gallery, Podcast, Video, Article
- REST API for categories and contents
- Admin login with session-based authentication and hashed passwords
- Admin CRUD for articles (create, edit, delete)
- MongoDB schema validation and indexes set up by a single init script

## Tech Stack

- Python 3, Flask
- MongoDB (local or Atlas) with PyMongo
- HTML, CSS, JavaScript (vanilla)

## Project Structure

```
jp-portfolio-flask/
├── app.py              # Flask app: pages, public API, admin API
├── db.py               # MongoDB connection (exports `db`)
├── jp_db_init.py       # Creates collections, validators, indexes, seeds categories
├── requirements.txt
├── .env                # Local secrets (not committed)
├── static/
│   ├── css/
│   ├── js/
│   └── img/
└── templates/
    ├── partials/
    ├── index.html
    ├── about.html
    ├── works.html
    ├── gallery.html
    ├── podcast.html
    ├── video.html
    ├── article.html
    └── admin.html
```

## Getting Started

### 1. Clone and create a virtual environment

```bash
git clone <your-repo-url>
cd jp-portfolio-flask
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```dotenv
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=jp_portfolio
SECRET_KEY=change-this-to-a-long-random-string
```

| Variable           | Description                                        |
| ------------------ | -------------------------------------------------- |
| `MONGODB_URI`      | MongoDB connection string (local or Atlas)         |
| `MONGODB_DATABASE` | Database name (defaults to `jp_portfolio`)         |
| `SECRET_KEY`       | Secret used to sign Flask sessions                 |

Generate a strong secret key with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. Initialize the database

```bash
python jp_db_init.py
```

This creates the `users`, `categories`, `contents`, `media_assets` and `content_versions` collections with validation and indexes, and seeds six default categories (Articles, Stories, Literature, Cinema, Photography, Podcasts). It is safe to run again.

### 5. Create the admin user

There is no signup page, so create the admin user once. Save this as `create_admin.py`, run it, then delete the file:

```python
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash
from db import db

db.users.insert_one({
    "email": "admin@example.com",
    "passwordHash": generate_password_hash("YOUR_STRONG_PASSWORD"),
    "role": "admin",
    "isActive": True,
    "createdAt": datetime.now(timezone.utc),
})
print("Admin created")
```

```bash
python create_admin.py
```

### 6. Run the app

```bash
python app.py
```

Open http://127.0.0.1:5000

## Pages

| Route      | Description           |
| ---------- | --------------------- |
| `/`        | Home                  |
| `/about`   | About                 |
| `/works`   | Works                 |
| `/gallery` | Gallery               |
| `/podcast` | Podcast               |
| `/video`   | Video                 |
| `/article` | Single article view   |
| `/admin`   | Admin login and panel |

## API Reference

### Public

| Method | Endpoint               | Description                                                        |
| ------ | ---------------------- | ------------------------------------------------------------------ |
| GET    | `/api/health`          | Pings MongoDB and returns `{"status": "ok"}`                       |
| GET    | `/api/categories`      | All categories, sorted by `sortOrder`                              |
| GET    | `/api/contents`        | All contents without body. Supports `?lang=en\|ta` and `?limit=N`  |
| GET    | `/api/contents/<slug>` | Single content item with body. Supports `?lang=en\|ta`            |

### Auth

| Method | Endpoint      | Description                                          |
| ------ | ------------- | ---------------------------------------------------- |
| POST   | `/api/login`  | Body: `{"email": "...", "password": "..."}`          |
| POST   | `/api/logout` | Clears the session                                   |
| GET    | `/api/me`     | Returns login status and role (401 if not logged in) |

### Admin (login required, role `admin`)

| Method | Endpoint                     | Description                                   |
| ------ | ---------------------------- | --------------------------------------------- |
| GET    | `/api/admin/contents`        | List all articles, newest updated first       |
| POST   | `/api/admin/contents`        | Create an article                             |
| PUT    | `/api/admin/contents/<slug>` | Update an article                             |
| DELETE | `/api/admin/contents/<slug>` | Delete an article                             |

Example create payload:

```json
{
  "slug": "article-11",
  "title": "தலைப்பு",
  "excerpt": "சுருக்கம்",
  "bodyText": "Paragraph one\n\nParagraph two",
  "status": "published",
  "translations": {
    "en": {
      "title": "English title",
      "excerpt": "English excerpt",
      "displayDate": "November 10, 2026"
    }
  }
}
```

## Content Model

Each document in `contents` has:

- `slug`: unique URL identifier
- `type`: `article`, `story`, `poem`, `screenplay`, `gallery`, `podcast`, `video` or `project`
- `status`: `draft`, `published`, `scheduled` or `archived`
- `title`, `excerpt`, `displayDate`: Tamil (main language)
- `body.text`: Tamil body, with paragraphs separated by a blank line
- `translations.en`: English `title`, `excerpt` and `displayDate`. Only these are needed in English.
- `tags`, `categoryIds`, `featured`, `publishedAt`, `createdAt`, `updatedAt`

## Admin Panel

1. Go to `/admin` and log in with the admin email and password.
2. Open **Articles** to see the article count and a card for each article.
3. Use the pencil icon to edit, the delete icon to remove, or **Create new** to add an article.

## Deployment Checklist

- Use a strong, unique `SECRET_KEY`
- Use a new, strong admin password (never reuse development credentials)
- Run with `debug=False` and a production server such as Gunicorn or Waitress
- Use MongoDB Atlas and restrict network access to your server
- Keep `.env` out of version control (add it to `.gitignore`)

## .gitignore (suggested)

```
venv/
__pycache__/
.env
```


existing admin login
Email: naveenraj1732@gmail.com
pass: Naveen@2003

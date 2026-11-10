
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import CollectionInvalid

load_dotenv()

MONGODB_URI = os.getenv(
    "MONGODB_URI", "mongodb://localhost:27017/"
)
DATABASE_NAME = os.getenv(
    "MONGODB_DATABASE", "jp_portfolio"
)

client = MongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=5000
)

# Verify MongoDB connection
client.admin.command("ping")
db = client[DATABASE_NAME]

print(f"Connected to MongoDB: {DATABASE_NAME}")


def create_collection(name, validator):
    """Create a collection with MongoDB schema validation."""
    if name not in db.list_collection_names():
        try:
            db.create_collection(
                name,
                validator={
                    "$jsonSchema": validator
                },
                validationLevel="strict",
                validationAction="error"
            )
            print(f"Created collection: {name}")
        except CollectionInvalid:
            pass
    else:
        # Apply/update validation on an existing collection
        db.command({
            "collMod": name,
            "validator": {"$jsonSchema": validator},
            "validationLevel": "strict",
            "validationAction": "error"
        })
        print(f"Updated validator: {name}")


# 1. CONTENTS COLLECTION
content_schema = {
    "bsonType": "object",
    "required": [
        "type", "title", "slug", "status",
        "createdAt", "updatedAt"
    ],
    "properties": {
        "type": {
            "enum": [
                "article", "story", "poem",
                "screenplay", "gallery",
                "podcast", "video", "project"
            ]
        },
        "title": {"bsonType": "string"},
        "slug": {"bsonType": "string"},
        "excerpt": {"bsonType": "string"},
        "body": {
            "bsonType": "object",
            "properties": {
                "format": {
                    "enum": ["html", "plain_text"]
                },
                "html": {"bsonType": "string"},
                "text": {"bsonType": "string"}
            }
        },
        "coverImage": {
            "bsonType": ["object", "null"],
            "properties": {
                "assetId": {"bsonType": "objectId"},
                "alt": {"bsonType": "string"}
            }
        },
        "media": {
            "bsonType": "array",
            "items": {
                "bsonType": "object",
                "properties": {
                    "assetId": {"bsonType": "objectId"},
                    "caption": {"bsonType": "string"},
                    "alt": {"bsonType": "string"},
                    "order": {"bsonType": ["int", "long"]}
                }
            }
        },
        "externalLinks": {
            "bsonType": "array",
            "items": {
                "bsonType": "object",
                "properties": {
                    "provider": {"bsonType": "string"},
                    "url": {"bsonType": "string"},
                    "title": {"bsonType": "string"}
                }
            }
        },
        "categoryIds": {
            "bsonType": "array",
            "items": {"bsonType": "objectId"}
        },
        "tags": {
            "bsonType": "array",
            "items": {"bsonType": "string"}
        },
        "status": {
            "enum": [
                "draft", "published",
                "scheduled", "archived"
            ]
        },
        "featured": {"bsonType": "bool"},
        "publishedAt": {
            "bsonType": ["date", "null"]
        },
        "createdBy": {"bsonType": "objectId"},
        "createdAt": {"bsonType": "date"},
        "updatedAt": {"bsonType": "date"},
        "seo": {"bsonType": "object"}
    }
}


# 2. MEDIA ASSETS COLLECTION
media_schema = {
    "bsonType": "object",
    "required": [
        "kind", "storageKey", "mimeType",
        "sizeBytes", "createdAt"
    ],
    "properties": {
        "kind": {
            "enum": ["image", "document", "video", "audio"]
        },
        "storageKey": {"bsonType": "string"},
        "url": {"bsonType": "string"},
        "mimeType": {"bsonType": "string"},
        "sizeBytes": {"bsonType": ["int", "long"]},
        "width": {"bsonType": "int"},
        "height": {"bsonType": "int"},
        "alt": {"bsonType": "string"},
        "caption": {"bsonType": "string"},
        "uploadedBy": {"bsonType": "objectId"},
        "createdAt": {"bsonType": "date"}
    }
}


# 3. ADMIN USERS COLLECTION
user_schema = {
    "bsonType": "object",
    "required": [
        "email", "passwordHash",
        "role", "isActive", "createdAt"
    ],
    "properties": {
        "email": {"bsonType": "string"},
        "passwordHash": {"bsonType": "string"},
        "role": {"enum": ["admin", "editor"]},
        "isActive": {"bsonType": "bool"},
        "createdAt": {"bsonType": "date"}
    }
}


# 4. CATEGORIES COLLECTION
category_schema = {
    "bsonType": "object",
    "required": ["name", "slug"],
    "properties": {
        "name": {"bsonType": "string"},
        "slug": {"bsonType": "string"},
        "description": {"bsonType": "string"},
        "contentTypes": {
            "bsonType": "array",
            "items": {"bsonType": "string"}
        },
        "sortOrder": {"bsonType": "int"}
    }
}


# 5. CONTENT VERSIONS COLLECTION (optional history)
version_schema = {
    "bsonType": "object",
    "required": [
        "contentId", "snapshot", "createdAt"
    ],
    "properties": {
        "contentId": {"bsonType": "objectId"},
        "snapshot": {"bsonType": "object"},
        "createdBy": {"bsonType": "objectId"},
        "createdAt": {"bsonType": "date"}
    }
}


# Create collections and validators
create_collection("contents", content_schema)
create_collection("media_assets", media_schema)
create_collection("users", user_schema)
create_collection("categories", category_schema)
create_collection("content_versions", version_schema)


# INDEXES
contents = db["contents"]

# Unique URL per content item
contents.create_index(
    [("slug", ASCENDING)],
    unique=True,
    name="unique_content_slug"
)

# Public listings, sorted newest first
contents.create_index(
    [
        ("status", ASCENDING),
        ("type", ASCENDING),
        ("publishedAt", DESCENDING),
        ("_id", DESCENDING)
    ],
    name="public_content_listing"
)

# Featured homepage content
contents.create_index(
    [
        ("status", ASCENDING),
        ("featured", ASCENDING),
        ("publishedAt", DESCENDING)
    ],
    name="featured_content"
)

# Category filters
contents.create_index(
    [
        ("status", ASCENDING),
        ("categoryIds", ASCENDING),
        ("publishedAt", DESCENDING)
    ],
    name="content_by_category"
)

# Search by tags
contents.create_index(
    [("tags", ASCENDING)],
    name="content_tags"
)

# Admin authentication and media lookup
db["users"].create_index(
    [("email", ASCENDING)],
    unique=True,
    name="unique_user_email"
)

db["categories"].create_index(
    [("slug", ASCENDING)],
    unique=True,
    name="unique_category_slug"
)

db["media_assets"].create_index(
    [("storageKey", ASCENDING)],
    unique=True,
    name="unique_media_storage_key"
)

db["content_versions"].create_index(
    [
        ("contentId", ASCENDING),
        ("createdAt", DESCENDING)
    ],
    name="content_revision_history"
)


# Seed default categories without duplicates
now = datetime.now(timezone.utc)

default_categories = [
    {
        "name": "Articles",
        "slug": "articles",
        "description": "Written articles and essays",
        "contentTypes": ["article"],
        "sortOrder": 1
    },
    {
        "name": "Stories",
        "slug": "stories",
        "description": "Personal stories and narratives",
        "contentTypes": ["story"],
        "sortOrder": 2
    },
    {
        "name": "Literature",
        "slug": "literature",
        "description": "Poems and literary works",
        "contentTypes": ["poem"],
        "sortOrder": 3
    },
    {
        "name": "Cinema",
        "slug": "cinema",
        "description": "Screenplays and film projects",
        "contentTypes": ["screenplay", "project"],
        "sortOrder": 4
    },
    {
        "name": "Photography",
        "slug": "photography",
        "description": "Photographs and galleries",
        "contentTypes": ["gallery"],
        "sortOrder": 5
    },
    {
        "name": "Podcasts",
        "slug": "podcasts",
        "description": "Podcast episodes and interviews",
        "contentTypes": ["podcast"],
        "sortOrder": 6
    }
]

for category in default_categories:
    db["categories"].update_one(
        {"slug": category["slug"]},
        {
            "$setOnInsert": {
                **category,
                "createdAt": now
            }
        },
        upsert=True
    )

print("\nDatabase initialization completed.")
print("Collections:", db.list_collection_names())

client.close()

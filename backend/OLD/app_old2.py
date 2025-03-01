from flask import Flask, jsonify, request
from db_connection import connect_to_db
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_users():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users")
    users = cur.fetchall()
    conn.close()  # Ensure the connection is closed
    return jsonify(users)

def get_articles():
    try:
        conn = connect_to_db()
        cur = conn.cursor()
        # Adjusted column names to match the articles table schema
        cur.execute("SELECT article_id, title, text, author, publisher, source_url, timestamp, upvotes, downvotes FROM articles")
        articles = cur.fetchall()
        conn.close()

        # Convert data to JSON-friendly format with proper timestamp formatting
        articles_data = [
            {
                "article_id": row[0],
                "title": row[1],
                "text": row[2],
                "author": row[3],
                "publisher": row[4],
                "source_url": row[5],
                "timestamp": row[6].strftime('%Y-%m-%d %H:%M:%S') if row[6] else None,
                "upvotes": row[7],
                "downvotes": row[8],
                }
            for row in articles
        ]
        return jsonify(articles_data)
    except Exception as e:
        print("Error fetching articles:", e)
        return jsonify({"error": "Unable to fetch articles"}), 500

def get_comments():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM comments")  # Added spaces around '*'
    comments = cur.fetchall()
    conn.close()  # Ensure the connection is closed
    return jsonify(comments)

# Define URL routes
app.add_url_rule('/users', view_func=get_users)
app.add_url_rule('/articles', view_func=get_articles)
app.add_url_rule('/comments', view_func=get_comments)

if __name__ == '__main__':
    app.run(debug=True)


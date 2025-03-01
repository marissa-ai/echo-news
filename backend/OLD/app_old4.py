from flask import Flask, jsonify, request
from db_connection import connect_to_db
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Function to fetch all users
def get_users():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users")
    users = cur.fetchall()
    conn.close()
    return jsonify(users)

# Function to fetch all articles
def get_articles():
    try:
        conn = connect_to_db()
        cur = conn.cursor()
        # Fetch articles with necessary fields
        cur.execute("SELECT article_id, title, text, author, publisher, source_url, timestamp, upvotes, downvotes, categories, tags FROM articles")
        articles = cur.fetchall()
        conn.close()

        # Format articles for JSON response
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
                "categories": row[9],
                "tags": row[10],
            }
            for row in articles
        ]
        return jsonify(articles_data)
    except Exception as e:
        print("Error fetching articles:", e)
        return jsonify({"error": "Unable to fetch articles"}), 500

# Function to fetch trending articles (new endpoint)
@app.route('/articles/trending', methods=['GET'])
def get_trending_articles():
    """
    Fetch the top 5 trending articles based on upvotes.
    """
    try:
        conn = connect_to_db()
        cur = conn.cursor()
        # Fetch top 5 articles sorted by upvotes
        cur.execute("""
            SELECT article_id, title, text, author, publisher, source_url, timestamp, upvotes, downvotes, categories, tags 
            FROM articles 
            ORDER BY upvotes DESC 
            LIMIT 5
        """)
        trending_articles = cur.fetchall()
        conn.close()

        # Format data for JSON response
        trending_data = [
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
                "categories": row[9],
                "tags": row[10],
            }
            for row in trending_articles
        ]
        return jsonify(trending_data)
    except Exception as e:
        print("Error fetching trending articles:", e)
        return jsonify({"error": "Unable to fetch trending articles"}), 500

# Function to fetch all comments
def get_comments():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM comments")
    comments = cur.fetchall()
    conn.close()
    return jsonify(comments)

# Function to handle voting on articles
@app.route('/articles/vote', methods=['POST'])
def vote_article():
    """
    Handles upvotes and downvotes for articles.
    """
    try:
        data = request.json
        article_id = data['article_id']
        vote_type = data['vote_type']  # 'upvote' or 'downvote'

        conn = connect_to_db()
        cur = conn.cursor()

        # Update the upvotes or downvotes count
        if vote_type == 'upvote':
            cur.execute("UPDATE articles SET upvotes = upvotes + 1 WHERE article_id = %s", (article_id,))
        elif vote_type == 'downvote':
            cur.execute("UPDATE articles SET downvotes = downvotes + 1 WHERE article_id = %s", (article_id,))
        else:
            return jsonify({"error": "Invalid vote type"}), 400

        conn.commit()
        conn.close()

        return jsonify({"message": "Vote recorded successfully"}), 200
    except Exception as e:
        print("Error recording vote:", e)
        return jsonify({"error": "Unable to record vote"}), 500

# Define URL routes
app.add_url_rule('/users', view_func=get_users)
app.add_url_rule('/articles', view_func=get_articles)
app.add_url_rule('/comments', view_func=get_comments)

if __name__ == '__main__':
    app.run(debug=True)


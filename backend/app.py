from flask import Flask, jsonify, request
from db_connection import connect_to_db
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# User login endpoint
@app.route('/login', methods=['POST'])
def login():
    """
    Authenticate user with login name and password.
    """
    data = request.json
    login_name = data.get('login_name')
    password = data.get('password')

    try:
        conn = connect_to_db()
        cur = conn.cursor()
        # Fetch user by login_name
        cur.execute("SELECT password_hash, role FROM users WHERE login_name = %s", (login_name,))
        result = cur.fetchone()
        conn.close()

        if not result:
            return jsonify({"error": "Invalid login credentials"}), 401

        password_hash, role = result
        if check_password_hash(password_hash, password):
            return jsonify({"message": "Login successful", "role": role}), 200
        else:
            return jsonify({"error": "Invalid login credentials"}), 401
    except Exception as e:
        print("Error during login:", e)
        return jsonify({"error": "Server error"}), 500

# Submit article endpoint
@app.route('/articles/submit', methods=['POST'])
def submit_article():
    """
    Handles article submissions.
    """
    data = request.json
    title = data.get('title')
    text = data.get('text')
    url = data.get('url')
    category = data.get('category')
    topic = data.get('topic')
    submitted_by = data.get('login_name')

    try:
        conn = connect_to_db()
        cur = conn.cursor()

        # Insert article into database with 'Pending' status
        cur.execute("""
            INSERT INTO articles (title, text, source_url, category, topic, submitted_by, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (title, text, url, category, topic, submitted_by, 'Pending'))
        conn.commit()
        conn.close()

        return jsonify({"message": "Article submitted successfully"}), 200
    except Exception as e:
        print("Error submitting article:", e)
        return jsonify({"error": "Unable to submit article"}), 500

# Approve/reject article endpoint
@app.route('/articles/approve', methods=['POST'])
def approve_article():
    """
    Approve or reject an article submission.
    """
    data = request.json
    article_id = data.get('article_id')
    action = data.get('action')  # 'approve' or 'reject'

    if action not in ['approve', 'reject']:
        return jsonify({"error": "Invalid action"}), 400

    try:
        conn = connect_to_db()
        cur = conn.cursor()

        # Update article status
        new_status = 'Approved' if action == 'approve' else 'Rejected'
        cur.execute("UPDATE articles SET status = %s WHERE article_id = %s", (new_status, article_id))
        conn.commit()
        conn.close()

        return jsonify({"message": f"Article {new_status.lower()} successfully"}), 200
    except Exception as e:
        print("Error updating article status:", e)
        return jsonify({"error": "Unable to update article status"}), 500

# Fetch articles by status endpoint
@app.route('/articles', methods=['GET'])
def fetch_articles():
    """
    Fetch articles by status (Approved by default).
    """
    status = request.args.get('status', 'Approved')  # Default to 'Approved'

    try:
        conn = connect_to_db()
        cur = conn.cursor()

        # Fetch articles based on status
        cur.execute("SELECT * FROM articles WHERE status = %s", (status,))
        articles = cur.fetchall()
        conn.close()

        # Format articles for response
        articles_data = [
            {
                "article_id": row[0],
                "title": row[1],
                "text": row[2],
                "source_url": row[3],
                "category": row[4],
                "topic": row[5],
                "submitted_by": row[6],
                "status": row[7],
                "upvotes": row[8],
                "downvotes": row[9]
            }
            for row in articles
        ]

        return jsonify(articles_data), 200
    except Exception as e:
        print("Error fetching articles:", e)
        return jsonify({"error": "Unable to fetch articles"}), 500

if __name__ == '__main__':
    app.run(debug=True)


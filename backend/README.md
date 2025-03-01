# Echo News API

This is the backend API for the Echo News platform, a shareable news application that allows users to submit, vote on, and comment on news articles.

## Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI (OpenAPI)

## Features

- User authentication (register, login, logout)
- Article management (create, read, update, delete)
- Voting system (upvote, downvote)
- Comment system with nested replies
- User profiles and preferences
- Search functionality
- Activity tracking

## API Endpoints

The API is organized into the following modules:

- `/api/v1/auth`: Authentication endpoints
- `/api/v1/articles`: Article management endpoints
- `/api/v1/votes`: Voting system endpoints
- `/api/v1/comments`: Comment system endpoints
- `/api/v1/users`: User profile and preferences endpoints
- `/api/v1/search`: Search functionality endpoints

## Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL 12+

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/echo-news.git
   cd echo-news/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DB=echo
   SECRET_KEY=your_secret_key
   ```

5. Set up the database:
   ```
   psql -U your_postgres_user -d postgres -c "CREATE DATABASE echo;"
   ```

6. Run the database migrations:
   ```
   psql -U your_postgres_user -d echo -f database_schema.sql
   ```

### Running the API

Run the development server:
```
python run.py
```

The API will be available at http://localhost:8000.

API documentation will be available at http://localhost:8000/docs.

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── articles.py
│   │   │   ├── auth.py
│   │   │   ├── comments.py
│   │   │   ├── search.py
│   │   │   ├── users.py
│   │   │   └── votes.py
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── __init__.py
│   ├── db/
│   │   ├── session.py
│   │   └── __init__.py
│   ├── main.py
│   └── __init__.py
├── requirements.txt
├── run.py
└── README.md
```

## API Documentation

The API is documented using Swagger UI. You can access the documentation at http://localhost:8000/docs when the server is running.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
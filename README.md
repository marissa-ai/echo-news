# Echo - Our Shareable News

Echo is a modern news sharing platform that allows users to submit, vote on, and discuss news articles. It's designed to be a community-driven platform where the most valuable content rises to the top through user engagement.

## Project Structure

The project is divided into two main parts:

- **Backend**: A FastAPI-based RESTful API that handles all the business logic and data storage.
- **Frontend**: A React-based web application that provides the user interface.

## Features

- **User Authentication**: Register, login, and manage user profiles.
- **Article Management**: Submit, edit, and delete news articles.
- **Voting System**: Upvote or downvote articles to influence their visibility.
- **Comment System**: Discuss articles with nested comments and replies.
- **Search Functionality**: Find articles, users, and comments with advanced filtering.
- **User Profiles**: View and edit user profiles, track activity, and manage preferences.
- **Badges and Reputation**: Earn badges and reputation points for contributing to the community.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI (OpenAPI)

### Frontend
- **Framework**: React
- **State Management**: Redux
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **API Client**: Axios

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL 12+

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
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
   psql -U your_postgres_user -d echo -f database_schema.sql
   ```

6. Run the development server:
   ```
   python run.py
   ```

   The API will be available at http://localhost:8000.
   API documentation will be available at http://localhost:8000/docs.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the API URL:
   ```
   REACT_APP_API_URL=http://localhost:8000/api/v1
   ```

4. Run the development server:
   ```
   npm start
   ```

   The frontend will be available at http://localhost:3000.

## API Documentation

The API is documented using Swagger UI. You can access the documentation at http://localhost:8000/docs when the backend server is running.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

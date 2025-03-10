import psycopg2
from fastapi import Depends
from app.core.config import settings

def get_db():
    """
    Create and yield a database connection.
    The connection will be closed when the request is finished.
    """
    conn = None
    try:
        # Define the connection parameters
        params = {
            'dbname': settings.POSTGRES_DB,
            'user': settings.POSTGRES_USER,
            'password': settings.POSTGRES_PASSWORD,
            'host': settings.POSTGRES_HOST,
            'port': settings.POSTGRES_PORT,
        }

        print(f"Attempting to connect to database with params: {params}")
        
        # Establish a connection to the database
        conn = psycopg2.connect(**params)
        print("Successfully connected to the database")
        
        yield conn
    except Exception as e:
        print(f"Database connection error: {e}")
        print(f"Connection parameters used: host={settings.POSTGRES_HOST}, port={settings.POSTGRES_PORT}, dbname={settings.POSTGRES_DB}, user={settings.POSTGRES_USER}")
        raise
    finally:
        if conn is not None:
            conn.close() 
import psycopg2
from app.core.config import settings

def init_db():
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
        conn.autocommit = True  # Set autocommit mode
        
        # Create a cursor
        cur = conn.cursor()
        
        # Read and execute the schema file
        with open('database_schema.sql', 'r') as schema_file:
            cur.execute(schema_file.read())
            
        print("Database schema has been successfully applied!")
        
        cur.close()
        
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"An error occurred: {error}")
    finally:
        if conn is not None:
            conn.close()

if __name__ == "__main__":
    init_db() 
import psycopg2

def connect_to_db():
    conn = None
    try:
        # Define the connection parameters
        params = {
            'dbname': 'echo',
            'user': 'postgres',
            'password': 'St.Clair95#',
            'host': 'localhost',
            'port': 5432,
        }

        # Establish a connection to the database
        conn = psycopg2.connect(**params)

        return conn

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return None

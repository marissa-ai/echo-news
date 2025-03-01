from db_connection import connect_to_db

conn = connect_to_db()
if conn:
    print("Database connection successful!")
    conn.close()
else:
    print("Failed to connect to the database.")


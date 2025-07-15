import os
import psycopg2
from psycopg2 import sql

# Database connection
DATABASE_URL = os.environ.get('DATABASE_URL')

def init_database():
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("✅ Connected to database successfully!")
        
        # Read and execute schema
        with open('schema.sql', 'r') as file:
            schema_sql = file.read()
        
        cur.execute(schema_sql)
        conn.commit()
        
        print("✅ Database schema executed successfully!")
        print("✅ Tables created and data inserted!")
        
        # Verify tables
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = cur.fetchall()
        print(f"📊 Created {len(tables)} tables: {[t[0] for t in tables]}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    init_database()

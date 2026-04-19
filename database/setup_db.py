import sqlite3
import os

def setup_database(db_path="enterprise_data.db"):
    if os.path.exists(db_path):
        os.remove(db_path)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        role TEXT NOT NULL
    )
    ''')

    # Create Sales table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY,
        region TEXT,
        product TEXT,
        revenue REAL,
        date TEXT
    )
    ''')

    # Create Employees table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary REAL,
        role TEXT
    )
    ''')

    # Insert sample Users
    users = [
        (1, 'admin_user', 'Admin'),
        (2, 'manager_user', 'Manager'),
        (3, 'employee_user', 'Employee')
    ]
    cursor.executemany('INSERT INTO users VALUES (?, ?, ?)', users)

    # Insert sample Sales
    sales_data = [
        (1, 'West', 'Widget A', 5000.0, '2023-01-15'),
        (2, 'East', 'Widget A', 3000.0, '2023-01-20'),
        (3, 'West', 'Widget B', 7000.0, '2023-02-10'),
        (4, 'North', 'Widget A', 4500.0, '2023-02-25'),
        (5, 'South', 'Widget C', 2000.0, '2023-03-05'),
        (6, 'West', 'Widget B', 8000.0, '2023-03-12'),
        (7, 'East', 'Widget C', 2500.0, '2023-04-01'),
        (8, 'North', 'Widget B', 6000.0, '2023-04-10'),
        (9, 'West', 'Widget A', 5500.0, '2023-05-05'),
        (10, 'South', 'Widget A', 3500.0, '2023-05-15'),
    ]
    cursor.executemany('INSERT INTO sales VALUES (?, ?, ?, ?, ?)', sales_data)

    # Insert sample Employees
    employees_data = [
        (1, 'Alice Smith', 'Sales', 60000.0, 'Manager'),
        (2, 'Bob Jones', 'Engineering', 80000.0, 'Employee'),
        (3, 'Charlie Brown', 'HR', 55000.0, 'Employee'),
        (4, 'David Wilson', 'Sales', 50000.0, 'Employee'),
        (5, 'Eve Davis', 'Engineering', 95000.0, 'Manager'),
        (6, 'Frank Miller', 'Sales', 52000.0, 'Employee'),
    ]
    cursor.executemany('INSERT INTO employees VALUES (?, ?, ?, ?, ?)', employees_data)

    # Create Feedback table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        sql TEXT NOT NULL,
        rating INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    conn.commit()
    conn.close()
    print(f"Database setup complete: {db_path}")

if __name__ == "__main__":
    setup_database()

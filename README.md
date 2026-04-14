# Production-Grade AI-Powered Conversational Data System

This system allows users to query structured enterprise data using natural language. It translates English queries into SQL, retrieves data from a SQLite database, and enforces Role-Based Access Control (RBAC).

## 🏗 Architecture

1.  **Frontend (React + TypeScript):** A chat-based interface where users can select their role and ask questions.
2.  **Backend (FastAPI + LangChain):** Processes natural language queries, generates SQL using LLMs, and validates them against RBAC rules.
3.  **Database (SQLite):** Stores enterprise data across `users`, `sales`, and `employees` tables.
4.  **Evaluation:** A suite of test queries to measure accuracy and latency.

## 🚀 Features

- **Natural Language to SQL:** Uses LangChain to interpret user intent and schema.
- **RBAC:**
    - `Admin`: Full access to all tables.
    - `Manager`: Access to `sales` and `employees`.
    - `Employee`: Access only to `sales`.
- **Latency:** Optimized for sub-2 second responses (mocked without LLM for instant local testing).
- **Security:** Validates generated SQL to prevent unauthorized table access.

## 🛠 Setup & Installation

### Prerequisites
- Python 3.12+
- Node.js & npm

### Backend Setup
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn langchain langchain-openai langchain-community sqlalchemy
   ```
3. Set your OpenAI API Key (optional for full LLM functionality):
   ```bash
   export OPENAI_API_KEY='your-key-here'
   ```
4. Initialize the database:
   ```bash
   python database/setup_db.py
   ```
5. Start the backend:
   ```bash
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.

## 🧪 Evaluation

To run the evaluation script:
```bash
python evaluation/test_queries.py
```
Results are saved in `evaluation/results.json`.

## 💡 Example Queries

- "Show me all sales in the West region" (Role: Employee)
- "What is the average salary in the Engineering department?" (Role: Manager)
- "List all users and their roles" (Role: Admin)
- "Show me users" (Role: Employee) -> **Expected Error: Access Denied**

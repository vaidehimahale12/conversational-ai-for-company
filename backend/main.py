from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import sqlite3
from langchain_openai import ChatOpenAI
from langchain.chains import create_sql_query_chain
from langchain_community.utilities import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(title="Conversational Data API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "enterprise_data.db"
db = SQLDatabase.from_uri(f"sqlite:///{DB_PATH}")

class QueryRequest(BaseModel):
    query: str
    role: str

class QueryResponse(BaseModel):
    sql: str
    results: List[Any]
    explanation: str
    latency: float

# RBAC Configuration
ROLE_PERMISSIONS = {
    "Admin": ["users", "sales", "employees"],
    "Manager": ["sales", "employees"],
    "Employee": ["sales"]
}

def get_db_for_role(role: str):
    allowed_tables = ROLE_PERMISSIONS.get(role, [])
    if not allowed_tables:
        raise HTTPException(status_code=403, detail="Unauthorized role")

    # In a real production system, we might use database views or row-level security.
    # For this demo, we'll restrict the schema provided to the LLM.
    return SQLDatabase.from_uri(f"sqlite:///{DB_PATH}", include_tables=allowed_tables)

def execute_query(sql: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(sql)
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()
        results = [dict(zip(columns, row)) for row in rows]
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL Execution Error: {str(e)}")
    finally:
        conn.close()

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    start_time = time.time()

    # Check Role permissions
    if request.role not in ROLE_PERMISSIONS:
        raise HTTPException(status_code=403, detail="Invalid role")

    api_key = os.getenv("OPENAI_API_KEY")

    # Mocking for demo if no API key is provided
    if not api_key or api_key == "TODO":
        # Simple mock logic for common queries if API key is missing
        sql = ""
        query_lower = request.query.lower()

        # RBAC Check for mock
        forbidden_tables = []
        if request.role == "Employee":
            forbidden_tables = ["users", "employees"]
        elif request.role == "Manager":
            forbidden_tables = ["users"]

        for table in forbidden_tables:
            if table in query_lower:
                raise HTTPException(status_code=403, detail=f"Access to table '{table}' is restricted for role '{request.role}'")

        if "sales" in query_lower:
             sql = "SELECT * FROM sales LIMIT 5"
        elif "employees" in query_lower:
             sql = "SELECT name, department FROM employees LIMIT 5"
        elif "users" in query_lower:
             sql = "SELECT username, role FROM users LIMIT 5"
        else:
             sql = "SELECT 'Please provide OPENAI_API_KEY for full functionality' as message"

        results = execute_query(sql)
        latency = time.time() - start_time
        return QueryResponse(
            sql=sql,
            results=results,
            explanation="Mock response (OPENAI_API_KEY not set)",
            latency=latency
        )

    try:
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
        role_db = get_db_for_role(request.role)

        # Create chain
        chain = create_sql_query_chain(llm, role_db)

        # Generate SQL
        sql_query = chain.invoke({"question": request.query})

        # Clean up SQL query (sometimes LLM adds markdown or prefixes)
        if "SQLQuery:" in sql_query:
            sql_query = sql_query.split("SQLQuery:")[-1].strip()
        sql_query = sql_query.replace("```sql", "").replace("```", "").strip()

        # Validate SQL (basic check against allowed tables)
        allowed_tables = ROLE_PERMISSIONS[request.role]
        sql_upper = sql_query.upper()
        # Very basic validation: check if any unauthorized table is mentioned
        for table in ["users", "sales", "employees"]:
            if table not in allowed_tables and table.upper() in sql_upper:
                raise HTTPException(status_code=403, detail=f"Access to table '{table}' is restricted for role '{request.role}'")

        # Execute
        results = execute_query(sql_query)

        latency = time.time() - start_time
        return QueryResponse(
            sql=sql_query,
            results=results,
            explanation=f"Successfully executed query as {request.role}",
            latency=latency
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

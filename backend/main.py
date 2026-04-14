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

class FeedbackRequest(BaseModel):
    query: str
    sql: str
    rating: int  # 1 for thumbs up, 0 for thumbs down

class QueryExplanation(BaseModel):
    intent: str
    filters: Dict[str, Any]
    aggregation: str
    reasoning: str

class ChartMetadata(BaseModel):
    type: str  # 'line', 'bar', 'pie'
    x_axis: str
    y_axis: str

class QueryResponse(BaseModel):
    sql: str
    data: List[Any]
    answer: str
    latency: float
    explanation: QueryExplanation
    chart: Optional[ChartMetadata] = None

# RBAC Configuration
ROLE_PERMISSIONS = {
    "Admin": ["users", "sales", "employees"],
    "Manager": ["sales", "employees"],
    "Employee": ["sales"]
}

def detect_chart(data: List[Dict[str, Any]], sql: str) -> Optional[ChartMetadata]:
    if not data or len(data) < 2:
        return None

    keys = list(data[0].keys())
    sql_upper = sql.upper()

    # Detect time-based data for line chart
    date_key = next((k for k in keys if "DATE" in k.upper()), None)
    numeric_keys = [k for k in keys if isinstance(data[0][k], (int, float))]

    if date_key and numeric_keys:
        return ChartMetadata(type="line", x_axis=date_key, y_axis=numeric_keys[0])

    # Detect categories for bar chart
    cat_key = next((k for k in keys if isinstance(data[0][k], str) and k != date_key), None)
    if cat_key and numeric_keys:
        if "COUNT" in sql_upper or "SUM" in sql_upper or "AVG" in sql_upper:
            return ChartMetadata(type="bar", x_axis=cat_key, y_axis=numeric_keys[0])

    return None

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

@app.post("/feedback")
async def store_feedback(request: FeedbackRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO feedback (query, sql, rating) VALUES (?, ?, ?)",
                       (request.query, request.sql, request.rating))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
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

        intent = "Data Retrieval"
        if "sales" in query_lower:
             sql = "SELECT id, region, product, revenue, date FROM sales LIMIT 5"
        elif "employees" in query_lower:
             sql = "SELECT name, department, salary FROM employees LIMIT 5"
        elif "users" in query_lower:
             sql = "SELECT username, role FROM users LIMIT 5"
        else:
             sql = "SELECT 'Please provide OPENAI_API_KEY for full functionality' as message"

        results = execute_query(sql)
        latency = time.time() - start_time

        chart = detect_chart(results, sql)

        explanation = QueryExplanation(
            intent=intent,
            filters={"role": request.role},
            aggregation="None (Mock Mode)",
            reasoning=f"Identified '{intent}' intent. Applied RBAC for '{request.role}'. Generated sample SQL."
        )

        return QueryResponse(
            sql=sql,
            data=results,
            answer="Mock response (OPENAI_API_KEY not set)",
            latency=latency,
            explanation=explanation,
            chart=chart
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

        chart = detect_chart(results, sql_query)

        # Generate dynamic explanation (In a real system, the LLM would provide this)
        explanation = QueryExplanation(
            intent="SQL Generation",
            filters={"role": request.role},
            aggregation="Calculated based on query",
            reasoning=f"Interpreted natural language as a database query. Verified permissions for role '{request.role}'. Mapped entities to schema."
        )

        return QueryResponse(
            sql=sql_query,
            data=results,
            answer=f"Successfully executed query as {request.role}",
            latency=latency,
            explanation=explanation,
            chart=chart
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

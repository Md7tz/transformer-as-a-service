# taas-backend
Setup:
    pipenv shell
    or
    python -m venv venv
    . venv/bin/activate
    pip install -r requirements.txt
Migrations:
    alembic revision -m "create account table"
    
    alembic upgrade head
    alembic upgrade +2
    alembic upgrade ae10+2

    alembic downgrade
    alembic downgrade -1
    alembic downgrade base
    
    alembic history --verbose
Run the development server:
    uvicorn main:app --reload
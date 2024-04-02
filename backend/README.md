# taas-backend
Setup:
    pipenv shell
    or
    python -m venv venv
    . venv/bin/activate
    pip install -r requirements.txt
Migrations:
    alembic upgrade head
    alembic upgrade downgrade
Run the development server:
    uvicorn main:app --reload
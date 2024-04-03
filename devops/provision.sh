# 1. Load the variables from vars.sh.
# 2. Update the apt packages.
# 3. Install nginx.
# 4. Install nodejs.
# 5. Install python.
# 6. Install postgresql.
# 7. Install pm2.
# 8. Install dependencies for psycopg2.
# 9. Create the database user with password and database as defined in vars.sh.

source vars.sh

# Update and upgrade
sudo apt-get update

# Nginx
sudo apt-get install -y nginx

# Nodejs
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Python
sudo apt-get install -y python3 python3-venv pipenv

# PostgreSQL
sudo apt-get install -y postgresql

# Pm2
sudo npm install -g pm2

# PsycoPg2
sudo apt-get install -y libpq-dev build-essential

# Postgres setup
sudo -u postgres createuser $DB_USER || true
sudo -u postgres createdb $DB_NAME || true
sudo -u postgres psql -c "ALTER role $DB_USER WITH PASSWORD '$DB_PASSWORD';"
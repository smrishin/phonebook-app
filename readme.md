# Phonebook Application

This application is a phonebook management system that allows users to store, manage, and retrieve contact information. It utilizes DynamoDB as the database to handle user and contact data efficiently.

# Frontend

## For installation:

```
cd web
npm i
```

## Development server:

```
npm run dev
```

## Production server:

```
npm run build
npm run start
```

# Backend server

```
cd server
```

# Set python virtual environment

```
python -m venv venv
```

# Activate virtual environment

```
source venv/bin/activate   # On Linux or Mac
source venv/Scripts/activate   # On Windows, bash terminal
venv\Scripts\activate   # On Windows
```

# Install dependencies

```
pip install -r requirements.txt
```

# Update any new dependencies added

```
pip freeze > requirements.txt
```

# Create DynamoDB tables

DynamoDB is used as the database for this application. To run DynamoDB locally, follow these steps:

1. **Install DynamoDB Local**: You can download it from the [AWS website](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html).

2. **Run DynamoDB Local**: After downloading, navigate to the directory where you extracted DynamoDB Local and run:

```
java -D java.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

Or install NoSQL Workbench from [AWS Website](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.settingup.html) and run dynamodb local from there

3. **Create DynamoDB Tables**: To create the necessary tables, run the following command after activating your virtual environment:

```
python scripts/create-dynamodb-tables.py
```

# Run the backend

```
//activate the virtual env
export USE_LOCAL=true //For local use
python app.py
```

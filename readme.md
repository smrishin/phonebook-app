# Phonebook Application

This application is a phonebook management system that allows
users to store, manage, and retrieve contact information. It
utilizes DynamoDB as the database to handle user and contact
data efficiently.

## Features

- User authentication (login)
- Contact management (create, read, update, delete)
- Search contacts
- Responsive design
- Real-time validation
- Error handling
- Edit history tracking
- Share local development environment (via localtunnel)

## Tech Stack

### Frontend

- Next.js 14
- React
- Tailwind CSS
- React Hook Form
- Axios

### Backend

- Python
- Flask
- DynamoDB
- AWS SDK (boto3)

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- AWS Account (for DynamoDB) or DynamoDB Local
- Git

## Setup

#### 1. Clone the repository:

```bash
git clone https://github.com/smrishin/phonebook-app.git
cd phonebook-app
```

#### 2. Set up the backend:

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip freeze > requirements.txt # if needed

```

#### 3. Set up the frontend:

```bash
cd web
npm install
```

#### 4. Configure environment variables:

For the backend (`server/.env`):

```
# Environment Settings
USE_LOCAL=true

# AWS Credentials (For Production)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true

# DynamoDB Settings (For Local Development)
DYNAMODB_LOCAL_URL=http://localhost:8000

```

For the frontend (`web/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

#### 5. Create DynamoDB tables:

Install Dynamodb, if needed

DynamoDB is used as the database for this application. To run DynamoDB locally, follow these steps:

- **Install DynamoDB Local**: You can download it from the [AWS website](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html).

- **Run DynamoDB Local**: After downloading, navigate to the directory where you extracted DynamoDB Local and run:

```
java -D java.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

Or install NoSQL Workbench from [AWS Website](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.settingup.html) and run dynamodb local from there

- **Create DynamoDB Tables**: To create the necessary tables, run the following command after activating your virtual environment:

```bash
cd server
python scripts/create-dynamodb-tables.py
```

#### 6. Seed the database with test data:

```bash
cd server
python scripts/seed_db.py
```

This will create:

- A test user (email: john.doe@example.com)
- 4 sample contacts

## Running the Application

#### 1. Start the backend server:

```bash
//activate the virtual env
export USE_LOCAL=true //For local use
python app.py
```

#### 2. Start the frontend development server:

```bash
cd web
npm run dev
```

#### 3. Open your browser and navigate to `http://localhost:3000`

## Sharing Your Local Development Environment

To share your local development environment with others (e.g., for testing or collaboration), you can use localtunnel to expose your application to the internet:

1. Start your backend and frontend servers as described above
2. In a new terminal, run:

```bash
npm run create-tunnels
```

This will:

- Create a public URL for your frontend (port 3000)
- Create a public URL for your backend (port 5000)
- Automatically update your frontend's environment variables to use the tunneled backend URL

The script will display the public URLs that you can share with others. They will be able to access your application through these URLs.

Note: The tunnel URLs are temporary and will change each time you run the script. Make sure to update the shared URLs when you restart the tunnels.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

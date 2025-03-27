import boto3
import os
import time
import uuid
from app.models import get_users_table, get_contacts_table

# Configuration: Use local or AWS DynamoDB
USE_LOCAL = os.getenv("USE_LOCAL", "true").lower() == "true"

if USE_LOCAL:
    dynamodb = boto3.resource(
        "dynamodb",
        region_name="us-east-1",
        endpoint_url="http://localhost:8000",  # DynamoDB Local
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy"
    )
else:
    dynamodb = boto3.resource(
        "dynamodb",
        region_name="us-east-1",  # Change to your AWS region
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )

def generate_unique_id(table, key_name, user_id=None, max_attempts=3):
    for _ in range(max_attempts):
        unique_id = str(uuid.uuid4())
        try:
            if user_id:  # For contacts table
                response = table.get_item(Key={
                    "user_id": user_id,
                    key_name: unique_id
                })
            else:  # For users table
                response = table.get_item(Key={
                    key_name: unique_id
                })
            if not response.get("Item"):
                return unique_id
        except Exception as e:
            print(f"Error generating unique ID: {str(e)}")
            continue
    raise Exception('Failed to generate unique ID')

def seed_database():
    """Seeds the database with a test user and 4 contacts."""
    try:
        # Get tables
        users_table = get_users_table()
        contacts_table = get_contacts_table()

        # Create test user
        user_id = generate_unique_id(users_table, 'user_id')
        current_time = str(int(time.time()))
        
        test_user = {
            'user_id': user_id,
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'phone': '+1-555-123-4567',
            'created_date': current_time
        }

        users_table.put_item(Item=test_user)
        print(f"Created test user: {test_user['email']}")

        # Create 4 contacts
        contacts = [
            {
                'first_name': 'Alice',
                'last_name': 'Smith',
                'email': 'alice.smith@example.com',
                'phone': '+1-555-987-6543'
            },
            {
                'first_name': 'Bob',
                'last_name': 'Johnson',
                'email': 'bob.johnson@example.com',
                'phone': '+1-555-456-7890'
            },
            {
                'first_name': 'Carol',
                'last_name': 'Williams',
                'email': 'carol.williams@example.com',
                'phone': '+1-555-234-5678'
            },
            {
                'first_name': 'David',
                'last_name': 'Brown',
                'email': 'david.brown@example.com',
                'phone': '+1-555-876-5432'
            }
        ]

        for contact_data in contacts:
            contact_id = generate_unique_id(contacts_table, 'contact_id', user_id)
            current_time = str(int(time.time()))
            
            contact = {
                "user_id": user_id,
                "contact_id": contact_id,
                "first_name": contact_data["first_name"],
                "last_name": contact_data["last_name"],
                "email": contact_data["email"],
                "phone": contact_data["phone"],
                "created_date": current_time,
                "edit_history": {
                    current_time: {
                        "first_name": contact_data["first_name"],
                        "last_name": contact_data["last_name"],
                        "email": contact_data["email"],
                        "phone": contact_data["phone"]
                    }
                }
            }

            contacts_table.put_item(Item=contact)
            print(f"Created contact: {contact['email']}")

        print("\nDatabase seeding completed successfully!")
        print(f"Test user email: {test_user['email']}")
        print("You can use this email to log in to the application.")

    except Exception as e:
        print(f"Error seeding database: {str(e)}")
        raise

if __name__ == "__main__":
    seed_database() 
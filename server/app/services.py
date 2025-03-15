import uuid
import time
import jwt
from flask import jsonify
from app.models import get_contacts_table, get_users_table
from app.socket import send_realtime_update

DELAY_TIME = 20  # Simulate slow API response time
JWT_SECRET = "your-secret-key-keep-it-safe"  # Keep this in environment variables in production

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

def check_user_email_exists(table, email):
    """Check if an email exists in the users table."""
    try:
        response = table.query(
            IndexName='email-index',
            KeyConditionExpression='email = :email',
            ExpressionAttributeValues={
                ':email': email
            }
        )
        return bool(response.get("Items"))
    except Exception as e:
        print(f"Error checking user email existence: {str(e)}")
        return False

def check_contact_email_exists(table, email, user_id):
    """Check if an email exists in the contacts table for a specific user."""
    try:
        response = table.query(
            IndexName='email-index',
            KeyConditionExpression='user_id = :uid AND email = :email',
            ExpressionAttributeValues={
                ':uid': user_id,
                ':email': email
            }
        )
        return bool(response.get("Items"))
    except Exception as e:
        print(f"Error checking contact email existence: {str(e)}")
        return False

def add_user(data):
    """Adds a new user to the database."""
    try:
        required_fields = ['first_name', 'last_name', 'email', 'phone']
        if not all(field in data for field in required_fields):
            print("missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400

        email = data.get('email')
        table = get_users_table()

        if check_user_email_exists(table, email):
            return jsonify({'error': 'Email already exists'}), 400

        user_id = generate_unique_id(table, 'user_id')
        user_data = {
            'user_id': user_id,
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'email': email,
            'phone': data.get('phone'),
            'created_date': str(int(time.time()))
        }

        table.put_item(Item=user_data)
        print("user added")
        return jsonify(user_data), 201
    except Exception as e:
        print(f"Error adding user: {str(e)}")
        return jsonify({'error': 'Failed to add user'}), 500

def get_user(email):
    """Login route that verifies email and returns a JWT token."""
    try:
        table = get_users_table()
        response = table.query(
            IndexName='email-index',
            KeyConditionExpression='email = :email',
            ExpressionAttributeValues={':email': email}
        )
        
        items = response.get("Items", [])
        if not items:
            return jsonify({"error": "User not found"}), 404
            
        user = items[0]
        token = jwt.encode(
            {
                'user_id': user['user_id'],
                'email': user['email'],
                'exp': int(time.time()) + 86400  # 24 hours
            },
            JWT_SECRET,
            algorithm='HS256'
        )
        
        return jsonify({
            "token": token,
            "user": {
                "user_id": user["user_id"],
                "email": user["email"],
                "first_name": user["first_name"],
                "last_name": user["last_name"]
            }
        }), 200
    except Exception as e:
        print(f"Error during login: {str(e)}")
        return jsonify({"error": "Login failed"}), 500

def create_contact(user_id, data):
    """Creates a new contact."""
    try:
        required_fields = ["first_name", "last_name", "email", "phone"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "All fields are required"}), 400

        table = get_contacts_table()
        email = data.get("email")

        if check_contact_email_exists(table, email, user_id):
            return jsonify({"error": "Email already exists"}), 400

        contact_id = generate_unique_id(table, 'contact_id', user_id)
        current_time = str(int(time.time()))
        
        time.sleep(DELAY_TIME)  # Simulating delay

        contact = {
            "user_id": user_id,
            "contact_id": contact_id,
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "email": email,
            "phone": data["phone"],
            "created_date": current_time,
            "edit_history": {
                current_time: {
                    "first_name": data["first_name"],
                    "last_name": data["last_name"], 
                    "email": email,
                    "phone": data["phone"]
                }
            }
        }

        table.put_item(Item=contact)
        print("contact created")
        
        send_realtime_update({**contact, "action": "create"})
        
        return jsonify(contact), 201
    except Exception as e:
        print(f"Error creating contact: {str(e)}")
        return jsonify({"error": "Failed to create contact"}), 500

def get_contacts(user_id):
    """Retrieves all contacts for a given user_id."""
    try:
        table = get_contacts_table()
        
        response = table.query(
            KeyConditionExpression="user_id = :uid",
            ExpressionAttributeValues={":uid": user_id},
            ProjectionExpression="contact_id, first_name, last_name"
        )
        print("Contacts:", response.get("Items", []))
        return jsonify(response.get("Items", [])), 200
    except Exception as e:
        print(f"Error retrieving contacts: {str(e)}")
        return jsonify({"error": "Failed to retrieve contacts"}), 500

def update_contact(user_id, contact_id, data):
    """Updates an existing contact."""
    try:
        table = get_contacts_table()
        
        response = table.get_item(Key={"user_id": user_id, "contact_id": contact_id})
        contact = response.get("Item")

        if not contact:
            return jsonify({"error": "Contact not found"}), 404

        if "email" in data and data["email"] != contact["email"]:
            if check_contact_email_exists(table, data["email"], user_id):
                return jsonify({"error": "Email already exists"}), 400

        edit_history = {}
        for field in ["first_name", "last_name", "phone", "email"]:
            if field in data:
                contact[field] = data[field]
                edit_history[field] = data[field]

        current_time = str(int(time.time()))
        contact.setdefault("edit_history", {})[current_time] = edit_history

        table.put_item(Item=contact)
        print(f"contact updated - id: {contact_id}, email: {contact['email']}")
        
        send_realtime_update({**contact, "action": "update"})
        
        return jsonify(contact), 200
    except Exception as e:
        print(f"Error updating contact: {str(e)}")
        return jsonify({"error": "Failed to update contact"}), 500

def delete_contact(user_id, contact_id):
    """Deletes a contact."""
    try:
        table = get_contacts_table()
        response = table.get_item(Key={"user_id": user_id, "contact_id": contact_id})

        if "Item" not in response:
            return jsonify({"error": "Contact not found"}), 404

        email = response['Item']['email']
        table.delete_item(Key={"user_id": user_id, "contact_id": contact_id})
        print(f"contact deleted - id: {contact_id}, email: {email}")
        
        send_realtime_update({
            "user_id": user_id,
            "contact_id": contact_id,
            "action": "delete"
        })

        return jsonify({"message": "Contact deleted", "email": email}), 200
    except Exception as e:
        print(f"Error deleting contact: {str(e)}")
        return jsonify({"error": "Failed to delete contact"}), 500

def get_contact(user_id, contact_id):
    """Retrieves a specific contact."""
    try:
        table = get_contacts_table()
        response = table.get_item(Key={"user_id": user_id, "contact_id": contact_id})
        contact = response.get("Item")

        if not contact:
            return jsonify({"error": "Contact not found"}), 404

        return jsonify(contact), 200
    except Exception as e:
        print(f"Error retrieving contact: {str(e)}")
        return jsonify({"error": "Failed to retrieve contact"}), 500

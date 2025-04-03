from flask import Blueprint, request, jsonify
import time
from app.services import add_user, get_user, create_contact, get_contacts, update_contact, delete_contact, get_contact
from app.config import Config
from app.sse import sse_contact_updates
# from app.socket import send_realtime_update
from app.auth import token_required

routes = Blueprint("routes", __name__)

@routes.route('/status', methods=['GET'])
def check_status():
    """
    GET /status
    Returns the status of the server
    """
    print("status check")
    current_time = time.strftime("%Y-%m-%d %H:%M:%S")
    return jsonify({
        'status': 'Server is running',
        'timestamp': int(time.time()),
        'datetime': current_time
    }), 200

@routes.route('/users', methods=['POST'])
@token_required
def create_user():
    """
    POST /users
    Creates a new user
    """
    return add_user(request.json)

@routes.route('/users/<email>', methods=['GET'])
def get_user_by_email(email):
    """
    GET /users/<email>
    Returns the user with the given email
    """
    return get_user(email)

@routes.route('/contacts/<user_id>', methods=['POST'])
@token_required
def add_contact(user_id):
    """
    POST /contacts/<user_id>
    Adds a new contact to the user with the given user_id
    """
    if user_id != request.user['user_id']:
        return jsonify({"error": "Unauthorized"}), 403
    return create_contact(user_id, request.json)

@routes.route('/contacts/<user_id>', methods=['GET'])
@token_required
def list_contacts(user_id):
    """
    GET /contacts/<user_id>
    Returns all contacts for the user with the given user_id
    """
    if user_id != request.user['user_id']:
        return jsonify({"error": "Unauthorized"}), 403
    return get_contacts(user_id)

@routes.route('/contacts/<user_id>/<contact_id>', methods=['GET'])
@token_required
def get_single_contact(user_id, contact_id):
    """
    GET /contacts/<user_id>/<contact_id>
    Returns the contact with the given user_id and contact_id
    """
    if user_id != request.user['user_id']:
        return jsonify({"error": "Unauthorized"}), 403
    return get_contact(user_id, contact_id)

@routes.route('/contacts/<user_id>/<contact_id>', methods=['PUT'])
@token_required
def modify_contact(user_id, contact_id):
    """
    PUT /contacts/<user_id>/<contact_id>
    Modifies the contact with the given user_id and contact_id
    """
    if user_id != request.user['user_id']:
        return jsonify({"error": "Unauthorized"}), 403
    return update_contact(user_id, contact_id, request.json)

@routes.route('/contacts/<user_id>/<contact_id>', methods=['DELETE'])
@token_required
def remove_contact(user_id, contact_id):
    """
    DELETE /contacts/<user_id>/<contact_id>
    Deletes the contact with the given user_id and contact_id
    """
    if user_id != request.user['user_id']:
        return jsonify({"error": "Unauthorized"}), 403
    return delete_contact(user_id, contact_id)

# Real-time updates via SSE for AWS Lambda - not using this for now
if Config.REALTIME_MODE == "sse":
    @routes.route("/contacts/updates/<user_id>", methods=["GET"])
    def sse_updates(user_id):
        return sse_contact_updates(user_id)



from functools import wraps
from flask import request, jsonify
import jwt
from app.services import JWT_SECRET

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # Verify token
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            # Add user info to request
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(*args, **kwargs)

    return decorated 
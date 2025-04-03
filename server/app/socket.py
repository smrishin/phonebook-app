from flask_socketio import SocketIO
from app.config import Config

'''
Future improvements:
- Implement threading to handle multiple connections and race conditions
- Implement a queue to handle the updates and send them to the clients
- Implement a more efficient way to handle the updates
'''

socketio = None

if Config.REALTIME_MODE == "websockets":
    socketio = SocketIO(cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    """Handle new client connections"""
    print('Client connected')

def send_realtime_update(contact):
    if Config.REALTIME_MODE == "websockets" and socketio:
        socketio.emit("contactUpdated", contact)

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnections"""
    print('Client disconnected')

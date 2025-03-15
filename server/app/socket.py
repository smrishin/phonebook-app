from flask_socketio import SocketIO
from app.config import Config

socketio = None

if Config.REALTIME_MODE == "websockets":
    socketio = SocketIO(cors_allowed_origins="*")

def send_realtime_update(contact):
    if Config.REALTIME_MODE == "websockets" and socketio:
        socketio.emit("contactUpdated", contact)

from app import create_app
from app.config import Config
from app.socket import socketio

app = create_app()

if __name__ == "__main__":
    if Config.REALTIME_MODE == "websockets":
        socketio.run(app, debug=True, host="0.0.0.0", port=5000)
    else:
        app.run(debug=True, host="0.0.0.0", port=5000)

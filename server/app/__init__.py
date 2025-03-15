from flask import Flask
from flask_cors import CORS
from app.routes import routes
from app.config import Config
from app.socket import socketio

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(routes)

    if Config.REALTIME_MODE == "websockets":
        socketio.init_app(app)

    return app

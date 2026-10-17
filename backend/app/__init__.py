from datetime import timedelta
import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from .extensions import db, jwt, bcrypt
from .routes import register_routes

def create_app(test_config=None):
    load_dotenv()  # Load environment variables from .env file

    app = Flask(__name__)

    app.config.update(
        SECRET_KEY=os.getenv('SECRET_KEY'),
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY'),
        SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(minutes=15),
    )
    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": os.getenv(
                    "CORS_ORIGINS",
                    "http://localhost:5173",
                )
            }
        },
    )

    register_routes(app)

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"}), 200

    return app

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

from app.models import User
from app.extensions import db
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__, url_prefix="/api/auth")

@auth_bp.post('/register')
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validate required fields and types
    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Email and password are required."}), 400

    email = email.strip().lower()

    password_length_check = User().check_password_length(password)
    if not password_length_check:
        return jsonify({"error": "Password must be at least 8 characters long."}), 400
    if not email or len(email) > 120:
        return jsonify({"error": "Invalid email."}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"error": "User already exists."}), 409

    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "User already exists."}), 409

    
    return jsonify({
        "message": "Registration successful.",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
        },
    }), 201

@auth_bp.post('/login')
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validate required fields and types
    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Email and password are required."}), 400

    email = email.strip().lower()

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Login successful.", "access_token": access_token, "token_type": "Bearer", "user": {"id": user.id, "email": user.email}}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    if user is None:
        return jsonify({"error": "User not found."}), 404

    return jsonify({
        "user": {
            "id": user.id,
            "email": user.email,
        }
    }), 200

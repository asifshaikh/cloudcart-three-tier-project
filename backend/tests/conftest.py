import pytest

from app import create_app
from app.extensions import db

@pytest.fixture()
def app():
    test_config = {
        "TESTING": True,
        "SECRET_KEY": "test-secret-key",
        "JWT_SECRET_KEY": "test-jwt-secret-key",
        "SQLALCHEMY_DATABASE_URI": "sqlite://",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "JWT_ACCESS_TOKEN_EXPIRES": False,
        "BCRYPT_LOG_ROUNDS": 4,
    }

    app = create_app(test_config)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture()
def client(app):
    return app.test_client()

@pytest.fixture()
def registered_user(client):
    user_data = {
        "email": "test@example.com",
        "password": "CloudCart123!",
    }

    response = client.post(
        "/api/auth/register",
        json=user_data,
    )

    assert response.status_code == 201
    return user_data

@pytest.fixture()
def auth_token(client, registered_user):
    response = client.post(
        "/api/auth/login",
        json=registered_user,
    )

    assert response.status_code == 200
    return response.get_json()["access_token"]
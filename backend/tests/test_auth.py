
import pytest

from app.extensions import db
from app.models import User


def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "SecurePass123!",
        },
    )

    assert response.status_code == 201

    data = response.get_json()
    assert data["message"] == "Registration successful."
    assert data["user"]["email"] == "newuser@example.com"
    assert "password_hash" not in data["user"]


def test_password_is_stored_as_bcrypt_hash(app, client):
    client.post(
        "/api/auth/register",
        json={
            "email": "hashcheck@example.com",
            "password": "SecurePass123!",
        },
    )

    with app.app_context():
        user = User.query.filter_by(
            email="hashcheck@example.com"
        ).first()

        assert user is not None
        assert user.password_hash != "SecurePass123!"
        assert user.check_password("SecurePass123!")
        assert not user.check_password("WrongPassword123!")


def test_register_rejects_duplicate_email(client, registered_user):
    response = client.post(
        "/api/auth/register",
        json={
            "email": registered_user["email"],
            "password": "AnotherPass123!",
        },
    )

    assert response.status_code == 409
    assert "error" in response.get_json()


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"email": "missing-password@example.com"},
        {"password": "MissingEmail123!"},
        {"email": "", "password": "SecurePass123!"},
        {"email": "shortpass@example.com", "password": "short"},
        {"email": 123, "password": "SecurePass123!"},
    ],
)
def test_register_rejects_invalid_input(client, payload):
    response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert response.status_code == 400
    assert "error" in response.get_json()


def test_login_success(client, registered_user):
    response = client.post(
        "/api/auth/login",
        json=registered_user,
    )

    assert response.status_code == 200

    data = response.get_json()
    assert data["message"] == "Login successful."
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0
    assert data["token_type"] == "Bearer"
    assert data["user"]["email"] == registered_user["email"]
    assert "password_hash" not in data["user"]


def test_login_rejects_wrong_password(client, registered_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": registered_user["email"],
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401
    assert response.get_json()["error"] == (
        "Invalid email or password."
    )


def test_login_rejects_unknown_email(client):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "unknown@example.com",
            "password": "SecurePass123!",
        },
    )

    assert response.status_code == 401


def test_login_rejects_missing_fields(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com"},
    )

    assert response.status_code == 400


def test_me_requires_authentication(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_rejects_invalid_token(client):
    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": "Bearer invalid-token",
        },
    )

    assert response.status_code in (401, 422)


def test_me_returns_authenticated_user(client, auth_token):
    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {auth_token}",
        },
    )

    assert response.status_code == 200
    assert response.get_json()["user"]["email"] == (
        "test@example.com"
    )

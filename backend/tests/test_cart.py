
import pytest

from app.extensions import db
from app.models import Product, CartItem


@pytest.fixture()
def product(app):
    item = Product(
        name="Test Backpack",
        description="A backpack for testing.",
        price="39.99",
        stock=10,
    )
    db.session.add(item)
    db.session.commit()
    return item


def test_cart_requires_authentication(client):
    response = client.get("/api/cart")

    assert response.status_code == 401


def test_add_product_to_cart(client, auth_token, product):
    response = client.post(
        "/api/cart/items",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"product_id": product.id, "quantity": 2},
    )

    assert response.status_code == 200
    data = response.get_json()

    assert data["item"]["quantity"] == 2
    assert data["item"]["product"]["name"] == "Test Backpack"
    assert data["item"]["line_total"] == "79.98"


def test_adding_same_product_increases_quantity(
    client, auth_token, product
):
    headers = {"Authorization": f"Bearer {auth_token}"}

    first = client.post(
        "/api/cart/items",
        headers=headers,
        json={"product_id": product.id, "quantity": 2},
    )
    second = client.post(
        "/api/cart/items",
        headers=headers,
        json={"product_id": product.id, "quantity": 3},
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.get_json()["item"]["quantity"] == 5

    with db.session.no_autoflush:
        items = db.session.execute(
            db.select(CartItem).where(
                CartItem.product_id == product.id
            )
        ).scalars().all()

    assert len(items) == 1


def test_cart_total(client, auth_token, product):
    headers = {"Authorization": f"Bearer {auth_token}"}

    client.post(
        "/api/cart/items",
        headers=headers,
        json={"product_id": product.id, "quantity": 2},
    )

    response = client.get("/api/cart", headers=headers)

    assert response.status_code == 200
    data = response.get_json()

    assert data["total"] == "79.98"
    assert len(data["items"]) == 1


def test_add_rejects_quantity_above_stock(
    client, auth_token, product
):
    response = client.post(
        "/api/cart/items",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"product_id": product.id, "quantity": 11},
    )

    assert response.status_code == 409
    assert response.get_json()["available_stock"] == 10


def test_add_rejects_invalid_quantity(
    client, auth_token, product
):
    response = client.post(
        "/api/cart/items",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"product_id": product.id, "quantity": 0},
    )

    assert response.status_code == 400


def test_update_cart_item(client, auth_token, product):
    headers = {"Authorization": f"Bearer {auth_token}"}

    add_response = client.post(
        "/api/cart/items",
        headers=headers,
        json={"product_id": product.id, "quantity": 2},
    )
    item_id = add_response.get_json()["item"]["id"]

    response = client.patch(
        f"/api/cart/items/{item_id}",
        headers=headers,
        json={"quantity": 4},
    )

    assert response.status_code == 200
    assert response.get_json()["item"]["quantity"] == 4


def test_remove_cart_item(client, auth_token, product):
    headers = {"Authorization": f"Bearer {auth_token}"}

    add_response = client.post(
        "/api/cart/items",
        headers=headers,
        json={"product_id": product.id, "quantity": 1},
    )
    item_id = add_response.get_json()["item"]["id"]

    response = client.delete(
        f"/api/cart/items/{item_id}",
        headers=headers,
    )

    assert response.status_code == 200

    cart_response = client.get("/api/cart", headers=headers)
    assert cart_response.get_json()["items"] == []
    assert cart_response.get_json()["total"] == "0.00"


def test_add_missing_product_returns_404(client, auth_token):
    response = client.post(
        "/api/cart/items",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"product_id": 99999, "quantity": 1},
    )

    assert response.status_code == 404

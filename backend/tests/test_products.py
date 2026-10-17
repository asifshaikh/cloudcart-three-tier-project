
import pytest

from app.extensions import db
from app.models import Product


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


def test_list_products(client, product):
    response = client.get("/api/products")

    assert response.status_code == 200
    data = response.get_json()

    assert data["count"] == 1
    assert data["products"][0]["name"] == "Test Backpack"
    assert data["products"][0]["price"] == "39.99"
    assert data["products"][0]["stock"] == 10


def test_get_product(client, product):
    response = client.get(f"/api/products/{product.id}")

    assert response.status_code == 200
    data = response.get_json()

    assert data["product"]["id"] == product.id
    assert data["product"]["name"] == "Test Backpack"


def test_get_missing_product_returns_404(client):
    response = client.get("/api/products/99999")

    assert response.status_code == 404
    assert response.get_json()["error"] == "Product not found."

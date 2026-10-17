from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import Product

products_bp = Blueprint('products', __name__, url_prefix="/api/products")

def serialize_product(product):
    return {
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': format(product.price, '.2f'),
        'stock': product.stock
    }

@products_bp.get("")
def list_products():
    products = db.session.execute(
        db.select(Product).order_by(Product.id)
    ).scalars().all()

    return jsonify({
        "products": [
            serialize_product(product)
            for product in products
        ],
        "count": len(products),
    }), 200


@products_bp.get("/<int:product_id>")
def get_product(product_id):
    product = db.session.get(Product, product_id)

    if product is None:
        return jsonify({
            "error": "Product not found."
        }), 404

    return jsonify({
        "product": serialize_product(product)
    }), 200

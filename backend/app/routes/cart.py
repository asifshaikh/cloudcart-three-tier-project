from decimal import Decimal
from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models import CartItem, Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity

cart_bp = Blueprint('cart', __name__, url_prefix="/api/cart")

def get_current_user():
    user_id = get_jwt_identity()
    return db.session.get(User, int(user_id))

def serialize_cart_item(item):
    line_total = item.product.price * item.quantity
    return {
        "id": item.id,
        "product": {
            "id": item.product.id,
            "name": item.product.name,
            "description": item.product.description,
            "price": format(item.product.price, ".2f"),
        },
        "quantity": item.quantity,
        "line_total": format(line_total, ".2f"),
    }

@cart_bp.get("")
@jwt_required()
def get_cart():
    user = get_current_user()

    if user is None:
        return jsonify({"error": "User not found."}), 404

    items = db.session.execute(db.select(CartItem).where(CartItem.user_id == user.id).order_by(CartItem.id)).scalars().all()

    total = sum((item.product.price * item.quantity for item in items), Decimal("0.00"))

    return jsonify({
        "items": [serialize_cart_item(item) for item in items],
        "total": format(total, ".2f")
    }), 200

@cart_bp.post("/items")
@jwt_required()
def add_to_cart():
    user = get_current_user()

    if user is None:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    # bool is a subclass of int in Python, so reject it explicitly.
    if (
        isinstance(product_id, bool)
        or not isinstance(product_id, int)
        or isinstance(quantity, bool)
        or not isinstance(quantity, int)
        or quantity < 1
    ):
        return jsonify({
            "error": "Product ID and a positive integer quantity are required."
        }), 400

    product = db.session.get(Product, product_id)

    if product is None:
        return jsonify({"error": "Product not found."}), 404

    item = db.session.execute(
        db.select(CartItem).where(
            CartItem.user_id == user.id,
            CartItem.product_id == product.id,
        )
    ).scalar_one_or_none()

    new_quantity = quantity + (item.quantity if item else 0)

    if product.stock < 1:
        return jsonify({"error": "Product is out of stock."}), 409

    if new_quantity > product.stock:
        return jsonify({
            "error": "Requested quantity exceeds available stock.",
            "available_stock": product.stock,
        }), 409

    if item:
        item.quantity = new_quantity
    else:
        item = CartItem(
            user_id=user.id,
            product_id=product.id,
            quantity=quantity,
        )
        db.session.add(item)

    db.session.commit()

    return jsonify({
        "message": "Cart updated successfully.",
        "item": serialize_cart_item(item),
    }), 200


@cart_bp.patch("/items/<int:item_id>")
@jwt_required()
def update_cart_item(item_id):
    user = get_current_user()

    if user is None:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    quantity = data.get("quantity")

    if (
        isinstance(quantity, bool)
        or not isinstance(quantity, int)
        or quantity < 1
    ):
        return jsonify({
            "error": "Quantity must be a positive integer."
        }), 400

    item = db.session.execute(
        db.select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == user.id,
        )
    ).scalar_one_or_none()

    if item is None:
        return jsonify({"error": "Cart item not found."}), 404

    if quantity > item.product.stock:
        return jsonify({
            "error": "Requested quantity exceeds available stock.",
            "available_stock": item.product.stock,
        }), 409

    item.quantity = quantity
    db.session.commit()

    return jsonify({
        "message": "Cart item updated successfully.",
        "item": serialize_cart_item(item),
    }), 200


@cart_bp.delete("/items/<int:item_id>")
@jwt_required()
def remove_cart_item(item_id):
    user = get_current_user()

    if user is None:
        return jsonify({"error": "User not found."}), 404

    item = db.session.execute(
        db.select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == user.id,
        )
    ).scalar_one_or_none()

    if item is None:
        return jsonify({"error": "Cart item not found."}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({
        "message": "Cart item removed successfully."
    }), 200
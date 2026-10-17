from .auth import auth_bp
from .products import products_bp   
from .cart import cart_bp
def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(cart_bp)
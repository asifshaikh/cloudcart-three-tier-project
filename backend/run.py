import click
from app import create_app
from app.extensions import db
from app.models import  Product
app = create_app()

@app.cli.command("init-db")
def init_db():
    """Create the database tables."""
    with app.app_context():
        db.create_all()

    click.echo("Database tables created.")

@app.cli.command("seed-products")
def seed_products():
    """Insert sample products into the database."""

    sample_products = [
        (
            "Everyday Backpack",
            "A durable backpack for daily use.",
            39.99,
            25,
        ),
        (
            "Wireless Mouse",
            "A smooth and responsive wireless mouse.",
            19.99,
            50,
        ),
        (
            "Bluetooth Headphones",
            "High-quality sound with noise cancellation.",
            89.99,
            15,
        ),
        (
            "Smartwatch",
            "A smartwatch with fitness tracking features.",
            129.99,
            30,
        ),
        (
            "Portable Charger",
            "A compact charger for your devices on the go.",
            29.99,
            40,
        ),
    ]

    with app.app_context():
        if Product.query.first():
            click.echo("Products already exist in the database. Skipping seeding.")
            return

        for product_data in sample_products:
            product = Product(name=product_data[0], description=product_data[1], price=product_data[2], stock=product_data[3])
            db.session.add(product)

        db.session.commit()
        click.echo("Sample products seeded into the database.")
import random
import shopify
from datetime import datetime, timedelta
import time
# Set up the Shopify API client using the provided token and shop name.
ACCESS_TOKEN = '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'
SHOP_NAME = 'jorge-test2'
shop_url = f'https://{SHOP_NAME}.myshopify.com'
api_version = '2023-01'
session = shopify.Session(shop_url, api_version, ACCESS_TOKEN)
shopify.ShopifyResource.activate_session(session)
TOTAL_ORDERS = 20

# Define the product names and prices.
PRODUCTS = [
    {'name': 'Skate board 1', 'price': 100},
    {'name': 'Winter board 2', 'price': 200},
    {'name': 'Printed T-shirt', 'price': 50},
    {'name': 'Board 1998', 'price': 150},
    {'name': 'Board v2', 'price': 123.50},
    {'name': 'Board Mac Miller', 'price': 250},
    {'name': 'Board Soda', 'price': 190},
    {'name': 'Board again', 'price': 160},
    {'name': 'Board again again again', 'price': 170},
]

NUM_USERS = 2

# Define the start and end dates for the orders.
START_DATE = datetime(2023, 5, 3)
END_DATE = datetime(2023, 5, 3, 23)

# Retrieve the product IDs for the three products using their names.
# Create the products if they don't exist.
product_ids = {}
for product in PRODUCTS:
    time.sleep(1)
    products = shopify.Product.find(title=product['name'])
    if len(products) == 0:
        new_product = shopify.Product({
            'title': product['name'],
            'product_type': 'Physical',
            'vendor': 'MyShopify',
            'variants': [{
                'price': product['price'],
                'inventory_quantity': 10,
                'inventory_management': 'shopify',
                'fulfillment_service': 'manual',
            }],
        })
        new_product.save()
        product_ids[product['name']] = new_product.id
    else:
        product_ids[product['name']] = products[0].id


CUSTOMERS = []
for user in range(NUM_USERS):
    i = user + 1
    email = f'customer{i}@example.com'

    # Try to find an existing customer with the same email address
    customers = shopify.Customer.find(email=email)
    if customers:
        # If a customer with the same email address exists, use their ID for the order
       customer_id = customers[0].id
    else:
        # If no customer with the same email address exists, create a new customer
        customer = shopify.Customer()
        customer.email = email
        customer.first_name = f'John {i}'
        customer.last_name = f'Doe {1}'
        customer.save()
        customer_id = customer.id

    CUSTOMERS.append(customer_id)
    
print(CUSTOMERS)

# Generate 500 random orders, each with a random product, price, and date.
orders = []
for i in range(TOTAL_ORDERS):
    product = random.choice(PRODUCTS)
    price = product['price']
    date = START_DATE + timedelta(days=random.randint(0, (END_DATE - START_DATE).days))
    orders.append({
        'line_items': [
            {
                'title': product['name'],
                'price': product['price'],
                'variant_id': product_ids[product['name']],
                'quantity': 1,
            }
        ],
        "financial_status": "paid",
        'total_price': price,
        'processed_at': date.isoformat(),
    })

# time.sleep(20)
print(orders[0])
start = time.time()
i = 0
# Use the Shopify API to create the 500 orders.
for order in orders:
    i += 1
    print(f'({i}): {time.time() - start}....')
    new_order = shopify.Order()
    new_order.attributes = random.choice(orders)
    cust_id = random.choice(CUSTOMERS)
    new_order.customer_id = cust_id
    new_order.email = f'customer{cust_id}@example.com'
    print(new_order.attributes)
    try:
        res = new_order.save()
    except Exception as e:
        print(e)
        time.sleep(10)
    time.sleep(10)

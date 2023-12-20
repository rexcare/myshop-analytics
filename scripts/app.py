from flask import Flask, jsonify, request, Response, redirect
from flask_cors import CORS
import requests
import os
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])


# Replace these with your own Shopify app credentials
SHOP_NAME = 'jorge-test2'
API_KEY = '4c577d483c9da0fb79b3769c1fcb285b'
API_SECRET_KEY = os.environ.get('API_SECRET_KEY')
REDIRECT_URI = 'http://127.0.0.1:5000/auth/callback' # Replace with your own redirect URI
SCOPE = 'read_products' # Replace with the desired scope for your app


@app.route('/proxy', methods=['GET', 'POST'])
def proxy():
    # Get the URL to proxy from the query parameters or request body
    url = request.args.get('url') or request.json.get('url')
    if not url:
        return 'URL is missing', 400

    # Make the request to the target API with the same method and headers as the original request
    method = request.method
    headers = {
        "X-Shopify-Access-Token": "fixme"
    }
    response = requests.request(method, url, headers=headers, data=request.get_data(), stream=True)
    print(method, url, headers, response, request.get_data())
    # Extract the response headers and content

    print(response.headers)
    proxied_headers = {'Link': dict(response.headers).get('Link') }
    proxied_content = response.json()
    print(proxied_content, proxied_headers)
    # Create a Flask Response object with the proxied content and headers

    res = jsonify(proxied_content)

    res.headers = proxied_headers
    return res
 

@app.route('/login')
def hello():
    # Redirect the user to the Shopify authorization page
    authorize_url = f'https://{SHOP_NAME}.myshopify.com/admin/oauth/authorize?client_id={API_KEY}&scope={SCOPE}&redirect_uri={REDIRECT_URI}'
    return redirect(authorize_url)


@app.route('/auth/callback')
def callback():
    # Retrieve the authorization code from the callback URL
    code = request.args.get('code')
    print(request.args)
    return redirect('http://localhost:3000/admin/default')


    # Exchange the authorization code for an access token
    token_url = f'https://{API_KEY}:{API_SECRET_KEY}@your-store-name.myshopify.com/admin/oauth/access_token'
    payload = {
        'client_id': API_KEY,
        'client_secret': API_SECRET_KEY,
        'code': code
    }
    response = requests.post(token_url, json=payload)
    access_token = response.json().get('access_token')

    # Use the access token to make API requests to Shopify
    # For example, you can use the access token to fetch products from the store
    headers = {
        'X-Shopify-Access-Token': access_token
    }
    products_url = f'https://your-store-name.myshopify.com/admin/api/2021-09/products.json'
    response = requests.get(products_url, headers=headers)
    products = response.json().get('products')

    # Do something with the products data
    # ...

    return jsonify(products)


if __name__ == '__main__':
    app.run(debug=True)

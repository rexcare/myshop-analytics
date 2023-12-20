import json
import requests
from flask import Flask, jsonify, request, redirect, abort
from flask_cors import CORS
from src.shopify_api_service import ShopifyApi
from src.data_service import OrdersDataService, NpEncoder
from src.params_service import fetch_secret_param
import firebase_admin
from firebase_admin import auth

firebase_admin.initialize_app()


SERVER_DOMAIN = fetch_secret_param("SERVER_DOMAIN")
CLIENT_DOMAIN = fetch_secret_param("CLIENT_DOMAIN")
SCOPE = fetch_secret_param("SHOPIFY_API_SCOPE")
APP_API_KEY = fetch_secret_param('SHOPIFY_PUBLIC_KEY')
APP_API_SECRET_KEY = fetch_secret_param('SHOPIFY_PRIVATE_KEY')

app = Flask(__name__)
CORS(app, origins=[CLIENT_DOMAIN])


@app.route('/')
def hello():
    return 'Hello, world!'

@app.route('/shopify/login')
def shopify_login():
    print("In log in")
    shop_name = request.args.get('shop_name')
    create_account = request.args.get('create_account')

    redirect_url = f"{SERVER_DOMAIN}/shopify/callback"
    if create_account:
        redirect_url += "/createAccount"
    authorize_url = f"https://{shop_name}.myshopify.com/admin/oauth/authorize?client_id={APP_API_KEY}&scope={SCOPE}&redirect_uri={redirect_url}"
    print(authorize_url)
    return redirect(authorize_url, code=302)

@app.route('/shopify/callback')
def shopify_login_callback(create_account=False):
    code = request.args.get('code')
    shop = request.args.get('shop')
    hmac = request.args.get('hmac')

    # TODO verify hmac

    token_url = f"https://{shop}/admin/oauth/access_token"
    params = {
        'client_id': APP_API_KEY,
        'client_secret': APP_API_SECRET_KEY,
        'code': code,
        'expires_in': 3600,
    }
    res = requests.post(token_url, params=params)
    if res.ok:
        data = res.json()
        access_token = data['access_token']
        if create_account:
            redirect_url = f"{CLIENT_DOMAIN}/auth/company-setup?access_token={access_token}&shop={shop}"
        else:
            redirect_url = f"{CLIENT_DOMAIN}/admin/default?access_token={access_token}&shop={shop}"
        return redirect(redirect_url, code=302)

    return abort(400, res.text)

@app.route('/auth/verify_token')
def auth_verify_token():
    token = request.args.get('token')
    try:
        decoded_token = auth.verify_id_token(token)
        return jsonify(decoded_token)
    except Exception as e:
        print(f"Error verifying token {token}:", e)
        return abort(400, str(e))


@app.route('/shopify/callback/createAccount')
def shopify_login_callback_with_account():
    return shopify_login_callback(create_account=True)


@app.route('/shopify/orders')
def fetch_orders():
    shop = request.args.get('shop')
    access_token = request.args.get('access_token')
    limit = request.args.get('limit')
    if limit: 
        limit = int(limit)
    else: 
        limit = 1000

    shopify = ShopifyApi(access_token, shop)
    orders = shopify.get_entity('orders', params={'status': 'any'}, limit=limit)

    df = shopify.normalize_orders(orders)
    dataservice = OrdersDataService(df)
    data = dataservice.run()
    data = json.loads(json.dumps(data, cls=NpEncoder))


    response = jsonify(data)
    return response


def main(request):
    return app


if __name__ == '__main__':
    print("Running locally")
    app.run(port=8000, debug=True)

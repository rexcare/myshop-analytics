import requests
import json
import argparse
import webbrowser
from urllib.parse import unquote

"""
1. Redirect user to integrate app in amazon website by routing to
f"https://sellercentral.amazon.com/apps/authorize/consent?application_id={app_id}&state={state}&version=beta&redirect_uri={redirect_uri}"


2. Once they accept, they will be redirected back to CA, and in the link there is a query param "spapi_oauth_code"
Use that code to get a token as defined in fun `get_token`

3. 

"""
# Set up the necessary parameters for the authorization request

'''
eg 
https://sellercentral.amazon.com/apps/authorize/consent?application_id=amzn1.sp.solution.5ccff65f-14d2-4768-8b61-c300f2c70c6a
'''



# https://sellercentral.amazon.com/sellingpartner/developerconsole/ref=xx_DevCon_dnav_xx
app_id = 'amzn1.sp.solution.5ccff65f-14d2-4768-8b61-c300f2c70c6a'
client_id = 'amzn1.application-oa2-client.f185056a208d42289003b22d0ae40b14'
client_secret = 'amzn1.oa2-cs.v1.c3757be008c282f8a4f2588527a09952b386d9dfb59207b7ddc2dbc07aa98820'
redirect_uri = 'https://clearanalytics-dev.web.app/amazon'
scope = 'sales:all'
auth_endpoint = 'https://sellercentral.amazon.com/apps/authorize/consent'
state = "fixme"
redirect_uri = 'https://clearanalytics-dev.web.app/auth/amazon'
def oauth():
    # Generate the authorization URL
    auth_url = f"https://sellercentral.amazon.com/apps/authorize/consent?application_id={app_id}&state=fixme&version=beta&redirect_uri={redirect_uri}"
    print(auth_url)


def get_token(authorization_code):

    # Set up the necessary parameters for the access token request
    token_endpoint = 'https://api.amazon.com/auth/o2/token'
    # Send the access token request
    response = requests.post(token_endpoint, data={
        'grant_type': 'authorization_code',
        'code': authorization_code,
        'client_id': client_id,
        'client_secret': client_secret
    })
    print(response.text)

    # Parse the response and extract the access token and refresh token
    tokens = json.loads(response.text)
    access_token = tokens['access_token']
    refresh_token = tokens['refresh_token']

    print(access_token)
    print(refresh_token)
    # Use the access token to make API calls to the Amazon Selling Partner API
    # ...



'''
ANVNvbwSWCuERvtcPmiX
A14B4EAZ7UZPBA
'''


def get_orders(access_token):
    api_endpoint = 'https://sellingpartnerapi-na.amazon.com/orders/v0/orders?MarketplaceIds=A14B4EAZ7UZPBA&CreatedAfter=2020-03-01T00:00:00.000Z'

    # Request headers
    headers = {
        'x-amz-access-token': access_token,
        'Content-Type': 'application/json'
    }

    # Request parameters
    params = {
        'limit': '10'  # Fetch 10 orders
    }
    print(headers)
    # Send GET request to orders endpoint
    print(api_endpoint)
    response = requests.get(api_endpoint, headers=headers, params=params)
    print(response.text)


'''
Watch me ! https://m.media-amazon.com/images/G/01/spapi/Call_Sandbox_Endpoint.mp4
'''

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Amazon')
    parser.add_argument('-c', '--authorization_code', type=str, help='Code', required=False)
    parser.add_argument('-s', '--selling_partner_id', type=str, help='The Amazon store ID', required=False)
    parser.add_argument('-t', '--token', type=str, help='The Amazon store ID', required=False)

    args = parser.parse_args()
    oauth()
    token = get_token(args.authorization_code)
    get_orders(args.token)

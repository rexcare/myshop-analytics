import requests
import pandas as pd
from datetime import datetime, timezone
from random import randrange
import numpy as np
import time

class ShopifyApi:
    def __init__(self, access_token, shop_domain):
        self.access_token = access_token
        self.shop_domain = shop_domain
        self.base_url = f'https://{self.shop_domain}/admin/api/2023-04'

    def _get_request(self, url, params={}, headers={}):

        response = requests.get(url, params=params, headers=headers)
        request_time = response.elapsed.total_seconds()
        print(f"{response.url} : {request_time} (s)")
        if response.ok:
            return response
        else:
            msg = f"Error fetching {url}: {response.status_code} {response.reason}"
            print(msg)
            raise Exception(msg)


    def get_entity(self, entity, params={}, limit=100):
        url = f'{self.base_url}/{entity}.json'
        start_time = time.time()
        
        page_limit = min(250, limit)
        params['limit'] = page_limit

        # Set the authorization header with the access token
        headers = {
            'X-Shopify-Access-Token': self.access_token,
        }

        data = []
        response = self._get_request(url, params=params, headers=headers)
        batch = response.json()[entity]
        data += batch

        # Paginate through the remaining pages
        while 'Link' in response.headers and len(data) < limit:
            link_header = response.headers['Link']
            next_url = None
            for link in link_header.split(','):
                link = link.strip()
                if link.endswith('rel="next"'):
                    next_url = link[link.index('<')+1:link.index('>')]
                    break
            if not next_url:
                break
            print(f"Fetched {len(batch)} {entity}. Total: {len(data)}")
            response = self._get_request(next_url, headers=headers)
            batch = response.json()[entity]
            data += batch


        end_time = time.time()        
        duration = end_time - start_time
        print(f"Done fetching data. Total fetched: {len(data)} Duration (s): {duration}")
        return data


    def flatten_customer_data(self, orders):
        flat_orders = []
        for o in orders:
            customer = o.get('customer')
            if not customer:
                customer = {}
            customer = {f'user_{k}': v for k, v in customer.items()}
            flat_orders.append({ **o, **customer })

        return flat_orders        


    def normalize_product_names(self, df):
        '''
        Normalizes product names to best-effort standard
        '''
        df['product_product_id'].fillna(df['product_title'], inplace=True)

        products = df[['product_product_id', 'product_title']].groupby('product_product_id')['product_title'].apply(set).reset_index()
        products['product_short_title'] = products.product_title.apply(lambda titles: min(titles, key=len))
        products['product_title_variations'] = products.product_title.apply(lambda titles: ', '.join(titles))

        df = pd.merge(df, products, on='product_product_id', how='left')
        df = df.rename(columns={'product_short_title': 'product_name'})
        return df



    def normalize_orders(self, orders):
        '''
        Explodes products and adds dummy user ids
        '''
        orders = self.flatten_customer_data(orders)
        df = pd.json_normalize(orders, record_path='line_items', meta=['id', 'processed_at', 'user_id', 'total_price'], record_prefix='product_')
        cols = [
            'product_id', 'product_title', 'product_price', 'product_product_id', 'product_quantity', 
            'id', 'processed_at', 'user_id', 'total_price'
        ]
        df = df[cols]

        df['name'] = 'Order'
        df['processed_at'] = pd.to_datetime(df['processed_at'], utc=True)
        df['total_price'] = pd.to_numeric(df['total_price'])
        df['product_price'] = pd.to_numeric(df['product_price'])
        df['product_total_price'] = df.product_price * df.product_quantity
        df['processed_at_month'] = df.processed_at.dt.strftime('%Y-%m')
        df = self.normalize_product_names(df)

        return df



        
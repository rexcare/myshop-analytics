import argparse
import csv
import requests
import time
import json 
import tempfile
from src.utils import create_directory_if_not_exists

def transform_order(order):
    str_order = json.dumps(order)
    str_order = str_order.replace("{}", "null")
    return str_order

def fetch_orders(store_domain, access_token, starting_offset=0, max_orders=float("inf")):
    dir_name = f"{tempfile.gettempdir()}/export_data" 
    create_directory_if_not_exists(dir_name)
    file_name = f"{dir_name}/{store_domain}.jsonl"
    """Fetch orders from Shopify API and write them to a JSONL file."""
    # Endpoint for fetching orders from Shopify
    limit = min(250, max_orders)
    orders_endpoint = f'https://{store_domain}/admin/api/2023-04/orders.json?limit={limit}&status=any'

    # Fetch orders from Shopify with starting offset
    url = orders_endpoint
    headers = {'X-Shopify-Access-Token': access_token}
    all_orders = []
    with open(file_name, 'w') as f:
        while url:
            response = requests.get(url, headers=headers)
            print(response.url)
            if response.status_code == 200:
                orders = response.json().get('orders', [])
                all_orders.extend(orders)
                link_header = response.headers.get('Link')
                url = None
                if link_header:
                    # print(link_header)
                    next_link = [link for link in link_header.split(',') if 'rel="next"' in link]
                    if next_link:
                        next_link = next_link[0].strip()
                        url = next_link.split(';')[0].strip('<>')
                
                # Write orders data to JSONL file
                for order in orders:
                    f.write(transform_order(order) + '\n')
            else:
                print(f'Error fetching orders from Shopify API: {response.status_code} - {response.text}')
                raise Exception(response.text)
                url = None

            time.sleep(0)
            if len(all_orders) >= max_orders:
                break

    print(f'Finished. {len(all_orders)} orders exported to {file_name}.')
    return file_name


if __name__ == '__main__':
    """Main entry point of the script."""
    parser = argparse.ArgumentParser(description='Export orders from Shopify to CSV.')
    parser.add_argument('-d', '--store_domain', type=str, help='Shopify store domain', required=True)
    parser.add_argument('-t', '--access_token', type=str, help='Shopify access token', required=True)
    parser.add_argument('-o', '--starting_offset', type=int, help='Starting offset for fetching orders', default=0)
    parser.add_argument('-m', '--max_orders', type=int, help='Max number of orders', default=float("inf"))

    args = parser.parse_args()
    fetch_orders(args.store_domain, args.access_token, args.starting_offset, args.max_orders)
import re
import argparse
import time
from google.cloud import firestore
from src.load_bigquery import load_file_to_bigquery
from src.shopify_export import fetch_orders
from src.utils import replace_non_alphanumeric, benchmark

PROJECT_ID = 'clearanalytics-dev'
BIGQ_TABLE_NAME = 'shopify_orders'
SCHEMA_FILE = 'src/shopify_order_schema.json'
db = firestore.Client()


# Function to fetch 'integration' field for each document in 'company' collection
def fetch_companies(company=None):
    companies = []
    try:
        if company:
            doc_ref = db.collection('company').document(company)
            doc = doc_ref.get()
            comp = { 'firebaseId': doc.id, **doc.to_dict() }
            companies.append(comp)
        else:
            docs = db.collection('company').stream()
            for doc in docs:
                comp = { 'firebaseId': doc.id, **doc.to_dict() }
                companies.append(comp)
    except Exception as e:
        print('Error fetching company:', str(e))
    return companies


def update_integration_timestamp(company, integration_time):
    print(f"Updating shopifyExportedAt for {company} with value {integration_time}")
    doc_ref = db.collection("company").document(company) 
    res = doc_ref.update({
        "bigQuery.shopifyExportedAt": integration_time
    })
    return res


def process_company(company_id, store_domain, access_token):
    try:
        start_time = time.time()

        print(f"\n\n---- {company_id} (start: {start_time})")
        print(f"Fetching orders for company. Company id: {company_id} Shopify store: {store_domain}")        
        outf = benchmark(fetch_orders, store_domain, access_token, max_orders=20000)

        # FIXME ensure this at company id creation time
        bigq_dataset = replace_non_alphanumeric(company_id)

        print(f"Loading orders to bigquery. Company id: {company_id}. Dataset: {bigq_dataset}. Table: {BIGQ_TABLE_NAME}. File: {outf}")        
        
        benchmark(load_file_to_bigquery, bigq_dataset, BIGQ_TABLE_NAME, outf, schema_path=SCHEMA_FILE)
        update_integration_timestamp(company_id, start_time)
    except Exception as e:
        print(f"Unable to export {company_id}", e)
        raise e



def function_handler(event, context):
    '''
    Example event:
    {"oldValue": {}, "updateMask": {}, "value": {"createTime": "2023-07-05T03:02:06.590847Z", 
    "fields": {"foo": {"stringValue": "bar"}}, "name": "projects/clearanalytics-dev/databases/(default)/documents/company/test", 
    "updateTime": "2023-07-05T03:02:06.590847Z"}}
    '''
    print(f"Running in cloud with following invocation: Event: {event} Context: {context}")
    company_document = event.get('value', {})
    company_id = company_document.get('name').split('/')[-1]
    shopify_integration = company_document.get('fields', {}).get('shopifyIntegration', {}).get('mapValue', {}).get('fields', {})
    store_domain = shopify_integration.get('storeName', {}).get('stringValue')
    access_token = shopify_integration.get('token', {}).get('stringValue')

    required_fields = [company_id, store_domain, access_token]
    assert all(required_fields), "Missing one of company_id, store_domain, or access_token in invocation payload"
    
    return process_company(company_id, store_domain, access_token)


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='ETL from Shopify to Big Query')
    parser.add_argument('-c', '--company_name', type=str, help='Company name', required=False)
    args = parser.parse_args()

    msg = args.company_name if args.company_name else 'all'
    print(f"Starting ETL pipeline. Fetching companies ({msg})")
    companies = fetch_companies(args.company_name)
    for comp in companies:
        store_domain = comp.get('shopifyIntegration', {}).get('storeName')
        access_token = comp.get('shopifyIntegration', {}).get('token')
        company_id = comp.get('firebaseId')
        event = {
            'value': {
                'fields': {
                    'shopifyIntegration': {
                        'mapValue': {
                            'fields': {
                                'storeName': {
                                    'stringValue': store_domain
                                }, 
                                'token': {
                                    'stringValue': access_token
                                }
                            }
                        }
                    }
                },
                'name': company_id

            }
        }
        try:
            function_handler(event, {})
        except Exception as e:
            print(f'ERROR: {e}')
        
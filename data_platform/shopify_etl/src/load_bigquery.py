import argparse
import json
from google.cloud import bigquery

PROJECT_ID = 'clearanalytics-dev'
client = bigquery.Client(project=PROJECT_ID)



def get_merge_query(source_dataset, source_table, target_dataset, target_table):
    return f"""
        create or replace table {target_dataset}.{target_table} as (
        select * except(row_num) from (
            select *,
                row_number() over (
                partition by
                id
                order by
                updated_at desc
                ) row_num
            from
            {source_dataset}.{source_table}) t
        where row_num=1
        )
    """


def get_table_count(table_ref):
    try:
        table = client.get_table(table_ref)
        return table.num_rows
    except Exception as e:
        print(e)
        return 0


def load_data(dataset_id, table_id, source_file, schema_path=None):

    # Create a reference to the destination table
    table_ref = client.dataset(dataset_id).table(table_id)
    initial_count = get_table_count(table_ref)
    
    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        ignore_unknown_values=True,
    )
    if schema_path:
        job_config.schema = client.schema_from_json(schema_path)
    else:
        job_config.autodetect = True  # Auto-detect schema

    
    # Start the load job
    with open(source_file, "rb") as source:
        job = client.load_table_from_file(source, table_ref, job_config=job_config)
    
    # Wait for the job to complete
    job.result()
    
    # Check the job status
    if job.state != "DONE":
        raise Exception(job.state)

    final_count = get_table_count(table_ref)
    print(f"File loaded successfully to {dataset_id}.{table_id}. Initial count: {initial_count}. Final count: {final_count}. Net added: {final_count - initial_count}")



def load_file_to_bigquery(dataset_id, table_id, source_file, schema_path=None):
    '''
    Inserts to staging table and then recrates target table with only unique valyes
    '''
    create_dataset_if_not_exists(dataset_id)

    # Create a reference to the destination table
    table_ref = client.dataset(dataset_id).table(table_id)
    initial_count = get_table_count(table_ref)

    ## Load data to staging table in append-only
    print("Uploading data to staging table")
    staging_id = f"{table_id}_staging"
    load_data(dataset_id, staging_id, source_file, schema_path=schema_path)


    # Recreate table with only unique values
    print("Merging data to target table deduplicating rows")
    merge_query = get_merge_query(dataset_id, staging_id, dataset_id, table_id)
    job_config = bigquery.QueryJobConfig()
    job_config.use_legacy_sql = False
    job = client.query(merge_query, job_config=job_config)
    job.result()

    final_count = get_table_count(table_ref)

    print(f"File loaded successfully to {table_id}. Initial count: {initial_count}. Final count: {final_count}. Net added: {final_count - initial_count}")

    


def create_dataset_if_not_exists(dataset_id):
    # Construct the dataset reference
    dataset_ref = client.dataset(dataset_id)

    # Check if the dataset already exists
    try:
        dataset = client.get_dataset(dataset_ref)
        print("Dataset already exists: {}".format(dataset_id))

    except Exception as e:
        print(e)
        # Dataset does not exist, create it
        dataset = bigquery.Dataset(dataset_ref)
        dataset = client.create_dataset(dataset)
        print("Created dataset: {}".format(dataset_id))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='File to Big query')
    parser.add_argument('-d', '--dataset_id', type=str, help='File path', required=True)
    parser.add_argument('-t', '--table_id', type=str, help='File path', required=True)
    parser.add_argument('-f', '--file', type=str, help='File path', required=True)
    parser.add_argument('-s', '--schema_file', type=str, help='Schema json file path', required=True)

    args = parser.parse_args()

    load_file_to_bigquery(args.dataset_id, args.table_id, args.file, args.schema_file)

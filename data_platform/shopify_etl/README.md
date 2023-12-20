i


bq load --schema=shopify_order_schema.json --ignore_unknown_values --source_format=NEWLINE_DELIMITED_JSON viv_for_your_v.shopify_orders temp.jsonl


bq rm viv_for_your_v.shopify_orders  


// Empty structs not allowed in BQ. Replace with null (optionally subset num lines)
sed -n '1,200p' viv-for-your-v.myshopify.com.jsonl | sed  's/{}/null/g' > temp.jsonl   


// Load data
bq load --schema=shopify_order_schema.json --max_bad_records=20 --ignore_unknown_values --source_format=NEWLINE_DELIMITED_JSON viv_for_your_v.shopify_orders temp.jsonl


Goal is to have max_bad_records == 0
1. Fields that are garbage remove from schema (ignore_unknown_values flag simply ignores them)
2. Incorrectly inferred fields, fix schema and update (may need to delete table)



Example (allow all to be bad records to see what fields are garbage)
```
$ bq load --schema=shopify_order_schema.json --max_bad_records=200 --source_format=NEWLINE_DELIMITED_JSON viv_for_your_v.shopify_orders temp.jsonl

Upload complete.
Waiting on bqjob_r3a0b53a1770dbdba_0000018887ccac8a_1 ... (2s) Current status: DONE   
Warnings encountered during job execution:

b'Error while reading data, error message: JSON parsing error in row starting at position 0: No such field: fulfillments.line_items.properties.'

b'Error while reading data, error message: JSON parsing error in row starting at position 11206: No such field: line_items.properties.'

b'Error while reading data, error message: JSON parsing error in row starting at position 19599: No such field: line_items.properties.'

b'Error while reading data, error message: JSON parsing error in row starting at position 26320: No such field: line_items.properties.'

b'Error while reading data, error message: JSON parsing error in row starting at position 32591: No such field: line_items.properties.'

```


Removing duplicates:

TODO: Is it performant / cheap? How to run from python / cli?
Maybe just create new one, delete old, and rename. Does Looker break?

```
create or replace table jorge_test2.shopify_orders as (
  select * except(row_num) from (
      select *,
        row_number() over (
        partition by
        id
        order by
        updated_at desc
        ) row_num
      from
      jorge_test2.shopify_orders) t
  where row_num=1
)
```
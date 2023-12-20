README


Guides
General community connector: 
https://developers.google.com/looker-studio/connector/get-started

Community Connector specifically to use BigQuery (advanced services): 
https://developers.google.com/looker-studio/connector/advanced-services


Examples:
https://developers.google.com/looker-studio/connector/bigquery-row-level-security
https://developers.google.com/looker-studio/connector/embed-row-level-security


## Community connector
1. Because it reads from bigqueery, getSchema and getData simply respond the query configuration
2. All queries executed against BigQuery uses a specific service account, per https://developers.google.com/looker-studio/connector/use-a-service-account
    - Unable to use effectiveUser and handle service account in Looker Studio b/c only works with direct connections to BigQuery (ie not custom connector)
3. Before schema and data execution, validate user token and route to corresponding table # FIXME
    - Needs real default table so schema is legit

## Looker Studio Data Source (Embedded in report)
1. Enable overridable config params (so report in turn can override them)
2. 

## Looker Studio Report
Single report that uses the connector as data source
Allows overridable parameters in url (so embedded dashboard sets token and ocmpanyName)
https://developers.google.com/looker-studio/connector/data-source-parameters#set_url_parameters


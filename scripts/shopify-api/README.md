### Web app
NextJS

Local:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001/clearanalytics-dev/us-central1/shopifyOauth yarn dev
```


Deployment:
```
FE:
$ yarn deploy

BE:
$ yarn deploy
```

Back End Cloud functions
Local
```
Get config
$ firebase functions:config:get > .runtimeconfig.json
$ firebase emulators:start --only functions          

Set config
$ firebase functions:config:set my_variable=my_value
```


### Authentication

https://shopify.dev/docs/apps/auth#types-of-authentication-and-authorization-methods

https://community.shopify.com/c/shopify-apis-and-sdks/online-amp-offline-session-tokens/td-p/1204358

1. Online: OAuth, user redirect (FE user via okta)
"All apps that are created using Shopify CLI or through the Partner Dashboard"


2. Offline: Single-creation Access tokens (BE integrations & tasks)
Apps that are created in the Shopify admin


https://jorge-test2.myshopify.com/admin/api/2023-01/shop.json


API

Store
https://jorge-test2.myshopify.com/admin/api-version

e.g. GET orders
https://jorge-test2.myshopify.com/admin/api/2023-01/orders.json

GraphQL
POST https://jorge-test2.myshopify.com/admin/api/2023-01/graphql.json

 {
    orders(first: 30) {
      edges {
        node {
          id
          
        }
      }
    }
  }

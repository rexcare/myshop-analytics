var cc = DataStudioApp.createCommunityConnector();
var scriptProperties = PropertiesService.getScriptProperties();
var bqTypes = cc.BigQueryParameterType;


function verifyFirebaseToken(token) {
  try {
    const url = `https://us-central1-clearanalytics-dev.cloudfunctions.net/core-platform/auth/verify_token?token=${token}`;
    console.log("verifying token: " + url);

    var response = UrlFetchApp.fetch(url);
    console.log(response);
    // Call custom endpoint which validates token and company name
    return response;
  } catch (error) {
    console.error('Error verifying token:', error.message);
    if (token == scriptProperties.getProperty('ADMIN_FIREBASE_TOKEN')) {
      return true;
    }
    throw new Error("Insecure", error);
  }
}
function isAdminUser() {
  return false;
}

// No authentication needed (gated at data read time)
function getAuthType() {
  return cc
    .newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
}


function getConfig(request) {
  console.log(request);
  var config = cc.getConfig();
  config
      .newTextInput()
      .setId('token')
      .setName('Enter user token')
      .setAllowOverride(true);
  config
      .newTextInput()
      .setId('companyName')
      .setName('Enter your company name')
      .setAllowOverride(true);
  config.setDateRangeRequired(false);
  config.setIsSteppedConfig(false);
  return config.build();
}


/* https://developers.google.com/looker-studio/connector/use-a-service-account */

var SERVICE_ACCOUNT_CREDS = 'SERVICE_ACCOUNT_CREDS';
var SERVICE_ACCOUNT_KEY = 'private_key';
var SERVICE_ACCOUNT_EMAIL = 'client_email';
var BILLING_PROJECT_ID = 'project_id';
function getServiceAccountCreds() {
  return JSON.parse(scriptProperties.getProperty(SERVICE_ACCOUNT_CREDS)) || {};
}

function getOauthService() {
  var serviceAccountCreds = getServiceAccountCreds();
  var serviceAccountKey = serviceAccountCreds[SERVICE_ACCOUNT_KEY];
  var serviceAccountEmail = serviceAccountCreds[SERVICE_ACCOUNT_EMAIL];
  console.log("Service account email: " + serviceAccountEmail);

  return OAuth2.createService('RowLevelSecurity')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setPrivateKey(serviceAccountKey)
    .setIssuer(serviceAccountEmail)
    .setPropertyStore(scriptProperties)
    .setCache(CacheService.getScriptCache())
    .setScope(['https://www.googleapis.com/auth/bigquery.readonly']);
}



/*
https://developers.google.com/looker-studio/connector/advanced-services
*/
function getQueryConfig(request) {
  console.log(request);
  var companyName = (request.configParams && request.configParams.companyName);
  var sqlString = "" +
    "SELECT * " +
    `FROM clearanalytics-dev.${companyName}.shopify_orders`
  console.log(sqlString);
  var projectId = "clearanalytics-dev"; //(request.configParams && request.configParams.projectId);
  var accessToken = getOauthService().getAccessToken();
  return DataStudioApp.createCommunityConnector().newBigQueryConfig()
      .setAccessToken(accessToken)
      .setUseStandardSql(true)
      .setBillingProjectId(projectId)
      .setQuery(sqlString)
      .build();
}

function getSchema(request) {
  // if verifyFirebaseToken
  return getQueryConfig(request);
}

function getData(request) {
  var effective = Session.getEffectiveUser().toString();
  var active = Session.getActiveUser().toString();
  console.log("Effective user: " + effective);
  console.log("Active user: " + active);

  var firebaseToken = (request.configParams && request.configParams.token);
  if (verifyFirebaseToken(firebaseToken)) {
    return getQueryConfig(request)
  }
}

// getQueryConfig({configParams: {companyName: "lala"}})

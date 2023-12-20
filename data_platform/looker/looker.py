import requests


url = "https://datastudio.googleapis.com/v1/assets:search"

# POST https://datastudio.googleapis.com/v1/assets/assetName/permissions:addMembers


res = requests.get(url)
print(res.text)
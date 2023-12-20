import os
from dotenv import load_dotenv

# Load lcoal env variables from file
env = os.environ.get('env')
if env == 'local':
    load_dotenv(dotenv_path='.env.local')

# Retrieve a secret
def fetch_secret_param(name):
    env_value = os.environ.get(name)
    assert env_value, f"Could not find env variable with name {name}"
    return env_value
    

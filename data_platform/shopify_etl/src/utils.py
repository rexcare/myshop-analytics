
import os
import time
import re


def replace_non_alphanumeric(text):
    pattern = r'[^a-zA-Z0-9]'
    replaced_text = re.sub(pattern, '_', text)
    return replaced_text


def benchmark(func, *args, **kwargs):
    start_time = time.time()
    result = func(*args, **kwargs)
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Function '{func.__name__}' executed in {execution_time:.6f} seconds.")
    return result


def create_directory_if_not_exists(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)


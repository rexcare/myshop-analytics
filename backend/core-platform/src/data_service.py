from datetime import datetime, timezone
import itertools
import json
import pandas as pd
import numpy as np


def explode_combinations(df, buckets=[], buckets_col='', group_col=''):
    '''
    Makes sure every group in df has an entry for each bucket
    '''
    # Create all possible combinations
    names = list(df[group_col].unique())
    combinations = list(itertools.product(buckets, names))
    combinations_df = pd.DataFrame(combinations, columns=[buckets_col, group_col])

    # Merge DFs to have every combo in group
    df = pd.merge(combinations_df, df, how='left', on=[buckets_col, group_col]).fillna(0)
    return df


def explode_month_combinations(df, date_col, group_col):
    start_date = df[date_col].min()
    end_date = (datetime.now(timezone.utc) + pd.DateOffset(months=1)).strftime('%Y-%m')
    date_range = pd.date_range(start=start_date, end=end_date, freq='m').strftime('%Y-%m')
    df = explode_combinations(df, buckets=date_range, buckets_col='processed_at_month', group_col=group_col)
    return df


def pandas_df_to_grid_series(df, buckets_col='', group_col='', data_col=''):
    '''
    Returns in grid series format
    '''
    df[data_col] = df[data_col].astype(float).round(2)

    df = df.sort_values([buckets_col, group_col])
    periods = list(df[buckets_col].unique())
    df = df.groupby(group_col).agg({data_col: list}).reset_index()
    df.columns = ['name', 'data']
    
    series = df.to_dict('records')
    res = { 'periods': periods, 'series': series }
    return res


class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

class OrdersDataService:
    def __init__(self, orders_df):
        self.orders_df = orders_df

    def fix_group_cols(self, df):
        df.columns = [''.join(col).strip() for col in df.columns.values]
        return df

    def aggregate_orders(self):
        df = self.orders_df.groupby('id').first().groupby(['name', 'processed_at_month']).agg({'total_price': ['sum', 'count']}).reset_index()
        df = self.fix_group_cols(df)
        df = explode_month_combinations(df, 'processed_at_month', 'name')
        return df

    def aggregate_products(self):
        df = self.orders_df.groupby(['product_name', 'processed_at_month']).agg({'product_total_price': ['sum', 'count'], 'product_quantity': ['sum']}).reset_index()
        df = self.fix_group_cols(df)
        df = explode_month_combinations(df, 'processed_at_month', 'product_name')
        return df

    def aggregate_users(self):
        # Customer journey aggregation

        # Group by user: user, purchase_number
        user_aggs = self.orders_df.drop_duplicates(subset=['id', 'product_name', 'user_id']).groupby(['product_name', 'user_id'])['id'].count().reset_index()
        user_aggs = user_aggs.rename(columns={'id': 'unique_user_purchase_count'})
        user_aggs = user_aggs.groupby(['product_name', 'unique_user_purchase_count'])['user_id'].count().reset_index()
        user_aggs = user_aggs.rename(columns={'unique_user_purchase_count': 'purchase_number', 'user_id': 'user_count'})
        max_purchase = user_aggs.purchase_number.max()
        buckets = list(range(1, max_purchase + 1))
        user_aggs = explode_combinations(user_aggs, buckets=buckets, buckets_col='purchase_number', group_col='product_name')
        # Calculate cumsum of unique users by sorting desc
        user_aggs = user_aggs.sort_values(by=['product_name', 'purchase_number'], ascending=False)
        user_aggs['cumsum_unique_users'] = user_aggs.groupby(['product_name'])['user_count'].cumsum()
        user_aggs['max_users_in_purchase'] = user_aggs.groupby('product_name')['cumsum_unique_users'].transform('max')
        user_aggs['cumpercent_unique_users'] = (100*user_aggs.cumsum_unique_users) / user_aggs.max_users_in_purchase

        user_aggs = user_aggs.reset_index()
        return user_aggs

    def run(self):
        orders_aggs = self.aggregate_orders()
        products_aggs = self.aggregate_products()
        user_aggs = self.aggregate_users()

        order_sum_aggs = pandas_df_to_grid_series(orders_aggs, buckets_col='processed_at_month', group_col='name', data_col='total_pricesum')
        order_count_aggs = pandas_df_to_grid_series(orders_aggs, buckets_col='processed_at_month', group_col='name', data_col='total_pricecount')

        product_sum_aggs = pandas_df_to_grid_series(products_aggs, buckets_col='processed_at_month', group_col='product_name', data_col='product_total_pricesum')
        product_count_aggs = pandas_df_to_grid_series(products_aggs, buckets_col='processed_at_month', group_col='product_name', data_col='product_quantitysum')


        user_journey = pandas_df_to_grid_series(user_aggs, buckets_col='purchase_number', group_col='product_name', data_col='cumsum_unique_users')
        user_journey_percent = pandas_df_to_grid_series(user_aggs, buckets_col='purchase_number', group_col='product_name', data_col='cumpercent_unique_users')

        data = { 
            'order_sum': order_sum_aggs, 
            'order_counts': order_count_aggs, 
            'product_sums': product_sum_aggs, 
            'product_counts': product_count_aggs, 
            'user_journey': user_journey,
            'user_journey_percent': user_journey_percent,
        }

        return data

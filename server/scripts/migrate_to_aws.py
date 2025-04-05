import boto3
import json
from botocore.exceptions import ClientError

def get_local_dynamodb():
    """Get local DynamoDB client"""
    return boto3.client('dynamodb', endpoint_url='http://localhost:8000')

def get_aws_dynamodb():
    """Get AWS DynamoDB client"""
    return boto3.client('dynamodb')

def get_phonebook_tables(client):
    """Get all phonebook-* tables from DynamoDB"""
    try:
        response = client.list_tables()
        return [table for table in response['TableNames'] if table.startswith('phonebook-')]
    except ClientError as e:
        print(f"Error getting tables: {e}")
        return []

def get_table_items(client, table_name):
    """Get all items from a table"""
    items = []
    try:
        paginator = client.get_paginator('scan')
        for page in paginator.paginate(TableName=table_name):
            items.extend(page['Items'])
        return items
    except ClientError as e:
        print(f"Error getting items from table {table_name}: {e}")
        return []

def put_items(client, table_name, items):
    """Put items into a table"""
    for item in items:
        try:
            client.put_item(TableName=table_name, Item=item)
        except ClientError as e:
            print(f"Error putting item in table {table_name}: {e}")

def migrate_table(local_client, aws_client, table_name):
    """Migrate a single table from local to AWS"""
    print(f"\nMigrating table: {table_name}")
    
    # Get all items from local table
    items = get_table_items(local_client, table_name)
    print(f"Found {len(items)} items in local table")
    
    if items:
        # Put items in AWS table
        put_items(aws_client, table_name, items)
        print(f"Successfully migrated {len(items)} items to AWS")
    else:
        print("No items found in local table")

def main():
    print("Starting DynamoDB migration from local to AWS...")
    
    # Get clients
    local_client = get_local_dynamodb()
    aws_client = get_aws_dynamodb()
    
    # Get all phonebook tables
    local_tables = get_phonebook_tables(local_client)
    aws_tables = get_phonebook_tables(aws_client)
    
    if not local_tables:
        print("No phonebook tables found in local DynamoDB")
        return
    
    print(f"\nFound {len(local_tables)} phonebook tables in local DynamoDB:")
    for table in local_tables:
        print(f"- {table}")
    
    # Migrate each table
    for table_name in local_tables:
        if table_name not in aws_tables:
            print(f"\nWarning: Table {table_name} does not exist in AWS. Skipping...")
            continue
            
        print(f"\nMigrating data for table: {table_name}")
        migrate_table(local_client, aws_client, table_name)
    
    print("\nMigration complete!")

if __name__ == "__main__":
    input("Do you want to migrate local db data to AWS? (y/n)")
    if input() == "y":
        main() 
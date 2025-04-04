import boto3
import os
# from app.config import Config

# dynamodb = boto3.resource("dynamodb", **Config.DYNAMODB_CONFIG)


# Configuration: Use local or AWS DynamoDB
USE_LOCAL = os.getenv("USE_LOCAL", "true").lower() == "true"

if USE_LOCAL:
    dynamodb = boto3.resource(
        "dynamodb",
        region_name="us-east-1",
        endpoint_url="http://localhost:8000",  # DynamoDB Local
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy"
    )
else:
    dynamodb = boto3.resource(
        "dynamodb",
        # region_name="us-east-1",  # Change to your AWS region
        # aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        # aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )

def create_users_table():
    table_name = "phonebook-users"

    existing_tables = dynamodb.meta.client.list_tables()["TableNames"]
    if table_name in existing_tables:
        print(f"Table '{table_name}' already exists.")
        return

    print(f"Creating table: {table_name}...")

    table = dynamodb.create_table(
        TableName=table_name,
        KeySchema=[
            {"AttributeName": "user_id", "KeyType": "HASH"}
        ],
        AttributeDefinitions=[
            {"AttributeName": "user_id", "AttributeType": "S"},
            {"AttributeName": "email", "AttributeType": "S"}
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "email-index",
                "KeySchema": [
                    {"AttributeName": "email", "KeyType": "HASH"}
                ],
                "Projection": {"ProjectionType": "ALL"}
            }
        ],
        BillingMode="PAY_PER_REQUEST"
    )

    table.wait_until_exists()
    print(f"Table '{table_name}' created successfully.")

def create_contacts_table():
    table_name = "phonebook-contacts"

    existing_tables = dynamodb.meta.client.list_tables()["TableNames"]
    if table_name in existing_tables:
        print(f"Table '{table_name}' already exists.")
        return

    print(f"Creating table: {table_name}...")

    table = dynamodb.create_table(
        TableName=table_name,
        KeySchema=[
            {"AttributeName": "user_id", "KeyType": "HASH"},
            {"AttributeName": "contact_id", "KeyType": "RANGE"}
        ],
        AttributeDefinitions=[
            {"AttributeName": "user_id", "AttributeType": "S"},
            {"AttributeName": "contact_id", "AttributeType": "S"},
            {"AttributeName": "email", "AttributeType": "S"}
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "email-index",
                "KeySchema": [
                    {"AttributeName": "user_id", "KeyType": "HASH"},
                    {"AttributeName": "email", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"}
            }
        ],
        BillingMode="PAY_PER_REQUEST"
    )

    table.wait_until_exists()
    print(f"Table '{table_name}' created successfully.")

if __name__ == "__main__":
    create_users_table()
    create_contacts_table()

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

def delete_table(table_name):
    
    answer = input(f"Are you sure you want to delete the table '{table_name}'? (y/n): ")

    if answer.lower() not in ["y", "yes"]:
        print("Table deletion cancelled.")
        return
    
    print(f"Deleting table '{table_name}'...")

    try:
        table = dynamodb.Table(table_name)
        table.delete()
        table.wait_until_not_exists()
        print(f"Table '{table_name}' deleted successfully.")
    except Exception as e:
        print(f"Error deleting table '{table_name}': {e}")


if __name__ == "__main__":
    table_names = ["phonebook-users", "phonebook-contacts"]
    for table_name in table_names:
        delete_table(table_name)

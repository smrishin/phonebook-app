import boto3
from app.config import Config

dynamodb = boto3.resource("dynamodb", **Config.DYNAMODB_CONFIG)

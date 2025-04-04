from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    USE_LOCAL = os.getenv("USE_LOCAL", "true").lower() == "true"
    REALTIME_MODE = "websockets"

    if USE_LOCAL:
        # REALTIME_MODE = "websockets"
        DYNAMODB_CONFIG = {
            "region_name": "us-east-1",
            "endpoint_url": os.getenv("DYNAMODB_LOCAL_URL", "http://localhost:8000"),
            "aws_access_key_id": "dummy",
            "aws_secret_access_key": "dummy"
        }
    else:
        # AWS Lambda - not using this for now
        # REALTIME_MODE = "sse" # Server-Sent Events
        DYNAMODB_CONFIG = {
            "region_name": os.getenv("AWS_REGION", "us-east-1"),
            "aws_access_key_id": os.getenv("AWS_ACCESS_KEY_ID"),
            "aws_secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY")
        }

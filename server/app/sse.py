"""
contact updates via SSE for AWS Lambda - not using this for now
"""

from flask import Response, json
import time
from app.models import get_contacts_table

def sse_contact_updates(user_id):
    def event_stream():
        while True:
            table = get_contacts_table()
            response = table.query(
                KeyConditionExpression="user_id = :uid",
                ExpressionAttributeValues={":uid": user_id}
            )
            yield f"data: {json.dumps(response.get('Items', []))}\n\n"
            time.sleep(5)  # Polling every 5 seconds

    return Response(event_stream(), content_type="text/event-stream")

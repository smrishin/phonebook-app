from app.db import dynamodb


def get_contacts_table():
    return dynamodb.Table("phonebook-contacts")

def get_users_table():
    return dynamodb.Table("phonebook-users")

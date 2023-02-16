import json

from django.urls import reverse
from rest_framework.status import HTTP_200_OK, HTTP_403_FORBIDDEN

from user.tests import UserBase


class TransactionTestCase(UserBase):
    fixtures = (
        'user/fixtures/user_fixtures.json',
        'aoi/fixtures/aoi_fixtures.json',
        'aoi/fixtures/notebook_fixtures.json',
        'aoi/fixtures/request_fixtures.json',
        'transaction/fixtures/transaction_fixtures.json'
    )

    def test_get_transactions_list_authorized(self):
        response_data = [
            {
                "id": 1003,
                "user": 1003,
                "amount": -8.14,
                "created_at": "2023-02-15T11:16:21.210000Z",
                "updated_at": "2023-02-15T11:16:21.210000Z",
                "request": 1001,
                "comment": "",
                "completed": True
            },
            {
                "id": 1002,
                "user": 1002,
                "amount": 30,
                "created_at": "2023-02-15T11:15:11.230000Z",
                "updated_at": "2023-02-15T11:15:11.230000Z",
                "request": None,
                "comment": "",
                "completed": False
            },
            {
                "id": 1001,
                "user": 1001,
                "amount": -20.42,
                "created_at": "2023-02-15T11:14:31.140000Z",
                "updated_at": "2023-02-15T11:14:31.140000Z",
                "request": 1001,
                "comment": "",
                "completed": True
            }
        ]
        url = reverse("get_transactions_list")
        self.client.force_login(self.ex_2_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.data), len(response_data))
        self.assertEqual(response.json(), response_data)

    def test_get_transactions_list_not_authorized(self):
        url = reverse("get_transactions_list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

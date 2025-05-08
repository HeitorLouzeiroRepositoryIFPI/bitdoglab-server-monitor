from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/server-status/', consumers.ServerStatusConsumer.as_asgi()),
]
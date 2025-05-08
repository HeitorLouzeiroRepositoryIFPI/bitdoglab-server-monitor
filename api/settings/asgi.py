import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.settings')

import sys

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from servermonitor.routing import websocket_urlpatterns
from django.core.asgi import get_asgi_application



application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
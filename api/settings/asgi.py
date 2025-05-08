import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.settings')
django.setup()  # Inicializa o Django antes de importar os outros módulos

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from servermonitor.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
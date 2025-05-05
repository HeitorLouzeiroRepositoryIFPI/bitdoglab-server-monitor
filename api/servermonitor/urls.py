from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServerStatusViewSet

router = DefaultRouter()
router.register(r'status', ServerStatusViewSet, basename='serverstatus')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServerStatusViewSet, TemperatureViewSet

router = DefaultRouter()
router.register(r'status', ServerStatusViewSet, basename='serverstatus')
router.register(r'temperature', TemperatureViewSet, basename='temperature')

urlpatterns = [
    path('', include(router.urls)),
]

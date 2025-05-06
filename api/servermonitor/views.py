from django.shortcuts import render
from servermonitor.models import ServerStatus, Temperature
from .serializers import ServerStatusSerializer, TemperatureSerializer

from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action

# Create your views here.


class ServerStatusViewSet(ReadOnlyModelViewSet):
    """
    A view that returns the server status.
    """
    serializer_class = ServerStatusSerializer

    def get_queryset(self):
        """
        Returns the server status.
        """
        return ServerStatus.objects.all().order_by('-data_received')[:1]

    @action(detail=False, methods=['get'])
    def latest(self, request, *args, **kwargs):
        """
        Returns the latest server status.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TemperatureViewSet(ReadOnlyModelViewSet):
    """
    A view that returns temperature readings.
    """
    serializer_class = TemperatureSerializer
    
    def get_queryset(self):
        """
        Returns temperature readings.
        """
        return Temperature.objects.all().order_by('-data_received')
    
    @action(detail=False, methods=['get'])
    def latest(self, request, *args, **kwargs):
        """
        Returns the latest temperature reading.
        """
        queryset = self.get_queryset()[:1]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def history(self, request, *args, **kwargs):
        """
        Returns the last 24 hours of temperature readings, limited to 100 entries.
        """
        from django.utils import timezone
        import datetime
        
        # Obter as últimas 24 horas de leituras
        start_time = timezone.now() - datetime.timedelta(hours=24)
        queryset = self.get_queryset().filter(
            data_received__gte=start_time
        )[:100]  # Limitar a 100 resultados
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

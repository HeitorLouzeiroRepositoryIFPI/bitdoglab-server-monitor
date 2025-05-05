from django.shortcuts import render
from servermonitor.models import ServerStatus
from .serializers import ServerStatusSerializer

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

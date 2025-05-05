from servermonitor.models import ServerStatus
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers


class ServerStatusSerializer(ModelSerializer):
    class Meta:
        model = ServerStatus
        fields = ['id', 'button_one', 'button_two', 'joystick_x', 'joystick_y', 'direction', 'data_received']
        read_only_fields = ['id', 'data_received']

        extra_kwargs = {
            'button_one': {'required': True},
            'button_two': {'required': True}
        }

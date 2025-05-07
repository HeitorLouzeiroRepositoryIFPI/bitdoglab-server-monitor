import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ServerStatus, Temperature

class MonitorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            "server_monitor",
            self.channel_name
        )
        await self.accept()
        
        # Enviar dados iniciais
        latest_status = await self.get_latest_status()
        latest_temp = await self.get_latest_temperature()
        
        if latest_status:
            await self.send(text_data=json.dumps({
                'type': 'server_status',
                'data': latest_status
            }))
            
        if latest_temp:
            await self.send(text_data=json.dumps({
                'type': 'temperature',
                'data': latest_temp
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "server_monitor",
            self.channel_name
        )

    # Receber mensagem do WebSocket
    async def receive(self, text_data):
        # Processar mensagens do cliente se necessário
        pass

    # Receber atualização do grupo server_monitor
    async def server_update(self, event):
        # Encaminhar a atualização para o WebSocket
        await self.send(text_data=json.dumps(event))
        
    @database_sync_to_async
    def get_latest_status(self):
        try:
            latest = ServerStatus.objects.order_by('-data_received').first()
            if latest:
                return {
                    "id": latest.id,
                    "button_one": latest.button_one,
                    "button_two": latest.button_two,
                    "joystick_x": latest.joystick_x,
                    "joystick_y": latest.joystick_y,
                    "direction": latest.direction,
                    "data_received": latest.data_received.isoformat()
                }
            return None
        except Exception:
            return None
            
    @database_sync_to_async
    def get_latest_temperature(self):
        try:
            latest = Temperature.objects.order_by('-data_received').first()
            if latest:
                return {
                    "id": latest.id,
                    "temperature": latest.temperature,
                    "data_received": latest.data_received.isoformat()
                }
            return None
        except Exception:
            return None
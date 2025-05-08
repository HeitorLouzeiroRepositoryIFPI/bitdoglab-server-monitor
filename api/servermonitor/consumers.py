import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from servermonitor.models import ServerStatus, Temperature

class ServerStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Aceitar a conexão WebSocket
        await self.accept()
        
        # Iniciar o loop de envio de dados
        self.send_data_task = asyncio.create_task(self.send_data_periodically())

    async def disconnect(self, close_code):
        # Cancelar o loop quando a conexão for fechada
        if hasattr(self, 'send_data_task'):
            self.send_data_task.cancel()
            
    async def receive(self, text_data):
        data = json.loads(text_data)
        # Apenas recebe dados do cliente, se necessário
        await self.send(text_data=json.dumps({
            'message': 'Dados recebidos com sucesso!'
        }))
    
    async def send_data_periodically(self):
        """Envia dados periódicos sobre status do servidor e temperatura."""
        try:
            while True:
                await self.send_server_status()
                await self.send_temperature()
                await asyncio.sleep(2)
        except asyncio.CancelledError:
            # Lidar com o cancelamento da tarefa
            pass
        except Exception as e:
            print(f"Erro no loop periódico: {e}")
    
    @database_sync_to_async
    def get_latest_server_status(self):
        """Obtém o status mais recente do servidor de forma síncrona."""
        return ServerStatus.objects.order_by('-data_received').first()
    
    async def send_server_status(self):
        """Busca e envia o status mais recente do servidor."""
        try:
            # Obter o registro mais recente de ServerStatus de forma assíncrona
            latest_status = await self.get_latest_server_status()
            
            if latest_status and self.scope["type"] == "websocket":
                # Converter para dicionário para enviar via JSON
                status_data = {
                    'type': 'server_status',
                    'button_one': latest_status.button_one,
                    'button_two': latest_status.button_two,
                    'joystick_x': latest_status.joystick_x,
                    'joystick_y': latest_status.joystick_y,
                    'direction': latest_status.direction,
                    'timestamp': latest_status.data_received.isoformat()
                }
                
                # Enviar os dados via WebSocket
                await self.send(text_data=json.dumps(status_data))
        except Exception as e:
            print(f"Erro ao enviar status do servidor: {e}")
    
    @database_sync_to_async
    def get_latest_temperature(self):
        """Obtém os dados de temperatura mais recentes de forma síncrona."""
        return Temperature.objects.order_by('-data_received').first()
    
    async def send_temperature(self):
        """Busca e envia os dados de temperatura mais recentes."""
        try:
            # Obter o registro mais recente de Temperature de forma assíncrona
            latest_temp = await self.get_latest_temperature()
            
            if latest_temp and self.scope["type"] == "websocket":
                # Enviar os dados via WebSocket
                await self.send(text_data=json.dumps({
                    'type': 'temperature',
                    'value': latest_temp.temperature,
                    'timestamp': latest_temp.data_received.isoformat()
                }))
        except Exception as e:
            print(f"Erro ao enviar dados de temperatura: {e}")
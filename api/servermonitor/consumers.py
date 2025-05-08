import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

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
                # Enviar status do servidor
                await self.send_server_status()
                
                # Enviar dados de temperatura
                await self.send_temperature()
                
                # Aguardar antes da próxima atualização (2 segundos)
                await asyncio.sleep(2)
        except asyncio.CancelledError:
            # Lidar com o cancelamento da tarefa
            pass
    
    async def send_server_status(self):
        from servermonitor.models import ServerStatus
        """Busca e envia o status mais recente do servidor."""
        try:
            # Obter o registro mais recente de ServerStatus
            latest_status = ServerStatus.objects.order_by('-timestamp').first()
            
            if latest_status:
                # Converter para dicionário para enviar via JSON
                status_data = {
                    'type': 'server_status',
                    'status': latest_status.status,
                    'timestamp': latest_status.timestamp.isoformat(),
                }
                
                # Adicionar campos opcionais se existirem
                if hasattr(latest_status, 'joystick_x'):
                    status_data['joystick_x'] = latest_status.joystick_x
                if hasattr(latest_status, 'joystick_y'):
                    status_data['joystick_y'] = latest_status.joystick_y
                if hasattr(latest_status, 'direction'):
                    status_data['direction'] = latest_status.direction
                
                # Enviar os dados via WebSocket
                await self.send(text_data=json.dumps(status_data))
        except Exception as e:
            print(f"Erro ao enviar status do servidor: {e}")
    
    async def send_temperature(self):
        from servermonitor.models import Temperature
        """Busca e envia os dados de temperatura mais recentes."""
        try:
            # Obter o registro mais recente de Temperature
            latest_temp = Temperature.objects.order_by('-timestamp').first()
            
            if latest_temp:
                # Enviar os dados via WebSocket
                await self.send(text_data=json.dumps({
                    'type': 'temperature',
                    'value': latest_temp.value,
                    'timestamp': latest_temp.timestamp.isoformat()
                }))
        except Exception as e:
            print(f"Erro ao enviar dados de temperatura: {e}")
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ServerStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Processar os dados recebidos
        await self.send(text_data=json.dumps({
            'message': 'Dados recebidos com sucesso!'
        }))
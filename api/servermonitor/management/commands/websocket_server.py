import json
import threading
import time
import asyncio
import websockets
from django.core.management.base import BaseCommand
from servermonitor.models import ServerStatus, Temperature
from asgiref.sync import sync_to_async

# python3 manage.py websocket_server --ip=10.8.45.122 --porta=4444

class Command(BaseCommand):
    help = 'Inicia um servidor WebSocket para receber dados do dispositivo Pico W'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.running = False

    def add_arguments(self, parser):
        parser.add_argument(
            '--porta',
            type=int,
            default=4444,
            help='Porta WebSocket para escutar (padrão: 4444)'
        )
        parser.add_argument(
            '--ip',
            type=str,
            default='0.0.0.0',
            help='Endereço IP para escutar (padrão: 0.0.0.0)'
        )

    def handle(self, *args, **options):
        ip = options['ip']
        porta = options['porta']

        self.stdout.write(self.style.SUCCESS(f'Iniciando servidor WebSocket em {ip}:{porta}'))

        self.running = True

        # Iniciar o servidor WebSocket
        asyncio.run(self.start_server(ip, porta))

    async def start_server(self, ip, porta):
        async with websockets.serve(self.handle_connection, ip, porta):
            self.stdout.write(self.style.SUCCESS('Servidor WebSocket rodando. Pressione Ctrl+C para interromper.'))
            await asyncio.Future()  # Mantém o servidor rodando

    # Funções auxiliares síncronas para manipular o banco de dados
    def save_temperature(self, temperatura):
        Temperature.objects.create(temperature=temperatura)
        return f'Dados de temperatura salvos: {temperatura}°C'

    def save_server_status(self, botao1, botao2, joystick_x, joystick_y, direction):
        ServerStatus.objects.create(
            button_one=botao1,
            button_two=botao2,
            joystick_x=joystick_x,
            joystick_y=joystick_y,
            direction=direction
        )
        return f'Dados de status salvos'

    async def handle_connection(self, websocket):
        self.stdout.write(self.style.SUCCESS('Nova conexão WebSocket estabelecida'))

        # Convertendo as funções síncronas para assíncronas
        save_temperature_async = sync_to_async(self.save_temperature)
        save_server_status_async = sync_to_async(self.save_server_status)

        try:
            async for message in websocket:
                self.stdout.write(f'Mensagem recebida: {message}')

                try:
                    # Tentar fazer parse do JSON recebido
                    dados_json = json.loads(message)

                    # Verificar se os dados contêm informação de temperatura
                    if 'temperatura' in dados_json:
                        temperatura = dados_json.get('temperatura')
                        result = await save_temperature_async(temperatura)
                        self.stdout.write(self.style.SUCCESS(result))
                    else:
                        botao1 = '0' if dados_json.get('botao1', False) else '1'
                        botao2 = '0' if dados_json.get('botao2', False) else '1'
                        joystick_x = dados_json.get('joystick_x', 2000)
                        joystick_y = dados_json.get('joystick_y', 2000)
                        direction = dados_json.get('direcao', 'Centro')

                        result = await save_server_status_async(botao1, botao2, joystick_x, joystick_y, direction)
                        self.stdout.write(self.style.SUCCESS(f'{result}: {dados_json}'))

                    # Enviar uma resposta de confirmação
                    resposta = json.dumps({"status": "ok", "message": "Dados recebidos com sucesso"})
                    await websocket.send(resposta)

                except json.JSONDecodeError:
                    self.stdout.write(self.style.ERROR(f'Erro: JSON inválido: {message}'))
                    await websocket.send(json.dumps({"status": "error", "message": "JSON inválido"}))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Erro ao processar dados: {str(e)}'))
                    await websocket.send(json.dumps({"status": "error", "message": str(e)}))

        except websockets.ConnectionClosed:
            self.stdout.write(self.style.WARNING('Conexão WebSocket encerrada'))
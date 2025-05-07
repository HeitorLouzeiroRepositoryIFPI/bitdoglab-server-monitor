import json
import socket
import threading
import time
from django.core.management.base import BaseCommand
from servermonitor.models import ServerStatus, Temperature
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

#python3 manage.py udp_server --ip=10.8.45.122 --porta=4444

class Command(BaseCommand):
    help = 'Inicia um servidor UDP para receber dados do dispositivo Pico W'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.running = False
        self.server_socket = None
        self.channel_layer = get_channel_layer()

    def add_arguments(self, parser):
        parser.add_argument(
            '--porta',
            type=int,
            default=4444,
            help='Porta UDP para escutar (padrão: 4444)'
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
        
        self.stdout.write(self.style.SUCCESS(f'Iniciando servidor UDP em {ip}:{porta}'))
        
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.server_socket.bind((ip, porta))
        
        self.running = True
        
        # Iniciar thread para receber mensagens
        thread = threading.Thread(target=self.receive_messages)
        thread.daemon = True
        thread.start()
        
        try:
            self.stdout.write(self.style.SUCCESS('Servidor UDP rodando. Pressione Ctrl+C para interromper.'))
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('Interrompendo servidor UDP...'))
            self.running = False
            self.server_socket.close()
    
    def receive_messages(self):
        """Thread para receber e processar mensagens UDP"""
        self.stdout.write(self.style.SUCCESS('Thread de recebimento iniciada'))
        
        while self.running:
            try:
                # Buffer para receber dados
                data, addr = self.server_socket.recvfrom(1024)
                
                # Processar dados recebidos
                self.stdout.write(f'Dados recebidos de {addr}: {data.decode("utf-8")}')
                
                try:
                    # Tentar fazer parse do JSON recebido
                    dados_json = json.loads(data.decode('utf-8'))
                    
                    # Verificar se os dados contêm informação de temperatura
                    if 'temperatura' in dados_json:
                        # Processar dados de temperatura
                        temperatura = dados_json.get('temperatura')
                        
                        # Salvar no banco de dados
                        temp_obj = Temperature.objects.create(
                            temperature=temperatura
                        )
                        
                        self.stdout.write(self.style.SUCCESS(f'Dados de temperatura salvos: {temperatura}°C'))
                        
                        # Enviar dados para WebSocket
                        try:
                            async_to_sync(self.channel_layer.group_send)(
                                'server_monitor',
                                {
                                    'type': 'server_update',
                                    'message_type': 'temperature',
                                    'data': {
                                        'id': temp_obj.id,
                                        'temperature': temp_obj.temperature,
                                        'data_received': temp_obj.data_received.isoformat()
                                    }
                                }
                            )
                            self.stdout.write(self.style.SUCCESS('Dados de temperatura enviados via WebSocket'))
                        except Exception as ws_error:
                            self.stdout.write(self.style.ERROR(f'Erro ao enviar via WebSocket: {str(ws_error)}'))
                    else:
                        # Processar dados de status do servidor (joystick e botões)
                        # Mapear valores booleanos para as escolhas do modelo
                        botao1 = '0' if dados_json.get('botao1', False) else '1'
                        botao2 = '0' if dados_json.get('botao2', False) else '1'
                        
                        # Salvar no banco de dados
                        status_obj = ServerStatus.objects.create(
                            button_one=botao1,
                            button_two=botao2,
                            joystick_x=dados_json.get('joystick_x', 2000),
                            joystick_y=dados_json.get('joystick_y', 2000),
                            direction=dados_json.get('direcao', 'Centro')
                        )
                        
                        self.stdout.write(self.style.SUCCESS(f'Dados de status salvos: {dados_json}'))
                        
                        # Enviar dados para WebSocket
                        try:
                            async_to_sync(self.channel_layer.group_send)(
                                'server_monitor',
                                {
                                    'type': 'server_update',
                                    'message_type': 'server_status',
                                    'data': {
                                        'id': status_obj.id,
                                        'button_one': status_obj.button_one,
                                        'button_two': status_obj.button_two,
                                        'joystick_x': status_obj.joystick_x,
                                        'joystick_y': status_obj.joystick_y,
                                        'direction': status_obj.direction,
                                        'data_received': status_obj.data_received.isoformat()
                                    }
                                }
                            )
                            self.stdout.write(self.style.SUCCESS('Dados de status enviados via WebSocket'))
                        except Exception as ws_error:
                            self.stdout.write(self.style.ERROR(f'Erro ao enviar via WebSocket: {str(ws_error)}'))
                    
                    # Opcionalmente, enviar uma resposta de confirmação
                    resposta = json.dumps({"status": "ok", "message": "Dados recebidos com sucesso"})
                    self.server_socket.sendto(resposta.encode('utf-8'), addr)
                    
                except json.JSONDecodeError:
                    self.stdout.write(self.style.ERROR(f'Erro: JSON inválido: {data.decode("utf-8")}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Erro ao processar dados: {str(e)}'))
                    
            except Exception as e:
                if self.running:  # Apenas mostrar erro se ainda estiver rodando
                    self.stdout.write(self.style.ERROR(f'Erro no servidor UDP: {str(e)}'))
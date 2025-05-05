#include "pico/cyw43_arch.h"
#include "pico/stdlib.h"
#include "lwip/tcp.h"
#include "lwip/udp.h"
#include <string.h>
#include <stdio.h>
#include "hardware/adc.h"

#define PINO_BOTAO_1 5
#define PINO_BOTAO_2 6
#define SSID_WIFI "Embarca"
#define SENHA_WIFI "EmbarcaTech01"
#define JOYSTICK_EIXO_X 27
#define JOYSTICK_EIXO_Y 26

// Configurações para UDP
#define UDP_PORT 4444
#define UDP_INTERVALO_MS 200 // Intervalo entre envios UDP

// Endereço IP do servidor receptor (substitua pelos valores corretos)
#define SERVIDOR_IP_0 10
#define SERVIDOR_IP_1 8
#define SERVIDOR_IP_2 45
#define SERVIDOR_IP_3 122  // Substitua pelo IP correto do seu servidor Django

// Estrutura para manter o estado do UDP
struct udp_state {
    struct udp_pcb *pcb;
    ip_addr_t destino_addr;
    uint16_t destino_porta;
    bool conectado;  // Flag para indicar se a conexão está ativa
};

static struct udp_state estado_udp;

// Callback para receber dados UDP
static void udp_recv_callback(void *arg, struct udp_pcb *pcb, struct pbuf *p,
                             const ip_addr_t *addr, u16_t port) {
    if (p) {
        // Extrair os dados recebidos
        char* dados = (char*)malloc(p->tot_len + 1);
        if (dados) {
            pbuf_copy_partial(p, dados, p->tot_len, 0);
            dados[p->tot_len] = '\0';
            
            // Processar os dados recebidos
            printf("Recebido UDP de %s:%d: %s\n", ipaddr_ntoa(addr), port, dados);
            
            free(dados);
        }
        pbuf_free(p);
    }
}

char mensagemBotao1[50] = "Nenhum evento no botão 1";
char mensagemBotao2[50] = "Nenhum evento no botão 2";

char respostaJson[256];

const char* mapearDirecaoJoystick(int x, int y) {
    const int limiteInferior = 1500;
    const int limiteSuperior = 2500;

    if (x < limiteInferior && y > limiteSuperior) return "Noroeste";
    if (x > limiteSuperior && y > limiteSuperior) return "Nordeste";
    if (x < limiteInferior && y < limiteInferior) return "Sudoeste";
    if (x > limiteSuperior && y < limiteInferior) return "Sudeste";
    if (x < limiteInferior) return "Oeste";
    if (x > limiteSuperior) return "Leste";
    if (y > limiteSuperior) return "Norte";
    if (y < limiteInferior) return "Sul";
    return "Centro";
}

void criarStatusJson(int x, int y) {
    const char* direcao = mapearDirecaoJoystick(x, y);
    snprintf(respostaJson, sizeof(respostaJson),
        "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n"
        "{\"botao1\": \"%s\", \"botao2\": \"%s\", \"direcao\": \"%s\"}",
        mensagemBotao1, mensagemBotao2, direcao);
}

static err_t callbackHttp(void *arg, struct tcp_pcb *tpcb, struct pbuf *p, err_t err) {
    if (!p) {
        tcp_close(tpcb);
        return ERR_OK;
    }

    char *requisicao = (char *)p->payload;

    adc_select_input(1);
    int x = adc_read();
    adc_select_input(0);
    int y = adc_read();

    // Apenas respondemos com o status em formato JSON
    criarStatusJson(x, y);
    tcp_write(tpcb, respostaJson, strlen(respostaJson), TCP_WRITE_FLAG_COPY);

    pbuf_free(p);
    return ERR_OK;
}

static err_t callbackConexao(void *arg, struct tcp_pcb *novoPcb, err_t err) {
    tcp_recv(novoPcb, callbackHttp);
    return ERR_OK;
}

static void iniciarServidorHttp(void) {
    struct tcp_pcb *pcb = tcp_new();
    if (!pcb) {
        printf("Erro ao criar PCB\n");
        return;
    }

    if (tcp_bind(pcb, IP_ADDR_ANY, 80) != ERR_OK) {
        printf("Erro ao ligar o servidor na porta 80\n");
        return;
    }

    pcb = tcp_listen(pcb);
    tcp_accept(pcb, callbackConexao);
    printf("Servidor HTTP rodando na porta 80...\n");
}

// Inicializa a comunicação UDP
void iniciar_cliente_udp(ip_addr_t destino, uint16_t porta) {
    estado_udp.pcb = udp_new();
    if (!estado_udp.pcb) {
        printf("Erro ao criar PCB para UDP\n");
        return;
    }
    
    // Bind para poder receber respostas
    err_t err = udp_bind(estado_udp.pcb, IP_ADDR_ANY, 0);
    if (err != ERR_OK) {
        printf("Erro ao fazer bind do socket UDP: %d\n", err);
        return;
    }
    
    // Registrar callback para recebimento de dados
    udp_recv(estado_udp.pcb, udp_recv_callback, NULL);
    
    estado_udp.destino_addr = destino;
    estado_udp.destino_porta = porta;
    estado_udp.conectado = true;
    
    printf("Cliente UDP inicializado para IP:%s Porta:%d\n", 
           ipaddr_ntoa(&destino), porta);
}

// Verifica e reconecta o UDP se necessário
void verificar_conexao_udp() {
    if (!estado_udp.conectado || !estado_udp.pcb) {
        printf("Reconectando cliente UDP...\n");
        
        // Recriar PCB se necessário
        if (!estado_udp.pcb) {
            estado_udp.pcb = udp_new();
            if (!estado_udp.pcb) {
                printf("Erro ao recriar PCB para UDP\n");
                return;
            }
            
            // Bind para poder receber respostas
            err_t err = udp_bind(estado_udp.pcb, IP_ADDR_ANY, 0);
            if (err != ERR_OK) {
                printf("Erro ao fazer bind do socket UDP: %d\n", err);
                return;
            }
            
            // Registrar callback para recebimento de dados
            udp_recv(estado_udp.pcb, udp_recv_callback, NULL);
        }
        
        estado_udp.conectado = true;
        printf("Cliente UDP reconectado\n");
    }
}

// Envia dados via UDP com verificação de conexão
void enviar_dados_udp(const char *dados, int tamanho) {
    // Verifica se a conexão está ativa
    verificar_conexao_udp();
    
    printf("[UDP] Preparando para enviar pacote de %d bytes\n", tamanho);
    printf("[UDP] Destino: %s:%d\n", ipaddr_ntoa(&estado_udp.destino_addr), estado_udp.destino_porta);
    
    struct pbuf *p = pbuf_alloc(PBUF_TRANSPORT, tamanho, PBUF_RAM);
    if (!p) {
        printf("[UDP ERRO] Falha ao alocar pacote UDP\n");
        return;
    }
    
    memcpy(p->payload, dados, tamanho);
    
    err_t err = udp_sendto(estado_udp.pcb, p, 
                        &estado_udp.destino_addr, 
                        estado_udp.destino_porta);
    
    if (err != ERR_OK) {
        printf("[UDP ERRO] Falha ao enviar dados UDP: %d\n", err);
        estado_udp.conectado = false;
    } else {
        printf("[UDP SUCESSO] Pacote enviado: %s\n", dados);
    }
    
    pbuf_free(p);
}

char dados_udp[256];

// Prepara dados para envio UDP
void preparar_dados_udp(int x, int y, bool botao1, bool botao2) {
    const char* direcao = mapearDirecaoJoystick(x, y);
    snprintf(dados_udp, sizeof(dados_udp),
             "{"
             "\"joystick_x\": %d,"
             "\"joystick_y\": %d,"
             "\"direcao\": \"%s\","
             "\"botao1\": %d,"
             "\"botao2\": %d"
             "}",
             x, y, direcao, botao1, botao2);
    
    printf("[INFO] Dados preparados: x=%d, y=%d, direcao=%s, botao1=%d, botao2=%d\n", 
           x, y, direcao, botao1, botao2);
}

void monitorarBotoes() {
    static bool ultimoEstadoBotao1 = false;
    static bool ultimoEstadoBotao2 = false;

    bool estadoBotao1 = !gpio_get(PINO_BOTAO_1);
    bool estadoBotao2 = !gpio_get(PINO_BOTAO_2);

    if (estadoBotao1 != ultimoEstadoBotao1) {
        ultimoEstadoBotao1 = estadoBotao1;
        snprintf(mensagemBotao1, sizeof(mensagemBotao1),
                 estadoBotao1 ? "Botão 1 foi pressionado!" : "Botão 1 foi solto!");
    }

    if (estadoBotao2 != ultimoEstadoBotao2) {
        ultimoEstadoBotao2 = estadoBotao2;
        snprintf(mensagemBotao2, sizeof(mensagemBotao2),
                 estadoBotao2 ? "Botão 2 foi pressionado!" : "Botão 2 foi solto!");
    }
}

int main() {
    stdio_init_all();
    sleep_ms(10000);
    printf("\n\n============= INICIALIZANDO SISTEMA =============\n");
    printf("Versão do Monitor: 1.0.0\n");
    printf("Iniciando servidor HTTP e UDP\n");

    if (cyw43_arch_init()) {
        printf("Erro ao inicializar Wi-Fi\n");
        return 1;
    }

    cyw43_arch_enable_sta_mode();
    printf("Conectando ao Wi-Fi '%s'...\n", SSID_WIFI);

    // Tenta conectar ao Wi-Fi com retry
    int tentativas = 0;
    while (tentativas < 3) {
        if (cyw43_arch_wifi_connect_timeout_ms(SSID_WIFI, SENHA_WIFI, CYW43_AUTH_WPA2_AES_PSK, 10000) == 0) {
            printf("Conectado ao Wi-Fi!\n");
            uint8_t *enderecoIp = (uint8_t*)&(cyw43_state.netif[0].ip_addr.addr);
            printf("IP: %d.%d.%d.%d\n", enderecoIp[0], enderecoIp[1], enderecoIp[2], enderecoIp[3]);
            break;
        }
        
        printf("Tentativa %d falhou. Tentando novamente...\n", tentativas + 1);
        tentativas++;
        sleep_ms(2000);
    }
    
    if (tentativas >= 3) {
        printf("Falha ao conectar ao Wi-Fi após múltiplas tentativas\n");
        return 1;
    }

    gpio_init(PINO_BOTAO_1);
    gpio_set_dir(PINO_BOTAO_1, GPIO_IN);
    gpio_pull_up(PINO_BOTAO_1);

    gpio_init(PINO_BOTAO_2);
    gpio_set_dir(PINO_BOTAO_2, GPIO_IN);
    gpio_pull_up(PINO_BOTAO_2);

    adc_init();
    adc_gpio_init(JOYSTICK_EIXO_X);
    adc_gpio_init(JOYSTICK_EIXO_Y);

    iniciarServidorHttp();
    
    // Configuração do cliente UDP usando as macros de configuração
    ip_addr_t destino_udp;
    IP4_ADDR(&destino_udp, SERVIDOR_IP_0, SERVIDOR_IP_1, SERVIDOR_IP_2, SERVIDOR_IP_3);
    iniciar_cliente_udp(destino_udp, UDP_PORT);
    
    // Contador para controlar o intervalo de envio UDP
    uint32_t ultimo_envio_udp = 0;
    uint32_t ultimo_check_conexao = 0;
    
    // Adicione isso ao seu código para enviar apenas quando houver mudanças
    static int ultimo_x = 0;
    static int ultimo_y = 0;
    static bool ultimo_botao1 = false;
    static bool ultimo_botao2 = false;

    while (true) {
        monitorarBotoes();
        
        // Leitura dos valores atuais do joystick
        adc_select_input(1);
        int x = adc_read();
        adc_select_input(0);
        int y = adc_read();
        
        //printf("[JOYSTICK] Valores brutos: X=%d, Y=%d\n", x, y);
        
        // Estado dos botões
        bool botao1_estado = !gpio_get(PINO_BOTAO_1);
        bool botao2_estado = !gpio_get(PINO_BOTAO_2);
        
        // if (botao1_estado || botao2_estado) {
        //     printf("[BOTOES] Estado: Botão 1=%s, Botão 2=%s\n", 
        //           botao1_estado ? "PRESSIONADO" : "SOLTO", 
        //           botao2_estado ? "PRESSIONADO" : "SOLTO");
        // }
        
        // Verificar conexão UDP periodicamente (a cada 5 segundos)
        uint32_t tempo_atual = to_ms_since_boot(get_absolute_time());
        if (tempo_atual - ultimo_check_conexao >= 5000) {
            verificar_conexao_udp();
            ultimo_check_conexao = tempo_atual;
        }
        
        // Verifica se é hora de enviar dados UDP
        if (tempo_atual - ultimo_envio_udp >= UDP_INTERVALO_MS) {
            // Define uma zona morta ainda maior para o joystick
            // Ignora pequenas variações que são apenas ruído do sensor analógico
            bool mudanca_joystick = (abs(x - ultimo_x) > 800 || abs(y - ultimo_y) > 800);
            
            // Ou se houve mudança na direção do joystick (mesmo que pequena mas suficiente para mudar a direção)
            const char* direcao_atual = mapearDirecaoJoystick(x, y);
            const char* direcao_anterior = mapearDirecaoJoystick(ultimo_x, ultimo_y);
            
            // Ignora pequenas oscilações quando estiver na posição central
            bool mudanca_direcao = false;
            if (strcmp(direcao_atual, "Centro") == 0 && strcmp(direcao_anterior, "Centro") == 0) {
                // Estamos no centro, ignorar pequenas oscilações
                mudanca_direcao = false;
            } else {
                // Em outros casos, detecta mudança na direção
                mudanca_direcao = (strcmp(direcao_atual, direcao_anterior) != 0);
            }
            
            // Verifica se houve mudança nos botões ou uma mudança significativa no joystick
            bool mudanca_significativa = (mudanca_joystick || 
                                        mudanca_direcao ||
                                        botao1_estado != ultimo_botao1 ||
                                        botao2_estado != ultimo_botao2);
                                        
            if (mudanca_significativa) {
                // Prepara e envia os dados via UDP
                preparar_dados_udp(x, y, botao1_estado, botao2_estado);
                enviar_dados_udp(dados_udp, strlen(dados_udp));
                
                // Atualiza valores anteriores
                ultimo_x = x;
                ultimo_y = y;
                ultimo_botao1 = botao1_estado;
                ultimo_botao2 = botao2_estado;
            }
            
            ultimo_envio_udp = tempo_atual;
        }
        
        // Dar tempo para o LwIP processar pacotes recebidos
        cyw43_arch_poll();
        
        sleep_ms(10); // Pequeno delay para não sobrecarregar o CPU
    }

    return 0;
}
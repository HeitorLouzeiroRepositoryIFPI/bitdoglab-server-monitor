#include "pico/cyw43_arch.h"
#include "pico/stdlib.h"
#include "lwip/tcp.h"
#include <string.h>
#include <stdio.h>
#include "hardware/adc.h"
#include "hardware/i2c.h"

#define PINO_BOTAO_1 5
#define PINO_BOTAO_2 6
#define SSID_WIFI "Embarca"
#define SENHA_WIFI "EmbarcaTech01"
#define JOYSTICK_EIXO_X 27
#define JOYSTICK_EIXO_Y 26
#define PINO_BOTAO 6
#define PORTO_I2C i2c1
#define PINO_SDA 14
#define PINO_SCL 15
#define ENDERECO_OLED 0x3C

char mensagemBotao1[50] = "Nenhum evento no botão 1";
char mensagemBotao2[50] = "Nenhum evento no botão 2";

char respostaHttp[2048];
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

void criarPaginaHttp() {
    snprintf(respostaHttp, sizeof(respostaHttp),
        "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n"
        "<!DOCTYPE html><html><head><meta charset='UTF-8'>"
        "<title>Monitoramento</title></head><body>"
        "<h1>Monitoramento de Joystick e Botões</h1>"
        "<p><strong>Botão 1:</strong> <span id='b1'></span></p>"
        "<p><strong>Botão 2:</strong> <span id='b2'></span></p>"
        "<p><strong>Direção do Joystick:</strong> <span id='dir'></span></p>"

        "<script>"
        "function atualizar() {"
        "fetch('/status')"
        ".then(resp => resp.json())"
        ".then(data => {"
        "document.getElementById('b1').textContent = data.botao1;"
        "document.getElementById('b2').textContent = data.botao2;"
        "document.getElementById('dir').textContent = data.direcao;"
        "});"
        "}"
        "setInterval(atualizar, 1000);"
        "window.onload = atualizar;"
        "</script>"

        "</body></html>");
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

    if (strncmp(requisicao, "GET /status", 11) == 0) {
        criarStatusJson(x, y);
        tcp_write(tpcb, respostaJson, strlen(respostaJson), TCP_WRITE_FLAG_COPY);
    } else {
        criarPaginaHttp();
        tcp_write(tpcb, respostaHttp, strlen(respostaHttp), TCP_WRITE_FLAG_COPY);
    }

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
    printf("Iniciando servidor HTTP\n");

    if (cyw43_arch_init()) {
        printf("Erro ao inicializar Wi-Fi\n");
        return 1;
    }

    cyw43_arch_enable_sta_mode();
    printf("Conectando ao Wi-Fi...\n");

    if (cyw43_arch_wifi_connect_timeout_ms(SSID_WIFI, SENHA_WIFI, CYW43_AUTH_WPA2_AES_PSK, 10000)) {
        printf("Falha ao conectar ao Wi-Fi\n");
        return 1;
    } else {
        printf("Conectado ao Wi-Fi!\n");
        uint8_t *enderecoIp = (uint8_t*)&(cyw43_state.netif[0].ip_addr.addr);
        printf("IP: %d.%d.%d.%d\n", enderecoIp[0], enderecoIp[1], enderecoIp[2], enderecoIp[3]);
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

    while (true) {
        monitorarBotoes();
        sleep_ms(100);
    }

    return 0;
}
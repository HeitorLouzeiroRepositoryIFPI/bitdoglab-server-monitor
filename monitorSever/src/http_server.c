#include "http_server.h"
#include "config.h"
#include "input_monitor.h"
#include "pico/stdlib.h"
#include "lwip/tcp.h"
#include "hardware/adc.h"
#include <stdio.h>
#include <string.h>

char respostaHttp[2048];
char respostaJson[256];

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

void inicializarServidorHttp(void) {
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
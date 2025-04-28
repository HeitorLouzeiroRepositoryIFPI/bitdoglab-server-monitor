#include "pico/stdlib.h"
#include "input_monitor.h"
#include "wifi_manager.h"
#include "http_server.h"
#include <stdio.h>

int main() {
    stdio_init_all();
    sleep_ms(10000);
    printf("Iniciando servidor HTTP\n");

    // Initialize inputs
    inicializarMonitorEntrada();
    
    if (!conectarWifi()) {
        printf("Falha ao conectar WiFi. Encerrando.\n");
        return 1;
    }
    
    inicializarServidorHttp();
    
    while (true) {
        monitorarBotoes();
        sleep_ms(100);
    }

    return 0;
}
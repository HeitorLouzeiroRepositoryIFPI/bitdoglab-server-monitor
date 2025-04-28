#include "wifi_manager.h"
#include "pico/cyw43_arch.h"
#include "pico/time.h"
#include <stdio.h>

#define SSID_WIFI "Embarca"
#define SENHA_WIFI "EmbarcaTech01"
#define MAX_RETRIES 3
#define WIFI_TIMEOUT_MS 30000

bool conectarWifi(void) {
    if (cyw43_arch_init()) {
        printf("Erro ao inicializar Wi-Fi\n");
        return false;
    }

    cyw43_arch_enable_sta_mode();
    
    int tentativas = 0;
    while (tentativas < MAX_RETRIES) {
        printf("Tentativa %d de conexão ao Wi-Fi...\n", tentativas + 1);
        
        if (cyw43_arch_wifi_connect_timeout_ms(SSID_WIFI, SENHA_WIFI, CYW43_AUTH_WPA2_AES_PSK, WIFI_TIMEOUT_MS) == 0) {
            printf("Conectado ao Wi-Fi!\n");
            uint8_t *enderecoIp = (uint8_t*)&(cyw43_state.netif[0].ip_addr.addr);
            printf("IP: %d.%d.%d.%d\n", enderecoIp[0], enderecoIp[1], enderecoIp[2], enderecoIp[3]);
            return true;
        }
        
        printf("Falha na tentativa %d\n", tentativas + 1);
        tentativas++;
        if (tentativas < MAX_RETRIES) {
            sleep_ms(1000); // Espera 1 segundo antes de tentar novamente
        }
    }

    printf("Falha ao conectar ao Wi-Fi após %d tentativas\n", MAX_RETRIES);
    return false;
}
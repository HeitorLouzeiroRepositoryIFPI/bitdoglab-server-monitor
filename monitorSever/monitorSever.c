#include "pico/cyw43_arch.h"
#include "pico/stdlib.h"
#include "lwip/tcp.h"
#include <string.h>
#include <stdio.h>
#include "hardware/adc.h"
#include "hardware/i2c.h"


#define BUTTON1_PIN 5      // ajuste conforme seu hardware

int main() {
    stdio_init_all();              // inicializa USB Serial
    gpio_init(BUTTON1_PIN);
    gpio_set_dir(BUTTON1_PIN, GPIO_IN);
    gpio_pull_up(BUTTON1_PIN);     // botões em LOW quando pressionados

    bool last_state = false;

    while (true) {
        bool curr = !gpio_get(BUTTON1_PIN);   // LOW → pressionado
        if (curr != last_state) {
            if (curr) {
                printf("Botão pressionado!\n");
            } else {
                printf("Botão solto!\n");
            }
            last_state = curr;
        }
        sleep_ms(50);           // debounce simples
    }

    return 0;
}

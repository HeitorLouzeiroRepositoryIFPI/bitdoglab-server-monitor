#include "input_monitor.h"
#include "hardware/adc.h"
#include "hardware/gpio.h"
#include "pico/stdlib.h"
#include <stdio.h>

#define PINO_BOTAO_1 5
#define PINO_BOTAO_2 6
#define JOYSTICK_EIXO_X 27
#define JOYSTICK_EIXO_Y 26

// Moving these to global scope and making them non-static
char mensagemBotao1[50];
char mensagemBotao2[50];

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

void inicializarMonitorEntrada(void) {
    // Inicializar ADC para o joystick
    adc_init();
    adc_gpio_init(JOYSTICK_EIXO_X);
    adc_gpio_init(JOYSTICK_EIXO_Y);

    // Inicializar GPIOs para os botões
    gpio_init(PINO_BOTAO_1);
    gpio_set_dir(PINO_BOTAO_1, GPIO_IN);
    gpio_pull_up(PINO_BOTAO_1);

    gpio_init(PINO_BOTAO_2);
    gpio_set_dir(PINO_BOTAO_2, GPIO_IN);
    gpio_pull_up(PINO_BOTAO_2);
}

void monitorarBotoes(void) {
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
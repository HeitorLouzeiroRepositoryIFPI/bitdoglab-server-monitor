#include "ssd1306.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h> // Adicionado para malloc e free
#include "pico/stdlib.h"
#include "hardware/i2c.h"

// Buffer de dados para o display
static uint8_t buffer[SSD1306_PAGES][SSD1306_WIDTH];
static i2c_inst_t *i2c_inst;

// Fonte 5x8 básica
static const uint8_t font5x8[] = {
    0x00, 0x00, 0x00, 0x00, 0x00, // Espaço
    0x00, 0x00, 0x5F, 0x00, 0x00, // !
    0x00, 0x07, 0x00, 0x07, 0x00, // "
    0x14, 0x7F, 0x14, 0x7F, 0x14, // #
    0x24, 0x2A, 0x7F, 0x2A, 0x12, // $
    0x23, 0x13, 0x08, 0x64, 0x62, // %
    0x36, 0x49, 0x55, 0x22, 0x50, // &
    0x00, 0x05, 0x03, 0x00, 0x00, // '
    0x00, 0x1C, 0x22, 0x41, 0x00, // (
    0x00, 0x41, 0x22, 0x1C, 0x00, // )
    0x08, 0x2A, 0x1C, 0x2A, 0x08, // *
    0x08, 0x08, 0x3E, 0x08, 0x08, // +
    0x00, 0x50, 0x30, 0x00, 0x00, // ,
    0x08, 0x08, 0x08, 0x08, 0x08, // -
    0x00, 0x60, 0x60, 0x00, 0x00, // .
    0x20, 0x10, 0x08, 0x04, 0x02, // /
    0x3E, 0x51, 0x49, 0x45, 0x3E, // 0
    0x00, 0x42, 0x7F, 0x40, 0x00, // 1
    0x42, 0x61, 0x51, 0x49, 0x46, // 2
    0x21, 0x41, 0x45, 0x4B, 0x31, // 3
    0x18, 0x14, 0x12, 0x7F, 0x10, // 4
    0x27, 0x45, 0x45, 0x45, 0x39, // 5
    0x3C, 0x4A, 0x49, 0x49, 0x30, // 6
    0x01, 0x71, 0x09, 0x05, 0x03, // 7
    0x36, 0x49, 0x49, 0x49, 0x36, // 8
    0x06, 0x49, 0x49, 0x29, 0x1E, // 9
    0x00, 0x36, 0x36, 0x00, 0x00, // :
    0x00, 0x56, 0x36, 0x00, 0x00, // ;
    0x00, 0x08, 0x14, 0x22, 0x41, // <
    0x14, 0x14, 0x14, 0x14, 0x14, // =
    0x41, 0x22, 0x14, 0x08, 0x00, // >
    0x02, 0x01, 0x51, 0x09, 0x06, // ?
    0x32, 0x49, 0x79, 0x41, 0x3E, // @
    0x7E, 0x11, 0x11, 0x11, 0x7E, // A
    0x7F, 0x49, 0x49, 0x49, 0x36, // B
    0x3E, 0x41, 0x41, 0x41, 0x22, // C
    0x7F, 0x41, 0x41, 0x22, 0x1C, // D
    0x7F, 0x49, 0x49, 0x49, 0x41, // E
    0x7F, 0x09, 0x09, 0x01, 0x01, // F
    0x3E, 0x41, 0x41, 0x49, 0x3A, // G
    0x7F, 0x08, 0x08, 0x08, 0x7F, // H
    0x00, 0x41, 0x7F, 0x41, 0x00, // I
    0x20, 0x40, 0x41, 0x3F, 0x01, // J
    0x7F, 0x08, 0x14, 0x22, 0x41, // K
    0x7F, 0x40, 0x40, 0x40, 0x40, // L
    0x7F, 0x02, 0x04, 0x02, 0x7F, // M
    0x7F, 0x04, 0x08, 0x10, 0x7F, // N
    0x3E, 0x41, 0x41, 0x41, 0x3E, // O
    0x7F, 0x09, 0x09, 0x09, 0x06, // P
    0x3E, 0x41, 0x51, 0x21, 0x5E, // Q
    0x7F, 0x09, 0x19, 0x29, 0x46, // R
    0x46, 0x49, 0x49, 0x49, 0x31, // S
    0x01, 0x01, 0x7F, 0x01, 0x01, // T
    0x3F, 0x40, 0x40, 0x40, 0x3F, // U
    0x1F, 0x20, 0x40, 0x20, 0x1F, // V
    0x7F, 0x20, 0x18, 0x20, 0x7F, // W
    0x63, 0x14, 0x08, 0x14, 0x63, // X
    0x03, 0x04, 0x78, 0x04, 0x03, // Y
    0x61, 0x51, 0x49, 0x45, 0x43, // Z
    0x00, 0x00, 0x7F, 0x41, 0x41, // [
    0x02, 0x04, 0x08, 0x10, 0x20, // "\"
    0x41, 0x41, 0x7F, 0x00, 0x00, // ]
    0x04, 0x02, 0x01, 0x02, 0x04, // ^
    0x40, 0x40, 0x40, 0x40, 0x40, // _
    0x00, 0x01, 0x02, 0x04, 0x00, // `
    0x20, 0x54, 0x54, 0x54, 0x78, // a
    0x7F, 0x48, 0x44, 0x44, 0x38, // b
    0x38, 0x44, 0x44, 0x44, 0x20, // c
    0x38, 0x44, 0x44, 0x48, 0x7F, // d
    0x38, 0x54, 0x54, 0x54, 0x18, // e
    0x08, 0x7E, 0x09, 0x01, 0x02, // f
    0x08, 0x14, 0x54, 0x54, 0x3C, // g
    0x7F, 0x08, 0x04, 0x04, 0x78, // h
    0x00, 0x44, 0x7D, 0x40, 0x00, // i
    0x20, 0x40, 0x44, 0x3D, 0x00, // j
    0x00, 0x7F, 0x10, 0x28, 0x44, // k
    0x00, 0x41, 0x7F, 0x40, 0x00, // l
    0x7C, 0x04, 0x18, 0x04, 0x78, // m
    0x7C, 0x08, 0x04, 0x04, 0x78, // n
    0x38, 0x44, 0x44, 0x44, 0x38, // o
    0x7C, 0x14, 0x14, 0x14, 0x08, // p
    0x08, 0x14, 0x14, 0x18, 0x7C, // q
    0x7C, 0x08, 0x04, 0x04, 0x08, // r
    0x48, 0x54, 0x54, 0x54, 0x20, // s
    0x04, 0x3F, 0x44, 0x40, 0x20, // t
    0x3C, 0x40, 0x40, 0x20, 0x7C, // u
    0x1C, 0x20, 0x40, 0x20, 0x1C, // v
    0x3C, 0x40, 0x30, 0x40, 0x3C, // w
    0x44, 0x28, 0x10, 0x28, 0x44, // x
    0x0C, 0x50, 0x50, 0x50, 0x3C, // y
    0x44, 0x64, 0x54, 0x4C, 0x44, // z
    0x00, 0x08, 0x36, 0x41, 0x00, // {
    0x00, 0x00, 0x7F, 0x00, 0x00, // |
    0x00, 0x41, 0x36, 0x08, 0x00, // }
    0x08, 0x08, 0x2A, 0x1C, 0x08, // →
    0x08, 0x1C, 0x2A, 0x08, 0x08  // ←
};

// Função para enviar comandos ao display
static void ssd1306_send_command(uint8_t command) {
    // Buffer para o comando (primeiro byte é 0x00 para indicar comando)
    uint8_t buf[2] = {0x00, command};
    i2c_write_blocking(i2c_inst, SSD1306_I2C_ADDR, buf, 2, false);
}

// Função para enviar dados ao display
static void ssd1306_send_data(uint8_t *data, size_t len) {
    // Aloca espaço para o byte de controle (0x40) + dados
    uint8_t *buf = malloc(len + 1);
    if (buf == NULL) return;  // Erro na alocação

    // Primeiro byte 0x40 indica que os dados seguintes são para o GDDRAM
    buf[0] = 0x40;
    memcpy(buf + 1, data, len);

    i2c_write_blocking(i2c_inst, SSD1306_I2C_ADDR, buf, len + 1, false);
    free(buf);
}

// Inicialização do display
bool ssd1306_init(i2c_inst_t *i2c_instance, uint8_t sda_pin, uint8_t scl_pin) {
    i2c_inst = i2c_instance;

    // Configurar os pinos I2C
    i2c_init(i2c_inst, 400 * 1000);  // 400 kHz
    gpio_set_function(sda_pin, GPIO_FUNC_I2C);
    gpio_set_function(scl_pin, GPIO_FUNC_I2C);
    gpio_pull_up(sda_pin);
    gpio_pull_up(scl_pin);

    // Pequeno delay para estabilizar
    sleep_ms(100);

    // Sequência de inicialização do display SSD1306
    ssd1306_send_command(SSD1306_DISPLAYOFF);
    ssd1306_send_command(SSD1306_SETDISPLAYCLOCKDIV);
    ssd1306_send_command(0x80);
    ssd1306_send_command(SSD1306_SETMULTIPLEX);
    ssd1306_send_command(0x3F);
    ssd1306_send_command(SSD1306_SETDISPLAYOFFSET);
    ssd1306_send_command(0x00);
    ssd1306_send_command(SSD1306_SETSTARTLINE | 0x00);
    ssd1306_send_command(SSD1306_CHARGEPUMP);
    ssd1306_send_command(0x14);
    ssd1306_send_command(SSD1306_MEMORYMODE);
    ssd1306_send_command(0x00);
    ssd1306_send_command(SSD1306_SEGREMAP | 0x01);
    ssd1306_send_command(SSD1306_COMSCANDEC);
    ssd1306_send_command(SSD1306_SETCOMPINS);
    ssd1306_send_command(0x12);
    ssd1306_send_command(SSD1306_SETCONTRAST);
    ssd1306_send_command(0xCF);
    ssd1306_send_command(SSD1306_SETPRECHARGE);
    ssd1306_send_command(0xF1);
    ssd1306_send_command(SSD1306_SETVCOMDETECT);
    ssd1306_send_command(0x40);
    ssd1306_send_command(SSD1306_DISPLAYALLON_RESUME);
    ssd1306_send_command(SSD1306_NORMALDISPLAY);
    ssd1306_send_command(SSD1306_DISPLAYON);

    // Limpar o buffer e o display
    memset(buffer, 0, sizeof(buffer));
    ssd1306_display();

    return true;
}

// Limpa o buffer e o display
void ssd1306_clear(void) {
    memset(buffer, 0, sizeof(buffer));
    ssd1306_display();
}

// Atualiza o display com o conteúdo do buffer
void ssd1306_display(void) {
    ssd1306_send_command(SSD1306_COLUMNADDR);
    ssd1306_send_command(0);                  // Column start address
    ssd1306_send_command(SSD1306_WIDTH - 1);  // Column end address

    ssd1306_send_command(SSD1306_PAGEADDR);
    ssd1306_send_command(0);                  // Page start address
    ssd1306_send_command(SSD1306_PAGES - 1);  // Page end address

    // Enviar todos os dados de uma vez
    for (int page = 0; page < SSD1306_PAGES; page++) {
        ssd1306_send_data(buffer[page], SSD1306_WIDTH);
    }
}

// Desenha um pixel no buffer
void ssd1306_draw_pixel(uint8_t x, uint8_t y, bool on) {
    if (x >= SSD1306_WIDTH || y >= SSD1306_HEIGHT) {
        return;
    }

    if (on) {
        buffer[y / 8][x] |= (1 << (y % 8));
    } else {
        buffer[y / 8][x] &= ~(1 << (y % 8));
    }
}

// Desenha texto no buffer
void ssd1306_draw_text(uint8_t x, uint8_t y, const char *text, bool invert) {
    while (*text) {
        char c = *text;
        
        // Verifica se o caractere está dentro do intervalo printável
        if (c < ' ' || c > '~' + 2) {
            c = '?';  // Substitui caracteres fora do intervalo
        }
        
        // Calcula o índice na tabela de fonte
        int idx = (c - ' ') * 5;
        
        // Desenha cada coluna do caractere
        for (int col = 0; col < 5; col++) {
            uint8_t line = font5x8[idx + col];
            if (invert) line = ~line;
            
            for (int row = 0; row < 8; row++) {
                if ((line & (1 << row)) != 0) {
                    ssd1306_draw_pixel(x + col, y + row, true);
                } else if (invert) {
                    ssd1306_draw_pixel(x + col, y + row, false);
                }
            }
        }
        
        // Avançar para o próximo caractere
        text++;
        x += 6;  // 5 pixels por caractere + 1 de espaço
        
        // Se saiu da tela, quebra a linha
        if (x + 6 > SSD1306_WIDTH) {
            x = 0;
            y += 8;
        }
        
        // Se saiu verticalmente da tela, para
        if (y >= SSD1306_HEIGHT) {
            break;
        }
    }
}

// Desenha uma linha usando o algoritmo de Bresenham
void ssd1306_draw_line(uint8_t x0, uint8_t y0, uint8_t x1, uint8_t y1, bool on) {
    int dx = abs(x1 - x0);
    int dy = abs(y1 - y0);
    int sx = x0 < x1 ? 1 : -1;
    int sy = y0 < y1 ? 1 : -1;
    int err = (dx > dy ? dx : -dy) / 2;
    int e2;
    
    while (1) {
        ssd1306_draw_pixel(x0, y0, on);
        
        if (x0 == x1 && y0 == y1) break;
        
        e2 = err;
        if (e2 > -dx) { err -= dy; x0 += sx; }
        if (e2 < dy) { err += dx; y0 += sy; }
    }
}

// Desenha um retângulo
void ssd1306_draw_rect(uint8_t x, uint8_t y, uint8_t width, uint8_t height, bool on, bool fill) {
    if (fill) {
        // Retângulo preenchido
        for (uint8_t i = 0; i < height; i++) {
            for (uint8_t j = 0; j < width; j++) {
                ssd1306_draw_pixel(x + j, y + i, on);
            }
        }
    } else {
        // Somente a borda
        for (uint8_t i = 0; i < width; i++) {
            ssd1306_draw_pixel(x + i, y, on);
            ssd1306_draw_pixel(x + i, y + height - 1, on);
        }
        for (uint8_t i = 0; i < height; i++) {
            ssd1306_draw_pixel(x, y + i, on);
            ssd1306_draw_pixel(x + width - 1, y + i, on);
        }
    }
}

// Desenha uma imagem bitmap no buffer
void ssd1306_draw_bitmap(uint8_t x, uint8_t y, const uint8_t *bitmap, uint8_t width, uint8_t height, bool invert) {
    int byteWidth = (width + 7) / 8;
    
    for (uint8_t j = 0; j < height; j++) {
        for (uint8_t i = 0; i < width; i++) {
            if (i & 7) {
                uint8_t byte = bitmap[j * byteWidth + i / 8];
                bool bit = byte & (128 >> (i & 7));
                if (invert) bit = !bit;
                if (bit) {
                    ssd1306_draw_pixel(x + i, y + j, true);
                }
            } else {
                uint8_t byte = bitmap[j * byteWidth + i / 8];
                bool bit = byte & 128;
                if (invert) bit = !bit;
                if (bit) {
                    ssd1306_draw_pixel(x + i, y + j, true);
                }
            }
        }
    }
}
#ifndef SSD1306_H
#define SSD1306_H

#include <stdint.h>
#include <stdbool.h>
#include "hardware/i2c.h"
#include "pico/stdlib.h"

// Definições de tamanho do display
#define SSD1306_HEIGHT              64
#define SSD1306_WIDTH               128
#define SSD1306_PAGES               (SSD1306_HEIGHT / 8)

// Comandos
#define SSD1306_SETCONTRAST         0x81
#define SSD1306_DISPLAYALLON_RESUME 0xA4
#define SSD1306_DISPLAYALLON        0xA5
#define SSD1306_NORMALDISPLAY       0xA6
#define SSD1306_INVERTDISPLAY       0xA7
#define SSD1306_DISPLAYOFF          0xAE
#define SSD1306_DISPLAYON           0xAF
#define SSD1306_SETDISPLAYOFFSET    0xD3
#define SSD1306_SETCOMPINS          0xDA
#define SSD1306_SETVCOMDETECT       0xDB
#define SSD1306_SETDISPLAYCLOCKDIV  0xD5
#define SSD1306_SETPRECHARGE        0xD9
#define SSD1306_SETMULTIPLEX        0xA8
#define SSD1306_SETLOWCOLUMN        0x00
#define SSD1306_SETHIGHCOLUMN       0x10
#define SSD1306_SETSTARTLINE        0x40
#define SSD1306_MEMORYMODE          0x20
#define SSD1306_COLUMNADDR          0x21
#define SSD1306_PAGEADDR            0x22
#define SSD1306_COMSCANINC          0xC0
#define SSD1306_COMSCANDEC          0xC8
#define SSD1306_SEGREMAP            0xA0
#define SSD1306_CHARGEPUMP          0x8D
#define SSD1306_EXTERNALVCC         0x01
#define SSD1306_SWITCHCAPVCC        0x02

// Endereço I2C do display (padrão: 0x3C)
#define SSD1306_I2C_ADDR            0x3C

// Inicializa o display OLED
bool ssd1306_init(i2c_inst_t *i2c_instance, uint8_t sda_pin, uint8_t scl_pin);

// Limpa o buffer e o display
void ssd1306_clear(void);

// Atualiza o display com o conteúdo do buffer
void ssd1306_display(void);

// Desenha um pixel no buffer
void ssd1306_draw_pixel(uint8_t x, uint8_t y, bool on);

// Desenha texto no buffer
void ssd1306_draw_text(uint8_t x, uint8_t y, const char *text, bool invert);

// Desenha uma linha
void ssd1306_draw_line(uint8_t x0, uint8_t y0, uint8_t x1, uint8_t y1, bool on);

// Desenha um retângulo
void ssd1306_draw_rect(uint8_t x, uint8_t y, uint8_t width, uint8_t height, bool on, bool fill);

// Desenha uma imagem bitmap no buffer
void ssd1306_draw_bitmap(uint8_t x, uint8_t y, const uint8_t *bitmap, uint8_t width, uint8_t height, bool invert);

#endif // SSD1306_H
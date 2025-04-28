#ifndef HTTP_SERVER_H
#define HTTP_SERVER_H

#include <stdint.h>

void inicializarServidorHttp(void);
void criarStatusJson(int x, int y);
void criarPaginaHttp(void);

extern char respostaHttp[2048];
extern char respostaJson[256];

#endif // HTTP_SERVER_H
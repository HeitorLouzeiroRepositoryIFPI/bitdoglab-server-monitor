#ifndef INPUT_MONITOR_H
#define INPUT_MONITOR_H

void inicializarMonitorEntrada(void);
void monitorarBotoes(void);
const char* mapearDirecaoJoystick(int x, int y);

extern char mensagemBotao1[50];
extern char mensagemBotao2[50];

#endif // INPUT_MONITOR_H
#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI(); // Pinos definidos em User_Setup.h

enum EstadoTerminal {
  INICIALIZANDO,
  AGUARDANDO_TAG,
  TAG_DETECTADA,
  CONSULTANDO,
  SUCESSO
};

EstadoTerminal estadoAtual = INICIALIZANDO;

void cabecalho() {
  tft.fillScreen(TFT_BLACK);

  // Faixa azul superior
  tft.fillRect(0, 0, 320, 35, TFT_BLUE);

  tft.setTextColor(TFT_WHITE, TFT_BLUE);
  tft.setTextSize(2);

  tft.setCursor(45, 10);
  tft.println("FREQUENCIA PREMIADA");
}

void setup() {
  Serial.begin(115200);

  tft.init();
  tft.setRotation(1);

  // Tela inicial
  cabecalho();

  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);

  tft.setCursor(75, 85);
  tft.println("Inicializando...");

  Serial.println("Terminal iniciado com sucesso!");

  delay(1500);

  // Depois da inicialização, entra no estado de espera
  estadoAtual = AGUARDANDO_TAG;
}

void loop() {

  if (estadoAtual == AGUARDANDO_TAG) {
    cabecalho();

    tft.setTextColor(TFT_YELLOW, TFT_BLACK);
    tft.setTextSize(2);
    tft.setCursor(95, 70);
    tft.println("MODO DEMO");

    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setCursor(55, 130);
    tft.println("Aproxime sua tag");

    Serial.println("Aguardando tag...");

    delay(3000);

    estadoAtual = TAG_DETECTADA;
  }

  else if (estadoAtual == TAG_DETECTADA) {
    cabecalho();

    tft.setTextColor(TFT_YELLOW, TFT_BLACK);
    tft.setTextSize(2);
    tft.setCursor(75, 70);
    tft.println("TAG DETECTADA");

    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setCursor(70, 120);
    tft.println("UID: DEMO1234");

    Serial.println("Tag simulada detectada.");
    Serial.println("UID: DEMO1234");

    delay(2000);

    estadoAtual = CONSULTANDO;
  }

  else if (estadoAtual == CONSULTANDO) {
    cabecalho();

    tft.setTextColor(TFT_YELLOW, TFT_BLACK);
    tft.setTextSize(2);
    tft.setCursor(90, 100);
    tft.println("VALIDANDO...");

    Serial.println("Consultando backend...");

    delay(2000);

    estadoAtual = SUCESSO;
  }

  else if (estadoAtual == SUCESSO) {
    cabecalho();

    tft.setTextColor(TFT_GREEN, TFT_BLACK);
    tft.setTextSize(2);
    tft.setCursor(40, 75);
    tft.println("PRESENCA REGISTRADA");

    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setCursor(95, 125);
    tft.println("Aluno Demo");

    Serial.println("Presenca registrada para Aluno Demo.");

    delay(3000);

    estadoAtual = AGUARDANDO_TAG;
  }
}
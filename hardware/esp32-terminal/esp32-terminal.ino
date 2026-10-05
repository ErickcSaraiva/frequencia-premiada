#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI(); // Pinos definidos em User_Setup.h

void setup() {
  Serial.begin(115200);

  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);

  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);

  tft.setCursor(30, 40);
  tft.println("FREQUENCIA PREMIADA");

  tft.setCursor(45, 100);
  tft.println("Aproxime sua tag");

  Serial.println("Terminal iniciado com sucesso!");
}

void loop() {
}
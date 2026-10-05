# Terminal ESP32 — Frequência Premiada

Este diretório contém o firmware do protótipo físico do projeto Frequência Premiada.

## Hardware atual

- ESP32-2432S028
- Display TFT integrado
- Leitor RFID-RC522
- Tags RFID/NFC
- Módulo relé

## Status atual

- ESP32 reconhecida pelo computador
- Firmware gravado com sucesso
- Comunicação serial funcionando
- Display TFT funcionando
- Tela inicial do terminal implementada
- Integração física com RC522 pendente do extensor microSD

## Fluxo previsto

1. O professor inicia uma chamada pelo sistema.
2. O aluno aproxima a tag no leitor RFID.
3. A ESP32 lê o UID da tag.
4. A ESP32 envia o UID para a API.
5. O backend valida a chamada e o aluno.
6. O resultado é exibido no display.

## Modo atual

Neste momento, o firmware implementa apenas a interface inicial do terminal.
A leitura real do RC522 será adicionada posteriormente.
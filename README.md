# Card Battle Arena — Extensión individual

## Funcionalidades del examen

- Modo de batalla manual y automático.
- Estrategia automática válida para jugador y máquina.
- Pausa de 1 segundo entre acciones automáticas.
- Protección contra múltiples acciones simultáneas mediante estado y un único temporizador.
- Golpe crítico: 12% de probabilidad y multiplicador x1.5.
- Esquive: 8% de probabilidad y daño final 0.
- Orden de resolución: daño aleatorio → esquive → crítico → defensa → redondeo → HP → derrota.
- Integración de críticos y esquives con el poder especial.
- Cambio automático a la siguiente carta derrotada.
- Detención de temporizadores al finalizar o desmontar el componente.
- Persistencia del modo de juego en el registro de la batalla.

## Archivos modificados

- `src/utils/battleEngine.js`: reglas de daño, crítico, esquive y estrategia automática.
- `src/components/battle/battle.js`: ejecución automática, temporizador único, controles y mensajes visuales.
- `src/components/deck/deckSelector.js`: selección del modo antes de iniciar la partida.
- `src/components/app/gameApp.js`: persistencia del modo en el historial.
- `src/components/battle/battleStyles.css`: estilos del modo y eventos críticos/esquive.
- `src/components/deck/deckStyles.css`: estilos del selector de modo.

## Ejecución

Terminal 1:

```bash
npm install
npm run server
```

Terminal 2:

```bash
npm run dev
```

## Sustentación rápida

- Crítico: `Math.random() < 0.12` en `BattleEngine.resolveDamage()`.
- Esquive: `Math.random() < 0.08` en `BattleEngine.resolveDamage()`.
- Multiplicador crítico: `damage * 1.5`.
- Defensa: `finalDamage *= 0.5`.
- Modo automático: `BattleComponent.runAutomaticTurn()`.
- Selección de acción: `BattleEngine.getAutomaticAction(owner)`.
- Temporizador: `scheduleAutomaticTurn()` y `clearAutomaticTimer()`.
- Modo persistido: propiedad `mode` del objeto `battle` en `GameApp.finishBattle()`.

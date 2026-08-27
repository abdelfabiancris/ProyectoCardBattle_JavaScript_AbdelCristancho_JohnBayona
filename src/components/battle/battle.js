import { BattleEngine } from '../../utils/battleEngine.js';
import { playSound } from '../../utils/audio.js';

import './battleStyles.css';

export class BattleComponent extends HTMLElement {

    constructor() {
        super();

        this.engine = null;
        this.player = null;
        this.logs = [];
        this.startedAt = null;
        this.resultSaved = false;
        this.battleMode = 'manual';
        this.isProcessingTurn = false;
        this.pendingTimers = [];

        /*
         * HP anterior de cada carta.
         * Se utilizan para animar la barra
         * desde el valor anterior hasta el nuevo.
         */
        this.previousPlayerHp = null;
        this.previousMachineHp = null;

        this.renderLoading();
    }

    scheduleTimer(callback, delay) {

        const timerId = setTimeout(
            () => {

                this.pendingTimers =
                    this.pendingTimers.filter(
                        (id) => id !== timerId
                    );

                callback();

            },
            delay
        );

        this.pendingTimers.push(
            timerId
        );

        return timerId;
    }

    clearBattleTimers() {

        this.pendingTimers.forEach(
            (timerId) => {
                clearTimeout(timerId);
            }
        );

        this.pendingTimers = [];

        this.isProcessingTurn = false;
    }

    setBattleData(data) {

        this.startedAt =
            new Date().toISOString();

        this.engine =
            new BattleEngine(
                data.playerDeck,
                data.machineDeck
            );

        this.engine.startedAt =
            this.startedAt;

        this.player =
            data.player;

        this.logs = [];

        /*
         * Reiniciamos los valores de HP
         * al comenzar una nueva batalla.
         */
        this.previousPlayerHp = null;
        this.previousMachineHp = null;

        this.render();
        this.configureEvents();
        this.configureModeSelector();

        /*
         * Si la máquina empieza,
         * realiza automáticamente su turno.
         */
        if (
            this.engine.turn === 'machine'
        ) {

            this.renderMachineThinking();

            setTimeout(
                () => {
                    this.machineAction();
                },
                1000
            );
        }
    }

    renderLoading() {

        this.innerHTML = `
            <section class="battle-section">

                <div class="battle-loading">

                    <h1>
                        ⚔️ Cargando batalla...
                    </h1>

                    <p>
                        Preparando a los maestros
                        para el combate.
                    </p>

                </div>

            </section>
        `;
    }

    render() {

        if (!this.engine) {
            return;
        }

        const state =
            this.engine.getState();

        const playerCard =
            state.playerCard;

        const machineCard =
            state.machineCard;

        /*
         * Guardamos el HP anterior.
         *
         * La primera vez utilizamos el HP actual
         * para que la barra aparezca correctamente
         * llena.
         */
        if (this.previousPlayerHp === null) {

            this.previousPlayerHp =
                playerCard?.currentHp ?? 250;
        }

        if (this.previousMachineHp === null) {

            this.previousMachineHp =
                machineCard?.currentHp ?? 250;
        }

        this.innerHTML = `
            <section class="battle-section">

                <header class="battle-header">

                    <h1>
                        ⚔️ Card Battle Arena ⚔️
                    </h1>

                    <div
                        class="
                            turn-indicator
                            ${state.turn === 'player'
                ? 'player-turn'
                : 'machine-turn'
            }
                        "
                    >
                        ${state.turn === 'player'
                ? '🎮 Tu turno'
                : '🤖 Turno de la máquina'
            }
                    </div>

                    <div class="round-indicator">
                        Ronda ${state.round}
                    </div>

                    <div class="battle-mode">
                        <label for="battle-mode-select">
                            🎮 Modo de batalla:
                        </label>

                        <select id="battle-mode-select">
                            <option value="manual"
                                ${this.battleMode === 'manual' ? 'selected' : ''}>
                                Manual
                            </option>

                            <option value="automatic"
                                ${this.battleMode === 'automatic' ? 'selected' : ''}>
                                Automático
                            </option>
                        </select>
                    </div>

                </header>

                <main class="battle-arena">

                    ${this.renderCard(
                playerCard,
                'user',
                this.previousPlayerHp
            )}

                    <div class="vs">
                        VS
                    </div>

                    ${this.renderCard(
                machineCard,
                'machine',
                this.previousMachineHp
            )}

                </main>

                ${state.gameOver
                ? ''
                : state.turn === 'player'
                    ? this.renderControls(
                        playerCard
                    )
                    : `
                        <div
                            class="
                                battle-controls
                                machine-thinking
                            "
                        >

                            <h3>
                                🤖 La máquina
                                está pensando...
                            </h3>

                            <div class="thinking-dots">
                                ● ● ●
                            </div>

                        </div>
                    `
            }

                ${this.renderLog()}

                <div id="battle-result"></div>

            </section>
        `;
    }

    renderCard(
        card,
        owner,
        previousHp
    ) {

        if (!card) {

            return `
                <div class="battle-player">

                    <p>
                        No hay carta disponible.
                    </p>

                </div>
            `;
        }

        /*
         * HP actual.
         */
        const hpPercentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (card.currentHp / 250) * 100
                )
            );

        /*
         * HP anterior.
         */
        const previousHpPercentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (previousHp / 250) * 100
                )
            );

        let hpClass = '';

        if (hpPercentage <= 30) {

            hpClass = 'low';

        } else if (hpPercentage <= 60) {

            hpClass = 'medium';
        }

        return `
            <div class="battle-player">

                <div
                    class="
                        player-label
                        ${owner === 'user'
                ? 'user'
                : 'machine'
            }
                    "
                >
                    ${owner === 'user'
                ? `🎮 ${this.player?.nickname
                || 'Jugador'
                }`
                : '🤖 Máquina'
            }
                </div>

                <article
                    class="
                        battle-card
                        ${card.isDefending
                ? 'defending'
                : ''
            }
                        ${card.defeated
                ? 'defeated'
                : ''
            }
                    "
                >

                    <img
                        class="battle-card-image"
                        src="${card.image}"
                        alt="${card.name}"
                    >

                    <div
                        class="battle-card-content"
                    >

                        <h2>
                            ${card.name}
                        </h2>

                        <span class="battle-type">
                            ${card.type}
                        </span>

                        <div class="hp-container">

                            <div class="hp-label">

                                <span>
                                    ❤️ HP
                                </span>

                                <span>
                                    ${card.currentHp}
                                    / 250
                                </span>

                            </div>

                            <div class="hp-bar">

                                <div
                                    class="
                                        hp-fill
                                        ${hpClass}
                                    "
                                    data-previous-width="${previousHpPercentage}"
                                    data-current-width="${hpPercentage}"
                                    style="
                                        width:
                                        ${previousHpPercentage}%;
                                    "
                                ></div>

                            </div>

                        </div>

                        <div class="card-status">

                            ${card.isDefending
                ? `
                                    <span
                                        class="
                                            defending-status
                                        "
                                    >
                                        🛡️ Defendiendo
                                    </span>
                                `
                : ''
            }

                            ${card.defeated
                ? `
                                    <span
                                        class="
                                            defeated-status
                                        "
                                    >
                                        💀 Derrotada
                                    </span>
                                `
                : ''
            }

                        </div>

                    </div>

                </article>

            </div>
        `;
    }

    renderControls(card) {

        const actions =
            this.engine.getAvailableActions(
                'player'
            );

        const specialAvailable =
            actions.includes('special');

        const cooldown =
            card.specialCooldown;

        const unlockTurn =
            card.special.unlockTurn;

        return `
            <section class="battle-controls">

                <h3>
                    🎮 Elige tu acción
                </h3>

                <div class="attack-buttons">

                    ${card.attacks
                .map(
                    (
                        attack,
                        index
                    ) => `
                                <button
                                    class="
                                        battle-button
                                        attack-button
                                    "
                                    data-action="attack-${index + 1}"
                                >

                                    ⚔️
                                    ${attack.name}

                                    <small>
                                        ${attack.baseDamage}
                                        daño base
                                    </small>

                                </button>
                            `
                )
                .join('')
            }

                </div>

                <button
                    class="
                        battle-button
                        defense-button
                    "
                    data-action="defense"
                >

                    🛡️
                    ${card.defense.name}

                    <small>
                        Reducir daño 50%
                    </small>

                </button>

                <button
                    class="
                        battle-button
                        special-button
                        ${specialAvailable
                ? 'available'
                : 'locked'
            }
                    "
                    data-action="special"
                    ${specialAvailable
                ? ''
                : 'disabled'
            }
                >

                    ⚡
                    ${card.special.name}

                    <small>

                        ${specialAvailable
                ? 'PODER DISPONIBLE'
                : cooldown > 0
                    ? `Cooldown: ${cooldown}`
                    : `Disponible desde tu turno ${unlockTurn}`
            }

                    </small>

                </button>

            </section>
        `;
    }

    renderLog() {

        return `
            <section class="battle-log">

                <h3>
                    📜 Registro de combate
                </h3>

                ${this.logs.length
                ? this.logs
                    .map(
                        (log) => `
                                <div
                                    class="log-entry"
                                >
                                    ${log}
                                </div>
                            `
                    )
                    .join('')
                : `
                        <div class="log-entry">
                            La batalla está
                            por comenzar...
                        </div>
                    `
            }

            </section>
        `;
    }

    configureEvents() {

        this
            .querySelectorAll(
                '[data-action]'
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        'click',
                        () => {

                            const action =
                                button
                                    .dataset
                                    .action
                                    .trim();

                            this.playerAction(
                                action
                            );
                        }
                    );
                }
            );
    }

    startAutomaticTurn() {

        if (
            !this.engine ||
            this.engine.gameOver ||
            this.isProcessingTurn
        ) {
            return;
        }

        if (
            this.battleMode !== 'automatic' ||
            this.engine.turn !== 'player'
        ) {
            return;
        }

        this.isProcessingTurn = true;

        this.disableControls();

        const action =
            this.getAutomaticPlayerAction();

        if (!action) {
            this.isProcessingTurn = false;
            return;
        }

        this.logs.unshift(
            `🤖 Modo automático: ` +
            `el jugador utilizará ${action}.`
        );

        this.render();
        this.configureEvents();
        this.configureModeSelector();


        this.scheduleTimer(
            () => {


                if (
                    !this.engine ||
                    this.engine.gameOver
                ) {
                    this.isProcessingTurn = false;
                    return;
                }

                this.isProcessingTurn = false;

                this.playerAction(action);

            },
            1000
        );
    }

    configureModeSelector() {

        const selector =
            this.querySelector(
                '#battle-mode-select'
            );

        if (!selector) {
            return;
        }

        selector.addEventListener(
            'change',
            (event) => {

                this.battleMode =
                    event.target.value;

                if (
                    this.battleMode === 'automatic' &&
                    this.engine?.turn === 'player'
                ) {

                    this.startAutomaticTurn();
                }
            }
        );
    }

    getAutomaticPlayerAction() {

        const actions =
            this.engine.getAvailableActions(
                'player'
            );

        if (!actions.length) {
            return null;
        }

        /*
        * Si el poder especial está disponible,
        * le damos prioridad algunas veces.
        */
        if (
            actions.includes('special') &&
            Math.random() < 0.5
        ) {
            return 'special';
        }

        /*
        * Si la vida está baja,
        * aumentamos la posibilidad de defenderse.
        */
        const playerCard =
            this.engine.getState().playerCard;

        const hpPercentage =
            (playerCard.currentHp / 250) * 100;

        if (
            actions.includes('defense') &&
            hpPercentage <= 30 &&
            Math.random() < 0.6
        ) {
            return 'defense';
        }

        /*
        * Si no se cumplen las condiciones
        * anteriores, elegimos una acción
        * válida al azar.
        */
        const randomIndex =
            Math.floor(
                Math.random() * actions.length
            );

        return actions[randomIndex];
    }

    /*
     * ========================================
     * TURNO DEL JUGADOR
     * ========================================
     */

    playerAction(action) {

        if (
            !this.engine ||
            this.engine.gameOver ||
            this.isProcessingTurn
        ) {
            return;
        }

        this.isProcessingTurn = true;

        this.disableControls();

        const result =
            this.engine.performAction(
                'player',
                action
            );

        if (!result.success) {

            this.logs.push(
                `❌ ${result.message}`
            );

            this.isProcessingTurn = false;

            this.render();
            this.configureEvents();
            this.configureModeSelector();

            return;
        }

        this.addResultToLog(
            result
        );

        this.playSoundForAction(
            result
        );

        /*
         * Guardamos los HP antes de
         * actualizar la interfaz.
         */
        const previousPlayerHp =
            this.previousPlayerHp;

        const previousMachineHp =
            this.previousMachineHp;

        /*
         * Actualizamos el estado visual.
         */
        this.render();
        this.configureEvents();
        this.configureModeSelector();

        /*
         * Animamos la barra de vida.
         */
        this.animateHealthBars();

        /*
         * Animamos la acción.
         */
        this.playActionAnimation(
            result.type,
            'player'
        );

        /*
         * Actualizamos los HP anteriores
         * después de preparar la animación.
         */
        this.updatePreviousHp();

        /*
         * Si terminó la partida.
         */
        if (result.gameOver) {

            this.isProcessingTurn = false;

            this.clearBattleTimers();

            /*
            * Actualizamos la interfaz con el
            * estado final de la batalla.
            */
            this.render();

            this.configureEvents();

            this.configureModeSelector();

            /*
            * Mostramos el resultado después
            * de actualizar el DOM.
            */
            this.scheduleTimer(
                () => {

                    this.showResult();

                },
                800
            );

            return;
        }
        /*
         * Si una carta fue derrotada.
         */
        if (result.defeated) {

            if (this.engine.gameOver) {

                this.isProcessingTurn = false;
                this.clearBattleTimers();
                this.showResult();

                return;
            }

            this.scheduleTimer(
                () => {

                    if (
                        !this.engine ||
                        this.engine.gameOver
                    ) {
                        this.isProcessingTurn = false;
                        return;
                    }

                    if (
                        this.engine.turn === 'machine'
                    ) {

                        this.renderMachineThinking();

                        this.scheduleTimer(
                            () => {

                                if (
                                    !this.engine ||
                                    this.engine.gameOver
                                ) {
                                    this.isProcessingTurn = false;
                                    return;
                                }

                                this.isProcessingTurn = false;

                                this.machineAction();

                            },
                            800
                        );
                    }

                },
                800
            );

            return;
        }

        /*
         * Turno de la máquina.
         */
        if (
            this.engine.turn === 'machine'
        ) {

            this.renderMachineThinking();

            this.scheduleTimer(
                () => {

                    if (
                        !this.engine ||
                        this.engine.gameOver
                    ) {
                        this.isProcessingTurn = false;
                        return;
                    }

                    this.isProcessingTurn = false;

                    this.machineAction();

                },
                1000
            );
        }
    }

    /*
     * ========================================
     * TURNO DE LA MÁQUINA
     * ========================================
     */

    machineAction() {

        if (
            !this.engine ||
            this.engine.gameOver
        ) {
            return;
        }

        /*
        * Guardamos el HP del jugador
        * ANTES de recibir el ataque.
        */
        const previousPlayerHp =
            this.engine.getState()
                .playerCard.currentHp;

        const result =
            this.engine.machineTurn();


        if (!result) {

            console.error(
                '❌ machineTurn() devolvió null'
            );

            return;
        }

        this.addResultToLog(
            result
        );

        this.playSoundForAction(
            result
        );

        /*
        * ========================================
        * PARTIDA TERMINADA
        * ========================================
        *
        * IMPORTANTE:
        *
        * Comprobamos gameOver ANTES de hacer
        * render().
        *
        * De esta manera evitamos que aparezca
        * "No hay carta disponible" y
        * "La máquina está pensando..."
        * como pantalla final.
        */
        if (result.gameOver) {

            this.isProcessingTurn = false;

            this.clearBattleTimers();

            /*
            * Actualizamos la interfaz una última vez.
            *
            * El motor ya cambió la carta derrotada,
            * por lo que render() mostrará el estado
            * final de las cartas.
            */
            this.render();

            this.configureEvents();

            this.configureModeSelector();

            /*
            * Mostramos el resultado después
            * de actualizar la interfaz.
            */
            this.showResult();

            return;
        }

        /*
        * ========================================
        * LA BATALLA CONTINÚA
        * ========================================
        *
        * Como todavía no terminó,
        * actualizamos el HTML.
        */
        this.render();

        this.configureEvents();

        this.configureModeSelector();

        /*
        * ========================================
        * ANIMACIÓN DE LA ACCIÓN
        * ========================================
        */

        if (
            result.type === 'attack' ||
            result.type === 'special'
        ) {

            const newPlayerHp =
                this.engine.getState()
                    .playerCard.currentHp;

            /*
            * Animación del ataque.
            */
            this.playActionAnimation(
                result.type,
                'machine'
            );

            /*
            * Animación de la barra de vida.
            *
            * Esperamos 250 ms para sincronizar
            * la barra con el impacto.
            */
            setTimeout(
                () => {

                    this.animateHealthBar(
                        'user',
                        previousPlayerHp,
                        newPlayerHp
                    );

                },
                250
            );

            /*
            * Guardamos el nuevo HP.
            */
            this.previousPlayerHp =
                newPlayerHp;

        } else {

            /*
            * Si la máquina utilizó defensa,
            * solamente ejecutamos su animación.
            */
            this.playActionAnimation(
                result.type,
                'machine'
            );
        }

        /*
        * ========================================
        * ACTUALIZAR HP DE LA MÁQUINA
        * ========================================
        */

        const state =
            this.engine.getState();

        if (state.machineCard) {

            this.previousMachineHp =
                state.machineCard.currentHp;
        }

        /*
        * ========================================
        * FINAL DEL TURNO
        * ========================================
        */

        this.isProcessingTurn = false;

        /*
        * ========================================
        * SIGUIENTE TURNO AUTOMÁTICO
        * ========================================
        */

        if (
            this.battleMode === 'automatic' &&
            this.engine.turn === 'player' &&
            !this.engine.gameOver
        ) {

            this.scheduleTimer(
                () => {

                    this.startAutomaticTurn();

                },
                1000
            );
        }
    }

    /*
     * ========================================
     * ANIMACIÓN DE BARRAS DE VIDA
     * ========================================
     */

    animateHealthBars() {

        const playerBar =
            this.querySelector(
                '.battle-player:first-child .hp-fill'
            );

        const machineBar =
            this.querySelector(
                '.battle-player:last-child .hp-fill'
            );

        /*
         * Barra del jugador.
         */
        if (playerBar) {

            const currentWidth =
                playerBar.dataset.currentWidth;

            requestAnimationFrame(
                () => {

                    playerBar.style.width =
                        `${currentWidth}%`;
                }
            );
        }

        /*
         * Barra de la máquina.
         */
        if (machineBar) {

            const currentWidth =
                machineBar.dataset.currentWidth;

            requestAnimationFrame(
                () => {

                    machineBar.style.width =
                        `${currentWidth}%`;
                }
            );
        }
    }

    /*
     * ========================================
     * ACTUALIZAR HP ANTERIOR
     * ========================================
     */

    updatePreviousHp() {

        if (!this.engine) {
            return;
        }

        const state =
            this.engine.getState();

        if (state.playerCard) {

            this.previousPlayerHp =
                state.playerCard.currentHp;
        }

        if (state.machineCard) {

            this.previousMachineHp =
                state.machineCard.currentHp;
        }
    }

    /*
     * ========================================
     * MÁQUINA PENSANDO
     * ========================================
     */

    renderMachineThinking() {

        const controls =
            this.querySelector(
                '.battle-controls'
            );

        if (!controls) {
            return;
        }

        controls.innerHTML = `
            <h3>
                🤖 La máquina
                está pensando...
            </h3>

            <div class="thinking-dots">
                ● ● ●
            </div>
        `;
    }

    /*
     * ========================================
     * DESHABILITAR BOTONES
     * ========================================
     */

    disableControls() {

        this
            .querySelectorAll(
                '[data-action]'
            )
            .forEach(
                (button) => {

                    button.disabled =
                        true;
                }
            );
    }

    /*
     * ========================================
     * REGISTRO DE COMBATE
     * ========================================
     */

    addResultToLog(result) {

        if (
            result.type === 'attack'
        ) {

            if (result.dodged) {

                this.logs.unshift(
                    `💨 ¡ATAQUE ESQUIVADO! 
                    ${result.defender} esquivó 
                    el ataque de ${result.attacker}.`
                );

            } else {

                const criticalMessage =
                    result.critical
                        ? ' 💥 ¡GOLPE CRÍTICO!'
                        : '';

                this.logs.unshift(
                    `⚔️ ${result.attacker}
                    utilizó ${result.actionName}
                    y causó ${result.damage}
                    de daño a ${result.defender}.${criticalMessage}`
                );
            }

            if (result.defeated) {

                this.logs.unshift(
                    `💀 ${result.defender}
                    fue derrotado.`
                );
            }

            return;
        }

        if (
            result.type === 'defense'
        ) {

            this.logs.unshift(
                `🛡️ ${result.attacker}
                utilizó ${result.actionName}
                y reducirá el próximo daño
                recibido en un 50%.`
            );

            return;
        }

        if (
            result.type === 'special'
        ) {

            if (result.dodged) {

                this.logs.unshift(
                    `💨 ¡ATAQUE ESQUIVADO! 
                    ${result.defender} esquivó 
                    el poder especial de ${result.attacker}.`
                );

            } else {

                const criticalMessage =
                    result.critical
                        ? ' 💥 ¡GOLPE CRÍTICO!'
                        : '';

                this.logs.unshift(
                    `⚡ ${result.attacker}
                    utilizó ${result.actionName}
                    y causó ${result.damage}
                    de daño a ${result.defender}.${criticalMessage}`
                );
            }

            if (result.defeated) {

                this.logs.unshift(
                    `💀 ${result.defender}
                    fue derrotado.`
                );
            }
        }
    }

    /*
     * ========================================
     * SONIDOS
     * ========================================
     */

    playSoundForAction(result) {

        if (
            result.type === 'attack' ||
            result.type === 'special'
        ) {

            /*
            * Si el ataque fue esquivado,
            * reproducimos únicamente el sonido
            * de esquive.
            */
            if (result.dodged) {

                playSound('dodge');

                return;
            }

            /*
            * Sonido normal del ataque.
            */
            if (result.type === 'attack') {

                playSound('attack');

            } else {

                playSound('special');
            }

            /*
            * Si fue golpe crítico,
            * reproducimos el sonido crítico.
            */
            if (result.critical) {

                setTimeout(
                    () => {
                        playSound('critical');
                    },
                    150
                );
            }

            /*
            * Si la carta fue derrotada,
            * reproducimos el sonido de derrota
            * de la carta.
            */
            if (result.defeated) {

                setTimeout(
                    () => {
                        playSound('defeated');
                    },
                    250
                );
            }

            return;
        }

        /*
        * Defensa.
        */
        if (
            result.type === 'defense'
        ) {

            playSound('defense');
        }
    }

    /*
     * ========================================
     * ANIMACIONES DE ACCIONES
     * ========================================
     */

    playActionAnimation(
        type,
        owner
    ) {

        /*
         * Carta atacante.
         */
        const attackerSelector =
            owner === 'player'
                ? '.battle-player:first-child .battle-card'
                : '.battle-player:last-child .battle-card';

        /*
         * Carta defensora.
         */
        const defenderSelector =
            owner === 'player'
                ? '.battle-player:last-child .battle-card'
                : '.battle-player:first-child .battle-card';

        const attacker =
            this.querySelector(
                attackerSelector
            );

        const defender =
            this.querySelector(
                defenderSelector
            );

        if (!attacker) {
            return;
        }

        /*
         * Limpiar animaciones anteriores.
         */
        attacker.classList.remove(
            'animate-attack',
            'animate-defense',
            'animate-special'
        );

        if (defender) {

            defender.classList.remove(
                'animate-damage'
            );
        }

        /*
         * Fuerza al navegador a reiniciar
         * la animación.
         */
        void attacker.offsetWidth;

        if (defender) {
            void defender.offsetWidth;
        }

        /*
         * ATAQUE
         */
        if (
            type === 'attack'
        ) {

            attacker.classList.add(
                'animate-attack'
            );

            setTimeout(
                () => {

                    if (!defender) {
                        return;
                    }

                    defender.classList.add(
                        'animate-damage'
                    );

                },
                250
            );
        }

        /*
         * DEFENSA
         */
        else if (
            type === 'defense'
        ) {

            attacker.classList.add(
                'animate-defense'
            );
        }

        /*
         * ESPECIAL
         */
        else if (
            type === 'special'
        ) {

            attacker.classList.add(
                'animate-special'
            );

            setTimeout(
                () => {

                    if (!defender) {
                        return;
                    }

                    defender.classList.add(
                        'animate-damage'
                    );

                },
                300
            );
        }

        /*
         * Limpiamos las clases.
         */
        setTimeout(
            () => {

                attacker.classList.remove(
                    'animate-attack',
                    'animate-defense',
                    'animate-special'
                );

                if (defender) {

                    defender.classList.remove(
                        'animate-damage'
                    );
                }

            },
            800
        );
    }

    /*
     * ========================================
     * ANIMAR BARRA DE VIDA INDIVIDUAL
     * ========================================
     */

    animateHealthBar(
        defenderOwner,
        previousHp,
        newHp
    ) {

        if (
            previousHp === undefined ||
            previousHp === null ||
            newHp === undefined ||
            newHp === null ||
            previousHp === newHp
        ) {
            return;
        }

        const selector =
            defenderOwner === 'user'
                ? '.battle-player:first-child .hp-fill'
                : '.battle-player:last-child .hp-fill';

        const hpBar =
            this.querySelector(selector);

        if (!hpBar) {
            return;
        }

        const previousPercentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (previousHp / 250) * 100
                )
            );

        const newPercentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (newHp / 250) * 100
                )
            );

        /*
         * Colocamos la barra en el
         * valor anterior.
         */
        hpBar.style.transition =
            'none';

        hpBar.style.width =
            `${previousPercentage}%`;

        /*
         * Obligamos al navegador a
         * aplicar primero el estado anterior.
         */
        void hpBar.offsetWidth;

        /*
         * Activamos la transición.
         */
        hpBar.style.transition =
            'width 1.2s ease-out';

        /*
         * Cambiamos al nuevo HP.
         */
        requestAnimationFrame(
            () => {

                hpBar.style.width =
                    `${newPercentage}%`;
            }
        );
    }

    /*
     * ========================================
     * ANIMACIÓN CARTA DERROTADA
     * ========================================
     */

    playDefeatedAnimation(owner) {

        const selector =
            owner === 'player'
                ? '.battle-player:first-child .battle-card'
                : '.battle-player:last-child .battle-card';

        const card =
            this.querySelector(selector);

        if (!card) {
            return;
        }

        card.classList.remove(
            'defeated-animation'
        );

        void card.offsetWidth;

        card.classList.add(
            'defeated-animation'
        );
    }


    /*
     * ========================================
     * RESULTADO FINAL
     * ========================================
     */
    async showResult() {


        if (!this.engine) {
            console.error(
                '❌ No existe el motor de batalla.'
            );
            return;
        }

        const resultContainer =
            this.querySelector(
                '#battle-result'
            );


        if (!resultContainer) {
            console.error(
                '❌ No se encontró #battle-result'
            );
            return;
        }

        /*
        * Determinamos quién ganó.
        */
        const won =
            this.engine.winner === 'player';

        /*
        * Resultado que se enviará
        * posteriormente a GameApp.
        */
        const result =
            won
                ? 'win'
                : 'loss';

        /*
        * Puntos correspondientes.
        */
        const pointsAwarded =
            won
                ? 50
                : 10;



        /*
        * ========================================
        * SONIDO DEL RESULTADO
        * ========================================
        */

        if (won) {

            playSound('victory');

        } else {

            playSound('defeat');
        }


        /*
        * ========================================
        * MOSTRAR RESULTADO
        * ========================================
        */

        resultContainer.innerHTML = `
            <div
                class="
                    battle-result
                    ${won
                ? 'victory'
                : 'defeat'
            }
                "
            >

                <div class="result-card">

                    <h2>
                        ${won
                ? '🏆 ¡VICTORIA!'
                : '💀 DERROTA'
            }
                    </h2>

                    <p>
                        ${won
                ? `¡Felicidades ${this.player?.nickname
                || 'Jugador'
                }!`
                : `
                                La máquina ganó
                                esta batalla.
                            `
            }
                    </p>

                    <p>
                        Puntos obtenidos:
                        <strong>
                            +${pointsAwarded}
                        </strong>
                    </p>

                    <button
                        class="result-button"
                        id="finish-battle"
                    >
                        Ver leaderboard
                    </button>

                </div>

            </div>
        `;


        /*
        * ========================================
        * LLEVAR EL RESULTADO A LA VISTA
        * ========================================
        *
        * Como #battle-result está después
        * del registro de combate, hacemos
        * scroll hasta el cartel.
        */

        resultContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        /*
        * ========================================
        * BOTÓN VER LEADERBOARD
        * ========================================
        */

        const finishButton =
            this.querySelector(
                '#finish-battle'
            );

        if (!finishButton) {

            console.error(
                '❌ No se encontró #finish-battle'
            );

            return;
        }

        finishButton.addEventListener(
            'click',
            () => {

                this.dispatchEvent(
                    new CustomEvent(
                        'battle-finished',
                        {
                            detail: {

                                player:
                                    this.player,

                                result,

                                pointsAwarded,

                                engine:
                                    this.engine,

                                startedAt:
                                    this.startedAt,

                                mode:
                                    this.battleMode
                            },

                            bubbles: true
                        }
                    )
                );
            }
        );
    }
}

customElements.define(
    'battle-component',
    BattleComponent
);
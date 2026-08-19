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

        this.renderLoading();
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

        this.render();
        this.configureEvents();

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

                </header>

                <main class="battle-arena">

                    ${this.renderCard(
                playerCard,
                'user'
            )}

                    <div class="vs">
                        VS
                    </div>

                    ${this.renderCard(
                machineCard,
                'machine'
            )}

                </main>

                ${state.turn === 'player'
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

    renderCard(card, owner) {

        if (!card) {

            return `
                <div class="battle-player">

                    <p>
                        No hay carta disponible.
                    </p>

                </div>
            `;
        }

        const hpPercentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (card.currentHp / 250) * 100
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
                ? `🎮 ${this.player?.nickname || 'Jugador'}`
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
                                    style="
                                        width:
                                        ${hpPercentage}%;
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

    playerAction(action) {

        if (
            !this.engine ||
            this.engine.gameOver
        ) {
            return;
        }

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

            this.render();
            this.configureEvents();

            return;
        }

        this.addResultToLog(
            result
        );

        this.playSoundForAction(
            result
        );

        this.playActionAnimation(
            result.type,
            'player'
        );

        /*
         * Si terminó la partida,
         * mostramos el resultado.
         */
        if (result.gameOver) {

            this.render();

            setTimeout(
                () => {
                    this.showResult();
                },
                700
            );

            return;
        }

        /*
         * Si una carta fue derrotada,
         * mostramos brevemente el estado
         * antes de continuar.
         */
        if (result.defeated) {

            this.render();

            setTimeout(
                () => {

                    this.configureEvents();

                    if (
                        this.engine.turn === 'machine'
                    ) {

                        this.renderMachineThinking();

                        setTimeout(
                            () => {
                                this.machineAction();
                            },
                            700
                        );
                    }

                },
                700
            );

            return;
        }

        this.render();
        this.configureEvents();

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

    machineAction() {

        if (
            !this.engine ||
            this.engine.gameOver
        ) {
            return;
        }

        const result =
            this.engine.machineTurn();

        if (!result) {
            return;
        }

        this.addResultToLog(
            result
        );

        this.playSoundForAction(
            result
        );

        this.playActionAnimation(
            result.type,
            'machine'
        );

        if (result.gameOver) {

            this.render();
            this.configureEvents();

            setTimeout(
                () => {
                    this.showResult();
                },
                700
            );

            return;
        }

        /*
         * Si la máquina derrotó la carta
         * del jugador, dejamos un pequeño
         * tiempo antes de continuar.
         */
        if (result.defeated) {

            this.render();

            setTimeout(
                () => {

                    this.configureEvents();

                },
                700
            );

            return;
        }

        this.render();
        this.configureEvents();
    }

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

    addResultToLog(result) {

        if (
            result.type === 'attack'
        ) {

            this.logs.unshift(
                `⚔️ ${result.attacker}
                utilizó ${result.actionName}
                y causó ${result.damage}
                de daño a ${result.defender}.`
            );

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

            this.logs.unshift(
                `⚡ ${result.attacker}
                utilizó ${result.actionName}
                y causó ${result.damage}
                de daño a ${result.defender}.`
            );

            if (result.defeated) {

                this.logs.unshift(
                    `💀 ${result.defender}
                    fue derrotado.`
                );
            }
        }
    }

    playSoundForAction(result) {

        if (
            result.type === 'attack'
        ) {

            playSound('attack');

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

        if (
            result.type === 'defense'
        ) {

            playSound('defense');

            return;
        }

        if (
            result.type === 'special'
        ) {

            playSound('special');

            if (result.defeated) {

                setTimeout(
                    () => {
                        playSound('defeated');
                    },
                    250
                );
            }
        }
    }

    playActionAnimation(
        type,
        owner
    ) {

        const attackerSelector =
            owner === 'player'
                ? '.battle-player:first-child .battle-card'
                : '.battle-player:last-child .battle-card';

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

        void attacker.offsetWidth;

        if (defender) {
            void defender.offsetWidth;
        }

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

        } else if (
            type === 'defense'
        ) {

            attacker.classList.add(
                'animate-defense'
            );

        } else if (
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

    playDefeatedAnimation(owner) {

        const selector =
            owner === 'player'
                ? '.battle-player:first-child .battle-card'
                : '.battle-player:last-child .battle-card';

        const card =
            this.querySelector(
                selector
            );

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

    async showResult() {

        const resultContainer =
            this.querySelector(
                '#battle-result'
            );

        if (!resultContainer) {
            return;
        }

        const won =
            this.engine.winner === 'player';

        const result =
            won
                ? 'win'
                : 'loss';

        const pointsAwarded =
            won
                ? 50
                : 10;

        if (won) {
            playSound('victory');
        } else {
            playSound('defeat');
        }

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
                ? `¡Felicidades ${this.player?.nickname || 'Jugador'}!`
                : 'La máquina ganó esta batalla.'
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

        this.querySelector(
            '#finish-battle'
        ).addEventListener(
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
                                    this.startedAt
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
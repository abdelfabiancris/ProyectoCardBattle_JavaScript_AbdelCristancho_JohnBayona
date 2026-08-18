import '../auth/playerRegister.js';
import '../admin/adminLogin.js';
import '../deck/deckSelector.js';
import '../battle/battle.js';
import '../leaderboard/leaderboard.js';
import '../admin/adminPanel.js';

import { patchPlayer } from '../../api/playersApi.js';
import { createBattle } from '../../api/battlesApi.js';

export class GameApp extends HTMLElement {

    constructor() {
        super();

        this.currentPlayer = null;

        this.renderRegister();

        this.configureEvents();
    }

    renderRegister() {

        this.innerHTML = `
            <section class="main-menu">

                <player-register></player-register>

                <div class="admin-access">

                    <button
                        id="admin-access-button"
                    >
                        ⚙️ Acceso administrativo
                    </button>

                </div>

            </section>
        `;

        const adminButton =
            this.querySelector(
                '#admin-access-button'
            );

        adminButton.addEventListener(
            'click',
            () => {

                this.showAdminLogin();

            }
        );
    }

    configureEvents() {

        /*
         * Registro del jugador
         */
        this.addEventListener(
            'player-registered',
            (event) => {

                this.currentPlayer =
                    event.detail;

                this.showDeckSelector();
            }
        );

        /*
         * Jugador terminó de seleccionar
         * sus cinco cartas.
         */
        this.addEventListener(
            'battle-ready',
            (event) => {

                this.showBattle(
                    event.detail
                );
            }
        );

        /*
         * Terminó la batalla.
         */
        this.addEventListener(
            'battle-finished',
            async (event) => {

                await this.finishBattle(
                    event.detail
                );
            }
        );

        /*
         * Volver al juego desde
         * el leaderboard.
         */
        this.addEventListener(
            'back-to-game',
            () => {

                this.showDeckSelector();

            }
        );

        /*
         * Login administrativo correcto.
         */
        this.addEventListener(
            'admin-authenticated',
            () => {

                this.showAdminPanel();

            }
        );

        /*
         * Cerrar sesión administrativa.
         */
        this.addEventListener(
            'admin-logout',
            () => {

                this.renderRegister();

            }
        );
    }

    showAdminLogin() {

        this.innerHTML = `
            <section class="admin-login-container">

                <admin-login></admin-login>

                <button
                    id="back-player-register"
                >
                    ← Volver al registro
                </button>

            </section>
        `;

        const backButton =
            this.querySelector(
                '#back-player-register'
            );

        backButton.addEventListener(
            'click',
            () => {

                this.renderRegister();

            }
        );
    }

    showAdminPanel() {

        this.innerHTML = `
            <admin-panel></admin-panel>
        `;
    }

    showDeckSelector() {

        this.innerHTML = `
            <deck-selector></deck-selector>
        `;

        const deckSelector =
            this.querySelector(
                'deck-selector'
            );

        deckSelector.setPlayer(
            this.currentPlayer
        );
    }

    showBattle(data) {

        this.innerHTML = `
            <battle-component></battle-component>
        `;

        const battle =
            this.querySelector(
                'battle-component'
            );

        battle.setBattleData(
            data
        );
    }

    async finishBattle(data) {

        try {

            const won =
                data.result === 'win';

            const points =
                won
                    ? 50
                    : 10;

            const updatedPlayer = {

                points:
                    this.currentPlayer.points
                    + points,

                wins:
                    this.currentPlayer.wins
                    + (
                        won
                            ? 1
                            : 0
                    ),

                losses:
                    this.currentPlayer.losses
                    + (
                        won
                            ? 0
                            : 1
                    ),

                gamesPlayed:
                    this.currentPlayer.gamesPlayed
                    + 1
            };

            /*
             * PATCH del jugador.
             */
            const savedPlayer =
                await patchPlayer(
                    updatedPlayer,
                    this.currentPlayer.id
                );

            this.currentPlayer =
                savedPlayer;

            /*
             * Estado final de la batalla.
             */
            const state =
                data.engine.getState();

            const battle = {

                id:
                    `battle-${Date.now()}`,

                playerId:
                    this.currentPlayer.id,

                playerNickname:
                    this.currentPlayer.nickname,

                result:
                    data.result,

                pointsAwarded:
                    points,

                playerDeck:
                    state.playerDeck.map(
                        (card) =>
                            card.id
                    ),

                machineDeck:
                    state.machineDeck.map(
                        (card) =>
                            card.id
                    ),

                startedAt:
                    data.engine.startedAt,

                endedAt:
                    new Date().toISOString()
            };

            await createBattle(
                battle
            );

            this.showLeaderboard();

        } catch (error) {

            console.error(
                'Error al finalizar la batalla:',
                error
            );

            this.showFinishError(
                error.message
            );
        }
    }

    showLeaderboard() {

        this.innerHTML = `
            <leaderboard-component>
            </leaderboard-component>
        `;
    }

    showFinishError(message) {

        this.innerHTML = `
            <section
                style="
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    text-align: center;
                "
            >

                <h1>
                    ⚠️ Error
                </h1>

                <p>
                    ${message}
                </p>

                <button
                    id="retry-leaderboard"
                >
                    Ver leaderboard
                </button>

            </section>
        `;

        this.querySelector(
            '#retry-leaderboard'
        ).addEventListener(
            'click',
            () => {

                this.showLeaderboard();

            }
        );
    }
}

customElements.define(
    'card-game-app',
    GameApp
);
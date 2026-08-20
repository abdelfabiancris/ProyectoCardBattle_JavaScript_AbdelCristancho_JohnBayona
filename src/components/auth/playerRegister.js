import { getPlayers, createPlayer } from '../../api/playersApi.js';
import './authStyles.css';

export class PlayerRegister extends HTMLElement {

    constructor() {
        super();

        this.players = [];

        this.render();
        this.configureEvents();
        this.loadPlayers();
    }

    render() {

        this.innerHTML = `
            <section class="auth-section">

                <div class="auth-card">

                    <h1>
                        Card Battle Arena
                    </h1>

                    <p class="auth-subtitle">
                        Avatar: La Leyenda de Aang
                    </p>

                    <h2>
                        Registro del jugador
                    </h2>

                    <p>
                        Crea un nuevo perfil o selecciona
                        uno existente para continuar.
                    </p>

                    <!-- =================================
                        CREAR NUEVO PERFIL
                        ================================= -->

                    <form id="player-form">

                        <label for="nickname">
                            Nuevo nickname
                        </label>

                        <input
                            type="text"
                            id="nickname"
                            name="nickname"
                            placeholder="Ej: AangMaster"
                            maxlength="20"
                            autocomplete="off"
                        >

                        <button type="submit">
                            ⚔️ Crear perfil
                        </button>

                    </form>

                    <div class="profile-divider">
                        <span>O</span>
                    </div>

                    <!-- =================================
                        SELECCIONAR PERFIL EXISTENTE
                        ================================= -->

                    <div class="existing-profile">

                        <h3>
                            🎮 ¿Ya tienes un perfil?
                        </h3>

                        <label for="existing-player">
                            Selecciona tu perfil
                        </label>

                        <select
                            id="existing-player"
                        >

                            <option value="">
                                Cargando perfiles...
                            </option>

                        </select>

                        <button
                            type="button"
                            id="select-profile"
                            class="existing-profile-button"
                            disabled
                        >
                            🎮 Continuar con este perfil
                        </button>

                    </div>

                    <p
                        id="register-message"
                        class="register-message"
                    ></p>

                </div>

            </section>
        `;
    }

    configureEvents() {

        const form =
            this.querySelector(
                '#player-form'
            );

        form.addEventListener(
            'submit',
            (event) => {

                event.preventDefault();

                this.registerPlayer();
            }
        );

        const select =
            this.querySelector(
                '#existing-player'
            );

        select.addEventListener(
            'change',
            () => {

                const button =
                    this.querySelector(
                        '#select-profile'
                    );

                button.disabled =
                    !select.value;
            }
        );

        const selectButton =
            this.querySelector(
                '#select-profile'
            );

        selectButton.addEventListener(
            'click',
            () => {

                this.selectExistingPlayer();
            }
        );
    }

    async loadPlayers() {

        try {

            this.players =
                await getPlayers();

            const select =
                this.querySelector(
                    '#existing-player'
                );

            if (!select) {
                return;
            }

            if (!this.players.length) {

                select.innerHTML = `
                    <option value="">
                        No existen perfiles todavía
                    </option>
                `;

                return;
            }

            select.innerHTML = `
                <option value="">
                    Selecciona un perfil...
                </option>

                ${
                    this.players
                        .map(
                            (player) => `
                                <option
                                    value="${player.id}"
                                >
                                    ${player.nickname}
                                </option>
                            `
                        )
                        .join('')
                }
            `;

        } catch (error) {

            console.error(
                'Error cargando perfiles:',
                error
            );

            const select =
                this.querySelector(
                    '#existing-player'
                );

            if (select) {

                select.innerHTML = `
                    <option value="">
                        No se pudieron cargar los perfiles
                    </option>
                `;
            }
        }
    }

    selectExistingPlayer() {

        const select =
            this.querySelector(
                '#existing-player'
            );

        const playerId =
            select.value;

        if (!playerId) {

            this.showMessage(
                'Selecciona un perfil para continuar.',
                'error'
            );

            return;
        }

        const player =
            this.players.find(
                (item) =>
                    item.id === playerId
            );

        if (!player) {

            this.showMessage(
                'No se encontró el perfil seleccionado.',
                'error'
            );

            return;
        }

        this.showMessage(
            `¡Bienvenido nuevamente, ${player.nickname}!`,
            'success'
        );

        this.dispatchEvent(
            new CustomEvent(
                'player-registered',
                {
                    detail: player,
                    bubbles: true
                }
            )
        );
    }

    async registerPlayer() {

        const input =
            this.querySelector(
                '#nickname'
            );

        const nickname =
            input.value.trim();

        if (!nickname) {

            this.showMessage(
                'El nickname es obligatorio.',
                'error'
            );

            return;
        }

        try {

            this.showMessage(
                'Comprobando nickname...',
                'loading'
            );

            const players =
                await getPlayers();

            const nicknameExists =
                players.some(
                    (player) =>
                        player.nickname.toLowerCase() ===
                        nickname.toLowerCase()
                );

            if (nicknameExists) {

                this.showMessage(
                    'Ese nickname ya está registrado. Selecciona el perfil existente.',
                    'error'
                );

                return;
            }

            const newPlayer = {

                id:
                    `player-${Date.now()}`,

                nickname,

                points:
                    0,

                wins:
                    0,

                losses:
                    0,

                gamesPlayed:
                    0,

                createdAt:
                    new Date().toISOString()
            };

            const playerCreated =
                await createPlayer(
                    newPlayer
                );

            this.showMessage(
                `¡Bienvenido, ${playerCreated.nickname}!`,
                'success'
            );

            this.dispatchEvent(
                new CustomEvent(
                    'player-registered',
                    {
                        detail:
                            playerCreated,

                        bubbles:
                            true
                    }
                )
            );

        } catch (error) {

            console.error(
                error
            );

            this.showMessage(
                'No se pudo completar el registro.',
                'error'
            );
        }
    }

    showMessage(
        text,
        type
    ) {

        const message =
            this.querySelector(
                '#register-message'
            );

        message.textContent =
            text;

        message.className =
            `register-message ${type}`;
    }
}

customElements.define(
    'player-register',
    PlayerRegister
);
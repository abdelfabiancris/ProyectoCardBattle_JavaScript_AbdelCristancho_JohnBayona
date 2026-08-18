import { getPlayers, createPlayer } from '../../api/playersApi.js';
import './authStyles.css';

export class PlayerRegister extends HTMLElement {
    constructor() {
        super();

        this.render();
        this.configureEvents();
    }

    render() {
        this.innerHTML = `
      <section class="auth-section">
        <div class="auth-card">
          <h1>Card Battle Arena</h1>

          <p class="auth-subtitle">
            Avatar: La Leyenda de Aang
          </p>

          <h2>Registro del jugador</h2>

          <p>
            Ingresa un nickname para comenzar tu aventura.
          </p>

          <form id="player-form">
            <label for="nickname">
              Nickname
            </label>

            <input
              type="text"
              id="nickname"
              name="nickname"
              placeholder="Ej: AangMaster"
              maxlength="20"
              autocomplete="off"
              required
            >

            <button type="submit">
              Comenzar partida
            </button>
          </form>

          <p
            id="register-message"
            class="register-message"
          ></p>
        </div>
      </section>
    `;
    }

    configureEvents() {
        const form = this.querySelector('#player-form');

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            this.registerPlayer();
        });
    }

    async registerPlayer() {
        const input = this.querySelector('#nickname');
        const message = this.querySelector('#register-message');

        const nickname = input.value.trim();

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

            const players = await getPlayers();

            const nicknameExists = players.some(
                (player) =>
                    player.nickname.toLowerCase() ===
                    nickname.toLowerCase()
            );

            if (nicknameExists) {
                this.showMessage(
                    'Ese nickname ya está registrado. Elige otro.',
                    'error'
                );

                return;
            }

            const newPlayer = {
                id: `player-${Date.now()}`,
                nickname,
                points: 0,
                wins: 0,
                losses: 0,
                gamesPlayed: 0,
                createdAt: new Date().toISOString()
            };

            const playerCreated = await createPlayer(newPlayer);

            this.showMessage(
                `¡Bienvenido, ${playerCreated.nickname}!`,
                'success'
            );

            this.dispatchEvent(
                new CustomEvent('player-registered', {
                    detail: playerCreated,
                    bubbles: true
                })
            );
        } catch (error) {
            console.error(error);

            this.showMessage(
                'No se pudo completar el registro.',
                'error'
            );
        }
    }

    showMessage(text, type) {
        const message = this.querySelector('#register-message');

        message.textContent = text;
        message.className = `register-message ${type}`;
    }
}

customElements.define(
    'player-register',
    PlayerRegister
);
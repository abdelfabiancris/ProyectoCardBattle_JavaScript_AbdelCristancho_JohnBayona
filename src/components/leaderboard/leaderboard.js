import { getPlayers } from '../../api/playersApi.js';
import './leaderboardStyles.css';

export class Leaderboard extends HTMLElement {

    constructor() {
        super();

        this.players = [];

        this.renderLoading();

        this.loadPlayers();
    }

    renderLoading() {

        this.innerHTML = `
            <section class="leaderboard-section">

                <div class="leaderboard-container">

                    <h1>
                        🏆 Leaderboard
                    </h1>

                    <p>
                        Cargando clasificación...
                    </p>

                </div>

            </section>
        `;
    }

    async loadPlayers() {

        try {

            const players =
                await getPlayers();

            /*
             * Ordenamos de mayor a menor
             * cantidad de puntos.
             */
            this.players =
                players.sort(
                    (a, b) =>
                        b.points - a.points
                );

            this.render();

        } catch (error) {

            console.error(error);

            this.renderError();
        }
    }

    render() {

        const topThree =
            this.players.slice(0, 3);

        const rest =
            this.players.slice(3);

        this.innerHTML = `
            <section
                class="leaderboard-section"
            >

                <div
                    class="leaderboard-container"
                >

                    <header
                        class="leaderboard-header"
                    >

                        <h1>
                            🏆 Leaderboard
                        </h1>

                        <p>
                            Los mejores maestros
                            de la arena.
                        </p>

                    </header>

                    <section
                        class="podium"
                    >

                        ${
                            topThree
                                .map(
                                    (
                                        player,
                                        index
                                    ) =>
                                        this.createPodiumPlayer(
                                            player,
                                            index
                                        )
                                )
                                .join('')
                        }

                    </section>

                    <section
                        class="ranking-list"
                    >

                        <h2>
                            Clasificación
                        </h2>

                        ${
                            rest.length
                                ? rest
                                    .map(
                                        (
                                            player,
                                            index
                                        ) =>
                                            this.createRankingRow(
                                                player,
                                                index + 4
                                            )
                                    )
                                    .join('')
                                : `
                                    <p>
                                        No hay más
                                        jugadores.
                                    </p>
                                `
                        }

                    </section>

                    <button
                        id="back-to-game"
                        class="leaderboard-button"
                    >
                        ⚔️ Volver al juego
                    </button>

                </div>

            </section>
        `;

        this.configureEvents();
    }

    createPodiumPlayer(
        player,
        index
    ) {

        const positions = [
            '🥇',
            '🥈',
            '🥉'
        ];

        return `
            <article
                class="
                    podium-player
                    position-${index + 1}
                "
            >

                <div class="podium-position">
                    ${positions[index]}
                </div>

                <h2>
                    ${player.nickname}
                </h2>

                <strong>
                    ${player.points} puntos
                </strong>

                <div class="podium-stats">

                    <span>
                        🏆 ${player.wins}
                        victorias
                    </span>

                    <span>
                        🎮 ${player.gamesPlayed}
                        partidas
                    </span>

                </div>

            </article>
        `;
    }

    createRankingRow(
        player,
        position
    ) {

        return `
            <article
                class="ranking-row"
            >

                <span
                    class="ranking-position"
                >
                    #${position}
                </span>

                <strong>
                    ${player.nickname}
                </strong>

                <span>
                    ${player.points} pts
                </span>

                <span>
                    🏆 ${player.wins}
                </span>

                <span>
                    🎮 ${player.gamesPlayed}
                </span>

            </article>
        `;
    }

    configureEvents() {

        const button =
            this.querySelector(
                '#back-to-game'
            );

        if (!button) {
            return;
        }

        button.addEventListener(
            'click',
            () => {

                this.dispatchEvent(
                    new CustomEvent(
                        'back-to-game',
                        {
                            bubbles: true
                        }
                    )
                );
            }
        );
    }

    renderError() {

        this.innerHTML = `
            <section
                class="leaderboard-section"
            >

                <div
                    class="
                        leaderboard-container
                        leaderboard-error
                    "
                >

                    <h1>
                        ⚠️ Error
                    </h1>

                    <p>
                        No se pudo cargar
                        el leaderboard.
                    </p>

                    <button
                        id="retry-leaderboard"
                        class="leaderboard-button"
                    >
                        🔄 Intentar nuevamente
                    </button>

                </div>

            </section>
        `;

        this.querySelector(
            '#retry-leaderboard'
        ).addEventListener(
            'click',
            () => {
                this.loadPlayers();
            }
        );
    }
}

customElements.define(
    'leaderboard-component',
    Leaderboard
);
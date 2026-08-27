import { getCards } from '../../api/cardsApi.js';
import './deckStyles.css';

export class DeckSelector extends HTMLElement {

    constructor() {
        super();

        this.player = null;
        this.cards = [];
        this.selectedCards = [];
        this.machineCards = [];
        this.mode = 'manual';

        this.renderLoading();
        this.loadCards();
    }

    setPlayer(player) {
        this.player = player;
    }

    renderLoading() {
        this.innerHTML = `
            <section class="deck-section">

                <div class="deck-container">

                    <h1>
                        🌪️ Selecciona tu equipo
                    </h1>

                    <p>
                        Elige exactamente 5 cartas
                        para comenzar la batalla.
                    </p>

                    <div id="deck-message">
                        Cargando cartas...
                    </div>

                </div>

            </section>
        `;
    }

    async loadCards() {

        try {

            const allCards =
                await getCards();

            /*
             * Solo utilizamos cartas activas.
             */
            this.cards =
                allCards.filter(
                    (card) => card.active === true
                );

            /*
             * La partida necesita como mínimo
             * 10 cartas activas.
             */
            if (this.cards.length < 10) {

                this.showError(
                    `Solo existen ${this.cards.length}
                    cartas activas.
                    Se necesitan mínimo 10.`
                );

                return;
            }

            this.render();

        } catch (error) {

            console.error(error);

            this.showError(
                'No se pudieron cargar las cartas.'
            );
        }
    }

    render() {

        this.innerHTML = `
            <section class="deck-section">

                <div class="deck-container">

                    <header class="deck-header">

                        <h1>
                            🌪️ Selección de mazo
                        </h1>

                        <p>
                            Maestro ${
                                this.player?.nickname
                                || ''
                            }
                        </p>

                        <div
                            id="selection-counter"
                            class="selection-counter"
                        >
                            0 / 5 cartas seleccionadas
                        </div>

                    </header>

                    <section class="battle-mode-selector">

                        <h2>🎮 Modo de batalla</h2>

                        <label class="mode-option">
                            <input
                                type="radio"
                                name="battle-mode"
                                value="manual"
                                checked
                            >
                            <span>🎮 Manual</span>
                        </label>

                        <label class="mode-option">
                            <input
                                type="radio"
                                name="battle-mode"
                                value="automatic"
                            >
                            <span>🤖 Automático</span>
                        </label>

                        <p class="mode-description">
                            En automático, el jugador y la máquina toman acciones mediante una estrategia JavaScript.
                        </p>

                    </section>

                    <div
                        id="selected-deck"
                        class="selected-deck"
                    >
                        <p>
                            Tu mazo aparecerá aquí.
                        </p>
                    </div>

                    <div
                        id="cards-grid"
                        class="cards-grid"
                    >
                    </div>

                    <div
                        id="deck-actions"
                        class="deck-actions"
                    >

                        <button
                            id="clear-selection"
                            class="deck-button secondary"
                        >
                            🗑️ Limpiar selección
                        </button>

                        <button
                            id="start-battle"
                            class="deck-button"
                            disabled
                        >
                            ⚔️ Comenzar batalla
                        </button>

                    </div>

                    <p
                        id="deck-message"
                        class="deck-message"
                    ></p>

                </div>

            </section>
        `;

        this.renderCards();
        this.renderSelectedDeck();
        this.configureEvents();
    }

    renderCards() {

        const container =
            this.querySelector(
                '#cards-grid'
            );

        container.innerHTML =
            this.cards
                .map(
                    (card) =>
                        this.createCardHTML(card)
                )
                .join('');
    }

    createCardHTML(card) {

        const selected =
            this.selectedCards.some(
                (selectedCard) =>
                    selectedCard.id === card.id
            );

        return `
            <article
                class="
                    deck-card
                    ${selected
                        ? 'selected'
                        : ''}
                "
                data-id="${card.id}"
            >

                <img
                    src="${card.image}"
                    alt="${card.name}"
                    class="deck-card-image"
                >

                <div
                    class="deck-card-content"
                >

                    <h2>
                        ${card.name}
                    </h2>

                    <span
                        class="card-type"
                    >
                        ${card.type}
                    </span>

                    <p>
                        ${card.description}
                    </p>

                    <p>
                        ❤️ HP: ${card.hp}
                    </p>

                    <button
                        class="select-card-button"
                        data-id="${card.id}"
                    >
                        ${
                            selected
                                ? '✓ Seleccionada'
                                : 'Seleccionar'
                        }
                    </button>

                </div>

            </article>
        `;
    }

    renderSelectedDeck() {

        const container =
            this.querySelector(
                '#selected-deck'
            );

        const counter =
            this.querySelector(
                '#selection-counter'
            );

        const startButton =
            this.querySelector(
                '#start-battle'
            );

        counter.textContent =
            `${this.selectedCards.length} / 5
            cartas seleccionadas`;

        if (!this.selectedCards.length) {

            container.innerHTML = `
                <p>
                    Selecciona tus cartas
                    para formar tu mazo.
                </p>
            `;

            startButton.disabled = true;

            return;
        }

        container.innerHTML = `
            <h2>
                🃏 Tu mazo
            </h2>

            <p>
                El orden de estas cartas
                será el orden del combate.
            </p>

            <div
                class="selected-cards-list"
            >

                ${this.selectedCards
                    .map(
                        (card, index) => `
                            <div
                                class="selected-card"
                                data-id="${card.id}"
                            >

                                <span
                                    class="card-position"
                                >
                                    ${index + 1}
                                </span>

                                <img
                                    src="${card.image}"
                                    alt="${card.name}"
                                >

                                <strong>
                                    ${card.name}
                                </strong>

                                <div
                                    class="position-buttons"
                                >

                                    <button
                                        class="move-up"
                                        data-id="${card.id}"
                                        ${
                                            index === 0
                                                ? 'disabled'
                                                : ''
                                        }
                                    >
                                        ↑
                                    </button>

                                    <button
                                        class="move-down"
                                        data-id="${card.id}"
                                        ${
                                            index ===
                                            this.selectedCards.length - 1
                                                ? 'disabled'
                                                : ''
                                        }
                                    >
                                        ↓
                                    </button>

                                </div>

                            </div>
                        `
                    )
                    .join('')}

            </div>
        `;

        startButton.disabled =
            this.selectedCards.length !== 5;
    }

    configureEvents() {

        /*
         * Selección de cartas.
         */
        this.querySelectorAll(
            '.select-card-button'
        ).forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        const id =
                            button.dataset.id;

                        this.toggleCard(id);
                    }
                );
            }
        );

        /*
         * Limpiar selección.
         */
        this.querySelector(
            '#clear-selection'
        ).addEventListener(
            'click',
            () => {

                this.selectedCards = [];

                this.renderCards();
                this.renderSelectedDeck();
                this.configureCardSelectionEvents();
                this.configureOrderEvents();
            }
        );

        /*
         * Selección del modo de batalla.
         */
        this.querySelectorAll(
            'input[name="battle-mode"]'
        ).forEach((radio) => {

            radio.addEventListener('change', () => {
                this.mode = radio.value;
            });
        });

        /*
         * Iniciar batalla.
         */
        this.querySelector(
            '#start-battle'
        ).addEventListener(
            'click',
            () => {

                this.startBattle();
            }
        );

        this.configureOrderEvents();
    }

    configureCardSelectionEvents() {

        this.querySelectorAll(
            '.select-card-button'
        ).forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        const id =
                            button.dataset.id;

                        this.toggleCard(id);
                    }
                );
            }
        );
    }

    configureOrderEvents() {

        this.querySelectorAll(
            '.move-up'
        ).forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        this.moveCard(
                            button.dataset.id,
                            -1
                        );
                    }
                );
            }
        );

        this.querySelectorAll(
            '.move-down'
        ).forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        this.moveCard(
                            button.dataset.id,
                            1
                        );
                    }
                );
            }
        );
    }

    toggleCard(id) {

        const existingIndex =
            this.selectedCards.findIndex(
                (card) =>
                    card.id === id
            );

        /*
         * Si ya está seleccionada,
         * la quitamos.
         */
        if (existingIndex !== -1) {

            this.selectedCards.splice(
                existingIndex,
                1
            );

        } else {

            /*
             * No permitimos más de 5.
             */
            if (
                this.selectedCards.length >= 5
            ) {

                this.showMessage(
                    'Solo puedes seleccionar 5 cartas.'
                );

                return;
            }

            const card =
                this.cards.find(
                    (item) =>
                        item.id === id
                );

            if (!card) {
                return;
            }

            this.selectedCards.push(
                card
            );
        }

        this.refreshSelection();
    }

    refreshSelection() {

        this.renderCards();
        this.renderSelectedDeck();

        this.configureCardSelectionEvents();
        this.configureOrderEvents();
    }

    moveCard(id, direction) {

        const index =
            this.selectedCards.findIndex(
                (card) =>
                    card.id === id
            );

        if (index === -1) {
            return;
        }

        const newIndex =
            index + direction;

        if (
            newIndex < 0 ||
            newIndex >=
                this.selectedCards.length
        ) {
            return;
        }

        const temp =
            this.selectedCards[index];

        this.selectedCards[index] =
            this.selectedCards[newIndex];

        this.selectedCards[newIndex] =
            temp;

        this.renderSelectedDeck();

        this.configureOrderEvents();
    }

    selectMachineCards() {

        const playerIds =
            new Set(
                this.selectedCards.map(
                    (card) =>
                        card.id
                )
            );

        const availableCards =
            this.cards.filter(
                (card) =>
                    !playerIds.has(card.id)
            );

        /*
         * Mezclamos las cartas disponibles.
         */
        const shuffled =
            [...availableCards]
                .sort(
                    () =>
                        Math.random() - 0.5
                );

        /*
         * Tomamos exactamente 5.
         */
        this.machineCards =
            shuffled.slice(0, 5);

        return this.machineCards;
    }

    startBattle() {

        if (
            this.selectedCards.length !== 5
        ) {

            this.showMessage(
                'Debes seleccionar exactamente 5 cartas.'
            );

            return;
        }

        if (
            this.cards.length < 10
        ) {

            this.showMessage(
                'Se necesitan mínimo 10 cartas activas.'
            );

            return;
        }

        /*
         * La máquina recibe 5 cartas
         * diferentes a las del jugador.
         */
        const machineDeck =
            this.selectMachineCards();

        if (
            machineDeck.length !== 5
        ) {

            this.showMessage(
                'No fue posible crear el mazo de la máquina.'
            );

            return;
        }

        /*
         * Enviamos la información al
         * GameApp mediante un evento.
         */
        this.dispatchEvent(
            new CustomEvent(
                'battle-ready',
                {
                    detail: {

                        playerDeck:
                            [...this.selectedCards],

                        machineDeck:
                            [...machineDeck],

                        player:
                            this.player,

                        mode:
                            this.mode
                    },

                    bubbles: true
                }
            )
        );
    }

    showMessage(message) {

        const element =
            this.querySelector(
                '#deck-message'
            );

        if (!element) {
            return;
        }

        element.textContent =
            message;

        setTimeout(
            () => {

                if (element) {
                    element.textContent =
                        '';
                }

            },
            3000
        );
    }

    showError(message) {

        this.innerHTML = `
            <section class="deck-section">

                <div
                    class="
                        deck-container
                        error-container
                    "
                >

                    <h1>
                        ⚠️ No se puede iniciar
                    </h1>

                    <p>
                        ${message}
                    </p>

                </div>

            </section>
        `;
    }
}

customElements.define(
    'deck-selector',
    DeckSelector
);
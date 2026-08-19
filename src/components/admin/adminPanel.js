import {
    getCards,
    createCard,
    updateCard,
    patchCard,
    deleteCard
} from '../../api/cardsApi.js';

import './adminStyles.css';

export class AdminPanel extends HTMLElement {

    constructor() {
        super();

        this.cards = [];

        this.renderLoading();

        this.loadCards();
    }

    renderLoading() {

        this.innerHTML = `
            <section class="admin-section">

                <div class="admin-container">

                    <h1>
                        👑 Panel de administración
                    </h1>

                    <p>
                        Cargando cartas...
                    </p>

                </div>

            </section>
        `;
    }

    async loadCards() {

        try {

            this.cards =
                await getCards();

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
            <section class="admin-section">

                <div class="admin-container">

                    <header class="admin-header">

                        <div>

                            <h1>
                                👑 Administración
                            </h1>

                            <p>
                                Gestión de cartas
                                de Card Battle Arena.
                            </p>

                        </div>

                        <button
                            id="logout-button"
                            class="admin-button secondary"
                        >
                            🚪 Cerrar sesión
                        </button>

                    </header>

                    <section
                        class="admin-create-section"
                    >

                        <h2>
                            ➕ Crear nueva carta
                        </h2>

                        <form
                            id="create-card-form"
                            class="card-form"
                        >

                            <input
                                type="text"
                                id="card-name"
                                placeholder="Nombre de la carta"
                                required
                            >

                            <input
                                type="text"
                                id="card-type"
                                placeholder="Elemento / Tipo"
                                required
                            >

                            <input
                                type="text"
                                id="card-image"
                                placeholder="/images/cards/carta.webp"
                                required
                            >

                            <textarea
                                id="card-description"
                                placeholder="Descripción"
                                required
                            ></textarea>

                            <button
                                type="submit"
                                class="admin-button"
                            >
                                ➕ Crear carta
                            </button>

                        </form>

                    </section>

                    <section class="admin-cards-section">

                        <h2>
                            🃏 Cartas registradas
                        </h2>

                        <div
                            id="admin-message"
                            class="admin-message"
                        ></div>

                        <div
                            id="admin-cards-grid"
                            class="admin-cards-grid"
                        >

                            ${this.cards
                .map(
                    (card) =>
                        this.createCardHTML(
                            card
                        )
                )
                .join('')}

                        </div>

                    </section>

                </div>

            </section>
        `;

        this.configureEvents();
    }

    createCardHTML(card) {

        return `
            <article
                class="
                    admin-card
                    ${card.active
                ? ''
                : 'inactive'}
                "
                data-id="${card.id}"
            >

                <img
                    src="${card.image}"
                    alt="${card.name}"
                >

                <div class="admin-card-content">

                    <h3>
                        ${card.name}
                    </h3>

                    <p>
                        Tipo:
                        ${card.type}
                    </p>

                    <p>
                        HP:
                        ${card.hp}
                    </p>

                    <p>
                        Estado:
                        ${card.active
                ? '🟢 Activa'
                : '🔴 Inactiva'
            }
                    </p>

                    <div class="admin-card-actions">

                        <button
                            class="edit-button"
                            data-id="${card.id}"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            class="toggle-button"
                            data-id="${card.id}"
                        >
                            ${card.active
                ? '🔴 Desactivar'
                : '🟢 Activar'
            }
                        </button>

                        <button
                            class="delete-button"
                            data-id="${card.id}"
                        >
                            🗑️ Eliminar
                        </button>

                    </div>

                </div>

            </article>
        `;
    }

    configureEvents() {

        /*
         * Crear carta.
         */
        const createForm =
            this.querySelector(
                '#create-card-form'
            );

        createForm.addEventListener(
            'submit',
            (event) => {

                event.preventDefault();

                this.handleCreateCard();
            }
        );

        /*
         * Editar carta.
         */
        this.querySelectorAll(
            '.edit-button'
        ).forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        this.handleEditCard(
                            button.dataset.id
                        );
                    }
                );
            }
        );

        /*
         * Activar / desactivar.
         *
         * Esto utiliza PATCH.
         */
        this.querySelectorAll(
            '.toggle-button'
        ).forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        this.handleToggleCard(
                            button.dataset.id
                        );
                    }
                );
            }
        );

        /*
         * Eliminar carta.
         */
        this.querySelectorAll(
            '.delete-button'
        ).forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        this.handleDeleteCard(
                            button.dataset.id
                        );
                    }
                );
            }
        );

        /*
         * Cerrar sesión.
         */
        this.querySelector(
            '#logout-button'
        ).addEventListener(
            'click',
            () => {

                this.dispatchEvent(
                    new CustomEvent(
                        'admin-logout',
                        {
                            bubbles: true
                        }
                    )
                );
            }
        );
    }

    async handleCreateCard() {

        const name =
            this.querySelector(
                '#card-name'
            ).value.trim();

        const type =
            this.querySelector(
                '#card-type'
            ).value.trim();

        const image =
            this.querySelector(
                '#card-image'
            ).value.trim();

        const description =
            this.querySelector(
                '#card-description'
            ).value.trim();

        if (
            !name ||
            !type ||
            !image ||
            !description
        ) {

            this.showMessage(
                'Todos los campos son obligatorios.'
            );

            return;
        }

        /*
         * Verificamos que no exista
         * otra carta con el mismo nombre.
         */
        const exists =
            this.cards.some(
                (card) =>
                    card.name.toLowerCase() ===
                    name.toLowerCase()
            );

        if (exists) {

            this.showMessage(
                'Ya existe una carta con ese nombre.'
            );

            return;
        }

        const newCard = {

            id:
                `card-${Date.now()}`,

            name,

            type,

            image,

            description,

            hp: 250,

            attacks: [

                {
                    id: 'attack-01',
                    name: 'Ataque 1',
                    baseDamage: 20
                },

                {
                    id: 'attack-02',
                    name: 'Ataque 2',
                    baseDamage: 30
                },

                {
                    id: 'attack-03',
                    name: 'Ataque 3',
                    baseDamage: 40
                },

                {
                    id: 'attack-04',
                    name: 'Ataque 4',
                    baseDamage: 50
                }

            ],

            defense: {

                name: 'Defensa',
                damageReduction: 0.5

            },

            special: {

                name: 'Poder especial',
                baseDamage: 65,
                unlockTurn: 2,
                cooldown: 3

            },

            sounds: {

                attack:
                    '/sounds/attack.mp3',

                defense:
                    '/sounds/defense.mp3',

                special:
                    '/sounds/special.mp3',

                defeated:
                    '/sounds/defeated.mp3'

            },

            active: true,

            createdAt:
                new Date().toISOString()
        };

        try {

            await createCard(
                newCard
            );

            this.showMessage(
                'Carta creada correctamente.'
            );

            await this.loadCards();

        } catch (error) {

            console.error(error);

            this.showMessage(
                'No se pudo crear la carta.'
            );
        }
    }

    async handleEditCard(id) {

        const card =
            this.cards.find(
                (item) =>
                    item.id === id
            );

        if (!card) {
            return;
        }

        const newName =
            prompt(
                'Nuevo nombre:',
                card.name
            );

        if (
            newName === null
        ) {
            return;
        }

        const newType =
            prompt(
                'Nuevo tipo:',
                card.type
            );

        if (
            newType === null
        ) {
            return;
        }

        const newDescription =
            prompt(
                'Nueva descripción:',
                card.description
            );

        if (
            newDescription === null
        ) {
            return;
        }

        /*
         * PUT reemplaza la carta
         * completa.
         */
        const updatedCard = {

            ...card,

            name:
                newName.trim(),

            type:
                newType.trim(),

            description:
                newDescription.trim()
        };

        try {

            await updateCard(
                updatedCard,
                id
            );

            this.showMessage(
                'Carta actualizada correctamente con PUT.'
            );

            await this.loadCards();

        } catch (error) {

            console.error(error);

            this.showMessage(
                'No se pudo actualizar la carta.'
            );
        }
    }

    async handleToggleCard(id) {

        const card =
            this.cards.find(
                (item) =>
                    item.id === id
            );

        if (!card) {
            return;
        }

        try {

            /*
             * PATCH solamente modifica
             * el campo active.
             */
            await patchCard(
                {
                    active:
                        !card.active
                },
                id
            );

            this.showMessage(
                'Estado de la carta actualizado con PATCH.'
            );

            await this.loadCards();

        } catch (error) {

            console.error(error);

            this.showMessage(
                'No se pudo cambiar el estado.'
            );
        }
    }

    async handleDeleteCard(id) {

        const card =
            this.cards.find(
                (item) =>
                    item.id === id
            );

        if (!card) {
            return;
        }

        const confirmed =
            confirm(
                `¿Seguro que deseas eliminar "${card.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            await deleteCard(
                id
            );

            this.showMessage(
                'Carta eliminada correctamente.'
            );

            await this.loadCards();

        } catch (error) {

            console.error(error);

            this.showMessage(
                'No se pudo eliminar la carta.'
            );
        }
    }

    showMessage(message) {

        const element =
            this.querySelector(
                '#admin-message'
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
            <section class="admin-section">

                <div
                    class="
                        admin-container
                        admin-error
                    "
                >

                    <h1>
                        ⚠️ Error
                    </h1>

                    <p>
                        ${message}
                    </p>

                    <button
                        id="retry-admin"
                        class="admin-button"
                    >
                        🔄 Intentar nuevamente
                    </button>

                </div>

            </section>
        `;

        this.querySelector(
            '#retry-admin'
        ).addEventListener(
            'click',
            () => {

                this.loadCards();
            }
        );
    }
}

customElements.define(
    'admin-panel',
    AdminPanel
);
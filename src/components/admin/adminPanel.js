import {
    getCards
} from '../../api/cardsApi.js';

import {
    crearCarta
} from '../cards/createCards.js';

import {
    editarCartaCompleta,
    editarCartaParcial
} from '../cards/editCards.js';

import {
    eliminarCarta
} from '../cards/deleteCards.js';

import './adminStyles.css';

export class AdminPanel extends HTMLElement {

    constructor() {

        super();

        this.cards = [];

        this.editingCard = null;

        this.renderLoading();

        this.loadCards();
    }

    async loadCards() {

        try {

            this.cards =
                await getCards();

            this.render();

            this.configureEvents();

        } catch (error) {

            console.error(error);

            this.renderError();
        }
    }

    renderLoading() {

        this.innerHTML = `
            <section class="admin-section">

                <h1>
                    ⚙️ Panel administrativo
                </h1>

                <p>
                    Cargando cartas...
                </p>

            </section>
        `;
    }

    render() {

        this.innerHTML = `
            <section class="admin-section">

                <div class="admin-container">

                    <header class="admin-header">

                        <div>

                            <h1>
                                ⚙️ Administración
                            </h1>

                            <p>
                                Gestión de cartas
                            </p>

                        </div>

                        <button
                            id="logout-admin"
                            class="admin-button"
                        >
                            🚪 Salir
                        </button>

                    </header>

                    <section class="admin-form-section">

                        <h2>
                            ${
                                this.editingCard
                                    ? '✏️ Editar carta'
                                    : '➕ Crear carta'
                            }
                        </h2>

                        ${this.renderForm()}

                    </section>

                    <section class="admin-cards-section">

                        <h2>
                            🃏 Cartas
                            (${this.cards.length})
                        </h2>

                        <div class="admin-cards-grid">

                            ${
                                this.cards
                                    .map(
                                        (card) =>
                                            this.renderCard(
                                                card
                                            )
                                    )
                                    .join('')
                            }

                        </div>

                    </section>

                </div>

            </section>
        `;
    }

    renderForm() {

        const card =
            this.editingCard;

        return `
            <form
                id="card-form"
                class="admin-form"
            >

                <div class="form-group">

                    <label>
                        Nombre
                    </label>

                    <input
                        type="text"
                        id="card-name"
                        required
                        value="${
                            card?.name || ''
                        }"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Tipo
                    </label>

                    <input
                        type="text"
                        id="card-type"
                        required
                        value="${
                            card?.type || ''
                        }"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Imagen
                    </label>

                    <input
                        type="text"
                        id="card-image"
                        value="${
                            card?.image || ''
                        }"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Descripción
                    </label>

                    <textarea
                        id="card-description"
                        required
                    >${
                        card?.description || ''
                    }</textarea>

                </div>

                <div class="form-group">

                    <label>
                        Ataque 1
                    </label>

                    <input
                        type="text"
                        id="attack-1-name"
                        required
                        value="${
                            card?.attacks?.[0]?.name || ''
                        }"
                    >

                    <input
                        type="number"
                        id="attack-1-damage"
                        required
                        min="1"
                        value="${
                            card?.attacks?.[0]?.baseDamage || 20
                        }"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Ataque 2
                    </label>

                    <input
                        type="text"
                        id="attack-2-name"
                        required
                        value="${
                            card?.attacks?.[1]?.name || ''
                        }"
                    >

                    <input
                        type="number"
                        id="attack-2-damage"
                        required
                        min="1"
                        value="${
                            card?.attacks?.[1]?.baseDamage || 30
                        }"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Ataque 3
                    </label>

                    <input
                        type="text"
                        id="attack-3-name"
                        required
                        value="${
                            card?.attacks?.[2]?.name || ''
                        }"
                    >

                    <input
                        type="number"
                        id="attack-3-damage"
                        required
                        min="1"
                        value="${
                            card?.attacks?.[2]?.baseDamage || 40
                        }"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Ataque 4
                    </label>

                    <input
                        type="text"
                        id="attack-4-name"
                        required
                        value="${
                            card?.attacks?.[3]?.name || ''
                        }"
                    >

                    <input
                        type="number"
                        id="attack-4-damage"
                        required
                        min="1"
                        value="${
                            card?.attacks?.[3]?.baseDamage || 50
                        }"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Defensa
                    </label>

                    <input
                        type="text"
                        id="defense-name"
                        required
                        value="${
                            card?.defense?.name || ''
                        }"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Poder especial
                    </label>

                    <input
                        type="text"
                        id="special-name"
                        required
                        value="${
                            card?.special?.name || ''
                        }"
                    >

                    <input
                        type="number"
                        id="special-damage"
                        required
                        min="1"
                        value="${
                            card?.special?.baseDamage || 65
                        }"
                    >

                </div>

                <div class="form-actions">

                    <button
                        type="submit"
                        class="admin-button primary"
                    >
                        ${
                            card
                                ? '💾 Guardar cambios'
                                : '➕ Crear carta'
                        }
                    </button>

                    ${
                        card
                            ? `
                                <button
                                    type="button"
                                    id="cancel-edit"
                                    class="admin-button"
                                >
                                    Cancelar
                                </button>
                            `
                            : ''
                    }

                </div>

            </form>
        `;
    }

    renderCard(card) {

        return `
            <article
                class="admin-card"
            >

                <div class="admin-card-image">

                    <img
                        src="${card.image}"
                        alt="${card.name}"
                    >

                </div>

                <div class="admin-card-content">

                    <h3>
                        ${card.name}
                    </h3>

                    <p>
                        Tipo:
                        <strong>
                            ${card.type}
                        </strong>
                    </p>

                    <p>
                        HP:
                        <strong>
                            ${card.hp}
                        </strong>
                    </p>

                    <p>
                        Estado:
                        ${
                            card.active
                                ? '🟢 Activa'
                                : '🔴 Inactiva'
                        }
                    </p>

                    <div class="admin-card-actions">

                        <button
                            class="admin-button"
                            data-edit="${card.id}"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            class="admin-button"
                            data-toggle="${card.id}"
                        >
                            ${
                                card.active
                                    ? '🔴 Desactivar'
                                    : '🟢 Activar'
                            }
                        </button>

                        <button
                            class="
                                admin-button
                                danger
                            "
                            data-delete="${card.id}"
                        >
                            🗑️ Eliminar
                        </button>

                    </div>

                </div>

            </article>
        `;
    }

    configureEvents() {

        const form =
            this.querySelector(
                '#card-form'
            );

        if (form) {

            form.addEventListener(
                'submit',
                (event) => {

                    event.preventDefault();

                    this.saveCard();
                }
            );
        }

        const cancel =
            this.querySelector(
                '#cancel-edit'
            );

        if (cancel) {

            cancel.addEventListener(
                'click',
                () => {

                    this.editingCard =
                        null;

                    this.render();

                    this.configureEvents();
                }
            );
        }

        this
            .querySelectorAll(
                '[data-edit]'
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        'click',
                        () => {

                            const id =
                                button.dataset.edit;

                            this.startEdit(id);
                        }
                    );
                }
            );

        this
            .querySelectorAll(
                '[data-toggle]'
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        'click',
                        () => {

                            const id =
                                button.dataset.toggle;

                            this.toggleCard(id);
                        }
                    );
                }
            );

        this
            .querySelectorAll(
                '[data-delete]'
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        'click',
                        () => {

                            const id =
                                button.dataset.delete;

                            this.deleteCard(id);
                        }
                    );
                }
            );

        const logout =
            this.querySelector(
                '#logout-admin'
            );

        if (logout) {

            logout.addEventListener(
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
    }

    async saveCard() {

        try {

            const card =
                this.getFormData();

            if (this.editingCard) {

                /*
                 * PUT:
                 * reemplazamos la carta completa.
                 */
                await editarCartaCompleta(
                    card,
                    this.editingCard.id
                );

                alert(
                    'Carta actualizada correctamente.'
                );

            } else {

                /*
                 * POST:
                 * creamos una carta nueva.
                 */
                await crearCarta(card);

                alert(
                    'Carta creada correctamente.'
                );
            }

            this.editingCard =
                null;

            await this.loadCards();

        } catch (error) {

            alert(
                error.message
            );
        }
    }

    getFormData() {

        const id =
            this.editingCard?.id
            || `card-${Date.now()}`;

        return {

            id,

            name:
                this.querySelector(
                    '#card-name'
                ).value.trim(),

            type:
                this.querySelector(
                    '#card-type'
                ).value.trim(),

            image:
                this.querySelector(
                    '#card-image'
                ).value.trim(),

            description:
                this.querySelector(
                    '#card-description'
                ).value.trim(),

            hp: 250,

            attacks: [

                {
                    id: 'attack-01',

                    name:
                        this.querySelector(
                            '#attack-1-name'
                        ).value.trim(),

                    baseDamage:
                        Number(
                            this.querySelector(
                                '#attack-1-damage'
                            ).value
                        )
                },

                {
                    id: 'attack-02',

                    name:
                        this.querySelector(
                            '#attack-2-name'
                        ).value.trim(),

                    baseDamage:
                        Number(
                            this.querySelector(
                                '#attack-2-damage'
                            ).value
                        )
                },

                {
                    id: 'attack-03',

                    name:
                        this.querySelector(
                            '#attack-3-name'
                        ).value.trim(),

                    baseDamage:
                        Number(
                            this.querySelector(
                                '#attack-3-damage'
                            ).value
                        )
                },

                {
                    id: 'attack-04',

                    name:
                        this.querySelector(
                            '#attack-4-name'
                        ).value.trim(),

                    baseDamage:
                        Number(
                            this.querySelector(
                                '#attack-4-damage'
                            ).value
                        )
                }

            ],

            defense: {

                name:
                    this.querySelector(
                        '#defense-name'
                    ).value.trim(),

                damageReduction:
                    0.5
            },

            special: {

                name:
                    this.querySelector(
                        '#special-name'
                    ).value.trim(),

                baseDamage:
                    Number(
                        this.querySelector(
                            '#special-damage'
                        ).value
                    ),

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

            active:
                this.editingCard?.active
                ?? true,

            createdAt:
                this.editingCard?.createdAt
                || new Date().toISOString()
        };
    }

    startEdit(id) {

        const card =
            this.cards.find(
                (item) =>
                    item.id === id
            );

        if (!card) {
            return;
        }

        this.editingCard =
            card;

        this.render();

        this.configureEvents();

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    async toggleCard(id) {

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
             * PATCH:
             * solamente cambiamos active.
             */
            await editarCartaParcial(
                {
                    active:
                        !card.active
                },
                id
            );

            await this.loadCards();

        } catch (error) {

            alert(
                error.message
            );
        }
    }

    async deleteCard(id) {

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

            await eliminarCarta(id);

            alert(
                'Carta eliminada correctamente.'
            );

            await this.loadCards();

        } catch (error) {

            alert(
                error.message
            );
        }
    }

    renderError() {

        this.innerHTML = `
            <section class="admin-section">

                <div class="admin-error">

                    <h1>
                        ⚠️ Error
                    </h1>

                    <p>
                        No se pudieron cargar
                        las cartas.
                    </p>

                    <button
                        id="retry-admin"
                        class="admin-button"
                    >
                        🔄 Reintentar
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
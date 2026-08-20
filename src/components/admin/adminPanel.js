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
        this.editingCardId = null;

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

            this.cards = await getCards();

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


                    <!-- ========================= -->
                    <!-- FORMULARIO -->
                    <!-- ========================= -->

                    <section class="admin-create-section">

                        <h2>
                            ${this.editingCardId
                ? '✏️ Editar carta'
                : '➕ Crear nueva carta'
            }
                        </h2>


                        <form
                            id="card-form"
                            class="card-form"
                        >

                            <!-- INFORMACIÓN BÁSICA -->

                            <h3>
                                📋 Información básica
                            </h3>


                            <label>
                                Nombre

                                <input
                                    type="text"
                                    id="card-name"
                                    placeholder="Nombre de la carta"
                                    required
                                >

                            </label>


                            <label>
                                Tipo

                                <input
                                    type="text"
                                    id="card-type"
                                    placeholder="Elemento / Tipo"
                                    required
                                >

                            </label>


                            <label>
                                Imagen

                                <input
                                    type="text"
                                    id="card-image"
                                    placeholder="/images/cards/carta.webp"
                                    required
                                >

                            </label>


                            <label>
                                Descripción

                                <textarea
                                    id="card-description"
                                    placeholder="Descripción"
                                    required
                                ></textarea>

                            </label>


                            <!-- ========================= -->
                            <!-- ATAQUES -->
                            <!-- ========================= -->

                            <h3>
                                ⚔️ Ataques
                            </h3>


                            <div class="attack-fields">

                                <div>

                                    <label>
                                        Ataque 1

                                        <input
                                            type="text"
                                            id="attack-1-name"
                                            placeholder="Nombre ataque 1"
                                            required
                                        >

                                    </label>

                                    <label>
                                        Daño

                                        <input
                                            type="number"
                                            id="attack-1-damage"
                                            min="1"
                                            required
                                        >

                                    </label>

                                </div>


                                <div>

                                    <label>
                                        Ataque 2

                                        <input
                                            type="text"
                                            id="attack-2-name"
                                            placeholder="Nombre ataque 2"
                                            required
                                        >

                                    </label>

                                    <label>
                                        Daño

                                        <input
                                            type="number"
                                            id="attack-2-damage"
                                            min="1"
                                            required
                                        >

                                    </label>

                                </div>


                                <div>

                                    <label>
                                        Ataque 3

                                        <input
                                            type="text"
                                            id="attack-3-name"
                                            placeholder="Nombre ataque 3"
                                            required
                                        >

                                    </label>

                                    <label>
                                        Daño

                                        <input
                                            type="number"
                                            id="attack-3-damage"
                                            min="1"
                                            required
                                        >

                                    </label>

                                </div>


                                <div>

                                    <label>
                                        Ataque 4

                                        <input
                                            type="text"
                                            id="attack-4-name"
                                            placeholder="Nombre ataque 4"
                                            required
                                        >

                                    </label>

                                    <label>
                                        Daño

                                        <input
                                            type="number"
                                            id="attack-4-damage"
                                            min="1"
                                            required
                                        >

                                    </label>

                                </div>

                            </div>


                            <!-- ========================= -->
                            <!-- DEFENSA -->
                            <!-- ========================= -->

                            <h3>
                                🛡️ Defensa
                            </h3>


                            <label>
                                Nombre de defensa

                                <input
                                    type="text"
                                    id="defense-name"
                                    placeholder="Escudo de Aire"
                                    required
                                >

                            </label>


                            <label>
                                Reducción de daño

                                <input
                                    type="number"
                                    id="defense-reduction"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value="0.5"
                                    required
                                >

                                <small>
                                    0.5 = 50%
                                </small>

                            </label>


                            <!-- ========================= -->
                            <!-- ESPECIAL -->
                            <!-- ========================= -->

                            <h3>
                                ⚡ Habilidad especial
                            </h3>


                            <label>
                                Nombre del especial

                                <input
                                    type="text"
                                    id="special-name"
                                    placeholder="Estado Avatar"
                                    required
                                >

                            </label>


                            <label>
                                Daño especial

                                <input
                                    type="number"
                                    id="special-damage"
                                    min="1"
                                    required
                                >

                            </label>


                            <label>
                                Turno de desbloqueo

                                <input
                                    type="number"
                                    id="special-unlock-turn"
                                    min="1"
                                    required
                                >

                            </label>


                            <label>
                                Cooldown

                                <input
                                    type="number"
                                    id="special-cooldown"
                                    min="1"
                                    required
                                >

                            </label>


                            <!-- BOTONES -->

                            <div class="form-actions">

                                <button
                                    type="submit"
                                    class="admin-button primary"
                                >
                                    ${this.editingCardId
                ? '💾 Guardar cambios'
                : '➕ Crear carta'
            }
                                </button>


                                ${this.editingCardId
                ? `
                                            <button
                                                type="button"
                                                id="cancel-edit"
                                                class="
                                                    admin-button
                                                    secondary
                                                "
                                            >
                                                ❌ Cancelar
                                            </button>
                                        `
                : ''
            }

                            </div>

                        </form>

                    </section>


                    <!-- ========================= -->
                    <!-- LISTA DE CARTAS -->
                    <!-- ========================= -->

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
                .join('')
            }

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
                    ${card.active ? '' : 'inactive'}
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

        const form =
            this.querySelector(
                '#card-form'
            );

        if (form) {

            form.addEventListener(
                'submit',
                (event) => {

                    event.preventDefault();

                    this.handleSaveCard();

                }
            );
        }


        const cancelButton =
            this.querySelector(
                '#cancel-edit'
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                'click',
                () => {

                    this.editingCardId = null;

                    this.render();

                }
            );
        }


        /*
         * EDITAR
         */

        this.querySelectorAll(
            '.edit-button'
        ).forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        this.startEdit(
                            button.dataset.id
                        );

                    }
                );

            }
        );


        /*
         * ACTIVAR / DESACTIVAR
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
         * ELIMINAR
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
         * LOGOUT
         */

        const logoutButton =
            this.querySelector(
                '#logout-button'
            );

        if (logoutButton) {

            logoutButton.addEventListener(
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


    /*
     * =====================================================
     * EDITAR
     * =====================================================
     */

    startEdit(id) {

        const card =
            this.cards.find(
                (item) =>
                    item.id === id
            );

        if (!card) {
            return;
        }

        this.editingCardId = id;

        this.render();


        /*
         * INFORMACIÓN BÁSICA
         */

        this.querySelector(
            '#card-name'
        ).value =
            card.name || '';

        this.querySelector(
            '#card-type'
        ).value =
            card.type || '';

        this.querySelector(
            '#card-image'
        ).value =
            card.image || '';

        this.querySelector(
            '#card-description'
        ).value =
            card.description || '';


        /*
         * ATAQUES
         */

        const attacks =
            card.attacks || [];


        attacks.forEach(
            (attack, index) => {

                const number =
                    index + 1;

                const nameInput =
                    this.querySelector(
                        `#attack-${number}-name`
                    );

                const damageInput =
                    this.querySelector(
                        `#attack-${number}-damage`
                    );

                if (nameInput) {

                    nameInput.value =
                        attack.name || '';

                }

                if (damageInput) {

                    damageInput.value =
                        attack.baseDamage || 0;

                }

            }
        );


        /*
         * DEFENSA
         */

        this.querySelector(
            '#defense-name'
        ).value =
            card.defense?.name || '';

        this.querySelector(
            '#defense-reduction'
        ).value =
            card.defense?.damageReduction ?? 0.5;


        /*
         * ESPECIAL
         */

        this.querySelector(
            '#special-name'
        ).value =
            card.special?.name || '';

        this.querySelector(
            '#special-damage'
        ).value =
            card.special?.baseDamage || 0;

        this.querySelector(
            '#special-unlock-turn'
        ).value =
            card.special?.unlockTurn || 1;

        this.querySelector(
            '#special-cooldown'
        ).value =
            card.special?.cooldown || 1;


        /*
         * Subir al formulario.
         */

        const form =
            this.querySelector(
                '#card-form'
            );

        if (form) {

            form.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

        }
    }


    /*
     * =====================================================
     * GUARDAR
     * =====================================================
     */

    async handleSaveCard() {

        /*
         * INFORMACIÓN BÁSICA
         */

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


        /*
         * ATAQUES
         */

        const attacks = [];

        for (
            let index = 1;
            index <= 4;
            index++
        ) {

            const attackName =
                this.querySelector(
                    `#attack-${index}-name`
                ).value.trim();

            const attackDamage =
                Number(
                    this.querySelector(
                        `#attack-${index}-damage`
                    ).value
                );


            if (
                !attackName ||
                !attackDamage ||
                attackDamage <= 0
            ) {

                this.showMessage(
                    `El ataque ${index} no es válido.`
                );

                return;
            }


            attacks.push({

                id:
                    `attack-0${index}`,

                name:
                    attackName,

                baseDamage:
                    attackDamage

            });
        }


        /*
         * DEFENSA
         */

        const defenseName =
            this.querySelector(
                '#defense-name'
            ).value.trim();

        const defenseReduction =
            Number(
                this.querySelector(
                    '#defense-reduction'
                ).value
            );


        /*
         * ESPECIAL
         */

        const specialName =
            this.querySelector(
                '#special-name'
            ).value.trim();

        const specialDamage =
            Number(
                this.querySelector(
                    '#special-damage'
                ).value
            );

        const specialUnlockTurn =
            Number(
                this.querySelector(
                    '#special-unlock-turn'
                ).value
            );

        const specialCooldown =
            Number(
                this.querySelector(
                    '#special-cooldown'
                ).value
            );


        /*
         * VALIDACIONES
         */

        if (
            !name ||
            !type ||
            !image ||
            !description ||
            !defenseName ||
            !specialName
        ) {

            this.showMessage(
                'Todos los campos son obligatorios.'
            );

            return;
        }


        if (
            defenseReduction < 0 ||
            defenseReduction > 1
        ) {

            this.showMessage(
                'La reducción debe estar entre 0 y 1.'
            );

            return;
        }


        if (
            specialDamage <= 0 ||
            specialUnlockTurn <= 0 ||
            specialCooldown <= 0
        ) {

            this.showMessage(
                'Los valores del especial no son válidos.'
            );

            return;
        }


        /*
         * =====================================================
         * EDITAR
         * =====================================================
         */

        if (this.editingCardId) {

            const card =
                this.cards.find(
                    (item) =>
                        item.id ===
                        this.editingCardId
                );

            if (!card) {
                return;
            }


            /*
             * Evitar nombres duplicados.
             */

            const duplicated =
                this.cards.some(
                    (item) =>
                        item.id !==
                        this.editingCardId &&
                        item.name.toLowerCase() ===
                        name.toLowerCase()
                );


            if (duplicated) {

                this.showMessage(
                    'Ya existe otra carta con ese nombre.'
                );

                return;
            }


            /*
             * Conservamos los datos
             * que no se editan.
             */

            const updatedCard = {

                ...card,

                name,

                type,

                image,

                description,

                attacks,

                defense: {

                    ...card.defense,

                    name:
                        defenseName,

                    damageReduction:
                        defenseReduction

                },

                special: {

                    ...card.special,

                    name:
                        specialName,

                    baseDamage:
                        specialDamage,

                    unlockTurn:
                        specialUnlockTurn,

                    cooldown:
                        specialCooldown

                }

            };


            try {

                await updateCard(
                    updatedCard,
                    this.editingCardId
                );


                this.editingCardId = null;

                await this.loadCards();


                this.showMessage(
                    '✅ Carta actualizada correctamente.'
                );


            } catch (error) {

                console.error(error);

                this.showMessage(
                    '❌ No se pudo actualizar la carta.'
                );

            }

            return;
        }


        /*
         * =====================================================
         * CREAR
         * =====================================================
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

            /*
             * Por ahora el motor utiliza
             * 250 HP.
             */

            hp: 250,

            attacks,

            defense: {

                name:
                    defenseName,

                damageReduction:
                    defenseReduction

            },

            special: {

                name:
                    specialName,

                baseDamage:
                    specialDamage,

                unlockTurn:
                    specialUnlockTurn,

                cooldown:
                    specialCooldown

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


            await this.loadCards();


            this.showMessage(
                '✅ Carta creada correctamente.'
            );


        } catch (error) {

            console.error(error);

            this.showMessage(
                '❌ No se pudo crear la carta.'
            );

        }
    }


    /*
     * =====================================================
     * ACTIVAR / DESACTIVAR
     * =====================================================
     */

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

            await patchCard(
                {
                    active:
                        !card.active
                },
                id
            );


            await this.loadCards();


            this.showMessage(
                '✅ Estado de la carta actualizado.'
            );


        } catch (error) {

            console.error(error);

            this.showMessage(
                '❌ No se pudo cambiar el estado.'
            );

        }
    }


    /*
     * =====================================================
     * ELIMINAR
     * =====================================================
     */

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


            await this.loadCards();


            this.showMessage(
                '✅ Carta eliminada correctamente.'
            );


        } catch (error) {

            console.error(error);

            this.showMessage(
                '❌ No se pudo eliminar la carta.'
            );

        }
    }


    /*
     * =====================================================
     * MENSAJES
     * =====================================================
     */

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


    /*
     * =====================================================
     * ERROR
     * =====================================================
     */

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
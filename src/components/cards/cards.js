import { getCards } from '../../api/cardsApi.js';
import './cardsStyles.css';

export class CardsComponent extends HTMLElement {
    constructor() {
        super();

        this.cards = [];
        this.render();
        this.loadCards();
    }

    render() {
        this.innerHTML = `
      <section class="cards-section">
        <h2>Card Battle Arena</h2>

        <p class="cards-subtitle">
          Cartas de Avatar: La Leyenda de Aang
        </p>

        <div class="cards-grid" id="cards-container">
          <p>Cargando cartas...</p>
        </div>
      </section>
    `;
    }

    async loadCards() {
        try {
            this.cards = await getCards();

            this.renderCards();
        } catch (error) {
            console.error(error);

            const container = this.querySelector('#cards-container');

            container.innerHTML = `
        <p>
          No se pudieron cargar las cartas.
        </p>
      `;
        }
    }

    renderCards() {
        const container = this.querySelector('#cards-container');

        if (!this.cards.length) {
            container.innerHTML = `
        <p>No hay cartas disponibles.</p>
      `;

            return;
        }

        container.innerHTML = this.cards
            .map(
                (card) => `
          <article class="card">
            <img
              class="card-image"
              src="${card.image}"
              alt="${card.name}"
              onerror="this.src='/images/cards/default.webp'"
            >

            <div class="card-content">
              <h3>${card.name}</h3>

              <span class="card-type">
                ${card.type}
              </span>

              <p class="card-description">
                ${card.description}
              </p>

              <p class="card-hp">
                HP: ${card.hp}
              </p>

              <div class="card-attacks">
                <h4>Ataques</h4>

                <ul>
                  ${card.attacks
                        .map(
                            (attack) => `
                        <li>
                          ${attack.name} -
                          ${attack.baseDamage} daño
                        </li>
                      `
                        )
                        .join('')}
                </ul>
              </div>

              <p>
                Defensa:
                ${card.defense.name}
              </p>

              <p>
                Especial:
                ${card.special.name}
              </p>

              <p class="${card.active
                        ? 'active-status'
                        : 'inactive-status'
                    }">
                ${card.active ? 'Activa' : 'Inactiva'}
              </p>
            </div>
          </article>
        `
            )
            .join('');
    }
}

customElements.define('cards-component', CardsComponent);
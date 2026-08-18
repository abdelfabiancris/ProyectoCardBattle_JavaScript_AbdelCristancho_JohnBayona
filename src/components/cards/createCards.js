import { createCard } from '../../api/cardsApi.js';

export async function crearCarta(card) {

    try {

        const nuevaCarta =
            await createCard(card);

        return nuevaCarta;

    } catch (error) {

        console.error(
            'Error creando carta:',
            error
        );

        throw error;
    }
}
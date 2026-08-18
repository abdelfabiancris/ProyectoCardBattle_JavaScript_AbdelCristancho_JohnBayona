import {
    updateCard,
    patchCard
} from '../../api/cardsApi.js';

/*
 * PUT
 *
 * Reemplaza completamente
 * la carta.
 */
export async function editarCartaCompleta(
    card,
    id
) {

    try {

        const cartaActualizada =
            await updateCard(
                card,
                id
            );

        return cartaActualizada;

    } catch (error) {

        console.error(
            'Error utilizando PUT:',
            error
        );

        throw error;
    }
}

/*
 * PATCH
 *
 * Actualiza solamente
 * algunos campos.
 */
export async function editarCartaParcial(
    data,
    id
) {

    try {

        const cartaActualizada =
            await patchCard(
                data,
                id
            );

        return cartaActualizada;

    } catch (error) {

        console.error(
            'Error utilizando PATCH:',
            error
        );

        throw error;
    }
}
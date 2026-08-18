import {
    deleteCard
} from '../../api/cardsApi.js';

export async function eliminarCarta(id) {

    try {

        await deleteCard(id);

        return true;

    } catch (error) {

        console.error(
            'Error eliminando carta:',
            error
        );

        throw error;
    }
}
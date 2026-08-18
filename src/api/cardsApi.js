import { API_URL } from './apiConfig.js';

export async function getCards() {

    const response =
        await fetch(
            `${API_URL}/cards`
        );

    if (!response.ok) {

        throw new Error(
            'No se pudieron obtener las cartas.'
        );
    }

    return await response.json();
}

export async function getCardById(id) {

    const response =
        await fetch(
            `${API_URL}/cards/${id}`
        );

    if (!response.ok) {

        throw new Error(
            'No se pudo obtener la carta.'
        );
    }

    return await response.json();
}

export async function createCard(card) {

    const response =
        await fetch(
            `${API_URL}/cards`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body:
                    JSON.stringify(card)
            }
        );

    if (!response.ok) {

        throw new Error(
            'No se pudo crear la carta.'
        );
    }

    return await response.json();
}

export async function updateCard(
    card,
    id
) {

    const response =
        await fetch(
            `${API_URL}/cards/${id}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body:
                    JSON.stringify(card)
            }
        );

    if (!response.ok) {

        throw new Error(
            'No se pudo actualizar la carta.'
        );
    }

    return await response.json();
}

export async function patchCard(
    data,
    id
) {

    const response =
        await fetch(
            `${API_URL}/cards/${id}`,
            {
                method: 'PATCH',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body:
                    JSON.stringify(data)
            }
        );

    if (!response.ok) {

        throw new Error(
            'No se pudo actualizar parcialmente la carta.'
        );
    }

    return await response.json();
}

export async function deleteCard(id) {

    const response =
        await fetch(
            `${API_URL}/cards/${id}`,
            {
                method: 'DELETE'
            }
        );

    if (!response.ok) {

        throw new Error(
            'No se pudo eliminar la carta.'
        );
    }

    return true;
}
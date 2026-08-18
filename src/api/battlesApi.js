import { API_URL } from './apiConfig.js';

export async function getBattles() {

    const response =
        await fetch(
            `${API_URL}/battles`
        );

    if (!response.ok) {

        throw new Error(
            'No se pudieron obtener las batallas.'
        );
    }

    return await response.json();
}

export async function getBattleById(id) {

    const response =
        await fetch(
            `${API_URL}/battles/${id}`
        );

    if (!response.ok) {

        throw new Error(
            'No se pudo obtener la batalla.'
        );
    }

    return await response.json();
}

export async function createBattle(
    battle
) {

    const response =
        await fetch(
            `${API_URL}/battles`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body:
                    JSON.stringify(battle)
            }
        );

    if (!response.ok) {

        throw new Error(
            'No se pudo guardar la batalla.'
        );
    }

    return await response.json();
}
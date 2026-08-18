import { API_URL } from './apiConfig.js';

export async function getPlayers() {
    const response = await fetch(`${API_URL}/players`);

    if (!response.ok) {
        throw new Error('No se pudieron obtener los jugadores.');
    }

    return await response.json();
}

export async function getPlayerById(id) {
    const response = await fetch(`${API_URL}/players/${id}`);

    if (!response.ok) {
        throw new Error('No se pudo obtener el jugador.');
    }

    return await response.json();
}

export async function createPlayer(player) {
    const response = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(player)
    });

    if (!response.ok) {
        throw new Error('No se pudo registrar el jugador.');
    }

    return await response.json();
}

export async function updatePlayer(player, id) {
    const response = await fetch(`${API_URL}/players/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(player)
    });

    if (!response.ok) {
        throw new Error('No se pudo actualizar el jugador.');
    }

    return await response.json();
}

export async function patchPlayer(data, id) {
    const response = await fetch(`${API_URL}/players/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('No se pudo actualizar parcialmente el jugador.');
    }

    return await response.json();
}
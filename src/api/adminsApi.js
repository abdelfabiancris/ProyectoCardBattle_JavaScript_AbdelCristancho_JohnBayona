import { API_URL } from './apiConfig.js';

export async function getAdmins() {

    const response =
        await fetch(
            `${API_URL}/admins`
        );

    if (!response.ok) {

        throw new Error(
            'No se pudieron obtener los administradores.'
        );
    }

    return await response.json();
}

export async function validateAdmin(
    username,
    password
) {

    const admins =
        await getAdmins();

    return admins.find(
        (admin) =>
            admin.username === username &&
            admin.password === password
    );
}
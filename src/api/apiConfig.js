const mode =
    import.meta.env.VITE_API_MODE || 'development';

const DEV_URL =
    import.meta.env.VITE_API_DEV_URL ||
    'http://localhost:3000';

const PROD_URL =
    import.meta.env.VITE_API_PROD_URL ||
    'https://proyectocardbattlejavascriptabdelcristanchojo-production.up.railway.app';

export const API_URL =
    mode === 'production'
        ? PROD_URL
        : DEV_URL;
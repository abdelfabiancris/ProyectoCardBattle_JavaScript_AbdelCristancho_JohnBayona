let API_URL;

switch (import.meta.env.VITE_API_MODE) {
    case 'production':
        API_URL = import.meta.env.VITE_API_PROD_URL;
        break;

    case 'development':
    default:
        API_URL = import.meta.env.VITE_API_DEV_URL;
        break;
}

export { API_URL };
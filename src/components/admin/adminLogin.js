import { validateAdmin } from '../../api/adminsApi.js';

import './adminStyles.css';

export class AdminLogin extends HTMLElement {

    constructor() {
        super();

        this.render();
        this.configureEvents();
    }

    render() {

        this.innerHTML = `
            <section class="admin-login">

                <div class="admin-login-card">

                    <h1>
                        Administración
                    </h1>

                    <p>
                        Inicia sesión para gestionar
                        las cartas.
                    </p>

                    <form id="admin-login-form">

                        <div class="form-group">

                            <label for="admin-username">
                                Usuario
                            </label>

                            <input
                                type="text"
                                id="admin-username"
                                placeholder="admin"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label for="admin-password">
                                Contraseña
                            </label>

                            <input
                                type="password"
                                id="admin-password"
                                placeholder="Contraseña"
                                required
                            >

                        </div>

                        <p
                            id="admin-error"
                            class="admin-error-message"
                        ></p>

                        <button
                            type="submit"
                            class="admin-button primary"
                        >
                            🔑 Iniciar sesión
                        </button>

                    </form>

                </div>

            </section>
        `;
    }

    configureEvents() {

        const form =
            this.querySelector(
                '#admin-login-form'
            );

        form.addEventListener(
            'submit',
            async (event) => {

                event.preventDefault();

                await this.login();
            }
        );
    }

    async login() {

        const username =
            this.querySelector(
                '#admin-username'
            ).value.trim();

        const password =
            this.querySelector(
                '#admin-password'
            ).value;

        const errorMessage =
            this.querySelector(
                '#admin-error'
            );

        errorMessage.textContent = '';

        try {

            /*
             * Consultamos los administradores
             * mediante Fetch API.
             */
            const admin =
                await validateAdmin(
                    username,
                    password
                );

            /*
             * Si no existe un administrador
             * con esas credenciales.
             */
            if (!admin) {

                errorMessage.textContent =
                    '❌ Usuario o contraseña incorrectos.';

                return;
            }

            /*
             * Login correcto.
             */
            this.dispatchEvent(
                new CustomEvent(
                    'admin-authenticated',
                    {
                        detail: admin,
                        bubbles: true
                    }
                )
            );

        } catch (error) {

            console.error(
                'Error en login:',
                error
            );

            errorMessage.textContent =
                '⚠️ No se pudo conectar con el servidor.';
        }
    }
}

customElements.define(
    'admin-login',
    AdminLogin
);
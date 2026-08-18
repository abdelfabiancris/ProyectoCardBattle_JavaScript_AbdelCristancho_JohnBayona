import {
    validateAdmin
} from '../../api/adminsApi.js';

import './adminStyles.css';

export class AdminLogin
    extends HTMLElement {

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
                        🔐 Administración
                    </h1>

                    <p>
                        Inicia sesión para
                        gestionar las cartas.
                    </p>

                    <form id="admin-form">

                        <div class="form-group">

                            <label
                                for="username"
                            >
                                Usuario
                            </label>

                            <input
                                type="text"
                                id="username"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label
                                for="password"
                            >
                                Contraseña
                            </label>

                            <input
                                type="password"
                                id="password"
                                required
                            >

                        </div>

                        <button
                            type="submit"
                            class="admin-button"
                        >
                            Iniciar sesión
                        </button>

                        <p
                            id="login-message"
                            class="login-message"
                        ></p>

                    </form>

                </div>

            </section>
        `;
    }

    configureEvents() {
        const form =
            this.querySelector(
                '#admin-form'
            );

        form.addEventListener(
            'submit',
            async (event) => {

                event.preventDefault();

                const username =
                    this.querySelector(
                        '#username'
                    ).value.trim();

                const password =
                    this.querySelector(
                        '#password'
                    ).value;

                const message =
                    this.querySelector(
                        '#login-message'
                    );

                message.textContent =
                    'Verificando...';

                try {
                    const admin =
                        await validateAdmin(
                            username,
                            password
                        );

                    if (!admin) {
                        message.textContent =
                            '❌ Usuario o contraseña incorrectos.';

                        return;
                    }

                    message.textContent =
                        '✅ Acceso permitido.';

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

                    console.error(error);

                    message.textContent =
                        '⚠️ No se pudo validar el acceso.';
                }
            }
        );
    }
}

customElements.define(
    'admin-login',
    AdminLogin
);
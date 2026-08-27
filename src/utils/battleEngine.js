const MAX_HP = 250;

export class BattleEngine {

    constructor(
        playerDeck,
        machineDeck
    ) {

        this.player = {
            name: 'player',
            deck: this.prepareDeck(
                playerDeck
            ),
            currentIndex: 0
        };

        this.machine = {
            name: 'machine',
            deck: this.prepareDeck(
                machineDeck
            ),
            currentIndex: 0
        };

        /*
         * El primer turno se decide
         * aleatoriamente.
         */
        this.turn =
            Math.random() < 0.5
                ? 'player'
                : 'machine';

        this.round = 1;

        this.gameOver = false;

        this.winner = null;

        this.history = [];

        this.startedAt =
            new Date().toISOString();
    }

    /*
     * Prepara las cartas para la batalla.
     * Cada carta comienza con 250 HP.
     */
    prepareDeck(deck) {

        return deck.map(
            (card) => ({

                ...card,

                currentHp:
                    MAX_HP,

                /*
                 * Cantidad de turnos propios
                 * realizados por esta carta.
                 */
                ownTurns: 0,

                /*
                 * Indica si la carta está
                 * protegiéndose.
                 */
                isDefending: false,

                /*
                 * Turnos propios restantes
                 * para reutilizar el especial.
                 */
                specialCooldown: 0,

                defeated: false

            })
        );
    }

    getPlayerCard() {

        return this.player.deck[
            this.player.currentIndex
        ];
    }

    getMachineCard() {

        return this.machine.deck[
            this.machine.currentIndex
        ];
    }

    getCurrentCard(owner) {

        if (owner === 'player') {

            return this.getPlayerCard();
        }

        return this.getMachineCard();
    }

    getOpponent(owner) {

        if (owner === 'player') {

            return this.getMachineCard();
        }

        return this.getPlayerCard();
    }

    /*
     * Devuelve las acciones que la carta
     * puede realizar actualmente.
     */
    getAvailableActions(owner) {

        const card =
            this.getCurrentCard(owner);

        if (
            !card ||
            card.defeated
        ) {

            return [];
        }

        const actions = [
            'attack-1',
            'attack-2',
            'attack-3',
            'attack-4',
            'defense'
        ];

        /*
         * ownTurns representa los turnos
         * propios que YA realizó la carta.
         *
         * Si tiene 1 turno realizado,
         * el próximo será su turno 2.
         */
        const nextOwnTurn =
            card.ownTurns + 1;

        /*
         * El especial:
         *
         * - Se desbloquea desde turno 2.
         * - No puede utilizarse durante cooldown.
         */
        if (
            nextOwnTurn >=
            card.special.unlockTurn &&
            card.specialCooldown === 0
        ) {

            actions.push(
                'special'
            );
        }

        return actions;
    }

    /*
     * Calcula el daño aleatorio.
     *
     * Factor:
     * 0.85 hasta 1.15
     */
    calculateDamage(baseDamage) {

        const factor =
            0.85 +
            Math.random() * 0.30;

        return Math.round(
            baseDamage * factor
        );
    }

    /*
     * Resuelve todos los eventos que pueden
     * modificar el daño de un ataque.
     *
     * Orden obligatorio del examen:
     * 1. daño aleatorio
     * 2. esquive
     * 3. golpe crítico
     * 4. defensa
     * 5. redondeo
     * 6. descuento de HP
     */
    resolveDamage(target, damage) {

        const dodged =
            Math.random() < 0.08;

        if (dodged) {

            return {
                damage: 0,
                dodged: true,
                critical: false,
                defended: target.isDefending
            };
        }

        const critical =
            Math.random() < 0.12;

        let finalDamage =
            critical
                ? damage * 1.5
                : damage;

        const defended =
            target.isDefending;

        if (defended) {

            finalDamage *= 0.5;

            /*
             * La defensa protege únicamente
             * contra el siguiente ataque.
             */
            target.isDefending = false;
        }

        finalDamage = Math.round(finalDamage);

        target.currentHp =
            Math.max(
                0,
                target.currentHp - finalDamage
            );

        if (target.currentHp === 0) {
            target.defeated = true;
        }

        return {
            damage: finalDamage,
            dodged: false,
            critical,
            defended
        };
    }

    /*
     * Ejecuta una acción del jugador
     * o de la máquina.
     */
    performAction(
        owner,
        action
    ) {

        if (this.gameOver) {

            return {
                success: false,
                message:
                    'La partida ya terminó.'
            };
        }

        if (
            owner !== this.turn
        ) {

            return {
                success: false,
                message:
                    'No es el turno de este jugador.'
            };
        }

        const attacker =
            this.getCurrentCard(owner);

        const defender =
            this.getOpponent(owner);

        if (
            !attacker ||
            !defender
        ) {

            return {
                success: false,
                message:
                    'No hay cartas disponibles.'
            };
        }

        /*
         * Al comenzar un nuevo turno propio,
         * reducimos el cooldown.
         *
         * Ejemplo:
         *
         * cooldown 3
         * ↓
         * turno propio → 2
         * ↓
         * turno propio → 1
         * ↓
         * turno propio → 0
         */
        if (
            attacker.specialCooldown > 0
        ) {

            attacker.specialCooldown--;
        }

        const availableActions =
            this.getAvailableActions(
                owner
            );

        if (
            !availableActions.includes(
                action
            )
        ) {

            /*
             * Como redujimos cooldown
             * antes de validar, si la acción
             * no es válida no debemos contar
             * ese turno.
             *
             * El cooldown sí representa el
             * comienzo del turno propio.
             */

            return {
                success: false,
                message:
                    'Esta acción no está disponible.'
            };
        }

        let result = null;

        /*
         * ATAQUES NORMALES
         */
        if (
            action.startsWith(
                'attack-'
            )
        ) {

            result =
                this.normalAttack(
                    attacker,
                    defender,
                    action
                );
        }

        /*
         * DEFENSA
         */
        if (
            action === 'defense'
        ) {

            result =
                this.defend(
                    attacker
                );
        }

        /*
         * PODER ESPECIAL
         */
        if (
            action === 'special'
        ) {

            result =
                this.specialAttack(
                    attacker,
                    defender
                );
        }

        /*
         * Identificamos quién ejecutó la acción.
         * Esto también permite detectar defensas
         * consecutivas en el modo automático.
         */
        result.owner = owner;

        /*
         * El turno propio se contabiliza
         * después de realizar la acción.
         */
        attacker.ownTurns++;

        /*
         * Guardamos la acción en el historial.
         */
        this.history.push(
            result
        );

        /*
         * Si la carta defensora fue derrotada,
         * entra la siguiente carta.
         */
        if (
            defender.defeated
        ) {

            this.changeDefeatedCard(
                owner === 'player'
                    ? 'machine'
                    : 'player'
            );
        }

        /*
         * Si todavía hay partida,
         * cambiamos el turno.
         */
        if (
            !this.gameOver
        ) {

            this.changeTurn();
        }

        return {
            success: true,

            ...result,

            gameOver:
                this.gameOver,

            winner:
                this.winner,

            turn:
                this.turn,

            playerCard:
                this.getPlayerCard(),

            machineCard:
                this.getMachineCard()
        };
    }

    /*
     * Ataque normal.
     */
    normalAttack(
        attacker,
        defender,
        action
    ) {

        const attackIndex =
            Number(
                action.split('-')[1]
            ) - 1;

        const attack =
            attacker.attacks[
            attackIndex
            ];

        if (!attack) {

            return {
                type: 'attack',
                success: false,
                message:
                    'Ataque no encontrado.'
            };
        }

        const damage =
            this.calculateDamage(
                attack.baseDamage
            );

        const damageResult =
            this.resolveDamage(
                defender,
                damage
            );

        return {

            type: 'attack',

            attacker:
                attacker.name,

            owner: this.turn,

            defender:
                defender.name,

            actionName:
                attack.name,

            baseDamage:
                attack.baseDamage,

            damage:
                damageResult.damage,

            targetHp:
                defender.currentHp,

            defeated:
                defender.defeated,

            critical:
                damageResult.critical,

            dodged:
                damageResult.dodged,

            defended:
                damageResult.defended
        };
    }

    /*
     * Defensa.
     */
    defend(card) {

        card.isDefending =
            true;

        return {

            type: 'defense',

            attacker:
                card.name,

            actionName:
                card.defense.name,

            message:
                `${card.name} se está defendiendo.`,

            damageReduction:
                0.5
        };
    }

    /*
     * Poder especial.
     */
    specialAttack(
        attacker,
        defender
    ) {

        const special =
            attacker.special;

        const damage =
            this.calculateDamage(
                special.baseDamage
            );

        const damageResult =
            this.resolveDamage(
                defender,
                damage
            );

        /*
         * Al utilizar el especial,
         * empieza cooldown de 3.
         */
        attacker.specialCooldown =
            special.cooldown;

        return {

            type: 'special',

            attacker:
                attacker.name,

            owner: this.turn,

            defender:
                defender.name,

            actionName:
                special.name,

            baseDamage:
                special.baseDamage,

            damage:
                damageResult.damage,

            targetHp:
                defender.currentHp,

            defeated:
                defender.defeated,

            critical:
                damageResult.critical,

            dodged:
                damageResult.dodged,

            defended:
                damageResult.defended,

            cooldown:
                attacker.specialCooldown
        };
    }

    /*
     * Cambia el turno.
     */
    changeTurn() {

        if (
            this.turn === 'player'
        ) {

            this.turn =
                'machine';

        } else {

            this.turn =
                'player';

            /*
             * Cuando vuelve el turno
             * al jugador comienza una
             * nueva ronda.
             */
            this.round++;
        }
    }

    /*
     * Cambia a la siguiente carta
     * cuando una carta es derrotada.
     */
    changeDefeatedCard(owner) {

        const participant =
            owner === 'player'
                ? this.player
                : this.machine;

        const currentCard =
            participant.deck[
            participant.currentIndex
            ];

        if (currentCard) {

            currentCard.defeated =
                true;
        }

        participant.currentIndex++;

        /*
         * Si ya no quedan cartas,
         * termina la partida.
         */
        if (
            participant.currentIndex >=
            participant.deck.length
        ) {

            this.gameOver =
                true;

            this.winner =
                owner === 'player'
                    ? 'machine'
                    : 'player';

            return;
        }

        /*
         * La siguiente carta comienza
         * completamente nueva.
         */
        const nextCard =
            participant.deck[
            participant.currentIndex
            ];

        nextCard.currentHp =
            MAX_HP;

        nextCard.ownTurns =
            0;

        nextCard.isDefending =
            false;

        nextCard.specialCooldown =
            0;

        nextCard.defeated =
            false;
    }

    /*
     * Selecciona una acción automática válida
     * para cualquier participante.
     *
     * La lista siempre sale del estado actual
     * del motor, por lo que el especial nunca
     * puede ser elegido si está bloqueado.
     */
    getAutomaticAction(owner) {

        const actions =
            this.getAvailableActions(owner);

        if (!actions.length) {
            return null;
        }

        const card =
            this.getCurrentCard(owner);

        /*
         * Si la carta tiene poca vida, puede
         * priorizar defensa.
         */
        const lowHp =
            card.currentHp <= MAX_HP * 0.30;

        if (
            lowHp &&
            actions.includes('defense') &&
            Math.random() < 0.45
        ) {
            return 'defense';
        }

        /*
         * El especial tiene prioridad cuando
         * está disponible.
         */
        if (
            actions.includes('special') &&
            Math.random() < 0.55
        ) {
            return 'special';
        }

        /*
         * Evitamos defensa consecutiva.
         */
        const lastAction =
            this.history[this.history.length - 1];

        let validActions = [...actions];

        if (
            lastAction?.owner === owner &&
            lastAction?.type === 'defense'
        ) {
            validActions = validActions.filter(
                (action) => action !== 'defense'
            );
        }

        const attackActions =
            validActions.filter(
                (action) =>
                    action.startsWith('attack-')
            );

        if (attackActions.length) {
            return attackActions[
                Math.floor(
                    Math.random() * attackActions.length
                )
            ];
        }

        return validActions[0];
    }

    /*
     * Decide automáticamente qué acción
     * realizará la máquina.
     */
    getMachineAction() {

        return this.getAutomaticAction('machine');
    }

    /*
     * Ejecuta el turno automático
     * de la máquina.
     */
    machineTurn() {

        if (
            this.turn !== 'machine'
        ) {

            return null;
        }

        const action =
            this.getMachineAction();

        if (!action) {

            return null;
        }

        return this.performAction(
            'machine',
            action
        );
    }

    /*
     * Devuelve el estado completo
     * de la partida.
     */
    getState() {

        return {

            turn:
                this.turn,

            round:
                this.round,

            gameOver:
                this.gameOver,

            winner:
                this.winner,

            playerCard:
                this.getPlayerCard(),

            machineCard:
                this.getMachineCard(),

            playerDeck:
                this.player.deck,

            machineDeck:
                this.machine.deck,

            history:
                this.history
        };
    }
}
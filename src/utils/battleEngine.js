const MAX_HP = 250;

const CRITICAL_CHANCE = 0.12;
const CRITICAL_MULTIPLIER = 1.5;
const DODGE_CHANCE = 0.08;

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

    resolveDamage(target, damage) {

        /*
         * Primero comprobamos si el defensor
         * esquiva completamente el ataque.
         */
        const dodged =
            Math.random() < DODGE_CHANCE;

        if (dodged) {

            return {
                damage: 0,
                dodged: true,
                critical: false
            };
        }

        /*
         * Si no esquivó, comprobamos
         * si el ataque es crítico.
         */
        const critical =
            Math.random() < CRITICAL_CHANCE;

        let finalDamage =
            damage;

        if (critical) {

            finalDamage =
                Math.round(
                    finalDamage *
                    CRITICAL_MULTIPLIER
                );
        }

        /*
         * Finalmente aplicamos la defensa.
         */
        const damageAfterDefense =
            this.applyDamage(
                target,
                finalDamage
            );

        return {
            damage:
                damageAfterDefense,

            dodged:
                false,

            critical:
                critical
        };
    }

    /*
     * Aplica el daño al objetivo.
     *
     * Si está defendiendo,
     * recibe solamente el 50%.
     */

    applyDamage(
        target,
        damage
    ) {

        let finalDamage =
            damage;

        if (target.isDefending) {

            /*
             * Utilizamos la reducción configurada
             * en la carta.
             *
             * Si por alguna razón la carta no tiene
             * damageReduction, utilizamos 50%.
             */
            const damageReduction =
                target.defense?.damageReduction ?? 0.5;

            finalDamage =
                Math.round(
                    damage *
                    (1 - damageReduction)
                );

            /*
             * La defensa solo protege
             * contra el siguiente ataque.
             */
            target.isDefending =
                false;
        }

        target.currentHp =
            Math.max(
                0,
                target.currentHp -
                finalDamage
            );

        if (
            target.currentHp === 0
        ) {

            target.defeated =
                true;
        }

        return finalDamage;
    }

    /*
     * Ejecuta una acción del jugador
     * o de la máquina.
     */

    performAction(owner, action) {

        if (this.gameOver) {
            return {
                success: false,
                message: 'La partida ya terminó.'
            };
        }

        if (owner !== this.turn) {
            return {
                success: false,
                message: 'No es el turno de este jugador.'
            };
        }

        const attacker =
            this.getCurrentCard(owner);

        const defender =
            this.getOpponent(owner);

        if (!attacker || !defender) {
            return {
                success: false,
                message: 'No hay cartas disponibles.'
            };
        }

        /*
         * Primero obtenemos las acciones disponibles.
         */
        const availableActions =
            this.getAvailableActions(owner);

        /*
         * Comprobamos que la acción exista
         * antes de modificar cualquier estado.
         */
        if (!availableActions.includes(action)) {

            return {
                success: false,
                message: 'Esta acción no está disponible.'
            };
        }

        /*
         * El cooldown disminuye al comenzar
         * un nuevo turno propio.
         *
         * Como la acción ya fue validada,
         * aquí sí podemos actualizarlo.
         */
        if (attacker.specialCooldown > 0) {
            attacker.specialCooldown--;
        }

        let result = null;

        /*
         * ATAQUE NORMAL
         */
        if (action.startsWith('attack-')) {

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
        else if (action === 'defense') {

            result =
                this.defend(
                    attacker
                );
        }

        /*
         * PODER ESPECIAL
         */
        else if (action === 'special') {

            result =
                this.specialAttack(
                    attacker,
                    defender
                );
        }

        /*
         * Si por alguna razón no se generó
         * ningún resultado, detenemos la acción.
         */
        if (!result) {

            return {
                success: false,
                message: 'No se pudo ejecutar la acción.'
            };
        }

        /*
         * La carta acaba de realizar
         * un turno propio.
         */
        attacker.ownTurns++;

        /*
         * Guardamos la acción.
         */
        this.history.push(result);

        /*
         * Si el defensor fue derrotado,
         * entra su siguiente carta.
         */
        if (defender.defeated) {

            this.changeDefeatedCard(
                owner === 'player'
                    ? 'machine'
                    : 'player'
            );
        }

        /*
         * Si la partida continúa,
         * cambiamos el turno.
         */
        if (!this.gameOver) {
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

            defender:
                defender.name,

            actionName:
                attack.name,

            baseDamage:
                attack.baseDamage,

            damage:
                damageResult.damage,

            critical:
                damageResult.critical,

            dodged:
                damageResult.dodged,

            targetHp:
                defender.currentHp,

            defeated:
                defender.defeated
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
                card.defense?.damageReduction ?? 0.5
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

            defender:
                defender.name,

            actionName:
                special.name,

            baseDamage:
                special.baseDamage,

            damage:
                damageResult.damage,

            critical:
                damageResult.critical,

            dodged:
                damageResult.dodged,

            targetHp:
                defender.currentHp,

            defeated:
                defender.defeated,

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
     * Decide automáticamente qué acción
     * realizará la máquina.
     */
    getMachineAction() {

        const actions =
            this.getAvailableActions(
                'machine'
            );

        if (!actions.length) {

            return null;
        }

        /*
         * Si el especial está disponible,
         * existe un 40% de probabilidad
         * de utilizarlo.
         */
        if (
            actions.includes(
                'special'
            )
        ) {

            const useSpecial =
                Math.random() < 0.4;

            if (useSpecial) {

                return 'special';
            }
        }

        /*
         * 20% de probabilidad de defender.
         */
        if (
            Math.random() < 0.2
        ) {

            return 'defense';
        }

        /*
         * Si no utiliza especial ni defensa,
         * elige uno de los cuatro ataques.
         */
        const attacks =
            actions.filter(
                (action) =>
                    action.startsWith(
                        'attack-'
                    )
            );

        if (!attacks.length) {

            return 'defense';
        }

        const randomIndex =
            Math.floor(
                Math.random() *
                attacks.length
            );

        return attacks[
            randomIndex
        ];
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
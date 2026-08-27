const sounds = {
    attack: '/sounds/attack.mp3',
    defense: '/sounds/defense.mp3',
    special: '/sounds/special.mp3',
    defeated: '/sounds/defeated.mp3',
    victory: '/sounds/victory.mp3',
    defeat: '/sounds/defeat.mp3',
    critical: '/sounds/critical.mp3',
    dodge: '/sounds/dodge.mp3'
};

export function playSound(type) {

    const source =
        sounds[type];

    if (!source) {
        console.warn(
            `Sonido no encontrado: ${type}`
        );

        return;
    }

    const audio =
        new Audio(source);

    audio.volume = 0.7;

    audio.play()
        .catch(
            (error) => {
                console.warn(
                    'No se pudo reproducir el audio:',
                    error
                );
            }
        );
}
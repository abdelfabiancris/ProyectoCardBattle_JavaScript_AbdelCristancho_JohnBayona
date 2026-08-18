export function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInteger(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

export function shuffle(array) {
    return [...array].sort(
        () => Math.random() - 0.5
    );
}

export function randomItem(array) {
    if (!array.length) {
        return null;
    }

    const index = Math.floor(
        Math.random() * array.length
    );

    return array[index];
}
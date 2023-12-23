export function randomPlayerName() {
    return "BOT_" + Math.floor(Math.random() * 100).toString();
}

export function randomPlayerColor() {
    return '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}
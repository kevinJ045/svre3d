export class Random {
    static from(min, max, seed) {
        const r = (seed ? seed() : Math.random());
        return Math.floor(r * (max - min + 1) + min);
    }
    static shuffleArray(array, seed) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor((seed ? seed() : Math.random()) * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    static pick(...items) {
        let r = null;
        if (typeof items[items.length - 1] == "function" && typeof items[0] !== "function") {
            r = items.pop();
        }
        return items[this.from(0, items.length - 1, r)];
    }
}

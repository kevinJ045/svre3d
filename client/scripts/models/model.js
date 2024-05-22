export class Model {
    static from(data, args) {
        // @ts-ignore
        let d = new this(...(args || []));
        for (let i in data) {
            d[i] = data[i];
        }
        return d;
    }
}

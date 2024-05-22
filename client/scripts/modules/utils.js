export class Utils {
    static async lsDir(dir) {
        return fetch('/lsdir/res/' + dir)
            .then(r => r.json());
    }
    static async loadJson(file) {
        return fetch('/res/' + file)
            .then(r => r.json());
    }
    static async loadText(file) {
        return fetch(file)
            .then(r => r.text());
    }
    static async dirToJson(dir) {
        const files = await Utils.lsDir(dir);
        if (!dir.endsWith('/'))
            dir += '/';
        const parsed = [];
        for (let file of files) {
            try {
                parsed.push(await this.loadJson(dir + file));
            }
            catch (e) {
                console.log(e);
            }
            ;
        }
        return parsed;
    }
}

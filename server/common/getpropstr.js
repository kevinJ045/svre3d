export function getPropStr(object, str) {
    let ns = str.split('.');
    while (ns.length) {
        let n = ns.shift();
        if (object[n]) {
            object = object[n];
        }
    }
    return object;
}

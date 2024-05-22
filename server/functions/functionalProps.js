export const FunctionalData = {};
FunctionalData.entity = (entity) => ({
    isVariant(variant) {
        return functionalDataEntiry(variant, (v) => v == entity.variant);
    },
    hasFlag(prop) {
        return functionalDataEntiry(prop, (p) => entity.flags.includes(p));
    }
});
FunctionalData.chunk = (chunk) => ({
    hasFlag(prop) {
        return functionalDataEntiry(prop, (p) => chunk.flags.includes(p));
    }
});
FunctionalData.item = (item) => ({
    hasFlag(prop) {
        return functionalDataEntiry(prop, (p) => item.flags.includes(p));
    }
});
export function functionalDataEntiry(string, callBack) {
    let value = callBack(string.startsWith('!') ? string.replace('!', '') : string);
    return string.startsWith('!') ? !value : value;
}

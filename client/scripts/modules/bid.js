export function generateUniqueId() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const vendor = navigator.vendor;
    // Concatenate properties and hash them to create a unique identifier
    const uniqueString = `${userAgent}${platform}${vendor}`;
    const uniqueId = hashString(uniqueString);
    return uniqueId;
}
function hashString(input) {
    let hash = 0;
    if (input.length === 0)
        return hash;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

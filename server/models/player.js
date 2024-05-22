export const PlayerModel = {
    username: "",
    email: "",
    position: { x: 0, y: 0, z: 0 },
    variant: "i:grass",
    verified: false,
    equipment: { brow: 'i:normal-brow' },
    inventory: [],
    settings: {
        renderDistance: 4,
        sensitivity: 3
    },
    exp: {
        level: 1,
        max: 100,
        current: 1,
    },
    spawnPoint: { x: 0, z: 0 }
};

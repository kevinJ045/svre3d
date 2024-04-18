import { PlayerInfo } from "../../repositories/player"


export const UIVariables = () => ({
    player: {
        health: PlayerInfo?.entity?.health || { max: 100, current: 100 },
        exp: PlayerInfo?.entity?.exp || { level: 1, max: 100, current: 0 }
    }
});
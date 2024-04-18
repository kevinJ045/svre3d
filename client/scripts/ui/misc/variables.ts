import { PlayerInfo } from "../../repositories/player"


export const UIVariables = {
    player: {
        get health(){
            return PlayerInfo?.entity?.health || { max: 100, current: 100 };
        },
        get exp(){
            return PlayerInfo?.entity?.exp || { llevel: 1, max: 100, current: 0 };
        }
    }
}
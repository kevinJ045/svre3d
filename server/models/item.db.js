import { DBModel } from "./dbmodel.js";
export const ItemDBModel = {
    id: "",
    quantity: 1,
    data: {}
};
DBModel.register('item', ItemDBModel);

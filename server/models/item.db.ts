import { DBModel } from "./dbmodel";



export const ItemDBModel = {
	id: "",
	quantity: 1,
	data: {}
} as {
	id: string,
	quantity: number,
	data?: any
};


DBModel.register('item', ItemDBModel);
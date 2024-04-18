import path from "path";
import fs from "fs";
import { ResourceMap } from "../repositories/resources";

export function loadAllResources(map: typeof ResourceMap){

	// Resources Path
	const res_path = path.resolve(import.meta.dirname, '../../client/res/json');

	const json_folders = fs.readdirSync(res_path);

	fs.watch(res_path, 
	{ recursive: true },	
	(event, filename) => {
		const file = path.join(res_path, filename!);
		const json = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }));
		const folder = path.basename(path.dirname(file));

		map.remove(json.id, folder);
		map.loadJson(json, folder);
		console.log('updated json', filename);
	})

	json_folders.forEach(folder => {
		const json_folder = path.join(res_path, folder);
		const json_files = fs.readdirSync(json_folder);

		json_files.forEach(json_file => {

			const json = JSON.parse(fs.readFileSync(path.join(json_folder, json_file), { encoding: 'utf-8' }));

			map.loadJson(json, folder);
		});

	});

}
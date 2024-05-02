import path from "path";
import fs from "fs";
import { ResourceMap } from "../repositories/resources";

export function loadAllResources(map: typeof ResourceMap){

	// Resources Path
	const res_path = path.resolve(import.meta.dirname, '../../client/res/json');

	const json_folders = fs.readdirSync(res_path);

	const readFolder = (folder: string, currentFolder: string) => {
		const json_folder = path.join(currentFolder, folder);
		const json_files = fs.readdirSync(json_folder);

		json_files.forEach(json_file => {

			const filpath = path.join(json_folder, json_file);

			const isDir = fs.lstatSync(filpath).isDirectory();

			if(isDir){
				readFolder(json_file, json_folder);
			} else {
				const json = JSON.parse(fs.readFileSync(filpath, { encoding: 'utf-8' }));

				map.loadJson(json, folder);
			}
		});

	}

	json_folders.forEach(file => readFolder(file, res_path));

}
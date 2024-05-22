import path from "path";
import fs from "fs";
import { ResourceMap } from "../repositories/resources.js";
import Parser from "../lib/loader/Parser.class.js";
import STD from "../lib/loader/STD.class.js";
import Package from "../lib/loader/Package.class.js";
import { ServerData } from "../models/data.js";

export function loadAllResources(map: typeof ResourceMap, serverData: ServerData) {

	STD.registerMap(new Parser().parseYAML(path.resolve(import.meta.dirname, '../../packages/iovie/std.yaml'))!);

	const packagesPath = path.resolve(import.meta.dirname, '../../packages');

	const packages = fs.readdirSync(packagesPath);

	packages.forEach(file => {
		const packagePath = path.join(packagesPath, file);
		if (fs.existsSync(path.join(packagePath, 'main.yaml'))) {
			ResourceMap.addPackage(new Package(packagePath, serverData));
		}
	});

}

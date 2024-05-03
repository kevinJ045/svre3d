import STD from './STD.class';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';



export default class Parser {
  parsedFiles: Set<string>;
  yamlSchema: yaml.Schema;
  constructor() {
    this.parsedFiles = new Set();

    this.yamlSchema = new yaml.Schema([
      new yaml.Type('!realpath', {
        kind: 'scalar',
        construct: (data) => this.folderTagHandler(data),
      }),
      new yaml.Type('!xyz', {
        kind: 'mapping',
        construct: (data) => ({
          x: 0,
          y: 0,
          z: 0,
          ...data
        }),
      }),
      new yaml.Type('!import', {
        kind: 'scalar',
        construct: (data) => this.importFile(data),
      }),
      new yaml.Type('!id', {
        kind: 'scalar',
        construct: (data) => this.context.currentID ? this.context.currentID + ':' + data : data,
      }),
      ...(
        STD.getSchemas()
        .map(schema => new yaml.Type('!'+schema.name, {
          kind: 'mapping',
          construct: (data) => ({
            ...schema.values,
            ...data
          }),
        }))
      )
    ]);
  }

  context: Record<string, any> = {};

  folderTagHandler(data) {
    const relativePath = data;
    const absolutePath = path.resolve(path.dirname(this.context.currentFile), relativePath);
    return absolutePath;
  }

  importFile(filename) {
    const currentPath = this.context.currentFile; 
    const file = filename.endsWith('.yaml')
    ? this.parseYAML(this.folderTagHandler(filename))
    : this.lookUpFile(this.folderTagHandler(filename));
    this.context.currentFile = currentPath;
    return file; 
  }

  lookUpFile(filePath){
    this.context.currentFile = filePath;
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
  }

  parseYAML(filePath) {
    if (this.parsedFiles.has(filePath)) {
      return {};
    }
    let fileContent = this.lookUpFile(filePath);

    const data = yaml.load(fileContent, {
      schema: this.yamlSchema
    });

    this.parsedFiles.add(filePath);

    return data;
  }
}

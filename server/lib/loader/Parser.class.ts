import STD from './STD.class.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ResourceSchema } from './Schema.type.js';

const floatifyObject = (obj, int) => {
  for(let i in obj) obj[i] = int ? parseFloat(obj[i]) : parseInt(obj[i]);
  return obj;
}
const xyz = {
  x: 0,
  y: 0,
  z: 0
}

export default class Parser {
  parsedFiles: Record<string, ResourceSchema> = {};
  yamlSchema: yaml.Schema;
  constructor() {

    this.yamlSchema = new yaml.Schema([
      new yaml.Type('!realpath', {
        kind: 'scalar',
        construct: (data) => this.folderTagHandler(data),
      }),
      new yaml.Type('!int', {
        kind: 'scalar',
        construct: (data) => parseInt(data),
      }),
      new yaml.Type('!float', {
        kind: 'scalar',
        construct: (data) => parseFloat(data),
      }),
      new yaml.Type('!bool', {
        kind: 'scalar',
        construct: (data) => data == 'true' ? true : false,
      }),
      new yaml.Type('!xyz.int', {
        kind: 'mapping',
        construct: (data) => floatifyObject({
          ...xyz,
          ...data
        }, false),
      }),
      new yaml.Type('!material', {
        kind: 'scalar',
        construct: (data) => data,
      }),
      new yaml.Type('!vec3', {
        kind: 'sequence',
        construct: (data) => {
          const vec3 = [0, 0, 0];
          for(let i in data) vec3[i] = data[i];
          return vec3;
        },
      }),
      new yaml.Type('!xyz', {
        kind: 'mapping',
        construct: (data) => floatifyObject({
          ...xyz,
          ...data
        }, true),
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
    if (this.parsedFiles[filePath]) {
      return this.parsedFiles[filePath];
    }
    let fileContent = this.lookUpFile(filePath);

    const data = yaml.load(fileContent, {
      schema: this.yamlSchema
    });

    this.parsedFiles[filePath] = (data as ResourceSchema);

    return data as ResourceSchema;
  }
}

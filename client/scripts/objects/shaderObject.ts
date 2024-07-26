import { THREE } from "enable3d";
import { ResourceSchema } from "../../../server/lib/loader/Schema.type";
import { ResourceMap } from "../repositories/resources";

type baseShaderStructureOptions = { size?: number, shader: ResourceSchema, [key: string]: any };
export class ShaderStructure<T extends baseShaderStructureOptions> extends THREE.Mesh {
  shader: ResourceSchema;
  material: THREE.ShaderMaterial;
  constructor(options: T){
    if(!options) options = {} as any;
    if(!options.size) options.size = 1;
    super(new THREE.BoxGeometry(options.size, options.size, options.size));
    this.shader = options.shader;
    this.material = this.createMaterial(options);
  }

  createMaterial(options: T){
    return new THREE.ShaderMaterial({
      defines: this.shader.defines || {},
      uniforms: THREE.UniformsUtils.clone(this.createUniforms(options)),
      vertexShader: this.shader.material.vertex,
      fragmentShader: this.shader.material.fragment,
      transparent: this.shader.material.transparent ?? false
    });
  }

  createUniforms(options: T){
    const uniforms = {
      time: { value: 0 }
    };
    for(let i in this.shader.uniforms){
      const uniform = this.shader.uniforms[i];
      if(uniform.o){
        uniform.value = options[i] || uniform.value;
      }
      if(uniform.type == 't'){
        const tex = ResourceMap.find(uniform.value)?.resource.load;
        uniforms[i] = { value: uniform.index ? tex?.[uniform.index] : tex };
      } else if(uniform.type == 'c'){
        uniforms[i] = { value: uniform.value ? new THREE.Color(uniform.value) : new THREE.Color(0xffffff) };
      } else if(uniform.type?.startsWith('m')){
        uniforms[i] = { value: uniform.value ? new (THREE[uniform.type.endsWith('4') ? 'Matrix4' : 'Matrix3'] as any)(...uniform.value) : null };
      } else if(uniform.type?.startsWith('v')){
        uniforms[i] = { value: uniform.value ? new (THREE[uniform.type.endsWith('2') ? 'Vector2' : uniform.type.endsWith('4') ? 'Vector4' : 'Vector3'] as any)(...uniform.value) : null };
      } else if(uniform.type == 'v') {
        uniforms[i] = { value: options[uniform.value] }
      } else {
        uniforms[i] = { value: uniform.value }
      }
    }
    return uniforms;
  }


  update(time: number) {
    var invModelMatrix: THREE.Matrix4 = this.material.uniforms.invModelMatrix.value;
    this.updateMatrixWorld();
    invModelMatrix.copy(this.matrixWorld).invert();
    if (time !== undefined) {
      this.material.uniforms.time.value = time;
    }
    this.material.uniforms.invModelMatrix.value = invModelMatrix;
    this.material.uniforms.scale.value = this.scale;
  };
}
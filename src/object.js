class Object {
	constructor(position, rotation, scale, shader, model, texture = null) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.shader = shader;
		this.texture = texture;
		this.voxelList = [].concat(model.voxelList);
		this.center = model.center;
		this.translationVelocity = vec3(0, 0, 0);
		this.rotationVelocity = vec3(0, 0, 0);
		this.offsetRotation = {
			center: null,
			axis: vec3(0, 0, 0),
			angle: 0,
			angleSpeed: 0,
		}

		this.setupShader();
	}

	update(delta) {
		this.rotation = modVec3(add(this.rotation, mult(delta, this.rotationVelocity)), 360);
		this.position = add(this.position, mult(delta, this.translationVelocity));
		
		if (this.offsetRotation.center !== null) {
			this.offsetRotation.angle += this.offsetRotation.angleSpeed * delta;
		    if (this.offsetRotation.axis[0] !== 0)
				this.position = add(this.offsetRotation.center, mult(
					length(subtract(this.position, this.offsetRotation.center)), 
					vec3(0, Math.sin(this.offsetRotation.angle * Math.PI / 180), Math.cos(this.offsetRotation.angle * Math.PI / 180))
				));
			else if (this.offsetRotation.axis[1] !== 0)
				this.position = add(this.offsetRotation.center, mult(
					length(subtract(this.position, this.offsetRotation.center)), 
					vec3(Math.cos(this.offsetRotation.angle * Math.PI / 180), 0, Math.sin(this.offsetRotation.angle * Math.PI / 180))
				));
			else if (this.offsetRotation.axis[2] !== 0)
				this.position = add(this.offsetRotation.center, mult(
					length(subtract(this.position, this.offsetRotation.center)), 
					vec3(Math.cos(this.offsetRotation.angle * Math.PI / 180), Math.sin(this.offsetRotation.angle * Math.PI / 180), 0)
				));
		}
	}

	render() {
		this.voxelList.forEach( voxel => {
			let modelMatrix = translate(voxel.position[0], voxel.position[1], voxel.position[2]);
			modelMatrix = mult(translate(-this.center[0], -this.center[1], -this.center[2]), modelMatrix)
			let mTranslation = translate(this.position[0], this.position[1], this.position[2]);
            let mScale = scale(this.scale[0], this.scale[1], this.scale[2]);
			let mRotate = this.rotationMatrix || mult(rotateZ(this.rotation[2]), mult(rotateY(this.rotation[1]), rotateX(this.rotation[0])));
			modelMatrix = mult(mTranslation, mult(mRotate, mult(mScale, modelMatrix)));

			let mInvTrans = inverse(transpose(mult(gCamera.view, modelMatrix)));

			gl.uniformMatrix4fv(this.shader.uModel, false, flatten(modelMatrix));
			gl.uniformMatrix4fv(this.shader.uModelViewInverseTranspose, false, flatten(mInvTrans));
			gl.uniform4fv(this.shader.uColorDiffusion, mult(LIGHT.diffusion, voxel.color));
			gl.uniform4fv(this.shader.uColorAmbient, mult(LIGHT.ambient, voxel.color));
    		gl.drawArrays(gl.TRIANGLES, 0, 36);
		});
	}

	setupShader() {
		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		let cubeVertexes = [
			// Front face
			vec3(.5, .5, .5),
			vec3(-.5, .5, .5),
			vec3(.5, -.5, .5),

			vec3(.5, -.5, .5),
			vec3(-.5, .5, .5),
			vec3(-.5, -.5, .5),

			// Left face
			vec3(-.5, -.5, .5),
			vec3(-.5, .5, .5),
			vec3(-.5, -.5, -.5),

			vec3(-.5, -.5, -.5),
			vec3(-.5, .5, .5),
			vec3(-.5, .5, -.5),

			// Back face
			vec3(.5, -.5, -.5),
			vec3(-.5, .5, -.5),
			vec3(.5, .5, -.5),

			vec3(-.5, -.5, -.5),
			vec3(-.5, .5, -.5),
			vec3(.5, -.5, -.5),

			// Right face
			vec3(.5, .5, .5),
			vec3(.5, -.5, .5),
			vec3(.5, .5, -.5),

			vec3(.5, -.5, .5),
			vec3(.5, -.5, -.5),
			vec3(.5, .5, -.5),

			// Top face
			vec3(.5, .5, .5),
			vec3(-.5, .5, -.5),
			vec3(-.5, .5, .5),

			vec3(.5, .5, .5),
			vec3(.5, .5, -.5),
			vec3(-.5, .5, -.5),

			// Bottom face
			vec3(-.5, -.5, .5),
			vec3(-.5, -.5, -.5),
			vec3(.5, -.5, .5),

			vec3(-.5, -.5, -.5),
			vec3(.5, -.5, -.5),
			vec3(.5, -.5, .5),
		];

		let cubeNormals = [];
		for (let i = 0; i < cubeVertexes.length; i += 6) {
			let a = cubeVertexes[i];
			let b = cubeVertexes[i + 1];
			let c = cubeVertexes[i + 2];
			let normal = normalize(cross(subtract(b, a), subtract(c, a)));

			cubeNormals.push(normal, normal, normal, normal, normal, normal);
		}

		let vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertexes), gl.STATIC_DRAW);

		let aPosition = gl.getAttribLocation(this.shader.program, "aPosition");
		gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aPosition);

		let normalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeNormals), gl.STATIC_DRAW);

		let aNormal = gl.getAttribLocation(this.shader.program, "aNormal");
		gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aNormal);

		gl.bindVertexArray(null);
	}
}

class ModelLoader {
	constructor() {
		this.models = {};
		this.loadModel("bigfish_blue", BIGFISH_BLUE_MODEL);
		this.loadModel("bigfish_red", BIGFISH_RED_MODEL);
		this.loadModel("bigfish_yellow", BIGFISH_YELLOW_MODEL);
		this.loadModel("smallfish_blue", SMALLFISH_BLUE_MODEL);
		this.loadModel("smallfish_red", SMALLFISH_RED_MODEL);
		this.loadModel("smallfish_yellow", SMALLFISH_YELLOW_MODEL);
		this.loadModel("pufferfish_blue", PUFFERFISH_BLUE_MODEL);
		this.loadModel("pufferfish_red", PUFFERFISH_RED_MODEL);
		this.loadModel("pufferfish_yellow", PUFFERFISH_YELLOW_MODEL);
		this.loadModel("big_rock", BIG_ROCK_MODEL);
		this.loadModel("medium_rock", MEDIUM_ROCK_MODEL);
		this.loadModel("small_rock", SMALL_ROCK_MODEL);
		this.loadModel("small_kelp", SMALL_KELP_MODEL);
	}

	loadModel(name, modelData) {
		if (this.models[name]) {
			console.warn(`Model ${name} is already loaded.`);
			return;
		}
		
		let voxelList = [];
		let maxPoint = vec3(-Infinity, -Infinity, -Infinity);
		let minPoint = vec3(Infinity, Infinity, Infinity);

		for (let line of modelData.split('\n')) {
			if (line.trim() === "") continue;
			let properties = line.split(' ')
			let position = vec3(Number(properties[0]), Number(properties[1]), Number(properties[2]));
			let color = vec4(Number(properties[3])/255, Number(properties[4])/255, Number(properties[5])/255, 1);
			for (let i = 0; i < 3; i++) {
				if (position[i] < minPoint[i]) minPoint[i] = Number(position[i]);
				if (position[i] > maxPoint[i]) maxPoint[i] = Number(position[i]);
			}

			voxelList.push({
				"position": position,
				"color": color,
			});
		}

		for (let voxel of voxelList) {
			let adjacentList = [false, false, false, false, false, false];
			for (let otherVoxel of voxelList) {
				if (voxel === otherVoxel) continue;

				if (otherVoxel.position[0] === voxel.position[0] + 1 && otherVoxel.position[1] === voxel.position[1] && otherVoxel.position[2] === voxel.position[2]) adjacentList[0] = true; // Right
				if (otherVoxel.position[0] === voxel.position[0] - 1 && otherVoxel.position[1] === voxel.position[1] && otherVoxel.position[2] === voxel.position[2]) adjacentList[1] = true; // Left
				if (otherVoxel.position[0] === voxel.position[0] && otherVoxel.position[1] === voxel.position[1] + 1 && otherVoxel.position[2] === voxel.position[2]) adjacentList[2] = true; // Up
				if (otherVoxel.position[0] === voxel.position[0] && otherVoxel.position[1] === voxel.position[1] - 1 && otherVoxel.position[2] === voxel.position[2]) adjacentList[3] = true; // Down
				if (otherVoxel.position[0] === voxel.position[0] && otherVoxel.position[1] === voxel.position[1] && otherVoxel.position[2] === voxel.position[2] + 1) adjacentList[4] = true; // Forward
				if (otherVoxel.position[0] === voxel.position[0] && otherVoxel.position[1] === voxel.position[1] && otherVoxel.position[2] === voxel.position[2] - 1) adjacentList[5] = true; // Backward

				if (adjacentList.every(adj => adj)) break; // All adjacent found, no need to check further
			}
			// console.log(`Voxel at ${voxel.position} has adjacent: ${adjacentList}`);
			voxel.remove = false; // Default to not remove
			if (adjacentList.every(adj => adj))
				voxel.remove = true; // If all adjacent are found, mark for removal
		}

		for (let i = voxelList.length - 1; i >= 0; i--) {
			if (voxelList[i].remove) {
				voxelList.splice(i, 1); // Remove voxel if marked for removal
			}
		}

		this.models[name] = {
			voxelList: voxelList,
			center: mult(0.5, add(maxPoint, minPoint)),
		};
		
		if(DEBUG) console.log(`Model ${name} loaded with ${voxelList.length} voxels.`);
	}

}
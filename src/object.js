class Object {
	constructor(position, rotation, scale, shader, model, texture = null) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.shader = shader;
		this.texture = texture;
		this.model = model.split('\n');
		this.translationVelocity = vec3(0, 0, 0);
		this.rotationVelocity = vec3(0, 0, 0);
		this.offsetRotation = {
			center: null,
			axis: vec3(0, 0, 0),
			angle: 0,
			angleSpeed: 0,
		}

        this.calculateCenter();

		this.setupShader();
	}

    calculateCenter() {
		this.voxelList = [];
		let maxPoint = vec3(-Infinity, -Infinity, -Infinity);
		let minPoint = vec3(Infinity, Infinity, Infinity);

		for (let voxelProperties of this.model) {
			if (voxelProperties === "") continue;
			voxelProperties = voxelProperties.split(' ');
			let position = vec3(voxelProperties[0], voxelProperties[1], voxelProperties[2]);

			for (let i = 0; i < 3; i++) {
				if (voxelProperties[i] < minPoint[i]) minPoint[i] = Number(voxelProperties[i]);
				if (voxelProperties[i] > maxPoint[i]) maxPoint[i] = Number(voxelProperties[i]);
			}

			let color = vec4(voxelProperties[3]/255, voxelProperties[4]/255, voxelProperties[5]/255, 1);

			this.voxelList.push({
				"position": position,
				"color": color,
			});
		}
		this.center = mult(.5, add(maxPoint, minPoint));
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
			vec3(.5, .5, -.5),
			vec3(.5, -.5, .5),

			vec3(.5, -.5, .5),
			vec3(.5, .5, -.5),
			vec3(.5, -.5, -.5),

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

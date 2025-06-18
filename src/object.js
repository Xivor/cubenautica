class Object
{
	// model é uma string que contém o conteúdo do .ply (gerada pelo ply2js.py)
	constructor(pos, rotation, scale, model)
	{
		this.pos = pos;
		this.rotation = rotation;
		this.scale = scale;
		this.model = model.split("end_header\n")[1].split('\n');
		
		this.vao = null;
		this.shader = {};
		
		this.voxelList = [];
		let max = vec3(-Infinity, -Infinity, -Infinity);
		let min = vec3(Infinity, Infinity, Infinity);
		for(let voxel of this.model)
		{
			if(voxel === "") continue;
			voxel = voxel.split(' ');
			let pos = vec3(voxel[0], voxel[1], voxel[2]);

			for(let i = 0; i < 3; i++)
			{
				if(voxel[i] < min[i]) min[i] = Number(voxel[i]);
				if(voxel[i] > max[i]) max[i] = Number(voxel[i]);
			}

			let color = vec4(voxel[3]/255, voxel[4]/255, voxel[5]/255, 1);
			voxel = {
				"pos": pos,
				"color": color,
			};

			this.voxelList.push(voxel);
		}
		this.center = mult(.5, add(max, min));
	}
	setupShader(gl, shader)
	{
		this.shader = {...shader};
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
		for(let i = 0; i < cubeVertexes.length; i += 6)
		{
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

		let bufNormais = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufNormais);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeNormals), gl.STATIC_DRAW);

		let aNormal = gl.getAttribLocation(this.shader.program, "aNormal");
		gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aNormal);

		let perspectiva = perspective(60, 1, 0.1, 200);
		gl.uniformMatrix4fv(this.shader.uPerspective, false, flatten(perspectiva));

		gl.uniform4fv(this.shader.uLightPosition, vec4(5, 5, 5, 1));

		gl.bindVertexArray(null);
	}
	render(gl, camera)
	{
		gl.bindVertexArray(this.vao);

		let vista = lookAt(camera.eye, camera.at, camera.up);
		gl.uniformMatrix4fv(this.shader.uView, false, flatten(vista));

		this.voxelList.forEach( voxel => {
			let modelMatrix = translate(voxel.pos[0], voxel.pos[1], voxel.pos[2]);
			modelMatrix = mult(translate(-this.center[0], -this.center[1], -this.center[2]), modelMatrix)
			let mTranslation = translate(this.pos[0], this.pos[1], this.pos[2]);
			let mRotate = mult(rotateZ(this.rotation[2]), mult(rotateY(this.rotation[1]), rotateX(this.rotation[0])));
			modelMatrix = mult(mTranslation, mult(mRotate, modelMatrix));

			let mInvTrans = inverse(transpose(mult(vista, modelMatrix)));
			
		    gl.uniformMatrix4fv(this.shader.uModel, false, flatten(modelMatrix));
		    gl.uniformMatrix4fv(this.shader.uModelViewInverseTranspose, false, flatten(mInvTrans));
		    gl.uniform4fv(this.shader.uColorAmbient, mult(vec4(0.47, 0.47, 0.47, 1.0), voxel.color));
			gl.uniform4fv(this.shader.uColorDiffusion, mult(vec4(0.68, 0.68, 0.68, 1.0), voxel.color));
			gl.uniform4fv(this.shader.uColorEspecular, vec4(0.39, 0.39, 0.39, 1.0));
			gl.uniform1f(this.shader.uAlphaEspecular, 10.0);
    		gl.drawArrays(gl.TRIANGLES, 0, 36);
		});

		gl.bindVertexArray(null);
	}
}
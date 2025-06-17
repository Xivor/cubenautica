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
		for(let voxel of this.model)
		{
			voxel = voxel.split(' ');
			let pos = vec3(voxel[0], voxel[1], voxel[2]);

			let color = [];
			for(let i = 0; i < 36; i++) color = color.concat([vec4(voxel[3]/255, voxel[4]/255, voxel[5]/255, 1)]);

			voxel = {
				"pos": pos,
				"color": color,
			};

			this.voxelList.push(voxel);
		}
	}
	// program é a saída de makeProgram
	setupShader(gl, program)
	{
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

		let vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertexes), gl.STATIC_DRAW);

		let aPosition = gl.getAttribLocation(program, "aPosition");
		gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aPosition);

		this.shader.uModelView = gl.getUniformLocation(program, "uModelView");
		this.shader.uPerspective = gl.getUniformLocation(program, "uPerspective");

		let perspectiva = perspective(60, 1, 0.1, 20);
		gl.uniformMatrix4fv(this.shader.uPerspective, false, flatten(perspectiva));

		gl.bindVertexArray(null);
	}
	render(gl, camera)
	{
		gl.bindVertexArray(this.vao);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		let vista = lookAt(camera.eye, camera.at, camera.up);

		this.voxelList.forEach( voxel => {
			let mTranslation = translate(voxel.pos[EIXO_X], voxel.pos[EIXO_Y], voxel.pos[EIXO_Z]);
			let modelMatrix = mTranslation;
			let mRotate = mult(rotateZ(this.rotation[2]), mult(rotateY(this.rotation[1]), rotateX(this.rotation[0])));
			modelMatrix = mult(mRotate, modelMatrix);

			var bufCores = gl.createBuffer();
		    gl.bindBuffer(gl.ARRAY_BUFFER, bufCores);
		    gl.bufferData(gl.ARRAY_BUFFER, flatten(voxel.color), gl.STATIC_DRAW);
		    
		    var aColor = gl.getAttribLocation(gShader.program, "aColor");
		    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
		    gl.enableVertexAttribArray(aColor);

		    gl.uniformMatrix4fv(this.shader.uModelView, false, flatten(mult(vista, modelMatrix)));
    		gl.drawArrays(gl.TRIANGLES, 0, 36);
		});

		gl.bindVertexArray(null);
	}
}
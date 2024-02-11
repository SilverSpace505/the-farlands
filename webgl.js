class Webgl {
	gId = 0
	meshes = []
	vertexShader = `#version 300 es
		uniform mat4 uModel;
		uniform mat4 uView;
		uniform mat4 uProjection;
		
		layout(location = 0) in vec4 aPosition;
		layout(location = 1) in vec2 aUv;
		layout(location = 2) in vec4 aColour; 
		
		out vec2 vUv;
		out vec4 vColour;
		out vec4 vPos;
		out mat4 vView;
		void main() {
			vUv = aUv;
			vColour = aColour;
	 		vPos = uModel * aPosition;
			vView = uView;
			gl_Position = uProjection * uView * uModel * aPosition;
		}
	`
	fragmentShader = `#version 300 es
		precision mediump float;

		in vec2 vUv;
		in vec4 vColour;
		in vec4 vPos;
		in mat4 vView;

		uniform bool useTexture;
		uniform sampler2D uTexture;
		uniform bool useAlphaMap;
		uniform sampler2D uAlpha;
		uniform float uAlpha2;

 		uniform vec3 uCamera;
	 	uniform float rDistance;
		
		out vec4 fragColour;

		int ditherMatrix[64] = int[64](
			0, 32, 8, 40, 2, 34, 10, 42,
			48, 16, 56, 24, 50, 18, 58, 26,
			12, 44, 4, 36, 14, 46, 6, 38,
			60, 28, 52, 20, 62, 30, 54, 22,
			3, 35, 11, 43, 1, 33, 9, 41,
			51, 19, 59, 27, 49, 17, 57, 25,
			15, 47, 7, 39, 13, 45, 5, 37,
			63, 31, 55, 23, 61, 29, 53, 21
		);

		bool ditherPattern(vec2 coord, float alpha) {
			float size = 8.0;
			vec2 ditherCoord = mod(coord, size);
		
			int threshold = ditherMatrix[int(ditherCoord.x)+int(ditherCoord.y)*int(size)];
		
			return float(threshold)/64.0 >= alpha;
		}
		
		void main() {
			float distance2 = distance(vPos.xz, uCamera.xz)/rDistance;
			if (distance2 > 1.0) {
				distance2 = 1.0;
			}
	 		if (distance2 > 0.75) {
				distance2 -= 0.75;
	 			distance2 *= 4.0;
			} else {
	 			distance2 = 0.0;
			}
			
			vec4 colour = vColour;
			if (useTexture) {
				colour = texture(uTexture, vUv);
				colour.r *= vColour.r;
				colour.g *= vColour.g;
				colour.b *= vColour.b;
			}
			float alpha = uAlpha2;
			if (useAlphaMap) {
				alpha = texture(uAlpha, vUv).r;
			}
	 		if (distance2 >= 1.0) {
				alpha = 0.0;
			}
	 		if (alpha <= 0.0) {
				discard;
			}
			vec4 vSpace = vView * vec4(vPos.xyz, 1.0);
			float distance = length(vSpace.xyz)/100.0;	
			if (ditherPattern(gl_FragCoord.xy, alpha+distance)) {
				discard;
			}
			fragColour = vec4(colour.r+(0.529-colour.r)*distance2*alpha, colour.g+(0.808-colour.g)*distance2*alpha, colour.b+(0.922-colour.b)*distance2*alpha, 1.0);
		}
	`
	vertexShaderGL
	fragmentShaderGl
	attributes
	uniforms
	sortCooldown = 0
	lastView
	lastProjection
	updateView = true
	updateProjection = true
	rDistance = 0
	modelBuffer
	alpha = 0

	constructor() {
		this.vertexShaderGL = gl.createShader(gl.VERTEX_SHADER)
		gl.shaderSource(this.vertexShaderGL, this.vertexShader)
		gl.compileShader(this.vertexShaderGL)
		
		this.fragmentShaderGL = gl.createShader(gl.FRAGMENT_SHADER)
		gl.shaderSource(this.fragmentShaderGL, this.fragmentShader)
		gl.compileShader(this.fragmentShaderGL)

		this.program = gl.createProgram()
		gl.attachShader(this.program, this.vertexShaderGL)
		gl.attachShader(this.program, this.fragmentShaderGL)
		gl.linkProgram(this.program)

		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			console.log(gl.getShaderInfoLog(this.vertexShaderGL))
			console.log(gl.getShaderInfoLog(this.fragmentShaderGL))
		}
		this.attributes = {
			vertices: gl.getAttribLocation(this.program, "aPosition"),
			uvs: gl.getAttribLocation(this.program, "aUv"),
			colours: gl.getAttribLocation(this.program, "aColour"),
		}
		this.uniforms = {
			model: gl.getUniformLocation(this.program, "uModel"),
			view: gl.getUniformLocation(this.program, "uView"),
			projection: gl.getUniformLocation(this.program, "uProjection"),
			useTexture: gl.getUniformLocation(this.program, "useTexture"),
			texture: gl.getUniformLocation(this.program, "uTexture"),
			useAlphaMap: gl.getUniformLocation(this.program, "useAlphaMap"),
			alpha: gl.getUniformLocation(this.program, "uAlpha"),
			camera: gl.getUniformLocation(this.program, "uCamera"),
			rDistance: gl.getUniformLocation(this.program, "rDistance"),
			alpha2: gl.getUniformLocation(this.program, "uAlpha2")
		}

		this.modelBuffer = gl.createBuffer()
	}

	sortObjs() {
		this.meshes.sort((a, b) => a.rOrder - b.rOrder)
	}

	setupModels() {
		this.modelData = []
		for (let mesh of this.meshes) {
			this.modelData.push(...mesh.getModel())
			// console.log(mesh)
			// this.modelData.
		}

	}

	doRender = true
	render() {
		gl.useProgram(this.program)

		// this.setupModels()

		this.update()
		this.sortCooldown -= 1*60*delta
		if (this.sortCooldown <= 0) {
			this.sortCooldown = 30
			this.sortObjs()
		}
		for (let mesh of this.meshes) {
			if (this.doRender) {
				mesh.render()
			}
		}
	}

	update() {
		this.updateView = JSON.stringify(view) != JSON.stringify(this.lastView)
		this.lastView = {...view}
		this.updateProjection = JSON.stringify(projection) != JSON.stringify(this.lastProjection)
		this.lastProjection = {...projection}
		if (this.updateView) {
			gl.uniformMatrix4fv(this.uniforms.view, false, view)
		}
		if (this.updateProjection) {
			gl.uniformMatrix4fv(this.uniforms.projection, false, projection)
		}
		gl.uniform3fv(this.uniforms.camera, [camera.pos.x, camera.pos.y, camera.pos.z])
		// if (fogDistance < cs.x) {
		// 	fogDistance = cs.x
		// }
		fogDistance = (renderSize.x-0.5)*cs.x
		this.rDistance += (fogDistance-this.rDistance)*delta/3
		// this.rDistance = 5000
		gl.uniform1f(this.uniforms.rDistance, this.rDistance)
	}
	
	get Texture() {
		return class {
			img
			src
			id
			texture
			constructor(src) {
				this.img = new Image()
				this.img.src = src
				this.src = src
				this.id = webgl.gId
				webgl.gId += 1
				var img = this.img
				var id = this.id
				img.onload = function () {
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
	
					let texture2 = gl.createTexture()
					gl.activeTexture(gl.TEXTURE0 + id)
					gl.bindTexture(gl.TEXTURE_2D, texture2)
					gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)

					
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
				}
			}
		}
	}
	
	get Mesh() {
		return class {
			pos = {x: 0, y: 0, z: 0}
			size = {x: 1, y: 1, z: 1}
			rot = {x: 0, y: 0, z: 0}
			vertices = []
			faces = []
			colours = []
			uvs = []
			vertexBuffer
			faceBuffer
			uvBuffer
			colourBuffer
			useTexture = false
			useAlpha = false
			texture
			order = false
			alphaTexture
			rOrder = 0
			orderCooldown = 0
			sort = false
			vertexLocation = 0
			oneSide = false
			rotOff = {x: 0, y: 0, z: 0}
			vao
			updateTextures = true
			needSetup = true
			visible = true
			ignoreDepth = false
			customRot = []
			customRotOff = []
			ignoreFog = false
			originalFaces = []
			alpha = 1
			constructor(x, y, z, width, height, depth, vertices, faces, colours) {
				this.pos = {x: x, y: y, z: z}
				this.size = {x: width, y: height, z: depth}
				this.vertices = vertices
				this.faces = faces
				this.colours = colours

				webgl.meshes.push(this)

				this.vertexBuffer = gl.createBuffer()
				this.facesBuffer = gl.createBuffer()
				this.uvBuffer = gl.createBuffer()
				this.colourBuffer = gl.createBuffer()
				this.vao = gl.createVertexArray()

				gl.bindVertexArray(this.vao)
			}
			updateBuffers() {
				this.originalFaces = [...this.faces]
				this.vao = gl.createVertexArray()
				gl.bindVertexArray(this.vao)
				
				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)
				gl.enableVertexAttribArray(webgl.attributes.vertices)
				gl.vertexAttribPointer(webgl.attributes.vertices, 3, gl.FLOAT, false, 0, 0)
				
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.facesBuffer)
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.faces), gl.DYNAMIC_DRAW)
				
				gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer)
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW)
				gl.enableVertexAttribArray(webgl.attributes.uvs)
				gl.vertexAttribPointer(webgl.attributes.uvs, 2, gl.FLOAT, false, 0, 0)	

				gl.bindBuffer(gl.ARRAY_BUFFER, this.colourBuffer)
        		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colours), gl.STATIC_DRAW)
				gl.enableVertexAttribArray(webgl.attributes.colours)
				gl.vertexAttribPointer(webgl.attributes.colours, 3, gl.FLOAT, false, 0, 0)
				
				gl.bindVertexArray(null)
			}
			updateBufferF() {
				// this.vao = gl.createVertexArray()
				gl.bindVertexArray(this.vao)
				
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.facesBuffer)
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new  Uint32Array(this.faces), gl.DYNAMIC_DRAW)
		
				gl.bindVertexArray(null)
			}
			orderFaces(actual = false) {
				this.faces = [...this.originalFaces]
				let ds = []
				for (let i = 0; i < this.faces.length; i += 3) {
					let v1 = [this.vertices[this.faces[i]*3], this.vertices[this.faces[i]*3+1], this.vertices[this.faces[i]*3+2]]
					let v2 = [this.vertices[this.faces[i+1]*3], this.vertices[this.faces[i+1]*3+1], this.vertices[this.faces[i+1]*3+2]]
					let v3 = [this.vertices[this.faces[i+2]*3], this.vertices[this.faces[i+2]*3+1], this.vertices[this.faces[i+2]*3+2]]
					let pos = [Math.round((v1[0]+v2[0]+v3[0])/3*2)/2, Math.round((v1[1]+v2[1]+v3[1])/3*2)/2, Math.round((v1[2]+v2[2]+v3[2])/3*2)/2]
					ds.push([i, ((pos[0]-(camera.pos.x-this.pos.x))**2 + (pos[1]-(camera.pos.y-this.pos.y))**2 + (pos[2]-(camera.pos.z-this.pos.z))**2)])
				}
				ds.sort((a, b) => b[1] - a[1])
				let newFaces = []
				for (let sorted of ds) {
					newFaces.push(this.faces[sorted[0]], this.faces[sorted[0]+1], this.faces[sorted[0]+2])
					// let light = 5 - sorted[1]
					// this.colours[newFaces[sorted[0]]*3] = 1; this.colours[newFaces[sorted[0]]*3+1] = 0; this.colours[newFaces[sorted[0]]*3+2] = 0
					// this.colours[newFaces[sorted[0]+1]*3] = 1; this.colours[newFaces[sorted[0]+1]*3+1] = 0; this.colours[newFaces[sorted[0]+1]*3+2] = 0
					// this.colours[newFaces[sorted[0]+2]*3] = 1; this.colours[newFaces[sorted[0]+2]*3+1] = 0; this.colours[newFaces[sorted[0]+2]*3+2] = 0
				}
				this.faces = newFaces
				this.updateBufferF()
			}
			getModel() {
				let model = mat4.create()
				this.pos.x -= this.rotOff.x
				this.pos.y -= this.rotOff.y
				this.pos.z -= this.rotOff.z
				mat4.translate(model, model, [this.pos.x, this.pos.y, this.pos.z])
				if (this.customRotOff.length > 0) {
					mat4.translate(model, model, [this.customRotOff[0].x, this.customRotOff[0].y, this.customRotOff[0].z])
				}
				mat4.rotateY(model, model, this.rot.y)
				if (this.customRotOff.length > 0) {
					mat4.translate(model, model, [-this.customRotOff[0].x, -this.customRotOff[0].y, -this.customRotOff[0].z])
				}
				if (this.customRotOff.length > 1) {
					mat4.translate(model, model, [this.customRotOff[1].x, this.customRotOff[1].y, this.customRotOff[1].z])
				}
				mat4.rotateX(model, model, this.rot.x)
				if (this.customRotOff.length > 1) {
					mat4.translate(model, model, [-this.customRotOff[1].x, -this.customRotOff[1].y, -this.customRotOff[1].z])
				}
				if (this.customRotOff.length > 2) {
					mat4.translate(model, model, [this.customRotOff[2].x, this.customRotOff[2].y, this.customRotOff[2].z])
				}
				mat4.rotateY(model, model, this.rot.z)
				if (this.customRotOff.length > 2) {
					mat4.translate(model, model, [-this.customRotOff[2].x, -this.customRotOff[2].y, -this.customRotOff[2].z])
				}
				let i = 0
				for (let rot of this.customRot) {
					if (this.customRotOff.length > i+3) {
						mat4.translate(model, model, [this.customRotOff[i+3].x, this.customRotOff[i+3].y, this.customRotOff[i+3].z])
					}
					if (rot[0] == "X") {
						mat4.rotateX(model, model, rot[1])
					}
					if (rot[0] == "Y") {
						mat4.rotateY(model, model, rot[1])
					}
					if (rot[0] == "Z") {
						mat4.rotateZ(model, model, rot[1])
					}
					if (this.customRotOff.length > i+3) {
						mat4.translate(model, model, [-this.customRotOff[i+3].x, -this.customRotOff[i+3].y, -this.customRotOff[i+3].z])
					}
					i++
				}
				mat4.translate(model, model, [this.rotOff.x, this.rotOff.y, this.rotOff.z])
				mat4.scale(model, model, [this.size.x, this.size.y, this.size.z])
				this.pos.x += this.rotOff.x
				this.pos.y += this.rotOff.y
				this.pos.z += this.rotOff.z
				return model
			}
			render() {
				if (this.vertices.length <= 0 || !this.visible) {
					return
				}

				if (this.alpha != webgl.alpha) {
					webgl.alpha = this.alpha
					gl.uniform1f(webgl.uniforms.alpha2, this.alpha)
				}

				if (this.ignoreFog) {
					gl.uniform1f(webgl.uniforms.rDistance, 200)
				}

				if (this.ignoreDepth) {
					gl.disable(gl.DEPTH_TEST)
					gl.depthMask(false)
					mat4.perspective(projection, 60 * Math.PI/180, gl.canvas.width / gl.canvas.height, 0.01, 5000)
					webgl.update()
				} else {
					// gl.enable(gl.DEPTH_TEST)
					// gl.depthMask(true)
				}
				
				if (this.oneSide) {
					gl.enable(gl.CULL_FACE)
					gl.cullFace(gl.BACK)
				} else {
					gl.disable(gl.CULL_FACE)
				}
				
				// this.orderCooldown -= 1
				// if ((this.order && this.orderCooldown <= 0) || jKeys["KeyH"]) {
				// 	this.orderCooldown = fps
				// 	this.orderFaces(jKeys["KeyH"])
				// }
				let model = this.getModel()

				if (this.updateTextures) {
					// this.updateTextures = false
					gl.uniform1i(webgl.uniforms.useTexture, this.useTexture)
					if (this.useTexture) {
						gl.uniform1i(webgl.uniforms.texture, this.texture.id)
					}
					gl.uniform1i(webgl.uniforms.useAlphaMap, this.useAlpha)
					if (this.useAlpha) {
						gl.uniform1i(webgl.uniforms.alpha, this.alphaTexture.id)
					}
				}
				gl.uniformMatrix4fv(webgl.uniforms.model, false, model)

				gl.bindVertexArray(this.vao)

				if (this.useTexture || this.useAlpha) {
					gl.enableVertexAttribArray(webgl.attributes.uvs)
				} else {
					gl.disableVertexAttribArray(webgl.attributes.uvs)
				}
				
				gl.drawElements(gl.TRIANGLES, this.faces.length, gl.UNSIGNED_INT, 0)
				gl.bindVertexArray(null)

				if (this.ignoreDepth) {
					gl.enable(gl.DEPTH_TEST)
					gl.depthMask(true)
					mat4.perspective(projection, fov * Math.PI/180, gl.canvas.width / gl.canvas.height, 0.01, 5000)
					webgl.update()
				}

				if (this.ignoreFog) {
					gl.uniform1f(webgl.uniforms.rDistance, webgl.rDistance)
				}
			}
			delete() {
				webgl.meshes.splice(webgl.meshes.indexOf(this), 1)
			}
		}
	}
	get Box() {
		return class extends webgl.Mesh {
			lastColour = []
			colour = [0, 0, 0]
			visible = true
			constructor(x, y, z, width, height, depth, colour) {
				super(x, y, z, width, height, depth, [
					// +X
					1, 1, 1,
					1, 0, 0,
					1, 1, 0,
					1, 0, 1,
					// -X
					0, 1, 1,
					0, 0, 0,
					0, 1, 0,
					0, 0, 1,
					// +Y
					1, 1, 1,
					0, 1, 0,
					1, 1, 0,
					0, 1, 1,
					// -Y
					1, 0, 1,
					0, 0, 0,
					1, 0, 0,
					0, 0, 1,
					// +Z
					1, 1, 0,
					0, 0, 0,
					1, 0, 0,
					0, 1, 0,
					// -Z
					1, 1, 1,
					0, 0, 1,
					1, 0, 1,
					0, 1, 1,
				],[
					// +Z
					18, 17, 16,
					16, 17, 19,
					// -X
					6, 5, 4,
					4, 5, 7,
					// +X
					0, 1, 2,
					3, 1, 0,
					// -Z
					20, 21, 22,
					23, 21, 20,
					// -Y
					12, 13, 14,
					15, 13, 12,
					// +Y
					10, 9, 8,
					8, 9, 11,
				])
				this.oneSide = true
				this.colour = colour
			}
			updateShape(o=0) {
				this.vertices = [
					// +X
					1-o, 1, 1,
					1-o, 0, 0,
					1-o, 1, 0,
					1-o, 0, 1,
					// -X
					0+o, 1, 1,
					0+o, 0, 0,
					0+o, 1, 0,
					0+o, 0, 1,
					// +Y
					1, 1-o, 1,
					0, 1-o, 0,
					1, 1-o, 0,
					0, 1-o, 1,
					// -Y
					1, 0+o, 1,
					0, 0+o, 0,
					1, 0+o, 0,
					0, 0+o, 1,
					// +Z
					1, 1, 0+o,
					0, 0, 0+o,
					1, 0, 0+o,
					0, 1, 0+o,
					// -Z
					1, 1, 1-o,
					0, 0, 1-o,
					1, 0, 1-o,
					0, 1, 1-o,
				]
			}
			render() {
				if (!this.visible) { return }
				if (JSON.stringify(this.colour) != JSON.stringify(this.lastColour)) {
					this.colours = []
					// +X
					for (let i = 0; i < 4; i++) {
						this.colours.push(this.colour[0]*0.85, this.colour[1]*0.85, this.colour[2]*0.85)
					}
					// -X
					for (let i = 0; i < 4; i++) {
						this.colours.push(this.colour[0]*0.7, this.colour[1]*0.7, this.colour[2]*0.7)
					}
					// +Y
					for (let i = 0; i < 4; i++) {
						this.colours.push(this.colour[0]*1, this.colour[1]*1, this.colour[2]*1)
					}
					// -Y
					for (let i = 0; i < 4; i++) {
						this.colours.push(this.colour[0]*0.55, this.colour[1]*0.55, this.colour[2]*0.55)
					}
					// +Z
					for (let i = 0; i < 4; i++) {
						this.colours.push(this.colour[0]*0.75, this.colour[1]*0.75, this.colour[2]*0.75)
					}
					// -Z
					for (let i = 0; i < 4; i++) {
						this.colours.push(this.colour[0]*0.6, this.colour[1]*0.6, this.colour[2]*0.6)
					}
					this.updateBuffers()
				}
				this.lastColour = [...this.colour]
				this.pos.x -= this.size.x/2
				this.pos.y -= this.size.y/2
				this.pos.z -= this.size.z/2
				super.render()
				this.pos.x += this.size.x/2
				this.pos.y += this.size.y/2
				this.pos.z += this.size.z/2
			}
		}
	}
}

var webgl = new Webgl()
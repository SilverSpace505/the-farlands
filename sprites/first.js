class Chunk extends Object3D {
	mesh
	meshT
	collide = []
	blockSize = {x: 1, y: 1, z: 1}
	visible = false
	forceVis = 0
	constructor(x, y, z) {
		super(x, y, z, cs.x, cs.y, cs.z)
		this.mesh = new webgl.Mesh(0, 0, 0, 1, 1, 1, [], [], [])
		this.meshT = new webgl.Mesh(0, 0, 0, 1, 1, 1, [], [], [])
		this.mesh.useTexture = true
		this.mesh.texture = texture
		this.meshT.useTexture = true
		this.meshT.texture = texture
		this.meshT.useAlpha = true
		this.meshT.alphaTexture = alphaTexture
		this.meshT.order = true
		this.mesh.oneSide = true
		this.updatePos()
	}
	render(geometries) {
		var geometry = geometries[0]
		this.mesh.vertices = geometry.vertices
		this.mesh.uvs = geometry.uvs
		this.mesh.colours = geometry.colours
		this.mesh.faces = geometry.faces
		
		var geometryT = geometries[1]
		this.meshT.vertices = geometryT.vertices
		this.meshT.uvs = geometryT.uvs
		this.meshT.colours = geometryT.colours
		this.meshT.faces = geometryT.faces

		this.mesh.updateBuffers()
		this.meshT.updateBuffers()
		this.meshT.orderFaces()
	}
	updatePos() {
		this.mesh.pos = {x: this.pos.x*cs.x-player.wcpos.x, y: this.pos.y*cs.y-player.wcpos.y, z: this.pos.z*cs.z-player.wcpos.z}
		this.meshT.pos = {x: this.pos.x*cs.x-player.wcpos.x, y: this.pos.y*cs.y-player.wcpos.y, z: this.pos.z*cs.z-player.wcpos.z}
	}
	order(geometryT) {
		return
		// console.log(JSON.stringify(this.geometryT2) == geometryT)
		// this.geometryT2 = geometryT
		// this.geometryT = new THREE.BufferGeometry()
		// this.geometryT.setAttribute("position", new THREE.BufferAttribute(new Float32Array(geometryT.vertices), 3))
		// this.geometryT.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(geometryT.uvs), 2))
		// this.geometryT.setAttribute("color", new THREE.Float32BufferAttribute(geometryT.colours, 3))
		// this.geometryT.setIndex(geometryT.faces)
		// this.geometryT.computeVertexNormals()
		// this.geometryT.computeFaceNormals()
		// this.meshT.geometry = this.geometryT
		// console.log("ye")
		// this.geometryT.setIndex(order2)
		
		// this.geometryT.computeFaceNormals()
		// this.meshT.geometry = this.geometryT
	}
	updateShader() {
		// this.materialT.uniforms.cameraPos.value = camera.position
		// this.materialT.uniforms.light.value = light
		// this.material.uniforms.light.value = light
	}
	delete() {
		this.mesh.delete()
		this.meshT.delete()
	}
}

class VoxelModel extends Object3D {
	mesh
	pos = {x: 0, y: 0, z: 0}
	data
	visible = true
	constructor(x, y, z, data) {
		super(x, y, z, 1, 1, 1)
		this.pos = {x: x, y: y, z: z}
		this.mesh = new webgl.Mesh(x, y, z, 1, 1, 1, [], [], [])
		this.mesh.oneSide = true
		this.data = data
		this.update()
	}
	updateRaw() {
		this.mesh.pos = this.pos
		this.mesh.rot = this.rot
		this.mesh.size = this.size
		this.mesh.visible = this.visible
	}
	update() {
		this.updateRaw()
		this.mesh.vertices = []
		this.mesh.faces = []
		this.mesh.colours = []
		let offs = [
			[1, 0, 0],
			[-1, 0, 0],
			[0, 1, 0],
			[0, -1, 0],
			[0, 0, 1],
			[0, 0, -1],
		]
		for (let x = 0; x < 16; x++) {
			for (let y = 0; y < 16; y++) {
				for (let z = 0; z < 16; z++) {
					if (x*16*16+y*16+z >= this.data.length) { break }
					let d = this.data[x*16*16+y*16+z]
					if (d[0]) {
						let sides = []
						for (let off of offs) {
							let s = true
							let i = (x+off[0])*16*16+(y+off[1])*16+(z+off[2])
							if (i < 0 || i >= this.data.length) {
								s = false
							} else {
								if (!this.data[i][0]) {
									s = false
								}
							}
							sides.push(!s)
						}
						this.renderVoxel(x, y, z, d[1], sides)
					}
				}
			}
		}
		this.mesh.updateBuffers()
	}
	renderVoxel(x, y, z, c, sides) {
		x /= 16
		y /= 16
		z /= 16
		// +X
		let s = 1/16
		if (sides[0]) {
			let i0 = this.mesh.vertices.length/3
			let i1 = this.mesh.vertices.length/3+1
			let i2 = this.mesh.vertices.length/3+2
			let i3 = this.mesh.vertices.length/3+3
			this.mesh.vertices.push(
				s+x, 0+y, 0+z,
				s+x, s+y, s+z,
				s+x, s+y, 0+z,
				s+x, 0+y, s+z,
			)
			this.mesh.faces.push(
				i0, i2, i1,
				i1, i3, i0,
			)
			for (let i = 0; i < 4; i++) {
				this.mesh.colours.push(c[0]*0.85, c[1]*0.85, c[2]*0.85)
			}
		}
		// -X
		if (sides[1]) {
			let i0 = this.mesh.vertices.length/3
			let i1 = this.mesh.vertices.length/3+1
			let i2 = this.mesh.vertices.length/3+2
			let i3 = this.mesh.vertices.length/3+3
			this.mesh.vertices.push(
				0+x, 0+y, 0+z,
				0+x, s+y, s+z,
				0+x, s+y, 0+z,
				0+x, 0+y, s+z,
			)
			this.mesh.faces.push(
				i1, i2, i0,
				i0, i3, i1,
			)
			for (let i = 0; i < 4; i++) {
				this.mesh.colours.push(c[0]*0.7, c[1]*0.7, c[2]*0.7)
			}
		}
		// +Y
		if (sides[2]) {
			let i0 = this.mesh.vertices.length/3
			let i1 = this.mesh.vertices.length/3+1
			let i2 = this.mesh.vertices.length/3+2
			let i3 = this.mesh.vertices.length/3+3
			this.mesh.vertices.push(
				0+x, s+y, 0+z,
				s+x, s+y, s+z,
				s+x, s+y, 0+z,
				0+x, s+y, s+z,
			)
			this.mesh.faces.push(
				i1, i2, i0,
				i0, i3, i1,
			)
			for (let i = 0; i < 4; i++) {
				this.mesh.colours.push(c[0]*1, c[1]*1, c[2]*1)
			}
		}
		// -Y
		if (sides[3]) {
			let i0 = this.mesh.vertices.length/3
			let i1 = this.mesh.vertices.length/3+1
			let i2 = this.mesh.vertices.length/3+2
			let i3 = this.mesh.vertices.length/3+3
			this.mesh.vertices.push(
				0+x, 0+y, 0+z,
				s+x, 0+y, s+z,
				s+x, 0+y, 0+z,
				0+x, 0+y, s+z,
			)
			this.mesh.faces.push(
				i0, i2, i1,
				i1, i3, i0,
			)
			for (let i = 0; i < 4; i++) {
				this.mesh.colours.push(c[0]*0.55, c[1]*0.55, c[2]*0.55)
			}
		}
		// +Z
		if (sides[4]) {
			let i0 = this.mesh.vertices.length/3
			let i1 = this.mesh.vertices.length/3+1
			let i2 = this.mesh.vertices.length/3+2
			let i3 = this.mesh.vertices.length/3+3
			this.mesh.vertices.push(
				0+x, 0+y, s+z,
				s+x, s+y, s+z,
				s+x, 0+y, s+z,
				0+x, s+y, s+z,
			)
			this.mesh.faces.push(
				i0, i2, i1,
				i1, i3, i0,
			)
			for (let i = 0; i < 4; i++) {
				this.mesh.colours.push(c[0]*0.75, c[1]*0.75, c[2]*0.75)
			}
		}
		// -Z
		if (sides[5]) {
			let i0 = this.mesh.vertices.length/3
			let i1 = this.mesh.vertices.length/3+1
			let i2 = this.mesh.vertices.length/3+2
			let i3 = this.mesh.vertices.length/3+3
			this.mesh.vertices.push(
				0+x, 0+y, 0+z,
				s+x, s+y, 0+z,
				s+x, 0+y, 0+z,
				0+x, s+y, 0+z,
			)
			this.mesh.faces.push(
				i1, i2, i0,
				i0, i3, i1,
			)
			for (let i = 0; i < 4; i++) {
				this.mesh.colours.push(c[0]*0.6, c[1]*0.6, c[2]*0.6)
			}
		}
	}
}

class Text3D extends Object3D {
	spc = 1
	text = ""
	mesh
	lastText = ""
	center = true
	constructor(x, y, z, text, sizePerCharacter) {
		super(x, y, z, 1, 1, 1)
		this.text = text
		this.spc = sizePerCharacter
		this.mesh = new webgl.Mesh(0, 0, 0, 1, 1, 1, [], [], [])
		this.mesh.useTexture = true
		this.mesh.texture = fontTexture
		this.mesh.useAlpha = true
		this.mesh.alphaTexture = fontAlphaTexture
		this.mesh.order = true
		this.update()
	}
	lookAtCam() {
		if (!player) { return }
		let diff = {x: camera.pos.x-this.pos.x, y: camera.pos.y-this.pos.y, z: camera.pos.z-this.pos.z}
		this.rot.y = Math.atan2(diff.x, diff.z)
		var l1 = Math.sqrt((diff.x**2) + (diff.z**2))
		this.rot.x = Math.atan2(l1, diff.y)
		this.rot.x -= Math.PI/2
	}
	getWidth() {
		let x = 0
		for (let c of this.text) {
			let cData = characters[c]
			if (!cData) { 
				if (c == " ") x += this.spc
				continue 
			}
			let spacing = cData.length > 2 ? cData[2] : 1
			x += this.spc * spacing + this.spc * 0.2
		}
		return x
	}
	renderMesh() {
		this.mesh.vertices = []
		this.mesh.faces = []
		this.mesh.colours = []
		this.mesh.uvs = []

		let width = this.getWidth()

		let i = 0
		let x2 = 0
		for (let c of this.text) {
			let cData = characters[c]
			if (!cData) { 
				i++
				if (c == " ") x2 += this.spc
				continue 
			}
			let spacing = cData.length > 2 ? cData[2] : 1
			let x = cData[0]
			let y = cData[1]
				
			let i0 = this.mesh.vertices.length/3
			let i1 = this.mesh.vertices.length/3+1
			let i2 = this.mesh.vertices.length/3+2
			let i3 = this.mesh.vertices.length/3+3
			this.mesh.vertices.push(
				0+x2 - width/2,            0,            0,
				this.spc*spacing+x2 - width/2, this.spc*1.4, 0,
				this.spc*spacing+x2 - width/2, 0,            0,
				0+x2 - width/2,      			 this.spc*1.4, 0,
			)
			this.mesh.faces.push(
				i0, i1, i2,
				i0, i1, i3,
			)
			let sideOff1 = Math.floor((1-spacing) / 2 * 5) / 5 * fs.x
			let sideOff2 = Math.ceil((1-spacing) / 2 * 5) / 5 * fs.x
			this.mesh.uvs.push(
				x*fs.x+0+sideOff1, y*fs.y+0,
				x*fs.x+fs.x-sideOff2, y*fs.y+fs.y,
				x*fs.x+fs.x-sideOff2, y*fs.y+0,
				x*fs.x+0+sideOff1, y*fs.y+fs.y
			)
			for (let i2 = 0; i2 < 4; i2++) {
				this.mesh.colours.push(1, 1, 1)
			}

			if (i < this.text.length-1) {
				// i0 = this.mesh.vertices.length/3
				// i1 = this.mesh.vertices.length/3+1
				// i2 = this.mesh.vertices.length/3+2
				// i3 = this.mesh.vertices.length/3+3
				// this.mesh.vertices.push(
				// 	this.spc/1.2+i*this.spc - this.text.length/2*this.spc, 0,            0,
				// 	this.spc+i*this.spc - this.text.length/2*this.spc,     this.spc/1.2*1.4, 0,
				// 	this.spc+i*this.spc - this.text.length/2*this.spc,     0,            0,
				// 	this.spc/1.2+i*this.spc - this.text.length/2*this.spc, this.spc/1.2*1.4, 0,
				// )
				// this.mesh.faces.push(
				// 	i0, i1, i2,
				// 	i0, i1, i3,
				// )
				// this.mesh.uvs.push(
				// 	0+offF, 0,
				// 	0+offF, 0,
				// 	0+offF, 0,
				// 	0+offF, 0,
				// )
				// for (let i2 = 0; i2 < 4; i2++) {
				// 	this.mesh.colours.push(0, 0, 0)
				// }
				i++
				x2 += this.spc * spacing + this.spc * 0.2
			}
		}

		this.mesh.updateBuffers()
	}
	update() {
		this.size.x = this.text.length*this.spc
		this.size.y = this.sizePerCharacter*1.4
		this.mesh.pos = this.pos
		if (this.text != this.lastText) {
			this.renderMesh()
		}
		this.lookAtCam()
		this.mesh.rot = {...this.rot}
		this.lastText = this.text
	}
}

class Particle extends Box {
	vel = {x: 0, y: 0, z: 0}
	time = 0
	lifetime = 0
	wpos = {x: 0, y: 0, z: 0}
	rsize = 0
	constructor(colour, x, y, z, velx, vely, velz, size, lifetime) {
		super(0, 0, 0, size, size, size, colour)
		this.rsize = size
		this.box.alpha = 0.8
		this.vel = {x: velx, y: vely, z: velz}
		this.wpos = {x:x, y:y, z:z}
		this.lifetime = lifetime
		this.updateP()
	}
	updateP() {
		let s = this.rsize * (1-this.time/this.lifetime)
		this.size = {x: s, y: s, z: s}
		this.pos = {x: this.wpos.x - player.wcpos.x, y: this.wpos.y - player.wcpos.y, z: this.wpos.z - player.wcpos.z}
		this.update()
	}
	move() {
		this.wpos.x += this.vel.x
		this.wpos.y += this.vel.y
		this.wpos.z += this.vel.z

		this.vel.x *= 0.99
		this.vel.y *= 0.99
		this.vel.z *= 0.99

		let speed = 0.01
		this.vel.x += (Math.random()*speed - speed/2) * delta
		this.vel.y += (Math.random()*speed - speed/2) * delta 
		this.vel.z += (Math.random()*speed - speed/2) * delta

		this.updateP()

		this.time += delta
		if (this.time > this.lifetime) {
			this.delete()
			return false
		}
		return true
	}
}
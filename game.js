
var particles = []

function gameTick() {
	var oldPos = { ...player.pos }
	// time = 30
	// light = (Math.sin(time*Math.PI/60)+1)/2
	// aLight.intensity = light*0.9+0.35
	// console.log(l)
	// scene.background = new THREE.Color(0.529*light, 0.808*light, 0.922*light)
	// console.log(window.innerWidth, window.innerHeight)
	// var asp = 960/576
	// if (player.pos.y > 0) {
	// 	light.intensity = player.pos.y/worldSize.y
	// } else {
	// 	light.intensity = 0
	// }

	testText.text = "WOW, You found some 3D text! Big Number: " + Math.round(time)

	if (godmode) {
		dashForce = 1
		// airSpeed = 0.01
	} else {
		dashForce = 0.35
		// airSpeed = 0.003
	}

	inventoryOpen = !input.isMouseLocked()
	if (!inventoryOpen && selectedItem[0] != "none") {
		inventory = [...safeInventory]
		selectedItem = ["none", 0]
	}
	// var light2 = 1-Math.abs(Math.cos(time*0.01))
	// scene.background = new THREE.Color(135*light2, 206*light2, 235*light2)
	// aLight.intensity = light2
	// time += 1-Math.abs(Math.sin(time*0.01))+0.1
	// off.x = Math.sin(time*0.01)*aOff.x
	// off.z = Math.sin(time*0.01)*aOff.z
	// off.y = Math.abs(Math.cos(time*0.01))/2*aOff.y
	// requestAnimationFrame(render)

	frames += 1
	if (connecting <= 0) {
		player.tick()
	}
	player.wpos.x += player.pos.x - oldPos.x
	player.wpos.y += player.pos.y - oldPos.y
	player.wpos.z += player.pos.z - oldPos.z

	player.wcpos = { x: Math.floor(player.wpos.x / cs.x) * cs.x, y: Math.floor(player.wpos.y / cs.y) * cs.y, z: Math.floor(player.wpos.z / cs.z) * cs.z }
	player.pos = { x: player.wpos.x - player.wcpos.x, y: player.wpos.y - player.wcpos.y, z: player.wpos.z - player.wcpos.z }

	testText.pos = { x: 0 - player.wcpos.x, y: 100 - player.wcpos.y, z: 0.02 - player.wcpos.z }
	testText.update()

	for (let i = 0; i < particles.length; i++) {
		if (!particles[i].move()) {
			particles.splice(i, 1)
			i--
		}
	}

	clickSlow -= delta
	if (mouse.lclick || mouse.rclick) {
		clickSlow = 0.05
	}

	inInventory -= delta
	if (inventoryOpen) {
		inInventory = 0.1
	}

	chunkTickCooldown -= delta
	setTickCooldown -= delta
	showName -= delta
	if (showName < 0) {
		showName = 0
	}

	sky.pos.x = -player.wcpos.x + player.wpos.x
	sky.pos.y = 70 - player.wcpos.y + player.wpos.y
	sky.pos.z = -player.wcpos.z + player.wpos.z

	for (let i = 0; i < 10; i++) {
		var i2 = 0
		if (i < 9) {
			i2 = i + 1
		}
		if (jKeys["Digit" + i2]) {
			if (selected == i && showName > 0) {
				showName = 2.75
			} else {
				showName = 3
			}
			selected = i
		}
	}

	if (inventory[selected][0] != lastHeldItem) {
		showName = 3
	}
	lastHeldItem = inventory[selected][0]

	if (fps == 0) {
		fps = Math.round(1 / delta)
		newFPS = Math.round(1 / delta)
	}

	fps += (newFPS - fps) * delta
	cps += (newCPS - cps) * delta

	var chunkPos = { x: player.wcpos.x + cs.x / 2, y: player.wcpos.y + cs.y / 2, z: player.wcpos.z + cs.z / 2 }
	var offs = [
		[0, 0, 0],
		[cs.x, 0, 0],
		[-cs.x, 0, 0],
		[0, cs.y, 0],
		[0, -cs.y, 0],
		[0, 0, cs.z],
		[0, 0, -cs.z]
	]
	for (let i in offs) {
		borders[i].pos = { x: cs.x / 2, y: cs.y / 2, z: cs.z / 2 }
		borders[i].pos.x += offs[i][0]
		borders[i].pos.y += offs[i][1]
		borders[i].pos.z += offs[i][2]
		let c = [Math.floor((borders[i].pos.x + player.wcpos.x) / cs.x), Math.floor((borders[i].pos.y + player.wcpos.y) / cs.y), Math.floor((borders[i].pos.z + player.wcpos.z) / cs.z)].join(",")
		if (world[c] || true) {
			borders[i].pos.y -= 1000
		}
	}

	data = {
		x: safe(player.wpos.x),
		y: safe(player.wpos.y),
		z: safe(player.wpos.z),
		rx: safe(camera.rot.x),
		ry: safe(player.rot.y),
		hr: safe(player.headRot),
		sf: safe(player.speedF),
		cy: safe(cameraYTarget),
		a: anims.indexOf(player.anim),
		p: playerT,
		i: inventory[selected][0],
		u: username,
        ig: true
	}

	if (keys["Escape"]) {
		input.unlockMouse()
	}

	var ct = { x: player.pos.x + Math.sin(camera.rot.y + Math.PI / 2) * 1, y: player.pos.y, z: player.pos.z + Math.cos(camera.rot.y + Math.PI / 2) * 1 }

	var r = raycast3D(camera.pos, camera.rot, 10)
	rp = { ...r[1] }
	let tries = 0
	while (tries < 250 && r[0] < 10) {
		r[1].x += Math.sin(camera.rot.y) * Math.cos(camera.rot.x + Math.PI) * 0.01
		r[1].y -= Math.sin(camera.rot.x + Math.PI) * 0.01
		r[1].z += Math.cos(camera.rot.y) * Math.cos(camera.rot.x + Math.PI) * 0.01
		tries += 1
		if (getBlock(Math.round(r[1].x - 0.5), Math.round(r[1].y - 0.5), Math.round(r[1].z - 0.5)) != 0) {
			break
		}
	}
	if (tries >= 100 && r[0] < 10) {
		tries = 0
		r[1].x -= Math.sin(camera.rot.y) * Math.cos(camera.rot.x + Math.PI) * 1
		r[1].y += Math.sin(camera.rot.x + Math.PI) * 1
		r[1].z -= Math.cos(camera.rot.y) * Math.cos(camera.rot.x + Math.PI) * 1
		while (tries < 100 && r[0] < 10) {
			r[1].x -= Math.sin(camera.rot.y) * Math.cos(camera.rot.x + Math.PI) * 0.01
			r[1].y += Math.sin(camera.rot.x + Math.PI) * 0.01
			r[1].z -= Math.cos(camera.rot.y) * Math.cos(camera.rot.x + Math.PI) * 0.01
			tries += 1
			if (getBlock(Math.round(r[1].x - 0.5), Math.round(r[1].y - 0.5), Math.round(r[1].z - 0.5), false, false, false, true) != 0) {
				break
			}
		}
	}

	indicator.pos = { x: Math.round(r[1].x + 0.5) - 0.5, y: Math.round(r[1].y + 0.5) - 0.5, z: Math.round(r[1].z + 0.5) - 0.5 }
	indicator.visible = r[0] < 10 && getBlock(indicator.pos.x, indicator.pos.y, indicator.pos.z, false, false, false, true) != 0
	indicator.update()

    username = usernameBox.text

	// if (raycast3D(ct, camera.rotation, 3)[0] > 0.1) {
	// 	cameraOff.x += (ct.x-cameraOff.x)/5
	// 	cameraOff.y += (ct.y-cameraOff.y)/5
	// 	cameraOff.z += (ct.z-cameraOff.z)/5
	// } else {
	// 	cameraOff.x += (player.pos.x-cameraOff.x)/5
	// 	cameraOff.y += (player.pos.y-cameraOff.y)/5
	// 	cameraOff.z += (player.pos.z-cameraOff.z)/5
	// }

	// var raycast = raycast3D(cameraOff, camera.rotation, 3)
	// while (raycast[0] < 0.25 && distance(cameraOff, player.pos) > 0.1) {
	// 	cameraOff.x += (player.pos.x-cameraOff.x)/5
	// 	cameraOff.y += (player.pos.y-cameraOff.y)/5
	// 	cameraOff.z += (player.pos.z-cameraOff.z)/5
	// 	raycast = raycast3D(cameraOff, camera.rotation, 3)
	// }

	// target.position.set(player.pos.x, player.pos.y, player.pos.z)
	// light.position.set(player.pos.x+off.x, player.pos.y+off.y, player.pos.z+off.z)
	// light.shadow.camera.left = -80
	// light.shadow.camera.right = 80
	// light.shadow.camera.far = 80
	// light.shadow.camera.near = -80
	// light.shadow.camera.top = 80
	// light.shadow.camera.bottom = -80
	// light.shadow.camera.updateProjectionMatrix()

	for (let player in players) {
		if (!playerData[player]) {
			players[player].delete()
			delete players[player]
			return
		}
		if (!playerData[player].ig) {
			chat.push((playerData[player].u ? playerData[player].u : "Unnamed") + " left :(")
			if (chat.length > 5) {
				chat.splice(0, 1)
			}
			chatBox.stop = 3

			players[player].delete()
			delete players[player]
			delete playerData[player]
			return
		}
	}

	for (let player in playerData) {
		if (playerData[player] && player != id) {
			if (playerData[player].ig && !players[player]) {
				players[player] = new Player(0, 0, 0)
				joining.push(player)
			}
		}
	}

	var gplayer = player
	for (let player in players) {
		if (!playerData[player]) { continue }
        if (!playerData[player].ig) {
            players[player].visible = false
            return
        }
        players[player].visible = true
		players[player].pos2.x = interp(players[player].pos2.x, playerData[player].x, 15, 10)
		players[player].pos2.y = interp(players[player].pos2.y, playerData[player].y, 15, 10)
		players[player].pos2.z = interp(players[player].pos2.z, playerData[player].z, 15, 10)
		players[player].pos.x = players[player].pos2.x - gplayer.wcpos.x
		players[player].pos.y = players[player].pos2.y - gplayer.wcpos.y
		players[player].pos.z = players[player].pos2.z - gplayer.wcpos.z
		players[player].speedF += (playerData[player].sf - players[player].speedF) * delta * 10
		players[player].cameraY += (playerData[player].cy - players[player].cameraY) * delta * 10
		// players[player].cameraY = playerData[player].cy
		players[player].rotating -= 1
		if (itemData[playerData[player].i]) {
			players[player].selectedItem = playerData[player].i
		}

		players[player].handRotOffset += players[player].hroVel * delta
		players[player].hroVel -= 1000 * delta

		if (players[player].handRotOffset < 0) {
			players[player].handRotOffset = 0
		}

		if (players[player].rotating > 0) {
			players[player].rot.y += 0.25
		} else {
			players[player].rot.y = intAngle(players[player].rot.y, playerData[player].ry, 1 / 10)
		}

		players[player].headRot += (playerData[player].hr - players[player].headRot) / 10

		if (playerData[player].c == 0) {
			players[player].colour = [0, 0.5, 1]
		} else {
			players[player].colour = [1, 1, 1]
		}

		if (Object.keys(playerData[player]).includes("u")) {
			players[player].usernameText = playerData[player].u
		}
		// players[player].attack.pos = players[player].pos
		// players[player].attack.visible = false//players[player].attacking > 0
		// players[player].attack.size.x = (5-Math.abs(5 - players[player].attacking))/2
		// players[player].attack.size.y = (5-Math.abs(5 - players[player].attacking))/2
		// players[player].attack.size.z = (5-Math.abs(5 - players[player].attacking))/2
		// players[player].attack.update()
		players[player].attacking -= 1

		players[player].model[1].rot.x += (playerData[player].rx - players[player].model[1].rot.x) * delta * 15
		players[player].anim = anims[playerData[player].a]
		players[player].updateTexture(playerData[player].p)
		for (let model of players[player].model) {
			model.box.updateBuffers()
		}
		players[player].updateModel()
		// players[player].update()
		// if (playerData[player].username != null) {
		// 	players[player].username.text = playerData[player].username
		// 	players[player].username.pos = {...players[player].pos}
		// 	players[player].username.pos.y += 0.5
		// 	players[player].username.lookAtCam()
		// 	players[player].username.update()
		// }

	}

	// for (let set of sets) {
	// 	setBlock(set[0], set[1], set[2], set[3])
	// }

	// for (let chunk in world) {
	// 	world[chunk].updateShader()
	// }

	if (transparent.includes(getBlock(indicator.pos.x, indicator.pos.y, indicator.pos.z))) {
		if (indicator.box.rOrder == 0) {
			indicator.box.rOrder = 2000
			webgl.sortObjs()
		}
		indicator.box.rOrder = 2000
	} else {
		if (indicator.box.rOrder == 2000) {
			indicator.box.rOrder = 0
			webgl.sortObjs()
		}
		indicator.box.rOrder = 0
	}

	if (jKeys["KeyP"]) {
		thirdPerson = !thirdPerson
	}

	if (keys["KeyC"] && !inventoryOpen) {
		cameraYTarget = 0.25
	} else {
		cameraYTarget = 0.75
	}

	player.visible = rDistance > 0.5
	camera.pos = { ...player.pos }
	cameraY += (cameraYTarget - cameraY) * delta * 10
	camera.pos.y += cameraY

	// camera.position.set(cameraOff.x, cameraOff.y, cameraOff.z)

	if (thirdPerson) {
		rDistance += (4 - rDistance) * delta * 10
	} else {
		rDistance += (0 - rDistance) * delta * 10
	}

	if (rDistance > 0.5) {
		var raycast = raycast3D(camera.pos, { x: camera.rot.x + Math.PI, y: camera.rot.y, z: -camera.rot.z }, rDistance)
		camera.pos.x -= Math.sin(camera.rot.y) * Math.cos(camera.rot.x + Math.PI) * (raycast[0])
		camera.pos.y += Math.sin(camera.rot.x + Math.PI) * (raycast[0])
		camera.pos.z -= Math.cos(camera.rot.y) * Math.cos(camera.rot.x + Math.PI) * (raycast[0])
	}

	player.usernameText = username
	player.updateModel()

	let ds = []
	let ds2 = []
	for (let chunk2 in world) {
		var chunk = world[chunk2]
		var p = { x: chunk.pos.x * cs.x - player.wcpos.x + cs.x / 2, y: chunk.pos.y * cs.y - player.wcpos.y + cs.y / 2, z: chunk.pos.z * cs.z - player.wcpos.z + cs.z / 2 }
		chunk.mesh.rOrder = -1
		chunk.meshT.rOrder = Math.round(2000 - distance(camera.pos, p))
		chunk.updatePos()
		var diffy = Math.abs(p.y - camera.pos.y) + (cs.x + cs.z) / 2
		let visible = Math.abs(angleDistance(Math.atan2(p.z - camera.pos.z - Math.cos(camera.rot.y) * diffy, p.x - camera.pos.x - Math.sin(camera.rot.y) * diffy), -camera.rot.y - Math.PI / 2)) < Math.PI / 2
		chunk.forceVis += delta
		if (chunk.forceVis > 1) {
			chunk.forceVis = 1
			chunk.visible = true
		}
		chunk.mesh.visible = visible && chunk.visible
		chunk.meshT.visible = visible && chunk.visible
		if (chunk.visible) {
			var dx = Math.round(Math.sqrt((p.x - player.wcpos.x) ** 2 + (p.z - player.wcpos.z) ** 2) / cs.x)
			if (ds2.includes(dx)) {
				ds[ds2.indexOf(dx)][0] += 1
			} else {
				ds2.push(dx)
				ds.push([-dx, ds.length])
			}
		}
		// chunk.mesh.rOrder = 0
		// console.log(Math.round(2000-distance(camera.pos, p)))
		// chunk.meshT.rOrder = Math.round(2000-distance(camera.pos, p))
	}
	ds.sort((a, b) => a[0] - b[0])
	if (ds.length > 0) {
		fogDistance = ds2[ds[0][1]] * cs.x
	}

	// renderer.clear()
	// renderer.render(scene, camera)
	if (player.sprinting) {
		targetFOV = dFov+20
	} else {
		targetFOV = dFov
	}
	fov += (targetFOV - fov) * delta * 10

	view = mat4.create()
	mat4.translate(view, view, [camera.pos.x, camera.pos.y, camera.pos.z])
	mat4.rotateY(view, view, camera.rot.y)
	mat4.rotateX(view, view, camera.rot.x)
	mat4.rotateZ(view, view, camera.rot.z)
	mat4.invert(view, view)

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
	gl.clearColor(0.529, 0.808, 0.922, 1)
	gl.clear(gl.COLOR_BUFFER_BIT)
	gl.enable(gl.DEPTH_TEST)

	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
	mat4.perspective(projection, fov * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.01, 5000)

	webgl.render()

    renderUI()
}

setInterval(() => {
	if (showFPS) {
		console.log(frames)
	}
	newCPS = chunksLoaded
	chunksLoaded = 0
	newFPS = frames
	frames = 0
}, 1000)



function getSetPoses(sets) {
	let setsPos = []
	for (let set of sets) {
		setsPos.push([set[0], set[1], set[2]].join(","))
	}
	return setsPos
}

function addSets(sets2, replace = false, start = 0, setted = []) {
	let i2 = 0
	for (let set of sets2) {
		if (i2 < start) {
			i2++
			continue
		}
		if (set.length < 5) {
			set.push(replace)
		}
		set[4] = replace
		let pos = getPos(set[0], set[1], set[2])
		let c = [pos[0].x, pos[0].y, pos[0].z].join(",")
		if (!chunkSets[c]) {
			chunkSets[c] = []
		}
		let i = getSetPoses(chunkSets[c]).indexOf([set[0], set[1], set[2]].join(","))
		if (i != -1) {
			if (replace || ((setted.includes([set[0], set[1], set[2]].join(",")) || set[3] < chunkSets[c][i][3]) && !chunkSets[c][i][4])) {
				sets.push(set)
				chunkSets[c][i] = set
				setted.push([set[0], set[1], set[2]].join(","))
			}
		} else {
			sets.push(set)
			chunkSets[c].push(set)
			setted.push([set[0], set[1], set[2]].join(","))
		}
		i2++
		if (i2 - start > 100) {
			setTimeout(() => {
				addSets(sets2, replace, i2, setted)
			}, 100)
			return
		}
	}
}

function clearInv() {
	inventory = []
	for (let i = 0; i < 51; i++) {
		inventory.push(["none", 0])
	}
}

function getPlayersCode(doMenu=false) {
	let usernames = []
	for (let player in playerData) {
		let u = playerData[player].u
		if (!u) {
			u = "Unnamed"
		}
		if (!playerData[player].ig && !doMenu) {
			continue
		}
		usernames.push(u)
	}
	return usernames
}

function getPlayers() {
	let usernames = []
	for (let player in playerData) {
		let u = playerData[player].u
		if (!u) {
			u = "Unnamed"
		}
		if (!playerData[player].ig && !doMenu) {
			continue
		}
		usernames.push([u, player])
	}

	let str = "Players:"
	for (let username of usernames) {
		str += ` ${username[0]} (ID: ${username[1]})`
	}
	console.log(str)
}

function tp(id) {
	if (!Object.keys(playerData).includes(id)) {
		console.log("That player does not exist!")
		getPlayers()
		return
	}
	player.wpos.x = playerData[id].x
	player.wpos.y = playerData[id].y
	player.wpos.z = playerData[id].z
}
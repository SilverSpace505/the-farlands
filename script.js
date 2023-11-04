// settings
var world = {}
var chunks = {}
var sets = []
var chunkSets = {}
var borders = [
	new Object3D(0, 0, 0, 16, 16, 16),
	new Object3D(0, 0, 0, 16, 16, 16),
	new Object3D(0, 0, 0, 16, 16, 16),
	new Object3D(0, 0, 0, 16, 16, 16),
	new Object3D(0, 0, 0, 16, 16, 16),
	new Object3D(0, 0, 0, 16, 16, 16),
	new Object3D(0, 0, 0, 16, 16, 16),
]
var cameraOff = { x: 0, y: 0, z: 0 }
var offset = { x: -worldSize.x / 2, y: -worldSize.y - 0.5, z: -worldSize.z / 2 }
// var textureLoader = new THREE.TextureLoader()
var texture = new webgl.Texture("assets/blocks.png")
var alphaTexture = new webgl.Texture("assets/alpha.png")
var playerTexture = new webgl.Texture("assets/players.png")
var fontTexture = new webgl.Texture("assets/font.png")
var fontAlphaTexture = new webgl.Texture("assets/fontAlpha.png")
var skyTexture = new webgl.Texture("assets/sky.png")
var chunkTickCooldown = 0
var setTickCooldown = 0
var loadingChunks = []
var targetFOV = 60
var fov = 60
var cameraY = 0.75
var cameraYTarget = 0.75
var delta = 0
var fogDistance = 0
var blockBig = true

var mobile = false

var font = new FontFace("font", "url(assets/font.ttf)")
var fontLoaded = false
font.load().then(function(loadedFont) {
	fontLoaded = true
	document.fonts.add(loadedFont)
})

// var rando = []
// for (let i = 0; i < 1000; i++) {
// 	rando.push(Math.round(sRandom(i)*10+1))
// }
// console.log(rando)


// loader.load("assets/font.json", function(font2) {
//   font = font2
// })

var view = mat4.create()
const projection = mat4.create()

// sprites
var rp = { x: 0, y: 0, z: 0 }
var indicator = new Box(0, 0, 0, 1.025, 1.025, 1.025, [1, 1, 1])
for (let i = 0; i < 6; i++) {
	indicator.box.uvs.push(
		3 * blockSize.x, 2 * blockSize.y,
		3 * blockSize.x + blockSize.x, 2 * blockSize.y + blockSize.y,
		3 * blockSize.x + blockSize.x, 2 * blockSize.y,
		3 * blockSize.x, 2 * blockSize.y + blockSize.y,
	)
}
indicator.box.updateBuffers()
indicator.box.useTexture = true
indicator.box.texture = texture
indicator.box.useAlpha = true
indicator.box.alphaTexture = alphaTexture

var thirdPerson = false
var anims = ["idle", "walk", "jump", "run"]
var rDistance = 0
var players = {}
// x: 134.46097076958287, y: 13.250000000003208, z: 46.27446747936711
var player = new Player(cs.x / 2 + 0.5, worldSize.y, cs.z / 2 + 0.5)
player.real = true
var lastRounded = {}
var cSent = []
var toRender = []

// lighting
var time = 0
var aOff = { x: -0.5, y: 0.65, z: 0.25 }
var off = { x: -0.5, y: 0.65, z: 0.5 }
// var aLight = new THREE.AmbientLight(0xffffff, 1.25)
// scene.add(aLight)
var light = 0
// var light = new THREE.DirectionalLight(0xffffff, 0.75)
// light.position.set(off.x, off.y, off.z)
// light.castShadow = true
// light.shadow.mapSize.width = 4096
// light.shadow.mapSize.height = 4096
// light.shadow.bias = -0.0025
// scene.add(light)
// var target = new THREE.Object3D()
// target.position.set(0, 0, 0)
// scene.add(target)

// light.target = target

var chunkLoader = new Worker("threads/loader.js")

var worldPos = { x: 0, y: 0, z: 0 }
var canTick = true
var canSet = true
var canOrder = true
var order = 0

// variables
var collide = []
var meshes = []

var VERSION = 0
var saveData = {}

let skySize = 200
var sky = new webgl.Mesh(0, 100, 0, 1, 1, 1, [
	-1*skySize, 0, -1*skySize, 
	1*skySize, 0, 1*skySize, 
	-1*skySize, 0, 1*skySize, 
	1*skySize, 0, -1*skySize
], [0, 2, 1, 0, 3, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
sky.texture = skyTexture
sky.uvs = [0, 0, 1, 1, 0, 1, 1, 0]
sky.useTexture = true
sky.ignoreFog = true


sky.visible = true

sky.updateBuffers()

var username = "Unnamed"

var dFov = 60
var cameraTilt = 1

var saveDataLoaded = localStorage.getItem("data")
if (saveDataLoaded) {
	saveDataLoaded = JSON.parse(saveDataLoaded)
	if (saveDataLoaded.playerT) {
		playerT = saveDataLoaded.playerT
	}
	if (saveDataLoaded.renderSize) {
		renderSize = saveDataLoaded.renderSize
	}
	if (saveDataLoaded.chunkLoadSpeed) {
		chunkLoadSpeed = saveDataLoaded.chunkLoadSpeed
	}
	if (saveDataLoaded.sensitivity) {
		sensitivity = saveDataLoaded.sensitivity
	}
	if (saveDataLoaded.inventory) {
		inventory = saveDataLoaded.inventory
		for (let i in inventory) {
			if (!Object.keys(itemData).includes(inventory[i][0])) {
				inventory[i] = ["none", 0]
			}
		}
	}
	if (saveDataLoaded.wpos) {
		player.wpos = saveDataLoaded.wpos
	}
	if (saveDataLoaded.rot) {
		camera.rot = saveDataLoaded.rot
	}
	if (saveDataLoaded.selected) {
		selected = saveDataLoaded.selected
	}
	if (saveDataLoaded.fov) {
		dFov = saveDataLoaded.fov
	}
	if (saveDataLoaded.cameraTilt) {
		cameraTilt = saveDataLoaded.cameraTilt
	}
	if (saveDataLoaded.username) {
		username = saveDataLoaded.username
		updateUsernameBoxes()
	}
}

function updateUsernameBoxes() {
	usernameBox.text = username
	usernameBox2.text = username
}

// var drone = new Box(3, 2, 3, 1, 1, 1, [0.5, 0.5, 0.5])

var testText = new Text3D(2, 3, 2, "", 0.1)

var chat = []

var overlayA = 0
var overlayT = 0

var popupAlpha = 1
var popupT = 1

var overlay = new Canvas(uiCanvas.width/2, uiCanvas.height/2, uiCanvas.width, uiCanvas.height)
overlay.order = 1

function isCollidingBlock(object, x, y, z) {
	return isColliding3D(object.pos.x, object.pos.y, object.pos.z, object.size.x, object.size.y, object.size.z, x+0.5, y+0.5, z+0.5, 1, 1, 1)
}

function isCollidingWorld(object, t=false) {
	var round = { x: Math.round(object.pos.x - 0.5), y: Math.round(object.pos.y - 0.5), z: Math.round(object.pos.z - 0.5) }
	var check = []

	let non = []
	if (t) {
		non = noCol
	} else {
		non = none
	}

	// Center
	if (!non.includes(getBlock(round.x, round.y, round.z))) {
		if (isCollidingBlock(object, round.x, round.y, round.z)) { return true }
	}

	// X Dir
	if (!non.includes(getBlock(round.x + 1, round.y, round.z))) {
		if (isCollidingBlock(object, round.x + 1, round.y, round.z)) { return true }
	}
	if (!non.includes(getBlock(round.x - 1, round.y, round.z))) {
		if (isCollidingBlock(object, round.x - 1, round.y, round.z)) { return true }
	}

	// Z Dir
	if (!non.includes(getBlock(round.x, round.y, round.z + 1))) {
		if (isCollidingBlock(object, round.x, round.y, round.z + 1)) { return true }
	}
	if (!non.includes(getBlock(round.x, round.y, round.z - 1))) {
		if (isCollidingBlock(object, round.x, round.y, round.z - 1)) { return true }
	}

	// Y Dir
	if (!non.includes(getBlock(round.x, round.y + 1, round.z))) {
		if (isCollidingBlock(object, round.x, round.y + 1, round.z)) { return true }
	}
	if (!non.includes(getBlock(round.x, round.y - 1, round.z))) {
		if (isCollidingBlock(object, round.x, round.y - 1, round.z)) { return true }
	}

	// Corners - Top
	if (!non.includes(getBlock(round.x + 1, round.y + 1, round.z + 1))) {
		if (isCollidingBlock(object, round.x + 1, round.y + 1, round.z + 1)) { return true }
	}
	if (!non.includes(getBlock(round.x - 1, round.y + 1, round.z - 1))) {
		if (isCollidingBlock(object, round.x - 1, round.y + 1, round.z - 1)) { return true }
	}
	if (!non.includes(getBlock(round.x + 1, round.y + 1, round.z - 1))) {
		if (isCollidingBlock(object, round.x + 1, round.y + 1, round.z - 1)) { return true }
	}
	if (!non.includes(getBlock(round.x - 1, round.y + 1, round.z + 1))) {
		if (isCollidingBlock(object, round.x - 1, round.y + 1, round.z + 1)) { return true }
	}

	// Corners - Bottom
	if (!non.includes(getBlock(round.x - 1, round.y - 1, round.z - 1))) {
		if (isCollidingBlock(object, round.x - 1, round.y - 1, round.z - 1)) { return true }
	}
	if (!non.includes(getBlock(round.x + 1, round.y - 1, round.z + 1))) {
		if (isCollidingBlock(object, round.x + 1, round.y - 1, round.z + 1)) { return true }
	}
	if (!non.includes(getBlock(round.x - 1, round.y - 1, round.z + 1))) {
		if (isCollidingBlock(object, round.x - 1, round.y - 1, round.z + 1)) { return true }
	}
	if (!non.includes(getBlock(round.x + 1, round.y - 1, round.z - 1))) {
		if (isCollidingBlock(object, round.x + 1, round.y - 1, round.z - 1)) { return true }
	}

	// Edges - Top
	if (!non.includes(getBlock(round.x + 1, round.y + 1, round.z))) {
		if (isCollidingBlock(object, round.x + 1, round.y + 1, round.z)) { return true }
	}
	if (!non.includes(getBlock(round.x - 1, round.y + 1, round.z))) {
		if (isCollidingBlock(object, round.x - 1, round.y + 1, round.z)) { return true }
	}
	if (!non.includes(getBlock(round.x, round.y + 1, round.z - 1))) {
		if (isCollidingBlock(object, round.x, round.y + 1, round.z - 1)) { return true }
	}
	if (!none.includes(getBlock(round.x, round.y + 1, round.z + 1))) {
		if (isCollidingBlock(object, round.x, round.y + 1, round.z + 1)) { return true }
	}

	// Edges - Bottom
	if (!non.includes(getBlock(round.x - 1, round.y - 1, round.z))) {
		if (isCollidingBlock(object, round.x - 1, round.y - 1, round.z)) { return true }
	}
	if (!non.includes(getBlock(round.x + 1, round.y - 1, round.z))) {
		if (isCollidingBlock(object, round.x + 1, round.y - 1, round.z)) { return true }
	}
	if (!non.includes(getBlock(round.x, round.y - 1, round.z + 1))) {
		if (isCollidingBlock(object, round.x, round.y - 1, round.z + 1)) { return true }
	}
	if (!non.includes(getBlock(round.x, round.y - 1, round.z - 1))) {
		if (isCollidingBlock(object, round.x, round.y - 1, round.z - 1)) { return true }
	}

	// Edges - Sides
	if (!non.includes(getBlock(round.x + 1, round.y, round.z + 1))) {
		if (isCollidingBlock(object, round.x + 1, round.y, round.z + 1)) { return true }
	}
	if (!non.includes(getBlock(round.x - 1, round.y, round.z - 1))) {
		if (isCollidingBlock(object, round.x - 1, round.y, round.z - 1)) { return true }
	}
	if (!non.includes(getBlock(round.x - 1, round.y, round.z + 1))) {
		if (isCollidingBlock(object, round.x - 1, round.y, round.z + 1)) { return true }
	}
	if (!non.includes(getBlock(round.x + 1, round.y, round.z - 1))) {
		if (isCollidingBlock(object, round.x + 1, round.y, round.z - 1)) { return true }
	}
	for (let block of check) {
		if (block.isColliding([object])) {
			return true
		}
	}
	return false
}

function raycast3D(start, angle, distance) {
	var raycast2 = new Object3D(start.x, start.y, start.z, 0.01, 0.01, 0.01)
	var travel = 0
	while (travel < distance) {
		travel += 0.01
		raycast2.pos.x = start.x + Math.sin(angle.y) * Math.cos(angle.x + Math.PI) * travel
		raycast2.pos.y = start.y - Math.sin(angle.x + Math.PI) * travel
		raycast2.pos.z = start.z + Math.cos(angle.y) * Math.cos(angle.x + Math.PI) * travel
		if (isCollidingWorld(raycast2)) {
			break
		}
	}
	return [travel, raycast2.pos]
}

var tickTime = 0
var lastTime = 0

var scene = "menu"
var targetScene = "menu"

// render
function render(timestamp) {
	requestAnimationFrame(render)

	if (selectedItem[0] == "none") {
		safeInventory = copyInventory()
	}

	var w = window.innerWidth
	var h = window.innerHeight

	let aspect = w / h

	su = aspect
	if (su > targetSize.x / targetSize.y) {
		su = targetSize.x / targetSize.y
	}

	su *= screenScale

	canvas.width = targetSize.x * aspect / screenScale
	canvas.height = targetSize.x / screenScale
	gl.canvas.width = canvas.width
	gl.canvas.height = canvas.height

	cScale = w / canvas.width
	canvas.style.transform = `scale(${cScale})`
	cScale /= screenScale

	document.body.style.cursor = "default"

	uiCanvas.width = canvas.width * screenScale
	uiCanvas.height = canvas.height * screenScale
	uiCanvas.style.transform = `scale(${cScale})`
  	uictx.clearRect(0, 0, uiCanvas.width, uiCanvas.height)
	uictx.imageSmoothingEnabled = false

	overlay.width = uiCanvas.width
	overlay.height = uiCanvas.height
	overlay.x = overlay.width/2
	overlay.y = overlay.height/2
	overlay.bounds.maxX = overlay.width
	overlay.bounds.maxY = overlay.height

	overlay.clear(false)

	recipesScroll.x = (82.5*4 + 83*4/2)*su
	recipesScroll.y = 61*4/2*su
	recipesScroll.width = 86*4*su
	recipesScroll.height = 61*4*su
	recipesScroll.bounds.minY = (-64*rows + 61*4)*su
	recipesScroll.bounds.maxX = 86*4*su
	recipesScroll.bounds.maxY = 61*4*su
	recipesScroll.clear(false)

	devlog.clear(false)
	
	delta = (timestamp - lastTime) / 1000
	lastTime = timestamp
	if (!delta) { delta = 0 }
	if (delta > 0.1) { delta = 0.1 }

	tickTime += delta
	time = Date.now() / 1000

	if (scene == "game") {
		gameTick()
	} else {
		menuTick()
	}

	downTime += delta

	if (username.length > 15) {
		username = username.substring(0, 15)
        updateUsernameBoxes()
	}

	saveData = {
		version: VERSION,
		playerT: playerT,
		renderSize: renderSize,
		chunkLoadSpeed: chunkLoadSpeed,
		sensitivity: sensitivity,
		inventory: safeInventory,
		wpos: player.wpos,
		rot: camera.rot,
		selected: selected,
		username: username,
		fov: dFov,
		cameraTilt: cameraTilt,
	}

	localStorage.setItem("data", JSON.stringify(saveData))

	overlayA += (overlayT - overlayA) * delta * 5

	if (Math.abs(overlayT - overlayA) < 0.01 && overlayT == 1 && scene != targetScene) {
		overlayT = 0
		scene = targetScene
		if (scene == "game") {
			connecting = 120
			overlayT = 1
			thirdPerson = false
			usernameBox.text = username
			setTimeout(() => {
				overlayT = 0
				chat = []
				sendWelcome()
			}, 2000)
		}
		if (scene != "game") {
			usernameBox2.text = username
			backButton.reset()
		}
		if (scene == "menu") {
			playButton.reset()
			optionsButton.reset()
			htpButton.reset()
		}
	}

	if (connected) {
		popupT = 0
		if (connecting > 0 && scene == "game") {
			popupT = 1
		}
	} else {
		chat = []
		if (scene != "disconnected") {
			popupT = 1
		}
		for (let player in players) {
			players[player].delete()
		}
		players = {}
		playerData = {}
	}

	ui.rect(overlay.ctx, uiCanvas.width/2, uiCanvas.height/2, uiCanvas.width, uiCanvas.height, [0, 0, 0, overlayA])

	popupAlpha += (popupT - popupAlpha) * delta * 10

	if (popupAlpha < 0) {
		popupAlpha = 0
	}

	overlay.ctx.globalAlpha = popupAlpha

	ui.rect(overlay.ctx, 10*su + 58.5*su, uiCanvas.height-20*su - 85*su + 25*su, 140*su, 100*su, [0, 0, 0, 0.5])
	if (!connected && scene != "disconnected") {
		ui.text(overlay.ctx, 10*su, uiCanvas.height-20*su - 110 * su + 25*su, 20*su, "Connecting")
		ui.img(overlay.ctx, 10*su + 58.5*su, uiCanvas.height-20*su - 50 * su + 25*su, 100 * su, 100 * su, connectingImg, 
			{use: true, x: (Math.round(time*100 / 32)*32) % (192), y: 0, width: 32, height: 32}
		)
	} else if (scene == "game") {
		ui.text(overlay.ctx, 10*su, uiCanvas.height-20*su - 110 * su + 25*su, 16*su, "Loading World")
		ui.img(overlay.ctx, 10*su + 58.5*su, uiCanvas.height-20*su - 50 * su + 25*su, 100 * su, 100 * su, loadingImg, 
			{use: true, x: (Math.round(time*250 / 32)*32) % (256), y: 0, width: 32, height: 32}
		)
	}
	

	overlay.ctx.globalAlpha = 1

	updateInput()
}

// setInterval(orderTick, 1000/ordersPerSecond)
requestAnimationFrame(render)

function scrollElements(x, y) {
	if (recipesScroll.hasPoint(mouse.x, mouse.y) && scene == "game") {
		recipesScroll.ctx.off.x -= x
		recipesScroll.ctx.off.y -= y
	}
	if (devlog.hasPoint(mouse.x, mouse.y) && scene == "menu") {
		devlog.ctx.off.x -= x
		devlog.ctx.off.y -= y
	}
}

function checkInputs(event) {
	let wasFocused = focused
	if (focused) {
		focused.focused = false
		focused = null
	}

	if (inventoryOpen && tab == "options" && scene == "game") {
		usernameBox.checkFocus(event)
	}

	if (scene == "options") {
		usernameBox2.checkFocus(event)
	}

	if (!focused) {
		getInput.blur()
	}
}

function interp(x, y, mul=10, cut=-1) {
	if (cut != 1) {
		if (Math.abs(y - x) > cut) {
			return y
		}
	}
	return x + (y - x)*delta*10
}

function falseDisconnect() {
	scene = "disconnected"
	ws.close()
}
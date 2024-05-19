webgl.setup()
webgl.setStyles()
// ui setup
utils.setup()
utils.ignoreSafeArea()
utils.setStyles()
ui.setFont("font", "assets/font.ttf")
ui.targetSize = {x: 1300, y: 824}

glcanvas.style.position = "absolute"
glcanvas.style.left = 0
glcanvas.style.top = 0
document.body.style.overflow = "hidden"

var sensitivity = 0.005
var camera = {pos: {x: -2, y: 5, z: 5}, rot: {x: 0, y: -Math.PI/2-Math.PI*1000, z: 0}}
// var camera = new THREE.PerspectiveCamera(75, 1, 0.001, 1000)
// var renderer = new THREE.WebGLRenderer({canvas: canvas})
// renderer.setSize(960, 576)

var gl = glcanvas.getContext("webgl2", { antialias: false })
// renderer.sortObjects = true
// renderer.sortObjects = true
// renderer.autoClear = false
// renderer.premultipliedAlpha = true
// renderer.logarithmicDepthBuffer = true;
// renderer.autoClear = false
// renderer.setClearColor(0x000000, 0)
// renderer.autoClearColor = false;
// renderer.alpha = true;
// renderer.sortObjects = true
// renderer.sortObjects = THREE.SimpleSort
// renderer.setPixelRatio(window.devicePixelRatio);
// camera.rotation.order = "YXZ"
// camera.aspect = 1368/796
// camera.logarithmicDepthBuffer = true
// camera.updateProjectionMatrix()

// THREE.js scene settings
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFShadowMap

var screenScale = 1
var targetSize = {x: 1300*screenScale, y: 824*screenScale}
var cScale = 1
var joyStickPos = {x: 0, y: 0}

// Username setup

var crosshair = new Image()
crosshair.src = "assets/target.png?v="+Date.now()
var crosshairDash = new Image()
crosshairDash.src = "assets/target dash.png?v="+Date.now()
var inventoryImg = new Image()
inventoryImg.src = "assets/inventory.png?v="+Date.now()
var itemsImg = new Image()
itemsImg.src = "assets/items.png?v="+Date.now()
var playerImg = new Image()
playerImg.src = "assets/players.png?v="+Date.now()
var connectingImg = new Image()
connectingImg.src = "assets/connecting.png?v="+Date.now()
var loadingImg = new Image()
loadingImg.src = "assets/loading.png?v="+Date.now()

// Vars
var frames = 0
var fps = 0
var newFPS = 0
var chunksLoaded = 0
var cps = 0
var newCPS = 0

var mobileL = false
var mobileR = false

// var fragmentShader = `
//   varying vec2 vUv;
// 	varying vec3 vWorldPosition;
//   uniform sampler2D texture;
//   uniform sampler2D alphaMap;
// 	uniform vec3 cameraPos;
//  	uniform float light;
// 	varying vec3 vColor;

// 	float tanh(float x) {
//   	return (exp(2.0 * x) - 1.0) / (exp(2.0 * x) + 1.0);
// 	}
  
//   void main() {
//     vec4 color2 = texture2D(texture, vUv);
//     float alpha = 1.0-texture2D(alphaMap, vUv).r;
// 		float distance2 = floor(distance(vWorldPosition, cameraPos)+1.0)/500.0;
// 		distance2 = tanh(distance2);
// 		if (distance2 > 0.9) {
// 			distance2 = 0.9;
// 		}
// 		distance2 = 1.0-distance2;
// 		float mul = (500.0*distance2);
// 		mul = 500.0;
// 		vec2 uv = vec2(mod(vUv.x, 1.0/4.0)*4.0, mod(vUv.y, 1.0/3.0)*3.0);
// 		if ((mod((uv.x+uv.y)*mul, 1.0*alpha+1.0) < 1.0-alpha) && alpha < 1.0) {
// 	 		discard; 
// 		}
// 		float d = distance(vWorldPosition, cameraPos)/3.0;
// 		if (d > 1.0) {
// 			d = 1.0;
// 		}
// 		float cool = (1.0-d)*2.0;
// 		if (cool < light) {
// 			cool = light;
// 		}
// 		// gl_FragColor = vec4(vColor, 1.0);
// 		gl_FragColor = vec4(color2.r*vColor.r, color2.g*vColor.g, color2.b*vColor.b, 1.0);
// 		// gl_FragColor = vec4(1.0-alpha, 1.0-alpha, 1.0-alpha, 1.0);
// 		// gl_FragColor = vec4(floor(mod(floor(uv.x*10.0+0.5) + floor(uv.y*10.0+0.5), 1.9)), 0.0, 0.0, 1.0);
//   }
// `

/*
-> cool blue effect
var fragmentShader = `
  varying vec2 vUv;
	varying vec3 vWorldPosition;
  uniform sampler2D texture;
  uniform sampler2D alphaMap;
	uniform vec3 cameraPos;
  
  void main() {
    vec4 color = texture2D(texture, vUv);
    float alpha = texture2D(alphaMap, vUv).r;
		float mul = (1.0-alpha)*250.0;
		float distance2 = distance(vWorldPosition, cameraPos)/3.0;
		if (distance2 > 1.0) {
			distance2 = 1.0;
		}
		distance2 = 1.0-distance2;
		vec2 uv = vec2(mod(vUv.x, 1.0/4.0)*4.0, mod(vUv.y, 1.0/3.0)*3.0);
    if (alpha == 0.0 || (mod(floor(uv.x*mul+0.5)+floor(uv.y*mul+0.5), 2.0) != 0.0 && alpha != 1.0)) {
      discard;
    }
    gl_FragColor = color;
		gl_FragColor = vec4(color.r, color.g, color.b+distance2, 1.0);
  }
`
*/

input.onClick = (event) => {
	input.checkInputs(event)
	let x = 81*4*su
	if (tab == "backpack") {
		x = 165*4*su
	}
	if (!((mouse.x < x && mouse.y < 176*4*su) || (mouse.x > canvas.width - 100*su-20*su && mouse.y < 50*su+10*su)) && scene == "game") {
		input.lockMouse()
		mouse.locked = true
	}

	if (scene == "menu") {
		if (playButton.hovered() && connected && overlayT == 0) {
			overlayT = 1
			playButton.click()
			targetScene = "game"
			menuButtonG.reset()
			input.lockMouse()
			mouse.lclick = false

			chunks = {}
			for (let chunk in world) {
				world[chunk].delete()
			}
			world = {}
			sets = []
			chunkSets = {}
			loadingChunks = []
		}
	}

	if (discordButton.hovered() && mouse.lclick && scene == "menu") {
        discordButton.click()
        window.open("https://discord.gg/UUxdvXTe4t", "_blank")
    }

	if (mobile && mouse.lclick && chatButton.hovered() && scene == "game") {
		chatButton.click()
		if (chatBox.focused) {
			input.focused.focused = false
			input.focused = null
			getInput.blur()
		} else {
			chatBox.focused = true
			input.focused = chatBox
			input.getInput.focus()
			input.getInput.value = chatBox.text
			chatBox.time = 0
			event.preventDefault()
		}
	}
}

input.touchstart = (event) => {
	for (let touch of event.changedTouches) {
		input.touches[touch.identifier] = {x: touch.clientX/ui.scale, y: touch.clientY/ui.scale}

		if (scene == "game" && mouse.locked && buildButton.hovered("none", input.touches[touch.identifier])) {
			mobileR = true
			buildButton.click()
		}
		if (scene == "game" && mouse.locked && breakButton.hovered("none", input.touches[touch.identifier])) {
			mobileL = true
			breakButton.click()
		}
	}

	input.mouse.ldown = true
	input.mouse.has = true
	input.mobile = true
	input.moved = 0
	input.downTime = 0
	input.mouse.x = event.touches[0].clientX/ui.scale
	input.mouse.y = event.touches[0].clientY/ui.scale
	event.preventDefault()

	input.touches = {}
	for (let touch of event.touches) {
		input.touches[touch.identifier] = {x: touch.clientX/ui.scale, y: touch.clientY/ui.scale}
	}
}

var hasMouse = true

input.mouseMove = (event) => {
	hasMouse = true
	if (input.isMouseLocked() && connecting <= 0 && scene == "game") {
		camera.rot.x -= event.movementY*sensitivity
		if (camera.rot.x > Math.PI/2*0.99) {
			camera.rot.x = Math.PI/2*0.99
		}
		if (camera.rot.x < -Math.PI/2*0.99) {
			camera.rot.x = -Math.PI/2*0.99
		}
		camera.rot.y -= event.movementX*sensitivity	
	} else {
		input.mouse.x = event.clientX / ui.scale
		input.mouse.y = event.clientY / ui.scale
	}
}

function checkValidClick() {
	if (mobile) {
		// if ((mouse.x < 350*su && mouse.y < 100*su) || mouse.y > uiCanvas.height-100*su || (mouse.x < 400*su && mouse.y > uiCanvas.height-400*su)) {
		// 	return false
		// }
		// return false
		return mobileL || mobileR
	}
	return true
}

input.setGlobals()

document.addEventListener("mouseleave", () => {
	mouse.has = false
})

document.addEventListener("mouseenter", () => {
	mouse.has = true
})

input.keyPress = (event) => {
	if ((event.code == "Tab" || event.code == "KeyI" || event.code == "Escape" || event.code == "KeyO") && scene == "game") {
		if (input.isMouseLocked()) {
			input.unlockMouse()
			if (event.code == "KeyI") {
				tab = "backpack"
			}
			if (event.code == "KeyO") {
				tab = "options"
			}
		} else {
			input.lockMouse()
		}
	}

	if (event.code == "Tab") {
		event.preventDefault()
	}
}

input.keyPressAlways = (event) => {
	if (input.focused && event.code == "Enter") {
		if (input.focused == chatBox && input.focused.text.length > 0) {
			input.focused.text = input.focused.text.replace("\n", "")
			if (blockBig) {
				input.focused.text = input.focused.text.substring(0, 30)
			}
			
			chat.push((usernameBox.text ? usernameBox.text : "Unnamed") + ") " + input.focused.text)
			sendMsg({chat: (usernameBox.text ? usernameBox.text : "Unnamed") + ") " + input.focused.text})
			focused.text = ""
			if (chat.length > 5) {
				chat.splice(0, 1)
			}
			
		}
		input.focused.focused = false
		input.focused = null
		input.getInput.blur()
	}
}

function updateInput2() {
	mobileL = false
	mobileR = false
	if (!mouse.ldown) {
		joyStickPos.x = 0
		joyStickPos.y = 0
	}

	if (mobile && mouse.locked && scene == "game") {
		keys["KeyW"] = joyStickPos.y < -0.25
		keys["KeyS"] = joyStickPos.y > 0.25
		keys["KeyD"] = joyStickPos.x > 0.25
		keys["KeyA"] = joyStickPos.x < -0.25

		player.sprinting = Math.sqrt((joyStickPos.x)**2+(joyStickPos.y)**2) > 0.9
	}
}

input.touchMove = (event) => {
	for (let touch of event.changedTouches) {
		if (!input.touches[touch.identifier]) {
			continue
		}
		let deltaMove = {x: touch.clientX/ui.scale - input.touches[touch.identifier].x, y: touch.clientY/ui.scale - input.touches[touch.identifier].y}

		input.touches[touch.identifier] = {x: touch.clientX/ui.scale, y: touch.clientY/ui.scale}

		input.moved += Math.abs((deltaMove.x+deltaMove.y)/2)

		if (mouse.locked && !(input.touches[touch.identifier].x < 400*su && input.touches[touch.identifier].y > canvas.height-500*su)) {
			camera.rot.x -= deltaMove.y*sensitivity
			if (camera.rot.x > Math.PI/2*0.99) {
				camera.rot.x = Math.PI/2*0.99
			}
			if (camera.rot.x < -Math.PI/2*0.99) {
				camera.rot.x = -Math.PI/2*0.99
			}
			camera.rot.y -= deltaMove.x*sensitivity	
		}

		input.scroll(-deltaMove.x/ui.scale, -deltaMove.y/ui.scale)
	}
	
	input.mouse.x = event.touches[0].clientX/ui.scale
	input.mouse.y = event.touches[0].clientY/ui.scale
	input.mobile = true
	input.mouse.has = true
	input.mouse.ldown = true

	input.touches = {}
	for (let touch of event.touches) {
		input.touches[touch.identifier] = {x: touch.clientX/ui.scale, y: touch.clientY/ui.scale}
	}
}

input.touchStart = (event) => {
	for (let touch of event.changedTouches) {
		input.touches[touch.identifier] = {x: touch.clientX/ui.scale, y: touch.clientY/ui.scale}
		let oldMouse = input.mouse
		input.mouse = input.touches[touch.identifier]
		if (scene == "game" && mouse.locked && buildButton.hovered()) {
			mobileR = true
			buildButton.click()
		}
		if (scene == "game" && mouse.locked && breakButton.hovered()) {
			mobileL = true
			breakButton.click()
		}
		input.mouse = oldMouse
	}

	input.mouse.ldown = true
	input.mouse.has = true
	input.mobile = true
	input.moved = 0
	input.downTime = 0
	input.mouse.x = event.touches[0].clientX/ui.scale
	input.mouse.y = event.touches[0].clientY/ui.scale
	event.preventDefault()

	input.touches = {}
	for (let touch of event.touches) {
		input.touches[touch.identifier] = {x: touch.clientX/ui.scale, y: touch.clientY/ui.scale}
	}
}
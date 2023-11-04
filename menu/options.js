
var hrd2 = createSlider(0, 0, 2, 12)
var vrd2 = createSlider(0, 0, 2, 4)
var cls2 = createSlider(0, 0, 1, 5)
var ms2 = createSlider(0, 0, 1, 10)
var fov2 = createSlider(0, 0, 30, 120)
var ct2 = createSlider(0, 0, 1, 10)

var upSkin2 = new Button(0, 0, 12*4, 12*4, "img")
upSkin2.img = inventoryImg
upSkin2.clip = {use: true, x: 48, y: 176+16, width: 16, height: 16}
var downSkin2 = new Button(0, 0, 12*4, 12*4, "img")
downSkin2.img = inventoryImg
downSkin2.clip = {use: true, x: 32, y: 176+16, width: 16, height: 16}

var usernameBox2 = new TextBox(150, 525, 200, 20, "Username")
usernameBox2.outlineSize = 5

function optionsTick() {
    let w = uiCanvas.height*(2286/1283)
    if (uiCanvas.width > 2286) {
        w = uiCanvas.width
    }
    ui.img(uictx, uiCanvas.width/2, uiCanvas.height/2, w, uiCanvas.height, bgImg)
    ui.text(uictx, uiCanvas.width/2, 40*su, 40*su, "Options", "center")

    ui.text(uictx, uiCanvas.width/2-300*su, 150*su, 30*su, "Profile", "center")

    usernameBox2.x = uiCanvas.width/2-300*su
    usernameBox2.y = 190*su
    usernameBox2.width = 300*su
    usernameBox2.height = 30*su
    usernameBox2.outlineSize = 7.5*su

    username = usernameBox2.text

    usernameBox2.hover()

    usernameBox2.draw(uictx)

    upSkin2.x = uiCanvas.width/2-300*su - 65*su
    upSkin2.y = 260*su
    upSkin2.width = 18*4*su
    upSkin2.height = 18*4*su

    downSkin2.x = uiCanvas.width/2-300*su - 65*su
    downSkin2.y = 260*su + 18*4*su
    downSkin2.width = 18*4*su
    downSkin2.height = 18*4*su

    upSkin2.basic()
    downSkin2.basic()

    upSkin2.draw(uictx)
    downSkin2.draw(uictx)

    ui.img(uictx, uiCanvas.width/2-300*su + 18*4/2*su + 125/2*su - 65*su, 295*su, 125*su, 125*su, playerImg, {use: true, x: 32+playerT[0]*48, y: (playerSize2.y-1-playerT[1])*44, width: 8, height: 8})

    ui.text(uictx, uiCanvas.width/2-300*su, 380*su, 20*su, "Player Skin: "+ playerNames[playerT.join(",")], "center")

    var order = Object.keys(playerNames)

    if (upSkin2.hovered()) {
        if (mouse.lclick) {
            upSkin2.click()
            let i = order.indexOf(playerT.join(","))
            if (i > 0) {
                i -= 1
            } else {
                i = order.length-1
            }
            playerT = order[i].split(",")
            player.updateTexture(playerT)
        }
        let old = uictx.globalAlpha 
        uictx.globalAlpha = 0.25
        ui.img(uictx, upSkin2.x, upSkin2.y, upSkin2.visWidth, upSkin2.visHeight, inventoryImg, {use: true, x: 192, y: 176, width: 16, height: 16})
        uictx.globalAlpha = old
    }

    if (downSkin2.hovered()) {
        if (mouse.lclick) {
            downSkin2.click()
            let i = order.indexOf(playerT.join(","))
            if (i < order.length-1) {
                i += 1
            } else {
                i = 0
            }
            playerT = order[i].split(",")
            player.updateTexture(playerT)
        }
        let old = uictx.globalAlpha 
        uictx.globalAlpha = 0.25
        ui.img(uictx, downSkin2.x, downSkin2.y, downSkin2.visWidth, downSkin2.visHeight, inventoryImg, {use: true, x: 192, y: 176, width: 16, height: 16})
        uictx.globalAlpha = old
    }

    ui.text(uictx, uiCanvas.width/2+300*su, 150*su, 30*su, "Game", "center")

    ui.text(uictx, uiCanvas.width/2+300*su, 190*su, 20*su, "Horizontal Render Distance: "+renderSize.x, "center")
    hrd2.x = uiCanvas.width/2+300*su
    hrd2.y = 225*su
    hrd2.width = 32*4*su; hrd2.height = 16*4*su; hrd2.handleWidth = 16*4*su; hrd2.handleHeight = 16*4*su
    hrd2.value = renderSize.x
    hrd2.draw(uictx)
    if (hrd2.hovered()) {
        if (mouse.ldown) {
            hrd2.value = Math.round(hrd2.convert(mouse.x))
            hrd2.capValue()
            renderSize.x = hrd2.value
            renderSize.z = hrd2.value
        }
        highlightSlider(hrd2)
    }

    ui.text(uictx, uiCanvas.width/2+300*su, 190*su+75*su, 20*su, "Vertical Render Distance: "+renderSize.y, "center")
    vrd2.x = uiCanvas.width/2+300*su
    vrd2.y = 225*su+75*su
    vrd2.width = 32*4*su; vrd2.height = 16*4*su; vrd2.handleWidth = 16*4*su; vrd2.handleHeight = 16*4*su
    vrd2.value = renderSize.y
    vrd2.draw(uictx)
    if (vrd2.hovered()) {
        if (mouse.ldown) {
            vrd2.value = Math.round(vrd2.convert(mouse.x))
            vrd2.capValue()
            renderSize.y = vrd2.value
        }
        highlightSlider(vrd2)
    }

    ui.text(uictx, uiCanvas.width/2+300*su, 190*su+75*2*su, 20*su, "Chunk Load Speed: "+chunkLoadSpeed, "center")
    cls2.x = uiCanvas.width/2+300*su
    cls2.y = 225*su+75*2*su
    cls2.width = 32*4*su; cls2.height = 16*4*su; cls2.handleWidth = 16*4*su; cls2.handleHeight = 16*4*su
    cls2.value = chunkLoadSpeed
    cls2.draw(uictx)
    if (cls2.hovered()) {
        if (mouse.ldown) {
            cls2.value = Math.round(cls2.convert(mouse.x))
            cls2.capValue()
            chunkLoadSpeed = cls2.value
        }
        highlightSlider(cls2)
    }

    ui.text(uictx, uiCanvas.width/2+300*su, 190*su+75*3*su, 20*su, "Mouse Sensitivity: "+Math.round(sensitivity*1000), "center")
    ms2.x = uiCanvas.width/2+300*su
    ms2.y = 225*su+75*3*su
    ms2.width = 32*4*su; ms2.height = 16*4*su; ms2.handleWidth = 16*4*su; ms2.handleHeight = 16*4*su
    ms2.value = Math.round(sensitivity*1000)
    ms2.draw(uictx)
    if (ms2.hovered()) {
        if (mouse.ldown) {
            ms2.value = Math.round(ms2.convert(mouse.x))
            ms2.capValue()
            sensitivity = ms2.value/1000
        }
        highlightSlider(ms2)
    }

    ui.text(uictx, uiCanvas.width/2+300*su, 190*su+75*4*su, 20*su, "FOV: "+dFov, "center")
    fov2.x = uiCanvas.width/2+300*su
    fov2.y = 225*su+75*4*su
    fov2.width = 32*4*su; fov2.height = 16*4*su; fov2.handleWidth = 16*4*su; fov2.handleHeight = 16*4*su
    fov2.value = dFov
    fov2.draw(uictx)
    if (fov2.hovered()) {
        if (mouse.ldown) {
            fov2.value = Math.round(fov2.convert(mouse.x))
            fov2.capValue()
            dFov = fov2.value
        }
        highlightSlider(fov2)
    }

    ui.text(uictx, uiCanvas.width/2+300*su, 190*su+75*5*su, 20*su, "Camera Tilt: "+Math.round(ct2.value), "center")
    ct2.x = uiCanvas.width/2+300*su
    ct2.y = 225*su+75*5*su
    ct2.width = 32*4*su; ct2.height = 16*4*su; ct2.handleWidth = 16*4*su; ct2.handleHeight = 16*4*su
    ct2.value = (cameraTilt+0.5) * (10/5.5)
    ct2.draw(uictx)
    if (ct2.hovered()) {
        if (mouse.ldown) {
            ct2.value = Math.round(ct2.convert(mouse.x))
            ct2.capValue()
            cameraTilt = ct2.value/10 * 5.5 - 0.5
        }
        highlightSlider(ct2)
    }

    backButton.basic()

    backButton.draw(uictx)

    if (backButton.hovered() && mouse.lclick && overlayT == 0) {
        backButton.click()
        overlayT = 1
        targetScene = "menu"
    }

    if (backButton.hovered() && overlayT != 0) {
        document.body.style.cursor = "not-allowed"
    }
}
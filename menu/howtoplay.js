
function htpTick() {
    let w = uiCanvas.height*(2286/1283)
    if (uiCanvas.width > 2286) {
        w = uiCanvas.width
    }
    ui.img(uictx, uiCanvas.width/2, uiCanvas.height/2, w, uiCanvas.height, bgImg)
    ui.text(uictx, uiCanvas.width/2, 40*su, 40*su, "How to Play", "center")

    ui.text(uictx, uiCanvas.width/2-300*su, 150*su, 30*su, "Controls", "center")
    ui.text(uictx, uiCanvas.width/2-300*su, 190*su, 20*su, "WASD - Move \nSpace - Jump \nDouble tap W - Sprint \nShift - Crouch \nLeft Click - Build \nRight Click - Break \nG - Go back to spawn \nJ, K, L and ; - Switch player texture \nP - Toggle third person mode \n0-9 Switch held item \nI/ESC - Open/Close Inventory \nShift when crafting - Auto place result into inventory \nAlt when crafting - Craft max amount of recipe", "center")

    ui.text(uictx, uiCanvas.width/2+300*su, 150*su, 30*su, "Info", "center")
    ui.text(uictx, uiCanvas.width/2+300*su, 190*su, 20*su, "The farlands is a Indie game made by Silver. It's a game mainly focused around building things, although later more survival features will be added.", "center", 20*su/4.5, 400*su)

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

var reconnectButton = new ui.Button("rect", "Reconnect")

function disconnectedTick() {
    let w = uiCanvas.height*(2286/1283)
    if (w < canvas.width) {
        w = canvas.width
    }
    ui.img(uictx, uiCanvas.width/2, uiCanvas.height/2, w, uiCanvas.height, bgImg)

    ui.text(uictx, uiCanvas.width/2, uiCanvas.height/2 - 50*su, 40*su, "Disconnected", "center")

    reconnectButton.x = uiCanvas.width/2
    reconnectButton.y = uiCanvas.height/2
    reconnectButton.width = 200*su
    reconnectButton.height = 50*su
    reconnectButton.textSize = 30*su
    reconnectButton.bgColour = [0, 0, 0, 0.5]
    reconnectButton.hoverMul = 0.95
    
    reconnectButton.basic()
    reconnectButton.draw(uictx)

    if (reconnectButton.hovered() && mouse.lclick && overlayT == 0) {
        reconnectButton.click()
        overlayT = 1
        targetScene = "menu"
        connectToServer()
    }

    if (reconnectButton.hovered() && overlayT != 0) {
        document.body.style.cursor = "not-allowed"
    }
}
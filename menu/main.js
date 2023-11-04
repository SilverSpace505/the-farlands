
var playButton = new SideButton("Play")
playButton.bgColour = [0, 0, 0, 0.75]

var optionsButton = new SideButton("Options")
optionsButton.bgColour = [0, 0, 0, 0.75]

var htpButton = new SideButton("How to Play")
htpButton.bgColour = [0, 0, 0, 0.75]

var backButton = new SideButton("Back")
backButton.bgColour = [0, 0, 0, 0.75]

var bgImg = new Image()
bgImg.src = "assets/background.png?v="+Date.now()

var discordImg = new Image() 
discordImg.src = "assets/discord.png?v="+Date.now()

var discordButton = new Button(0, 0, 0, 0, "img")
discordButton.img = discordImg

var devlog = new Canvas(0, 0, 0, 0, [100, 100, 100, 1])

var devlogLines = 0

function menuTick() {

    backButton.x = 300/2*su
    backButton.y = uiCanvas.height/2 + 75*su * 3
    backButton.width = 300*su
    backButton.height = 70*su
    backButton.textSize = 35*su

    data = {
        ig: false,
        u: username
	}

    if (scene == "options") {
        optionsTick()
        return
    }
    if (scene == "howtoplay") {
        htpTick()
        return
    }
    if (scene == "disconnected") {
        disconnectedTick()
        return
    }

    let w = uiCanvas.height*(2286/1283)
    if (uiCanvas.width > 2286) {
        w = uiCanvas.width
    }
    ui.img(uictx, uiCanvas.width/2, uiCanvas.height/2, w, uiCanvas.height, bgImg)

    ui.text(uictx, uiCanvas.width/2, 75*su, (75+Math.sin(time)*2)*su, "The Farlands", "center")
   
    playButton.x = 500/2*su
    playButton.y = uiCanvas.height/2 - 75*su
    playButton.width = 500*su
    playButton.height = 70*su
    playButton.textSize = 35*su

    optionsButton.x = 500/2*su
    optionsButton.y = uiCanvas.height/2
    optionsButton.width = 500*su
    optionsButton.height = 70*su
    optionsButton.textSize = 35*su

    htpButton.x = 500/2*su
    htpButton.y = uiCanvas.height/2 + 75*su
    htpButton.width = 500*su
    htpButton.height = 70*su
    htpButton.textSize = 35*su

    if (connected) {
        playButton.basic()
    }

    optionsButton.basic()
    htpButton.basic()
    if (overlayT == 0 && mouse.lclick) {
        if (optionsButton.hovered()) {
            overlayT = 1
            targetScene = "options"
            optionsButton.click()
        }
        if (htpButton.hovered()) {
            overlayT = 1
            targetScene = "howtoplay"
            htpButton.click()
        }
    }

    playButton.draw(uictx)
    optionsButton.draw(uictx)
    htpButton.draw(uictx)

    if ((playButton.hovered()) && (!connected || overlayT != 0)) {
        document.body.style.cursor = "not-allowed"
    }
    if ((optionsButton.hovered() || htpButton.hovered()) && (overlayT != 0)) {
        document.body.style.cursor = "not-allowed"
    }

    let animOff = (Math.sin(time*5)+1)*20*su - 35*su

    discordButton.x = uiCanvas.width-20*su-100/2*su
    discordButton.y = uiCanvas.height-20*su-100/2*su - (animOff > 0*su ? animOff : 0)
    discordButton.width = 100*su
    discordButton.height = 100*su

    discordButton.basic()

    discordButton.draw(uictx)

    devlog.x = uiCanvas.width-348*su/2
    devlog.y = uiCanvas.height/2 + 25*su
    devlog.width = 350*su
    devlog.height = 500*su
    devlog.bounds.maxX = devlog.width
    devlog.bounds.maxY = devlog.height
    devlog.bounds.minY = -devlogLines * 15*su + devlog.height - 15*su

    devlog.clear()

    // devlog.ctx.globalAlpha = 1

    let devlogs = ""
    // devlogs += "[]  \n \n"
    devlogs += "[2023-10-15] Wall jumping and sliding, so now you can do some awesome parkour. \n \n"
    devlogs += "[2023-10-14] Full mobile support! So now you can play on any device! Anywhere you want. \n \n"
    devlogs += "[2023-10-12] Added the in game devlog list. \n \n"
    devlogs += "[2023-10-12] Fixed bugs with multiplayer (When being disconnected for being AFK it would not tell you and cause lots of issues). \n \n"
    devlogs += "[2023-10-11] Fixed some small bugs. \n \n"
    devlogs += "[2023-10-04] Fixed UI Scaling, fixed bugs in UI system. Joining and leaving in the menu now works properly. \n \n"
    devlogs += "[2023-10-01] Menu system, it's a big buggy but will be fixed soon. Now when being disconnected the page does not reload. \n \n"
    devlogs += "[2023-09-24] Optimisations. Hopefully it should be around +20 fps and more stability. When players leave and join messages are shown in chat, and a player list is shown when joining. \n \n"
    devlogs += "[2023-09-23] Chat system, and when in lava the screen goes orange. \n \n"
    devlogs += "[2023-09-23] Bug fixes, better flowers and grass. New Biomes: \n"
    devlogs += "* Snow Biome ( Pine Wood, Ice which you can slide on, Ice Ore, Ice Shard ) \n"
    devlogs += "* Desert Biome ( Cactus ) \n"
    devlogs += "* Jungle Biome ( Jungle wood & Jungle grass ) \n"
    devlogs += "* Molten Biome ( Magma, Lava Orb ore, Lava Orb ) \n \n"
    devlogs += "[2023-09-22] fixed bugs, added paths, grass and flowers. The way the flowers and grass is made is temporary. But for now the world looks a lot better. \n \n"
    devlogs += "[2023-09-21] UI scaling to make the game run better on more devices. \n \n"
    devlogs += "[2023-09-18] UI Recode. This will hopefully make the UI feel smoother, and run faster. I also made the recipes area scroll, which allows for infinite recipes which means more content :) \n \n"
    devlogs += "* See more on Discord *"

    devlogLines = ui.text(devlog.ctx, 10*su, 15*su, 15*su, devlogs, "left", 15*su/4.5, devlog.width-25*su)

    ui.rect(overlay.ctx, uiCanvas.width-350*su/2, uiCanvas.height/2 - 223*su-25*su, 350*su-5*su, 50*su, [100, 100, 100, 1], 5*su, [0, 0, 0, 1])
    // ui.rect(overlay.ctx, uiCanvas.width-350*su/2, uiCanvas.height/2 - 197.5*su, 350*su-5*su, 5*su, [100, 100, 100, 1])
    ui.text(overlay.ctx, uiCanvas.width-350*su/2, uiCanvas.height/2 - 223*su-25*su, 25*su, "Devlogs", "center")

    devlog.drawBorder(5*su, [0, 0, 0, 1])

    devlog.drawScroll()

    // playButton.draw(uictx)
}
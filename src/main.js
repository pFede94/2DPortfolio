import { scaleFactor, textDialog } from "./constants.js"
import { k } from "./kaboomCtx.js"
import { displayDialogue, setCamScale } from "./utils.js"

k.loadSprite("mc", "./Bob_16x16.png", {
  sliceX: 24,
  //divided the original rows (14) by 2
  sliceY: 7,
  //all the calculations are done with the new rows
  anims: {
    "idle-down": {from: 42, to: 47, loop: true, speed: 8},
    "walk-down": {from: 66, to: 71, loop: true, speed: 8},
    "idle-up": {from: 30, to: 35, loop: true, speed: 8},
    "walk-up": {from: 54, to: 59, loop: true, speed: 8},
    "idle-side": {from: 24, to: 29, loop: true, speed: 8},
    "walk-side": {from: 48, to: 53, loop: true, speed: 8}
  }
})
k.loadSprite("mapPB", "./2DPortafolioPB_v2.png")
k.loadSound("bgMusic", "./Homework.ogg")
k.loadSound("popup", "./cursor_style_2.ogg")

k.setBackground(k.Color.fromHex("#29b31d"))

k.scene("mainPB", async() => {
  //waits for the json to be loaded, contains the map data, such as boundaries
  const mapData = await (await fetch("./2DPortafolioPB_v2.json")).json()
  const layers = mapData.layers

  const map = k.add([
    k.sprite("mapPB"),
    k.pos(0),
    k.scale(scaleFactor)
  ])

  const player = k.make([
    k.sprite(
      "mc",
      { anim: "idle-down" }),
      k.area({
        //player hitbox
        //adjust depending the character
        shape: new k.Rect(k.vec2(0, 11), 10 , 10)
      }),
      k.body(),
      k.anchor("center"),
      k.pos(80,160),
      k.scale(scaleFactor),
      {
        speed: 300,
        direction: "down",
        isInDialogue: false
      },
      "player"
  ])
  //loops throught the layers in the json map data
  for(const layer of layers){
    //adds all the border collisions on the map
    if(layer.name === "limits"){
      for(const limit of layer.objects){
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), limit.width, limit.height)
          }),
          k.body({ isStatic: true }),
          k.pos(limit.x, limit.y),
          limit.name
        ])
        //checks if players is in contact with an object and displays the respective dialogue
        if (limit.name) {
          player.onCollide(limit.name, () => {
            //play pop-up sound
            k.play("popup", { volume: 0.5 })
            player.isInDialogue = true;
            displayDialogue(textDialog[limit.name], () => (player.isInDialogue = false));
            //freezes the player in the respective direction
            if(player.direction === "up"){
              player.play("idle-up")
              return
            }
            if(player.direction === "down"){
              player.play("idle-down")
              return
            }
            if(player.direction === "left"){
              player.play("idle-side")
              player.flipX = true
              return
            }
            if(player.direction === "right"){
              player.play("idle-side")
              player.flipX = false
              return
            }
          });
        }
      }
      continue
    }
    /* TODO adding new floor
    if(layer.name === "nextFloor"){
      go("1P")
    }
    */
    //spawns the player in the map
    if(layer.name === "spawn"){
      for(const object of layer.objects){
        if(object.name === "player"){
          player.pos = k.vec2( (map.pos.x + object.x) * scaleFactor, (map.pos.y + object.y) * scaleFactor)
          k.add(player)
          continue
        }
      }
    }
  }

  //camera scale to make responsive
  setCamScale(k)

  //background music
  const bgMusic = k.play("bgMusic", {
    volume: 0.5,
    loop: true
  })

  k.onResize(() => {
    setCamScale(k)
  })
  //camera following player
  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y)
  })

  //player movement
  k.onMouseDown((mouseBtn) => {
    if(mouseBtn !== "left" || player.isInDialogue){
      return
    }
    const worldMousePos = k.toWorld(k.mousePos())
    player.moveTo(worldMousePos, player.speed)

    //checks the vector angle of the camera and sets two angles as limits
    const mouseAngle = player.pos.angle(worldMousePos)
    const lowerBound = 50
    const upperBound = 125
    //checks if the camera angle its in between two angle limits and plays the respective animation
    if(mouseAngle > lowerBound && mouseAngle < upperBound && player.curAnim() !== "walk-up"){
      player.play("walk-up")
      player.direction = "up"
      return
    }
    if(mouseAngle < -lowerBound && mouseAngle > -upperBound && player.curAnim() !== "walk-down"){
      player.play("walk-down")
      player.direction = "down"
      return
    }
    if(Math.abs(mouseAngle) > upperBound){
      player.flipX = false;
      if(player.curAnim() !== "walk-side"){
        player.play("walk-side")
      }
      player.direction = "right"
      return
    }
    if(Math.abs(mouseAngle) < lowerBound){
      player.flipX = true;
      if(player.curAnim() !== "walk-side"){
        player.play("walk-side")
      }
      player.direction = "left"
      return
    }
  })
  k.onMouseRelease(() => {
    if(player.direction === "up"){
      player.play("idle-up")
      return
    }
    if(player.direction === "down"){
      player.play("idle-down")
      return
    }
    if(player.direction === "left"){
      player.play("idle-side")
      player.flipX = true
      return
    }
    if(player.direction === "right"){
      player.play("idle-side")
      player.flipX = false
      return
    }
  })
})

/*k.scene("1P", async() => {
  const mapData1P = await (await fetch("...")).json()
  const layers1P = mapData.layers
})*/

k.go("mainPB")

/*TODO: {
  -add the next floor that showcase the coding projects
  -transfer all the files in public to an online repository for more flexibility
  -add an arcade machine in the game to add a mini-game
  -add background music
  -add SFX
  -add minimalist basic music player
}*/
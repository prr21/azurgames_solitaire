import Phaser from "phaser"

import cardsAtlasJson from "../assets/cards/cards.json"
import cardsAtlasPng from "../assets/cards/cards.png"
import restartImage from "../assets/cards/restart.png"
import cupImage from "../assets/cards/cup.png"
import placeOgg from "../assets/cards/cardPlace.ogg"
import placeMp3 from "../assets/cards/cardPlace.mp3"

import { Table } from "./model"
import { Scoreboard } from "./scoreboard"
import { CardView, StackView } from "./views"
import { suitsMap, ranksMap } from "../types"
import { formatTime } from "../utils"

export class MainScene extends Phaser.Scene {
  _model: Table
  _scoreboard: Scoreboard
  _cardViews: Array<CardView>
  _stackViews: Array<StackView>

  constructor() {
    super()
    this._model = new Table()
    this._scoreboard = new Scoreboard()
    this._cardViews = []
    this._stackViews = []
  }

  preload() {
    this.load.atlas("cards", cardsAtlasPng, cardsAtlasJson)
    this.load.image("restart", restartImage)
    this.load.image("scoreboard-table", cupImage)
    this.load.audio("place", [placeOgg, placeMp3]) // problem on ios, use cordova plugin for audio
  }

  create() {
    this.startAnimation()

    this.fillStackViews()
    this.fillCardViews()

    this.initEvents()
    this.initTimer()
    this.initOnRestart()
    this.initOnOpenScoreboard()
  }

  update() {
    for (var i = 0; i < this._cardViews.length; i++) {
      this._cardViews[i].update()
    }
  }

  startAnimation() {
    // i did my best :D
    this.cameras.main.fadeFrom(400, 0, 0, 0)
  }

  fillStackViews() {
    const closedStackView = new StackView(this._model.closedUnusedStack, {
      scene: this,
      x: 10 + 70,
      y: 110,
    })
    const openedStackView = new StackView(this._model.openUnusedStack, {
      scene: this,
      cardOffsetX: 50,
      x: 10 + 70 + 150,
      y: 110,
    })
    // didn't find another solution
    const foldedStackView = new StackView(this._model.foldedStack, {
      scene: this,
      x: -1000,
    })

    const resultStackViews = this._model.resultStacks.map(
      (stack, k) =>
        new StackView(stack, {
          scene: this,
          x: 10 + 70 + 150 * (k + 3),
          y: 110,
        })
    )
    const workStackViews = this._model.workStacks.map(
      (stack, k) =>
        new StackView(stack, {
          scene: this,
          cardOffsetY: 50,
          x: 10 + 70 + 150 * k,
          y: 310,
        })
    )

    closedStackView.on("pointerdown", (pointer) =>
      this._model.switchToNextUnusedCards()
    )

    this._stackViews = [
      closedStackView,
      openedStackView,
      foldedStackView,
    ].concat(resultStackViews, workStackViews)
  }

  fillCardViews() {
    this._cardViews.push(
      ...this._model.cards.map(
        (card) =>
          new CardView(card, {
            scene: this,
            stackViews: this._stackViews,
            cardViews: this._cardViews,
            face: suitsMap[card.suit] + ranksMap[card.rank],

            x: 10 + card.rank * 50,
            y: 510 + card.suit * 200,
          })
      )
    )
  }

  initEvents() {
    this._model.on("move", () => this.sound.play("place"))
    this._model.on("win", (model) =>
      this._scoreboard.saveScoreboardRecord({
        moves: model.moves,
        time: model.time,
      })
    )
  }

  initTimer() {
    let timer
    const text = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "Timer: 0",
      {
        fontSize: "64px",
      }
    )

    this._model.on("timer:start", () => {
      this._model._time = 0

      timer = this.time.addEvent({
        delay: 1000,
        callback: () => {
          this._model._time += 1
          text.setText("Timer: " + formatTime(this._model._time))
        },
        loop: true,
      })
    })

    this._model.on("timer:stop", () => timer && timer.remove())
  }

  initOnOpenScoreboard() {
    this.scoreboardBtn = this.add.image(
      this.cameras.main.width - 70,
      this.cameras.main.height - 70,
      "scoreboard-table"
    )
    this.scoreboardBtn.scale = 0.5
    this.scoreboardBtn.setInteractive()
    this.scoreboardBtn.on("pointerdown", () => this._scoreboard.open())
  }

  initOnRestart() {
    this._model.restart()

    this.restartBtn = this.add.image(0, this.cameras.main.height, "restart")
    this.restartBtn.scale = 2
    this.restartBtn.setOrigin(0, 1)
    this.restartBtn.setInteractive()
    this.restartBtn.on("pointerdown", (pointer) => this._model.restart())
  }
}

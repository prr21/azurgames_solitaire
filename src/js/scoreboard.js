import EventEmitter from "events"

import { setToLocalStorage, getFromLocalStorage, formatTime } from "../utils"
import { ScoreboardRecord } from "../types"

export class Scoreboard extends EventEmitter {
  constructor() {
    super()
    this.table = document.getElementById("scoreboard")
    this.tbody = document.getElementById("scoreboard-content")
  }

  saveScoreboardRecord({ time, moves }) {
    const name = prompt("Name?", Math.random().toString(36).substr(2))
    if (!name) return

    const listOfScoreboardRecords = getFromLocalStorage("scoreboard")
    const scoreboardRecordData: ScoreboardRecord = {
      id: listOfScoreboardRecords.length + 1,
      name,
      time,
      moves,
      date: Date.now(),
    }
    listOfScoreboardRecords.push(scoreboardRecordData)

    const sortedScoreboard = listOfScoreboardRecords.sort(
      ({ time: a }, { time: b }) => a - b
    )
    setToLocalStorage("scoreboard", sortedScoreboard)
    this.open()
  }

  fillData() {
    // Было мало времени, чтобы реализовать таблицу на phaser
    const tbody = this.tbody
    const listOfScoreboardRecords = getFromLocalStorage("scoreboard")
    tbody.innerHTML = ""

    for (let i = 0; i < listOfScoreboardRecords.length; i++) {
      const tr = document.createElement("tr")
      const td = document.createElement("td")

      const { id, ...scoreboardRecordData } = listOfScoreboardRecords[i]
      const dataValues = Object.entries(scoreboardRecordData)

      td.innerText = i + 1
      tr.id = id
      tr.appendChild(td)

      dataValues.forEach(([key, value], i) => {
        const td = document.createElement("td")

        switch (key) {
          case "date":
            value = new Date(value).toLocaleString()
            break

          case "time":
            value = formatTime(value)
            break
            
          default: break
        }
        
        td.innerText = value
        tr.appendChild(td)
      })
      tbody.appendChild(tr)
    }
  }

  open() {
    this.fillData()
    this.table.hidden = false
    this.table.classList.toggle("fade-out")
    // if ((this.tween && this.tween !== null && this.tween.isRunning) || this.popup.scale.x === 1){
    //     return;
    // }

    // this.tween = this.add.tween(this.popup.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
  }
}

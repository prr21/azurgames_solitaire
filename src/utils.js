import { ScoreboardRecord } from "./types"

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  let partInSeconds = seconds % 60

  partInSeconds = partInSeconds.toString().padStart(2, "0")

  return `${minutes}:${partInSeconds}`
}

export function shuffle(arr: Array<any>): Array<any> {
  return [...arr.sort(() => Math.random() - 0.5)]
}

export function setToLocalStorage(key: string, value: any): void {
  if (typeof value === "object" || typeof value === "array") {
    value = JSON.stringify(value)
  }

  localStorage.setItem(key, value)
}

export function getFromLocalStorage(key: string): Array<ScoreboardRecord> {
  let item = localStorage.getItem(key) || "[]"
  return JSON.parse(item)
}

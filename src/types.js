export type CardViewOptions = {
  scene: Phaser.Scene,
  stackViews: Array<StackView>,
  cardViews: Array<CardView>,
  face: string,
  atlas: string | "cards",
  back: string | "back",
  x: integer | 0,
  y: integer | 0,
}

export type StackViewOptions = {
  scene: Phaser.Scene,
  atlas: string | "cards",
  back: string | "back",
  cardOffsetY: number | 0,
  cardOffsetX: number | 0,
  x: integer | 0,
  y: integer | 0,
}

export type Suit = 0 | 1 | 2 | 3
export const SuitValues: Array<Suit> = [0, 1, 2, 3]

export type Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 // ACE->2..10->J->Q->K
export const RankValues: Array<Rank> = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
]

export type ScoreboardRecord = {
  id: integer,
  name: string,
  time: number,
  moves: integer,
  date: integer,
}

export const suitsMap = {
  0: "spades",
  1: "diamonds",
  2: "clubs",
  3: "hearts",
}

export const ranksMap = {
  0: "Ace",
  1: "2",
  2: "3",
  3: "4",
  4: "5",
  5: "6",
  6: "7",
  7: "8",
  8: "9",
  9: "10",
  10: "Jack",
  11: "Queen",
  12: "King",
}

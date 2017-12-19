const fs = require('fs-extra')
const path = require('path')

const CHARS = {
  HORIZONTAL: '|',
  VERTICAL: '-',
  SPACE: ' ',
  CROSS: '+',
}

const DIRECTIONS = {
  TOP: [1, 0],
  BOTTOM: [-1, 0],
  RIGHT: [0, 1],
  LEFT: [0, -1]
}

class Packet {
  constructor (plan) {
    this.plan = plan
    this.currentPosition = []
    this.lastDirection = 'TOP'
    this.isTerminated = false
    this.letters = []
  }

  findFirstPosition () {
    this.currentPosition = [0, this.plan[0].reduce((c, a, i) => {
      c = a === CHARS.HORIZONTAL ? i : c
      return c
    })]
  }

  step () {
    let currentChar = this.plan[this.currentPosition[0]][this.currentPosition[1]]

    if (Packet.isLetter(currentChar)) {
      this.letters.push(currentChar)
    }

    switch (currentChar) {
      case CHARS.SPACE:
        this.isTerminated = true
        return

      case CHARS.CROSS:
        this.travelFromPosition(this.getPositionFromCross())
        break

      default:
        this.travelFromPosition(this.lastDirection)
        break
    }
  }

  travelFromPosition (direction) {
    this.currentPosition = this.currentPosition.map((n, i) => n + DIRECTIONS[direction][i])
    this.lastDirection = direction
  }

  getPositionFromCross () {
    let direction = Object.keys(DIRECTIONS)
      .map((dirKey) => {
        let direction = DIRECTIONS[dirKey]
        let [x, y] = [0, 1].map((a) => this.currentPosition[a] + direction[a] * -1)

        let character = (x < this.plan.length && y < this.plan[x].length) ? this.plan[x][y] : CHARS.SPACE
        return [character, dirKey]
      })
      .filter((([ch, dir]) => ch !== CHARS.SPACE && dir !== this.lastDirection)).reduce((c) => c)[1]

    return Packet.inverseDirection(direction)
  }

  static isLetter (str) {
    return str.charCodeAt(0) >= 'A'.charCodeAt(0) && str.charCodeAt(0) <= 'Z'.charCodeAt(0)
  }

  static inverseDirection (direction) {
    let inverseDirection = 'TOP'
    switch (direction) {
      case 'TOP':
        inverseDirection = 'BOTTOM'
        break
      case 'BOTTOM':
        inverseDirection = 'TOP'
        break
      case 'RIGHT':
        inverseDirection = 'LEFT'
        break
      case 'LEFT':
        inverseDirection = 'RIGHT'
        break
      default:
        console.error('LUL')
        break
    }
    return inverseDirection
  }
}

const solveFirstTask = (plan) => {
  let packet = new Packet(plan)

  packet.findFirstPosition()

  while (!packet.isTerminated) {
    packet.step()
  }

  return packet.letters.join('')
}

const solveTasks = (seq) => {

  let rawInstructions = (seq).split('\n').map((s) => [...s])

  console.log(solveFirstTask(rawInstructions))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))
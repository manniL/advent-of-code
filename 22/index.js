const fs = require('fs-extra')
const path = require('path')

const STATES = ['.', 'W', '#', 'F']

const DIRECTIONS = {
  TOP: [-1, 0],
  RIGHT: [0, 1],
  BOTTOM: [1, 0],
  LEFT: [0, -1]
}

const mod = (int, n) => {
  return ((int % n) + n) % n
}

class Map {
  constructor (plan, expandSize = 3E3, partTwo = false) {
    this.partTwo = partTwo
    this.plan = plan
    this.currentPosition = [0, 0]
    this.expandPlan(expandSize)
    this.currentPosition = this.determineMiddle()
    this.facing = 0
    this.infectCount = 0
  }

  determineMiddle () {
    return [Math.floor(this.plan.length / 2), Math.floor(this.plan[0].length / 2)]
  }

  expandPlan (size) {
    Array(size).fill(0).forEach(() => {
      this.plan.unshift([...'.'.repeat(this.plan[0].length)])
      this.plan.push([...'.'.repeat(this.plan[0].length)])
    })

    this.plan = this.plan.map((a) => {
      a.unshift(...'.'.repeat(size))
      a.push(...'.'.repeat(size))
      return a
    })
  }

  step () {
    if (this.willNodeBeInfected()) {
      this.infectCount++
    }

    this.changeNode()
    this.turn()
    this.moveForward()
  }

  willNodeBeInfected () {
    return this.currentStateNumber() === (this.partTwo ? 1 : 0)
  }

  currentStateNumber () {
    let currentState = this.currentState()
    return STATES.reduce((f, v, i) => v === currentState ? i : f, 0)
  }

  currentState () {
    let [x, y] = this.currentPosition
    return this.plan[x][y]
  }

  changeNode () {
    let [x, y] = this.currentPosition
    let partOneNewState = this.currentState() === '#' ? '.' : '#'
    let partTwoNewState = STATES[(this.currentStateNumber() + 1) % STATES.length]
    this.plan[x][y] = (this.partTwo) ? partTwoNewState : partOneNewState
  }

  turn () {
    let dirLen = Object.keys(DIRECTIONS).length
    let facingOffset = 0
    if (this.partTwo) {
      switch (this.currentState()) {
        case 'W':
          facingOffset = -1
          break
        case 'F':
          facingOffset = 1
          break
        case '.':
          facingOffset = 2
      }
    } else {
      facingOffset = this.currentState() === '#' ? -1 : 1
    }
    this.facing = mod(this.facing + facingOffset, dirLen)
  }

  moveForward () {
    this.currentPosition = this.currentPosition.map((c, key) => c + DIRECTIONS[Object.keys(DIRECTIONS)[this.facing]][key])
  }
}

const solveFirstTask = (plan) => {

  let map = new Map(plan)

  for (let i = 0; i < 1E4; i++) {
    map.step()
  }
  return map.infectCount
}

const solveSecondTask = (plan) => {

  let map = new Map(plan, 3E3, true)

  for (let i = 0; i < 1E7; i++) {
    map.step()
  }
  return map.infectCount
}

const solveTasks = (plan) => {
  plan = plan.split('\n').map((i) => [...i])
  console.log(solveFirstTask(plan), solveSecondTask(plan))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)//.catch(e => console.error(e))

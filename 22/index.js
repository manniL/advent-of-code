const fs = require('fs-extra')
const path = require('path')

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
  constructor (plan) {
    this.plan = plan
    this.currentPosition = [0, 0]
    this.expandPlan(3E3)
    this.currentPosition = this.determineMiddle()
    this.facing = 0
    this.burstCount = 0
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

    this.currentPosition = this.currentPosition.map((i) => i + size)
  }

  step () {
    let infectedStatus = this.isInfected()
    if (!infectedStatus) {
      this.infectCount++
    }
    this.burstCount++

    this.changeNode(!infectedStatus)
    this.turn(infectedStatus)
    this.moveForward()
  }

  isInfected () {
    let [x, y] = this.currentPosition
    return this.plan[x][y] === '#'
  }

  changeNode (infect = true) {
    let [x, y] = this.currentPosition
    this.plan[x][y] = (infect) ? '#' : '.'
  }

  turn (right = true) {
    let dirLen = Object.keys(DIRECTIONS).length
    this.facing = mod(this.facing + (right ? 1 : -1), dirLen)
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

const solveTasks = (plan) => {
  plan = plan.split('\n').map((i) => [...i])
  console.log(solveFirstTask(plan))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)//.catch(e => console.error(e))

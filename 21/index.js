const fs = require('fs-extra')
const path = require('path')

class Grid {
  constructor (rules) {
    this.grid = ['.#.', '..#', '###']
    this.rules = rules
  }

  step () {
    this.grid = Grid.gridFromSubgrids(this.getSubgrids().map((g) => this.getRule(g)))
  }

  static transform (string, shouldFlip, rotations) {
    let currentGrid = string.split('/').map((i) => [...i])
    if (shouldFlip) {
      currentGrid.reverse()
    }
    for (let r = 0; r < rotations; r++) {
      let rotatedGrid = []
      for (let i = 0; i < currentGrid.length; i++) {
        let newString = ''
        for (let j = currentGrid.length - 1; j >= 0; j--) {
          newString += currentGrid[j][i]
        }
        rotatedGrid.push(newString)
      }
      currentGrid = rotatedGrid
    }
    return currentGrid.join('/')
  }

  getSubgrids () {
    let dimension = this.grid.length % 2 === 0 ? 2 : 3
    let grids = []
    for (let i = 0; i < this.grid.length; i += dimension) {
      for (let j = 0; j < this.grid.length; j += dimension) {
        let str = new Array(dimension).fill(0).reduce((c, v, k) => {
          return c + this.grid[i + k].substring(j, j + dimension) + '/'
        }, '')
        grids.push(str.substr(0, str.length - 1))
      }
    }
    return grids
  }

  static gridFromSubgrids (subgrids) {
    let fullGrid = []
    let x = Math.sqrt(subgrids.length)
    let y = subgrids[0].match(/\//g).length + 1
    for (let i = 0; i < subgrids.length; i += x)
      for (let j = 0; j < y; j++) {
        let str = new Array(x).fill(0).reduce((c, v, k) => c + subgrids[i + k].split('/')[j], '')
        fullGrid.push(str)
      }
    return fullGrid
  }

  getRule (str) {
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 4; j++) {
        let s = Grid.transform(str, i, j)
        if (this.rules.hasOwnProperty(s))
          return this.rules[s]
      }
  }

  activePixels () {
    return this.grid.reduce((c, i) => c + i.match(/#/g).length, 0)
  }
}

const solveFirstTask = (instructions) => {

  let grid = new Grid(instructions)

  for (let i = 0; i < 5; i++) {
    grid.step()
  }

  return grid.activePixels()
}

const solveSecondTask = (instructions) => {

  let grid = new Grid(instructions)

  for (let i = 0; i < 18; i++) {
    grid.step()
  }

  return grid.activePixels()
}

const solveTasks = (instructions) => {
  instructions = instructions.split('\n').reduce((c, i) => {
    let [input, output] = i.split(' => ')
    c[input] = output
    return c
  }, {})
  console.log(solveFirstTask(instructions), solveSecondTask(instructions))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))

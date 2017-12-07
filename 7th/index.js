const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

Lazy.ArrayLikeSequence.define('rotate', {
  init (offset, reverse = false) {
    this.offset = offset
    this.reverse = reverse
  },

  get (i) {
    let index = (i + (this.reverse ? -this.offset : this.offset)) % this.parent.length()
    if (index < 0) {
      index += this.parent.length()
    }
    return this.parent.get(index)
  }
})

const solveFirstTask = (seq) => {
  return seq.map(p => p.name).without(seq.map((p) => p.programs).filter().flatten().uniq()).first()
}

const solveTasks = (seq) => {

  let overview = Lazy(seq).split('\n').map((line) => {
    line = line.split(' ')
    let name = line[0]
    let weight = parseInt(line[1].replace(/[()]/g, ''))
    let programs = false
    if (line.length > 2) {
      programs = [...line].splice(3).map((p) => p.replace(/[,]/g, ''))
    }
    return {
      name,
      weight,
      programs
    }
  })

  console.log(solveFirstTask(overview))

}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)

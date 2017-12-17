const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const solveBothTasks = (seq) => {

  //Init registers
  seq.each(({register}) => {this[register] = 0})

  let maxEver = Number.MIN_VALUE

  seq.each((instruction) => {
    const condition = `${this[instruction.condition[1]]} ${instruction.condition.splice(2).join(' ')}`
    if (eval(condition)) {
      this[instruction.register] += [instruction.by] * (instruction.operation === 'inc' ? 1 : -1)
      maxEver = (this[instruction.register] > maxEver) ? this[instruction.register] : maxEver
    }
  })

  return {max: seq.map(({register}) => this[register]).max(), maxEver}
}

const solveTasks = (seq) => {

  let overview = Lazy(seq).split('\n').map((line) => {
    line = line.split(' ')
    let [register, operation, by, ...condition] = [...line]
    return {
      register,
      operation,
      by,
      condition
    }
  })

  console.log(solveBothTasks(overview))

}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)

const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const solveFirstTask = (seq) => {

  //Init registers
  seq.each(({register}) => {this[register] = 0})

  //Run stuff
  seq.each((instruction) => {
    //Don't use template strings here! Eval won't work then
    const condition = `${this[instruction.condition[1]]} ${instruction.condition.splice(2).join(' ')}`
    if (eval(condition)) {
      this[instruction.register] += [instruction.by] * (instruction.operation === 'inc' ? 1 : -1)
    }
  })

  return seq.map(({register}) => this[register]).max()
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

  console.log(solveFirstTask(overview))

}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)

const fs = require('fs-extra')
const path = require('path')

const ops = {
  snd: (value) => `frequencies.push(${value})`,
  set: (register, value) => `this.${register} = ${value}`,
  add: (register, value) => `this.${register} += ${value}`,
  mul: (register, value) => `this.${register} *= ${value}`,
  mod: (register, value) => `this.${register} %= ${value}`,
  rcv: value => `if(${value} !== 0) { found = true}`,
  jgz: (register, value) => `if(this.${register} > 0) {currentInstruction += (${value} - 1)}`
}

const fixValue = (value) => value.charCodeAt(0) > '9'.charCodeAt(0) ? `this.${value}` : parseInt(value)

const solveFirstTask = (instructions) => {
  let found = false
  let currentInstruction = 0
  let frequencies = []
  while (!found && currentInstruction < instructions.length) {
    eval(instructions[currentInstruction++])
  }
  return frequencies[frequencies.length - 1]
}
const solveTasks = (seq) => {

  let overview = (seq).split('\n').map((instr) => {
      let onlyValue = ['snd', 'rcv']
      let [operation, register, value] = instr.split(' ')

      return onlyValue.includes(operation) ? ops[operation](fixValue(register)) : ops[operation](register, fixValue(value))
    }
  )

  console.log(solveFirstTask(overview))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))

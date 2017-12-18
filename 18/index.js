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
  instructions = instructions.map((instr) => {
      let onlyValue = ['snd', 'rcv']
      let [operation, register, value] = instr.split(' ')

      return onlyValue.includes(operation) ? ops[operation](fixValue(register)) : ops[operation](register, fixValue(value))
    }
  )
  let found = false
  let currentInstruction = 0
  let frequencies = []
  while (!found && currentInstruction < instructions.length) {
    eval(instructions[currentInstruction++])
  }
  return frequencies[frequencies.length - 1]
}

class Program {
  constructor (instructions) {
    this.instructions = instructions
    this.sendCount = 0
    this.registers = {}
    this.currentInstruction = 0
    this.isTerminated = false
    this.waitingForRcv = false
    this.toSend = []
    this.received = []
  }

  step () {
    if (!this.isTerminated) {
      this.currentInstruction += this.execute(this.instructions[this.currentInstruction])
      if (typeof this.instructions[this.currentInstruction] === 'undefined') {
        this.isTerminated = true
      }
    }
  }

  retrieveValue (n) {
    return isNaN(n) ? this.registers[n] : parseInt(n)
  }

  grabRcv (arr) {
    this.received = this.received.concat(arr)
  }

  clearSnd () {
    let toSend = this.toSend.slice()
    this.toSend = []
    return toSend
  }

  execute ({operation, x, y}) {
    let nextInstructionOffset = 1
    switch (operation) {
      case 'snd':
        this.toSend.push(this.retrieveValue(x))
        this.sendCount++
        break

      case 'set':
        this.registers[x] = this.retrieveValue(y)
        break

      case 'add':
        this.registers[x] += this.retrieveValue(y)
        break

      case 'mul':
        this.registers[x] *= this.retrieveValue(y)
        break

      case 'mod':
        this.registers[x] %= this.retrieveValue(y)
        break

      case 'rcv':
        if (this.received.length) {
          this.registers[x] = this.received.shift()
        } else {
          this.waitingForRcv = true
          nextInstructionOffset = 0
        }
        break

      case 'jgz':
        if (this.retrieveValue(x) > 0) {
          nextInstructionOffset = this.retrieveValue(y)
        }
        break
    }
    return nextInstructionOffset
  }

}

const solveSecondTask = (instructions) => {

  instructions = instructions.map((instr) => {
    let [operation, x, y] = instr.split(' ')
    return {operation, x, y}
  })

  let programs = [new Program(instructions), new Program(instructions)]
  programs.forEach((p, i) => {
    p.execute({operation: 'set', x: 'p', y: i})
  })

  console.log(programs[0].registers.p)

  while (true) {

    programs[1].grabRcv(programs[0].clearSnd())
    programs[0].grabRcv(programs[1].clearSnd())

    programs.forEach(p => p.step())

    if (programs.filter(p => p.waitingForRcv).length === 2 || programs.filter(p => p.isTerminated).length === 2) {
      break
    }
  }

  return programs[1].sendCount
}

const solveTasks = (seq) => {

  let rawInstructions = (seq).split('\n')

  console.log(solveFirstTask(rawInstructions), solveSecondTask(rawInstructions))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))
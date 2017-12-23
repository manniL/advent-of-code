const fs = require('fs-extra')
const path = require('path')

const solveFirstTask = (instructions) => {
  let p = new Program(instructions.map(i => i.split(' ')))
  while (!p.isTerminated) {
    p.step()
  }
  return p.mulCount
}

const solveSecondTask = (instructions) => {
  //AKA FindPrimes
  let input = parseInt(instructions[0].split(' ')[2]) * 100 + 100000
  let endOffset = 17000
  let nonPrimeNumbers = 0
  for (let i = input; i <= input + endOffset; i += 17) {
    let f = 2
    while (i % f !== 0) {
      f++
    }
    if (i !== f) {
      nonPrimeNumbers++
    }
  }
  return nonPrimeNumbers
}

class Program {
  constructor (instructions) {
    this.instructions = instructions
    this.initRegisters()
    this.currentInstruction = 0
    this.isTerminated = false
    this.mulCount = 0
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

  execute ([operation, x, y]) {
    let nextInstructionOffset = 1
    switch (operation) {
      case 'set':
        this.registers[x] = this.retrieveValue(y)
        break

      case 'mul':
        this.registers[x] *= this.retrieveValue(y)
        this.mulCount++
        break

      case 'sub':
        this.registers[x] -= this.retrieveValue(y)
        break

      case 'jnz':
        if (this.retrieveValue(x) !== 0) {
          nextInstructionOffset = this.retrieveValue(y)
        }
        break
    }
    return nextInstructionOffset
  }

  initRegisters () {
    this.registers = [...'abcdefgh'].reduce((c, l) => {
      c[l] = 0
      return c
    }, {})
  }
}

const solveTasks = (seq) => {

  let rawInstructions = (seq).split('\n')

  console.log(solveFirstTask(rawInstructions), solveSecondTask(rawInstructions))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))
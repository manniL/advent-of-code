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

const solveTasks = (seq) => {

  let previousStates = []
  let currentState = Lazy(seq).split('\t').map((n) => parseInt(n))

  let cycles = 0

  while (!previousStates.some((e) => JSON.stringify(e) === JSON.stringify(currentState.toArray()))) {
    previousStates.push(currentState.toArray())
    let banks = currentState.max()
    let index = currentState.indexOf(banks)
    let newState = currentState.toArray()
    newState[index] = 0

    let rotatedSeq = Lazy(newState).rotate(index + 1).toArray()

    let i = 0
    while (banks > 0) {
      rotatedSeq[i++ % rotatedSeq.length] += 1
      banks--
    }

    currentState = Lazy(rotatedSeq).rotate(index + 1, true)
    cycles++
  }
  let endCarry = Lazy(previousStates).reverse().reduce((c, e) => {
    if (!c.found) {
      if (JSON.stringify(c.array) !== JSON.stringify(e)) {
        c.count++
      } else {
        c.found = true
      }
    }
    return c
  }, {array: currentState.toArray(), count: 1, found: false})

  console.log(cycles, endCarry.count)

}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)

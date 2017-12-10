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

const solveFirstTask = (listSeq, lengths) => {

  let position = 0
  let skipLen = 0
  while (lengths.length) {
    let currentLength = parseInt(lengths.shift())
    let rotationOffset = (position + currentLength) % listSeq.length()
    let rotatedSeq = listSeq.rotate(rotationOffset)
    let reversedSeq = Lazy(rotatedSeq.toArray()).reverse().toArray().splice(0, currentLength)
    let splitSeq = rotatedSeq.toArray().splice(0, rotatedSeq.toArray().length - currentLength)
    reversedSeq.forEach((a) => splitSeq.push(a))
    let backRotateSeq = Lazy(splitSeq).rotate(rotationOffset, true)
    listSeq = Lazy(backRotateSeq)
    position = (position + currentLength + skipLen) % listSeq.toArray().length
    skipLen++
  }

  let finalArray = listSeq.toArray()

  return finalArray[0] * finalArray[1]

}
const solveTasks = (inputString) => {
  let list = Lazy(Lazy.range(256).toArray())
  let lengths = inputString.split(',')

  console.log(solveFirstTask(list, lengths))

}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)
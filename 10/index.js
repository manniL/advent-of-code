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

const solveSecondTask = (listSeq, asciiCodes) => {

  let additionalCodes = [17, 31, 73, 47, 23]
  additionalCodes.forEach((a) => asciiCodes.push(a))

  let position = 0
  let skipLen = 0
  for (let round = 0; round < 64; round++) {
    let asciiClone = [...asciiCodes]
    while (asciiClone.length) {
      let currentLength = asciiClone.shift()
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
  }

  //XOR
  let sparseHash = listSeq.toArray()
  console.log(sparseHash)
  let denseHash = []
  while (sparseHash.length) {
    denseHash.push(sparseHash.splice(0, 16).reduce((c, a) => c ^ a, 0))
  }
  return denseHash.map((a) => a.toString(16).length === 2 ? a.toString(16) : '0' + a.toString(16)).join('')
}
const solveTasks = (inputString) => {
  let list = Lazy(Lazy.range(256).toArray())
  let lengths = inputString.split(',')
  let asciiInput = inputString.split('').map((char) => char.charCodeAt(0))

  console.log(solveFirstTask(list, lengths), solveSecondTask(list, asciiInput))

}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)
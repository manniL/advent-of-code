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

const knotHash = (asciiCodes) => {
  asciiCodes = asciiCodes.concat([17, 31, 73, 47, 23])
  let listSeq = Lazy(Lazy.range(256).toArray())
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
  let denseHash = []
  while (sparseHash.length) {
    denseHash.push(sparseHash.splice(0, 16).reduce((c, a) => c ^ a, 0))
  }
  return denseHash.map((a) => a.toString(16).length === 2 ? a.toString(16) : '0' + a.toString(16)).join('')
}

const getMemory = (str) => {
  let asciiCodes = [...str].map((c) => c.charCodeAt(0))
  let suffix = Lazy.range(128).toArray()
  return suffix.map((suffix) => {
    let finalString = asciiCodes.concat([...`-${suffix}`].map(l => l.charCodeAt(0)))
    let hash = knotHash(finalString)
    return [...[...hash].map((letter) => [...'0000' + parseInt(letter, 16).toString(2)].splice(-4).join('')).join('')].map((n) => parseInt(n) ? '#' : '.').join('')
  })
}

const solveFirstTask = (memory) => {
  return [...memory.join('')].filter((l) => l === '#').length
}

const solveSecondTask = (memory) => {

  const getGroup = (memoryLookup, x, y) => {
    let topNeighbour = x > 0 ? memoryLookup[x - 1][y] : '.'
    let leftNeighbour = y > 0 ? memoryLookup[x][y - 1] : '.'

    return topNeighbour !== '.' ? topNeighbour : leftNeighbour !== '.' ? leftNeighbour : ++groupCount
  }

  const isHash = (a) => a === '#'

  const updateNearFields = (memoryLookup, x, y, newValue) => {
    if (x < memoryLookup.length - 1 && isHash(memoryLookup[x + 1][y])) {
      memoryLookup[x + 1][y] = newValue
      updateNearFields(memoryLookup, x + 1, y, newValue)
    }
    if (y < memoryLookup[x].length - 1 && isHash(memoryLookup[x][y + 1])) {
      memoryLookup[x][y + 1] = newValue
      updateNearFields(memoryLookup, x, y + 1, newValue)
    }

    if (x > 0 && isHash(memoryLookup[x - 1][y])) {
      memoryLookup[x - 1][y] = newValue
      updateNearFields(memoryLookup, x - 1, y, newValue)
    }

    if (y > 0 && isHash(memoryLookup[x][y - 1])) {
      memoryLookup[x][y - 1] = newValue
      updateNearFields(memoryLookup, x, y - 1, newValue)
    }

  }

  let groupCount = 0
  memory = memory.map((r) => [...r])
  let memoryClone = [...memory]

  memory.forEach((row, x) => row.forEach((cell, y) => {
    if (isHash(cell)) {
      memoryClone[x][y] = getGroup(memoryClone, x, y)
      updateNearFields(memoryClone, x, y, memoryClone[x][y])
    }
  }))

  return groupCount
}

const solveTasks = (inputString) => {
  let memory = getMemory(inputString)
  console.log(solveFirstTask(memory), solveSecondTask(memory))
}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)
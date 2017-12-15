const fs = require('fs-extra')
const path = require('path')

const solveBothTasks = (generators, partTwo = false) => {
  let divisor = 2147483647
  let judgeCount = 0
  let twoPairsCreated = 0

  const mapGen = (g) => {
    g.value = (g.value * g.factor) % divisor
    return g
  }
  const mapGenWithMod = (g) => {
    do {
      g.value = (g.value * g.factor) % divisor
    } while (g.value & g.mod)
    return g
  }

  let mapFn = partTwo ? mapGenWithMod : mapGen
  let maxPairs = partTwo ? 5 * 10 ** 6 : 4 * 10 ** 7
  while (twoPairsCreated < maxPairs) {

    if ((generators[0].value & 0xFFFF) === (generators[1].value & 0xFFFF)) {
      judgeCount++
    }

    generators = generators.map(mapFn)
    twoPairsCreated++
  }
  return judgeCount
}

const solveTasks = (startValues) => {
  startValues = startValues.split('\n').map((s) => parseInt(/(\d+)/gim.exec(s)[1]))

  let generators = [
    {value: startValues[0], factor: 16807, mod: 3},
    {value: startValues[1], factor: 48271, mod: 7}
  ]
  console.log(solveBothTasks(generators), solveBothTasks(generators, true))
}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)
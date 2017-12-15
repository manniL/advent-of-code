const fs = require('fs-extra')
const path = require('path')

const solveFirstTask = (generators) => {
  let divisor = 2147483647
  let judgeCount = 0
  let twoPairsCreated = 0

  const mapGen = (g) => {
    g.value = (g.value * g.factor) % divisor
    return g
  }

  while (twoPairsCreated < 4 * 10 ** 7) {

    if ((generators[0].value & 0xFFFF) === (generators[1].value & 0xFFFF)) {
      judgeCount++
    }

    generators = generators.map(mapGen)
    twoPairsCreated++
  }
  return judgeCount
}

const solveTasks = (startValues) => {
  startValues = startValues.split('\n').map((s) => parseInt(/(\d+)/gim.exec(s)[1]))

  let generators = [
    {value: startValues[0], factor: 16807},
    {value: startValues[1], factor: 48271}
  ]
  console.log(solveFirstTask(generators))
}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)
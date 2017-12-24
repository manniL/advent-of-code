const fs = require('fs-extra')
const path = require('path')

const solveTasks = (seq) => {

  let ports = (seq).split('\n').map(i => i.split('/').map(n => parseInt(n)))

  let bridges = [...buildUpBridges(0, [], ports, 0)]
  console.log(bridges.reduce((c, b) => c.strength > b.strength ? c : b, {}).strength)

}

function * buildUpBridges (current, used, remaining, strength) {
  for (let [x, y] of remaining) {
    if (x === current || y === current) {
      yield * buildUpBridges((x === current) ? y : x, [...used, [x, y]], remaining.filter(([a, b]) => !(x === a && y === b)), strength + x + y)
    }
  }
  yield {used, strength}
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))
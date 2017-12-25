const fs = require('fs-extra')
const path = require('path')

const solveTasks = (seq) => {

  let instructions = seq.split('\n\n')
  let [, startState, maxSteps] = /.*state (.*?)\.\n.*after (\d+) steps\./g.exec(instructions.shift())
  instructions = instructions.map(i => {
      let [state, ...ops] = i.split('If the current value is')
      state = /(\w):/g.exec(state)[1]
      ops = ops.map(op => {
        let [, value, write, offset, nextState] = /(\d):\n.* value (\d)\.\n.*(right|left).\n.*(\w)./gm.exec(op)
        return {
          value: parseInt(value),
          write: parseInt(write),
          offset: (offset === 'right') ? 1 : -1,
          nextState,
        }
      }).reduce((c, a) => {
        c[a.value] = a
        return c
      }, {})
      return {
        state,
        ops
      }
    }
  ).reduce((c, a) => {
    c[a.state] = a
    return c
  }, {})

  console.log(turingMachine(startState, maxSteps, instructions))
}

function turingMachine (startState, maxSteps, instructions) {
  let band = [0]
  let position = 0
  let state = startState
  for (let i = 0; i < maxSteps; i++) {
    let value = band[position]
    let op = instructions[state].ops[value]
    band[position] = op.write
    state = op.nextState
    position += op.offset
    if (position >= band.length) {
      band.push(0)
    } else if (position < 0) {
      band.unshift(0)
      position++
    }
  }

  return band.reduce((c, a) => c + a, 0)
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))
const fs = require('fs-extra')
const path = require('path')

const dance = (programs, instructions) => {
  instructions.forEach((i) => {
    let firstLetter = i[0]
    let swapIndices, swapLetters
    switch (firstLetter) {
      case 's':
        let [, ...len] = [...i]
        programs = [].concat(programs.splice((parseInt(len.join('')) % programs.length) * -1), programs)
        break
      case 'x':
        [, x1, x2] = /(\d+)\/(\d+)/gm.exec(i)
        swapIndices = [x1, x2]
        swapLetters = swapIndices.map((l) => programs[l])
        swapIndices.forEach((i, k) => {
          programs[i] = swapLetters[(k + 1) % 2]
        })
        break
      case 'p':
        swapLetters = [i[1], i[3]]
        swapIndices = swapLetters.map((l) => programs.indexOf(l))
        swapIndices.forEach((i, k) => {
          programs[i] = swapLetters[(k + 1) % 2]
        })
        break
    }
  })
  return programs
}

const solveFirstTask = (instructions) => {
  return dance([...'abcdefghijklmnop'], instructions).join('')
}

const solveSecondTask = (instructions) => {
  let finalPosition = [...'abcdefghijklmnop']
  let positions = [finalPosition.join('')]
  for (let count = 0; count < 10 ** 9; count++) {
    finalPosition = dance(finalPosition, instructions)
    if (!positions.includes(finalPosition.join(''))) {
      positions.push(finalPosition.join(''))
    } else {
      break
    }
  }
  return positions[(1E9 % positions.length)]
}

const solveTasks = (input) => {
  input = input.split(',')
  console.log(solveFirstTask(input), solveSecondTask(input))
}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))
const fs = require('fs-extra')
const path = require('path')

const solveFirstTask = (instructions) => {
  let programs = [...'abcdefghijklmnop']

  instructions.forEach((i) => {
    console.log(programs.join(''))
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
  return programs.join('')
}

const solveTasks = (input) => {
  input = input.split(',')
  console.log(solveFirstTask(input))
}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))
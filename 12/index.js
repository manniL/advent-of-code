const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const solveFirstTask = (lines) => {

  const getPrograms = (seq, currentArray, parent) => {
    currentArray.push(parent)
    let parentNode = seq.findWhere({parent})
    parentNode.programs.forEach((p) => !currentArray.includes(p) ? getPrograms(seq, currentArray, p) : null)

    return currentArray
  }

  let mappedLines = lines.map((line) => {
    let [parent, , ...programs] = [...(line.split(' '))]
    return {parent, programs}
  })

  let resultPrograms = getPrograms(Lazy(mappedLines), [], '0')
  return resultPrograms.reduce((c) => ++c, 0)

}

const solveTasks = (inputString) => {
  let lines = inputString.replace(/,/g, '').split('\n')
  console.log(solveFirstTask([...lines]))

}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)
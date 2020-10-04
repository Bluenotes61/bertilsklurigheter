const path = require('path')
const fs = require('fs')
const util = require('util')

const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)

exports.index = async (req, res, next) => {
  const puzzles = await readPuzzles()
  res.render('orden', { puzzles })
}

const readPuzzles = async () => {
  const directoryPath = path.join(appRoot, 'puzzles')
  const files = await readdir(directoryPath)
  const puzzles = []
  files.sort((f1, f2) => {
    const n1 = parseInt(f1.split('.')[0])
    const n2 = parseInt(f2.split('.')[0])
    return n1 > n2
  })
  for (const file of files) {
    const apath = path.join(appRoot, 'puzzles', file)
    const puzzleTxt = await readFile(apath, 'utf8')
    const lines = puzzleTxt.split('\n')
    puzzles.push({
      week: lines[0].trim(),
      numberString: lines[1].trim(),
      solutionString: lines[2].trim(),
      leads: [
        lines[3].trim(),
        lines[4].trim(),
        lines[5].trim(),
        lines[6].trim(),
        lines[7].trim(),
        lines[8].trim(),
        lines[9].trim(),
        lines[10].trim()
      ]
    })
  }
  return puzzles
}

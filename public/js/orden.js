/* global $ puzzles */
$(document).ready(function () {
  var radius = 200
  var nrOffset = 20
  var spinning = null
  var spinAmount = 10
  var currAngle = 0
  var finalAngle = 0
  var selectedBox = null
  var boxes = []
  var puzzle = null

  function init () {
    readCookie()

    buildSelect()

    $(document).on('keydown', function (e) {
      if (e.which === 8) e.preventDefault()
    })
    $(document).on('keyup', charEnter)
    $(window).on('resize', drawBoxes)

    $('.cheat a').on('click', cheat)
    $('.forget a').on('click', forget)
    $('.successarea .close a').on('click', function () {
      $('.puzzlearea').removeClass('success')
    })

    $('.openselect').on('click', function () {
      $('.select .yearsel a').removeClass('current')
      $('.select a#' + puzzle.number).addClass('current')
      $('.select').slideToggle()
      $(this).toggleClass('selected')
    })

    $('.select a').on('click', function () {
      selectPuzzle(this.id)
    })

    selectPuzzle(puzzles[0].number)
  }

  function buildSelect () {
    function getYearDiv (year) {
      return $('<div class="yearsel"><div class="year">' + year + '</div></div>')
    }
    var currYear = 0
    var currDiv = null
    for (var i = 0; i < puzzles.length; i++) {
      if (puzzles[i].year !== currYear) {
        if (currDiv) {
          $('.select').append(currDiv)
        }
        currYear = puzzles[i].year
        currDiv = getYearDiv(currYear)
      }
      var a = $('<a id="' + puzzles[i].number + '" >Vecka ' + puzzles[i].week + '</a>')
      if (puzzles[i].solved) a.addClass('solved')
      currDiv.append(a)
    }
    $('.select').append(currDiv)
  }

  function puzzleByNumber (nr) {
    return puzzles.find(function (p) { return p.number === parseInt(nr) })
  }

  function selectPuzzle (nr) {
    puzzle = puzzles.find(function (p) { return p.number === parseInt(nr) })
    $('.puzzlearea').removeClass('success')
    $('.week').text('Vecka ' + puzzle.week + ', ' + puzzle.year)
    $('.select').slideUp()

    puzzleSelected(puzzle)
    currAngle = 0
    drawBoxes()
  }

  function puzzleSelected (puzzle) {
    puzzle.numbers = []
    for (var p = 0; p < puzzle.numberString.length; p++) {
      if (puzzle.numberString[p] !== ' ') puzzle.numbers.push(p + 1)
    }
    puzzle.solution = puzzle.solutionString.split('')

    $('.puzzle').empty()
    boxes = []
    for (var i = 0; i < puzzle.nofBoxes; i++) {
      var abox = $('<div class="wordbox" data-nr="' + i + '"><div class="number"></div><div class="letter"><input type="text" /><div class="char"></div></div></div>')
      abox.nr = i
      abox.on('click', boxClicked)
      abox.find('input').on('focus', function () {
        $(this).val('')
      })

      if (puzzle.try[i]) {
        abox.letter = puzzle.try[i]
      }
      if (puzzle.solved) {
        abox.letter = puzzle.solutionString[i]
      }

      boxes.push(abox)
      $('.puzzle').append(abox)
    }
    selectedBox = boxes[0]

    for (var j = 0; j < puzzle.numbers.length; j++) {
      var num = puzzle.numbers[j]
      boxes[num - 1].number = j + 1
    }

    $('.leads ol').empty()
    for (var k = 0; k < puzzle.leads.length; k++) {
      $('.leads ol').append('<li>' + puzzle.leads[k] + '.</li>')
    }
    checkSolution()
  }

  function boxClicked () {
    var clickbox = $(this)
    var selbox = boxes.find(function (b) {
      return b.nr === clickbox.data('nr')
    })
    selectBox(selbox)
  }

  function cheat () {
    var nr = -1
    var count = 0
    while (nr === -1 && count < 1000) {
      var testnr = Math.floor(Math.random() * puzzle.nofBoxes)
      if (!boxes[testnr].letter || boxes[testnr].letter === '') {
        nr = testnr
      }
      count++
    }
    if (nr !== -1) {
      boxes[nr].letter = puzzle.solutionString[nr]
      drawBoxes()
      checkSolution()
    }
    saveCookie()
  }

  function forget () {
    puzzle.solved = false
    $('.puzzlearea').removeClass('success')
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].letter = ''
    }
    saveCookie()
    $('.select a#' + puzzle.number).removeClass('solved')
    drawBoxes()
  }

  function sizeBoxes (width, circleRadius, innerRadius) {
    var fontSize = circleRadius / 7
    var textOffset = nrOffset + width + innerRadius / 10
    $('.wordbox').css({ width: width, height: width + nrOffset })
    $('.wordbox .number').css({ height: nrOffset })
    $('.wordbox .letter').css({ height: width, width: width, lineHeight: width + 'px', fontSize: width + 'px' })
    $('.wordbox .letter input').css({ height: width, width: width })
    $('.title').css({ width: 2 * circleRadius, fontSize: fontSize })
    $('.title1').css({ top: textOffset })
    $('.title2').css({ top: 2 * circleRadius - textOffset - fontSize })
    var textRadius = circleRadius - textOffset - fontSize
    $('.title1').arctext({ radius: textRadius })
    $('.title2').arctext({ radius: textRadius, dir: -1 })
    $('.successarea h2').css({ fontSize: fontSize })
    $('.successarea').css({ top: circleRadius - $('.successarea').height() })
  }

  function getRadius () {
    var puzzleWidth = $('.puzzle').width()
    return (puzzle.nofBoxes + Math.PI) * (puzzleWidth - nrOffset) / (2 * puzzle.nofBoxes + 4 * Math.PI)
  }

  function drawBoxes () {
    radius = getRadius()
    var width = 2 * Math.PI * radius / (puzzle.nofBoxes + Math.PI)
    var circleRadius = radius + (nrOffset + width) / 2
    var innerRadius = radius - (nrOffset + width) / 2
    $('.puzzle').height(2 * circleRadius)
    sizeBoxes(width, circleRadius, innerRadius)
    for (var i = 0; i < boxes.length; i++) {
      var angle = i * 2 * Math.PI / puzzle.nofBoxes + toRad(currAngle)
      var x = radius * Math.sin(angle) + circleRadius - width / 2
      var y = radius * (1 - Math.cos(angle))
      var deg = toDeg(angle)
      boxes[i].find('.letter .char').text(boxes[i].letter)
      if (boxes[i].number) {
        boxes[i].find('.number').text(boxes[i].number)
      }
      boxes[i].css({ left: x, top: y, transform: 'rotate(' + deg + 'deg)' })
      boxes[i].removeClass('selected')
      if (boxes[i] === selectedBox) {
        boxes[i].addClass('selected')
      }
    }
    $('.puzzlearea').css({ height: circleRadius - 50 })
  }

  function charEnter (e) {
    if ((e.keyCode >= 65 && e.keyCode <= 90) || e.key.toUpperCase() === 'Å' || e.key.toUpperCase() === 'Ä' || e.key.toUpperCase() === 'Ö') {
      selectedBox.letter = e.key.toUpperCase()
      var nextNr = (selectedBox.nr + 1) % puzzle.nofBoxes
      selectBox(boxes[nextNr])
      $('.wordbox').removeClass('error')
      checkSolution()
    } else if (e.keyCode === 8 || e.keyCode === 46) {
      selectedBox.letter = ''
      $('.wordbox').removeClass('error')
      drawBoxes()
    } else if (e.keyCode === 37) {
      var prevNr = (selectedBox.nr - 1)
      if (prevNr < 0) prevNr = puzzle.nofBoxes - 1
      selectBox(boxes[prevNr])
    } else if (e.keyCode === 39) {
      var nextNr = (selectedBox.nr + 1) % puzzle.nofBoxes
      selectBox(boxes[nextNr])
    }
    saveCookie()
  }

  function saveCookie () {
    for (var i = 0; i < boxes.length; i++) {
      puzzle.try[i] = boxes[i].letter
    }

    var cookie = ''
    for (var j = 0; j < puzzles.length; j++) {
      if (cookie.length > 0) cookie += '|'
      cookie += puzzles[j].number + ','
      if (puzzles[j].solved) {
        cookie += '*'
      } else {
        var found = false
        var thisCookie = ''
        for (var k = 0; k < puzzles[j].try.length; k++) {
          if (puzzles[j].try[k]) found = true
          thisCookie += puzzles[j].try[k] || ' '
        }
        if (found) cookie += thisCookie
        else cookie += '-'
      }
    }
    var now = new Date()

    now.setTime(now.getTime() + 356 * 24 * 3600 * 1000)
    cookie = 'tries=' + cookie + ';expires=' + now.toGMTString() + ';'

    document.cookie = cookie
    document.cookie = 'solved=; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
  }

  function fixOldCookie (cookies, tries) {
    var solved = null
    for (var i = 0; i < cookies.length; i++) {
      var cookieArr = cookies[i].split('=')
      if (cookieArr[0].trim() === 'solved') {
        solved = cookieArr[1]
      }
    }
    if (solved && solved.length > 0) {
      solved = solved.split(',')
      for (var j = 0; j < tries.length; j++) {
        var atry = tries[j].split(',')
        if (solved.find(function (s) { return parseInt(s) === parseInt(atry[0]) })) {
          tries[j] = atry[0] + ',*'
        }
      }
    }
    return tries
  }

  function readCookie () {
    try {
      for (var p = 0; p < puzzles.length; p++) {
        puzzles[p].try = new Array(puzzles[p].nofBoxes)
      }

      var cookies = document.cookie.split(';')

      var tries = null
      for (var i = 0; i < cookies.length; i++) {
        var cookieArr = cookies[i].split('=')
        if (cookieArr[0].trim() === 'tries') {
          tries = cookieArr[1].split('|')
        }
      }

      if (!tries) {
        tries = ''
        for (var t = 0; t < puzzles.length; t++) {
          if (tries.length > 0) tries += ','
          tries += puzzles[t].number + '.-'
        }
      }

      tries = fixOldCookie(cookies, tries)

      if (tries) {
        for (var j = 0; j < tries.length; j++) {
          var atry = tries[j].split(',')
          var apuzzle = puzzleByNumber(atry[0])
          if (atry[1] === '*') {
            apuzzle.solved = true
          } else if (atry[1] !== '-') {
            var letters = atry[1].split('')
            for (var k = 0; k < apuzzle.try.length; k++) {
              if (letters[k] !== ' ') {
                apuzzle.try[k] = letters[k]
              }
            }
          }
        }
      }
    } catch (ex) {
      console.log(ex)
    }
  }

  function checkSolution () {
    var answer = ''
    for (var i = 0; i < puzzle.nofBoxes; i++) {
      if (boxes[i].letter) answer = answer + boxes[i].letter
    }
    if (answer.length === puzzle.solutionString.length) {
      if (answer === puzzle.solutionString) {
        puzzle.solved = true
        saveCookie()

        $('.select a#' + puzzle.number).addClass('solved')

        $('.puzzlearea').addClass('success')
      } else {
        for (var j = 0; j < puzzle.nofBoxes; j++) {
          if (boxes[j].letter !== puzzle.solutionString[j]) {
            boxes[j].addClass('error')
          }
        }
      }
    }
  }

  function selectBox (box) {
    selectedBox = box
    drawBoxes()
    spinToBox(selectedBox)
    selectedBox.find('input').focus()
  }

  function spinToBox (box) {
    if (!spinning) {
      finalAngle = 360 - selectedBox.nr * 360 / puzzle.nofBoxes

      var diff = currAngle - finalAngle
      var direction = (diff > 0 ? -1 : 1)

      if (diff < -180) {
        currAngle += 360
        direction = -1
      }
      if (diff > 180) {
        currAngle -= 360
        direction = 1
      }
      diff = currAngle - finalAngle
      spinAmount = Math.trunc(Math.abs(diff) / 10)

      spinning = setInterval(function () {
        spin(direction)
      }, 50)
    }
  }

  function spin (direction) {
    if ((direction === -1 && currAngle <= finalAngle) || (direction === 1 && currAngle >= finalAngle) || spinAmount === 0) {
      clearInterval(spinning)
      spinning = null
    } else {
      currAngle += direction * spinAmount
      drawBoxes()
    }
  }

  function toDeg (angle) {
    return angle * 360 / 2 / Math.PI
  }

  function toRad (angle) {
    return angle * 2 * Math.PI / 360
  }

  init()
})

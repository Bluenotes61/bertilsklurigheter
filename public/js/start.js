/* global $ */
$(document).ready(function () {
  function init () {
    $('a.opener').on('click', function () {
      $(this).toggleClass('open')
      $(this).next().slideToggle()
    })

    $('.answerlink').on('click', function () {
      $(this).next().slideToggle()
    })
  }

  init()
})

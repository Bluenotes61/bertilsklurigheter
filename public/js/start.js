$(document).ready(function(){

  function init() {
    $("a.opener").on("click", function(){
      $(this).next().slideToggle();
    });

    $(".answerlink").on("click", function(){
      $(this).next().slideToggle();
    });
  }

  init();
});

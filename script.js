// script.js
(function($) {
  $(window).on('load hashchange', function(){
    // Existing hash-based navigation code
    $('.content-region').hide();
    $('.main-menu a').removeClass('active');
    var region = location.hash.toString() || $('.main-menu a:first').attr('href');
    $(region).show();
    $('.main-menu a[href="'+ region +'"]').addClass('active');
  });

  $(document).ready(function() {
    // 1) Existing or other code you might have

    // 2) NEW: Abstract toggle code
    $('.toggle-abstract').on('click', function(e) {
      e.preventDefault();
      // Toggle the .abstract-text that immediately follows the clicked link
      $(this).next('.abstract-text').slideToggle();
    });
  });

  $('.toggle-abstract').on('click', function(e) {
    e.preventDefault();
    const $abstractText = $(this).next('.abstract-text');
    $abstractText.slideToggle();
  
    // Toggle link text
    if ($abstractText.is(':visible')) {
      $(this).text('Show Abstract');
    } else {
      $(this).text('Hide Abstract');
    }
  });
})(jQuery);

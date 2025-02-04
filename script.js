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

  // Use just ONE document.ready block for the toggle logic
  $(document).ready(function() {
    $('.toggle-abstract').on('click', function(e) {
      e.preventDefault();

      const $abstractText = $(this).next('.abstract-text');
      $abstractText.slideToggle();

      // Toggle link text after the slideToggle
      if ($abstractText.is(':visible')) {
        $(this).text('Hide Abstract');
      } else {
        $(this).text('Show Abstract');
      }
    });
  });
})(jQuery);
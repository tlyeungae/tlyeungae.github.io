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
    
      const $this = $(this);
      const $abstractText = $this.next('.abstract-text');
    
      // Use a callback so it checks after slideToggle finishes
      $abstractText.slideToggle(function() {
        if ($abstractText.is(':visible')) {
          $this.text('Hide Abstract');
        } else {
          $this.text('Show Abstract');
        }
      });
    });
  });
})(jQuery);

$(function() {
  const $photo = $('#photo');
  if (!$photo.length) return;

  const $btn = $('<button>')
    .text($photo.hasClass('hide') ? 'Show Photos' : 'Hide Photos')
    .css({ display: 'block', margin: '1rem 0' })
    .on('click', () => {
      $photo.toggleClass('hide');
      $btn.text($photo.hasClass('hide') ? 'Show Photos' : 'Hide Photos');
    });

  $photo.before($btn);
});
(function($) {
  // 1) Hash‑based navigation + photo‑button visibility
  $(window).on('load hashchange', function(){
    // hide all regions, clear active menu
    $('.content-region').hide();
    $('.main-menu a').removeClass('active');

    // figure out which region to show
    const region = location.hash || $('.main-menu a:first').attr('href');
    $(region).show();
    $('.main-menu a[href="'+ region +'"]').addClass('active');

    // show/hide the photo‑toggle button
    const $btn = $('#photo-toggle-btn');
    if (region === '#photo') {
      $btn.show();
    } else {
      $btn.hide();
    }
  });

  // 2) DOM‑ready: abstract toggles + build photo button
  $(function() {
    // abstract toggles
    $('.toggle-abstract').on('click', function(e) {
      e.preventDefault();
      const $this = $(this);
      const $abstract = $this.next('.abstract-text');
      $abstract.slideToggle(() => {
        $this.text( $abstract.is(':visible') ? 'Hide Abstract' : 'Show Abstract' );
      });
    });
  });
})(jQuery);
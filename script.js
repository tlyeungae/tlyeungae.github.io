(function($) {
  // 1) Hash-based navigation + photo-button visibility
  $(window).on('load hashchange', function(){
    // hide all regions, clear active menu
    $('.content-region').hide();
    $('.main-menu a').removeClass('active');

    // figure out which region to show
    const region = location.hash || $('.main-menu a:first').attr('href');
    $(region).show();
    $('.main-menu a[href="'+ region +'"]').addClass('active');

    // show/hide the photo-toggle button
    const $btn = $('#photo-toggle-btn');
    if (region === '#photo') {
      $btn.show();
    } else {
      $btn.hide();
    }
  });

  // 2) DOM-ready: abstract toggles + figure-label sync
  $(function() {

    // ---- Abstract toggles (robust to redesigned markup) ----
    // Works whether .toggle-abstract is <a> or <button>
    $('#research').on('click', '.toggle-abstract', function(e) {
      // prevent default only if it's an <a href="#">
      if (this.tagName.toLowerCase() === 'a') e.preventDefault();

      const $btn = $(this);

      // Find the abstract within the same paper card
      const $card = $btn.closest('.paper-card');
      const $abstract = $card.find('.abstract-text').first();

      // If not found (e.g. WIP items), do nothing safely
      if (!$abstract.length) return;

      $abstract.stop(true, true).slideToggle(180, function() {
        const isVisible = $abstract.is(':visible');
        $btn.text(isVisible ? 'Hide Abstract' : 'Show Abstract');
        $btn.attr('aria-expanded', String(isVisible));
      });
    });

    // ---- Figures: update "Hide Figures" / "Show Figures" label on <details> ----
    function syncFigureLabels() {
      $('#research details.paper-figs').each(function() {
        const isOpen = this.open;
        const $label = $(this).find('summary .label').first();
        if ($label.length) $label.text(isOpen ? 'Hide Figures' : 'Show Figures');
      });
    }

    // Initial sync + on toggle
    syncFigureLabels();
    $('#research').on('toggle', 'details.paper-figs', syncFigureLabels);

  });
})(jQuery);
(function($) {
  // 1) Hash-based navigation + photo-button visibility + fade-in
  $(window).on('load hashchange', function(){
    // hide all regions, clear active menu
    $('.content-region').hide().css('animation', 'none');
    $('.main-menu a').removeClass('active');

    // figure out which region to show
    const region = location.hash || $('.main-menu a:first').attr('href');
    const $region = $(region);
    $region.show();
    // re-trigger fade animation
    $region[0].offsetHeight; // force reflow
    $region.css('animation', '');
    $('.main-menu a[href="'+ region +'"]').addClass('active');

    // show/hide the photo-toggle button
    const $btn = $('#photo-toggle-btn');
    if (region === '#photo') {
      $btn.show();
    } else {
      $btn.hide();
    }

    // scroll to top on page switch
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // lazy-load ClustrMaps globe on first Stats tab visit
    if (region === '#stats') {
      var $globe = $('#clustrmaps-container');
      if ($globe.length && !$globe.data('loaded')) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.id = 'clstr_globe';
        s.src = $globe.data('src');
        $globe[0].appendChild(s);
        $globe.data('loaded', true);
      }
    }
  });

  // 2) Theme toggle (light / dark)
  (function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
  })();
  $(function() {
    var $btn = $('#theme-toggle');
    function updateLabel() {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      $btn.html(isLight ? '\u263E Dark Mode' : '\u2600 Light Mode');
    }
    updateLabel();
    $btn.on('click', function() {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
      updateLabel();
    });
  });

  // 3) Sticky header shrink + scroll-to-top button
  $(function() {
    var $header = $('#header');
    var $scrollBtn = $('#scroll-top');
    $(window).on('scroll', function() {
      var y = window.scrollY || window.pageYOffset;
      if (y > 80) {
        $header.addClass('scrolled');
      } else {
        $header.removeClass('scrolled');
      }
      if (y > 400) {
        $scrollBtn.addClass('visible');
      } else {
        $scrollBtn.removeClass('visible');
      }
    });
    $scrollBtn.on('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // 4) DOM-ready: abstract toggles + figure-label sync
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

    // Initial sync + on toggle (use native listeners; jQuery delegation misses the toggle event)
    syncFigureLabels();
    document.querySelectorAll('#research details.paper-figs').forEach(function(el) {
      el.addEventListener('toggle', syncFigureLabels);
    });

  });
})(jQuery);
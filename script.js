(function($) {
  // 1) Hash-based navigation + fade-in
  $(window).on('load hashchange', function(){
    $('.content-region').hide().css('animation', 'none');
    $('.main-menu a').removeClass('active');

    var region = location.hash || $('.main-menu a:first').attr('href');
    var $region = $(region);
    $region.show();
    $region[0].offsetHeight;            // force reflow
    $region.css('animation', '');
    $('.main-menu a[href="'+ region +'"]').addClass('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 2) Theme toggle — light is default (Working Paper aesthetic).
  //    Set data-theme="dark" only when the reader prefers it.
  (function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
  $(function() {
    var $btn = $('#theme-toggle');
    function updateLabel() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      // Compact monospace label fits the paper aesthetic
      $btn.html(isDark ? '\u263C&nbsp;&nbsp;Day' : '\u263E&nbsp;&nbsp;Night');
    }
    updateLabel();
    $btn.on('click', function() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
      updateLabel();
    });
  });

  // 3) Scroll-to-top button visibility
  $(function() {
    var $scrollBtn = $('#scroll-top');
    $(window).on('scroll', function() {
      var y = window.scrollY || window.pageYOffset;
      if (y > 600) { $scrollBtn.addClass('visible'); }
      else         { $scrollBtn.removeClass('visible'); }
    });
    $scrollBtn.on('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // 4) Abstract toggles + figure-label sync
  $(function() {
    $('#research').on('click', '.toggle-abstract', function(e) {
      if (this.tagName.toLowerCase() === 'a') e.preventDefault();
      var $btn = $(this);
      var $card = $btn.closest('.paper-card');
      var $abstract = $card.find('.abstract-text').first();
      if (!$abstract.length) return;
      $abstract.stop(true, true).slideToggle(180, function() {
        var isVisible = $abstract.is(':visible');
        $btn.text(isVisible ? 'Hide abstract' : 'Show abstract');
        $btn.attr('aria-expanded', String(isVisible));
      });
    });

    function syncFigureLabels() {
      $('#research details.paper-figs').each(function() {
        var isOpen = this.open;
        var $label = $(this).find('summary .label').first();
        if ($label.length) $label.text(isOpen ? 'Hide figures' : 'Show figures');
      });
    }
    syncFigureLabels();
    document.querySelectorAll('#research details.paper-figs').forEach(function(el) {
      el.addEventListener('toggle', syncFigureLabels);
    });
  });
})(jQuery);

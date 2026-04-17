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

  // 2) Theme toggle — dark (terminal) is default; light = "DAY" mode.
  (function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();
  $(function() {
    var $btn = $('#theme-toggle');
    function updateLabel() {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      $btn.html(isLight ? '&lt; NIGHT' : '&lt; DAY');
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

  // 3) Status-bar live clock (Lugano / Europe-Zurich time)
  (function clock() {
    var el = document.getElementById('status-clock');
    if (!el) return;
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function tick() {
      var now = new Date();
      // Format in Europe/Zurich timezone
      var fmt;
      try {
        fmt = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Zurich',
          hour12: false,
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(now);
      } catch (e) {
        fmt = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
      }
      el.textContent = 'LUGANO ' + fmt + ' CET';
    }
    tick();
    setInterval(tick, 1000);
  })();

  // 4) Scroll-to-top button visibility
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

  // 5) Abstract toggles + figure-label sync
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

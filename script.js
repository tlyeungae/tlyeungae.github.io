(function($) {

  // 0) Boot splash — only on first arrival of a session
  (function bootSplash() {
    var splash = document.getElementById('boot-splash');
    if (!splash) return;
    if (sessionStorage.getItem('tly-booted')) {
      splash.parentNode.removeChild(splash);
      return;
    }
    var pre = splash.querySelector('.boot-text');
    pre.classList.add('boot-cursor');

    // Each entry: [prefix, ok-suffix?, dim-suffix?]
    var lines = [
      ['> tly-001 boot v.2026.3'],
      ['> initializing terminal...'],
      ['> loading household_finance.module     ', '[OK]'],
      ['> loading research.archive             ', '[OK]', '  8 papers indexed'],
      ['> mounting /etc/curriculum.vitae       ', '[OK]'],
      ['> connecting to lugano.ch (46.0n,8.95e) ', '[OK]'],
      ['> READY.']
    ];

    // Use a fast text node + spans-on-line-complete approach.
    // Typing each character via textContent is much faster than innerHTML.
    var lineNode = document.createTextNode('');
    pre.appendChild(lineNode);
    var i = 0, j = 0;
    function finalize(parts) {
      // Replace the in-progress text node with a styled fragment + newline
      pre.removeChild(lineNode);
      var head = document.createTextNode(parts[0]);
      pre.appendChild(head);
      if (parts.length >= 2) {
        var ok = document.createElement('span');
        ok.className = 'ok';
        ok.textContent = parts[1];
        pre.appendChild(ok);
      }
      if (parts.length >= 3) {
        var dim = document.createElement('span');
        dim.className = 'dim';
        dim.textContent = parts[2];
        pre.appendChild(dim);
      }
      pre.appendChild(document.createTextNode('\n'));
      lineNode = document.createTextNode('');
      pre.appendChild(lineNode);
    }
    function type() {
      if (i >= lines.length) {
        sessionStorage.setItem('tly-booted', '1');
        setTimeout(function() {
          splash.classList.add('fade');
          setTimeout(function() {
            if (splash.parentNode) splash.parentNode.removeChild(splash);
          }, 450);
        }, 320);
        return;
      }
      var parts = lines[i];
      var full = parts.join('');
      if (j < full.length) {
        j++;
        lineNode.data = full.slice(0, j);
        setTimeout(type, 5 + Math.random() * 9);
      } else {
        finalize(parts);
        i++; j = 0;
        setTimeout(type, 55);
      }
    }
    setTimeout(type, 100);
  })();

  // 1) Hash-based navigation + fade-in + active-tab cursor
  function setActiveCursor() {
    document.querySelectorAll('.main-menu .nav-cursor').forEach(function(n){ n.remove(); });
    var $a = $('.main-menu a.active');
    if ($a.length) {
      $a.append('<span class="nav-cursor">▮</span>');
    }
  }
  $(window).on('load hashchange', function(){
    $('.content-region').hide().css('animation', 'none');
    $('.main-menu a').removeClass('active');

    var region = location.hash || $('.main-menu a:first').attr('href');
    var $region = $(region);
    $region.show();
    $region[0].offsetHeight;            // force reflow
    $region.css('animation', '');
    $('.main-menu a[href="'+ region +'"]').addClass('active');
    setActiveCursor();

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

  // 3b) Faux system stats — CPU + MEM fluctuate; gives the bar life
  (function sysStats() {
    var cpuEl = document.getElementById('status-cpu');
    var memEl = document.getElementById('status-mem');
    if (!cpuEl && !memEl) return;
    var cpu = 38, mem = 1.2;
    function step() {
      // random walk so values feel like a live process
      cpu = Math.max(18, Math.min(82, cpu + (Math.random() - 0.5) * 12));
      mem = Math.max(0.6, Math.min(1.9, mem + (Math.random() - 0.5) * 0.18));
      if (cpuEl) cpuEl.textContent = 'CPU\u00A0' + Math.round(cpu) + '%';
      if (memEl) memEl.textContent = 'MEM\u00A0' + mem.toFixed(1) + 'GB';
    }
    step();
    setInterval(step, 2400);
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

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
  function flashTransition(region){
    var $f = $('#page-flash'); if (!$f.length) return;
    var name = region.replace('#','');
    $f.html('&gt; loading <span style="color:#33ff66">' + name + '.module</span>... ');
    $f.addClass('show');
    setTimeout(function(){
      $f.append('<span class="ok">\u2713</span>');
    }, 180);
    setTimeout(function(){ $f.removeClass('show'); }, 460);
  }

  $(window).on('load hashchange', function(ev){
    $('.content-region').hide().css('animation', 'none');
    $('.main-menu a').removeClass('active');

    var region = location.hash || $('.main-menu a:first').attr('href');
    var $region = $(region);
    $region.show();
    $region[0].offsetHeight;            // force reflow
    $region.css('animation', '');
    $('.main-menu a[href="'+ region +'"]').addClass('active');
    setActiveCursor();
    if (ev && ev.type === 'hashchange') flashTransition(region);

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

  // 3a) T-MINUS countdowns for News & Forthcoming
  (function tminus() {
    var nodes = document.querySelectorAll('.news-tminus[data-date]');
    if (!nodes.length) return;
    function pad2(n){ return n < 10 ? '0' + n : '' + n; }
    function tick() {
      var now = new Date();
      // Anchor "today" at local midnight so the count doesn't flicker by hours
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      nodes.forEach(function(el) {
        var when = new Date(el.getAttribute('data-date') + 'T00:00:00');
        var days = Math.round((when - today) / 86400000);
        var label;
        el.classList.remove('past', 'imminent');
        if (days > 0) {
          label = 'T\u2212' + pad2(days) + ' DAYS';
          if (days <= 7) el.classList.add('imminent');
        } else if (days === 0) {
          label = 'T\u00B100 DAYS';
          el.classList.add('imminent');
        } else if (days >= -7) {
          label = 'T+' + pad2(-days) + ' DAYS';
          el.classList.add('past');
        } else {
          label = 'COMPLETE';
          el.classList.add('past');
        }
        el.textContent = label;
      });
    }
    tick();
    // Re-tick at midnight so the day flips even if the tab is left open
    setInterval(tick, 60 * 60 * 1000);
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

  // 4a) Console banner — easter egg for visitors who open DevTools
  (function consoleBanner(){
    if (!window.console || !console.log) return;
    var amber = 'color:#ffb000;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.4';
    var green = 'color:#33ff66;font-family:ui-monospace,Menlo,monospace;font-weight:700';
    var dim   = 'color:#8a8576;font-family:ui-monospace,Menlo,monospace;font-size:11px';
    console.log(
      '%c\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n' +
      '\u2588   %cTLY-001 \u00b7 BOOT OK%c          \u2588\n' +
      '\u2588   8 papers indexed         \u2588\n' +
      '\u2588   14 conferences           \u2588\n' +
      '\u2588   5 languages              \u2588\n' +
      '\u2588   \u221e espressos              \u2588\n' +
      '\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588',
      amber, green, amber
    );
    console.log('%c> source: github.com/tlyeungae', dim);
    console.log('%c> hit ` (backtick) to summon the terminal', dim);
    console.log('%c> try the konami code', dim);
  })();

  // 4b) Konami code — engineering mode
  (function konami(){
    var seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var pos = 0;
    document.addEventListener('keydown', function(e){
      var k = e.key;
      if (k === 'B') k = 'b'; else if (k === 'A') k = 'a';
      if (k === seq[pos]) {
        pos++;
        if (pos === seq.length) { pos = 0; engineeringMode(); }
      } else {
        pos = (k === seq[0]) ? 1 : 0;
      }
    });
    function engineeringMode(){
      document.body.classList.add('engineering-mode');
      if (window.console && console.log) {
        console.log(
          '%c> ENGINEERING MODE ENGAGED',
          'color:#33ff66;font-family:ui-monospace,monospace;font-size:14px;font-weight:700'
        );
      }
      setTimeout(function(){
        document.body.classList.remove('engineering-mode');
        if (window.console && console.log) {
          console.log('%c> ENGINEERING MODE OFF', 'color:#8a8576;font-family:ui-monospace,monospace');
        }
      }, 5200);
    }
  })();

  // 4c) Mini terminal
  $(function miniTerm(){
    var $term = $('#mini-term');
    if (!$term.length) return;
    var $output = $('#term-output');
    var $input  = $('#term-input');
    var $close  = $term.find('.term-close');
    var history = [];
    var hPos = -1;

    // Floating tab to invite people
    $('body').append('<button class="term-tab" type="button"><span class="key">`</span>open terminal</button>');
    var $tab = $('.term-tab');
    $tab.on('click', show);

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, function(c){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
      });
    }
    function out(html, cls){
      var div = document.createElement('div');
      div.className = 'term-line' + (cls ? ' ' + cls : '');
      div.innerHTML = html;
      $output[0].appendChild(div);
      $output[0].scrollTop = $output[0].scrollHeight;
    }
    function show(){
      $term.addClass('open').attr('aria-hidden','false');
      $tab.addClass('hidden');
      setTimeout(function(){ $input[0].focus(); }, 50);
    }
    function hide(){
      $term.removeClass('open').attr('aria-hidden','true');
      $tab.removeClass('hidden');
      $input.blur();
    }

    var COMMANDS = {
      help: function(){
        out('available commands:');
        out('  <span class="kw">help</span>          show this list');
        out('  <span class="kw">ls</span> [target]    list research / teaching / discussion');
        out('  <span class="kw">cat</span> [file]     cv | bio | email | committee');
        out('  <span class="kw">whoami</span>         operator info');
        out('  <span class="kw">ssh</span> [host]     github | linkedin | twitter | instagram');
        out('  <span class="kw">goto</span> [tab]     home | research | discussion | code | teaching | investment | photo');
        out('  <span class="kw">theme</span> [mode]   dark | light');
        out('  <span class="kw">date</span>           local time, Lugano');
        out('  <span class="kw">echo</span> &lt;text&gt;    echo text');
        out('  <span class="kw">clear</span>          clear screen');
        out('  <span class="dim">(esc closes \u00b7 \u2191/\u2193 history)</span>');
      },
      ls: function(arg){
        if (!arg || arg === 'research' || arg === 'papers'){
          out('<span class="kw">working_papers/</span>');
          $('#research .paper-card .paper-title').each(function(i){
            var num = (i+1).toString().padStart(2,'0');
            out('  ['+num+']  ' + escapeHtml($(this).text().trim()));
          });
        } else if (arg === 'teaching'){
          out('<span class="kw">teaching/</span>');
          $('#teaching .course-name').each(function(){
            out('  - ' + escapeHtml($(this).text().trim()));
          });
        } else if (arg === 'discussion' || arg === 'discuss'){
          out('<span class="kw">discussion/</span>');
          $('#discussion .discussion-info strong').each(function(){
            out('  - ' + escapeHtml($(this).text().trim()));
          });
        } else if (arg === '/' || arg === 'all'){
          out('home  research  discussion  code  teaching  investment  photo');
        } else {
          out('ls: ' + escapeHtml(arg) + ': no such directory', 'err');
        }
      },
      cat: function(arg){
        if (!arg) { out('cat: usage: cat [cv|bio|email|committee]', 'err'); return; }
        if (arg === 'cv' || arg === 'cv.pdf'){
          out('opening <span class="kw">CV.pdf</span>...');
          window.open('CV.pdf', '_blank');
        } else if (arg === 'bio' || arg === 'about'){
          var bio = ($('#home .home-bio p').first().text() || '').trim();
          out(escapeHtml(bio.slice(0,360)) + (bio.length > 360 ? ' \u2026' : ''));
        } else if (arg === 'email'){
          out('<a href="mailto:tai.lo.yeung@usi.ch" style="color:var(--amber)">tai.lo.yeung@usi.ch</a>');
          out('<a href="mailto:yeungtailo@gmail.com" style="color:var(--amber)">yeungtailo@gmail.com</a>');
        } else if (arg === 'committee'){
          out('Lorenz Kueng    \u00b7 USI');
          out('Jessica Wachter \u00b7 Wharton');
          out('Alberto Plazzi  \u00b7 USI');
        } else {
          out('cat: ' + escapeHtml(arg) + ': no such file', 'err');
        }
      },
      whoami: function(){
        out('tly@usi.ch');
        out('  Tai Lo Yeung \u00b7 \u694a\u00a0\u5927\u9b6f');
        out('  PhD Candidate, Department of Economics');
        out('  Universit\u00e0 della Svizzera italiana');
      },
      ssh: function(arg){
        var urls = {
          github:    'http://github.com/tlyeungae',
          linkedin:  'https://www.linkedin.com/in/tlyeungae/',
          twitter:   'https://twitter.com/tlyeungae',
          instagram: 'https://www.instagram.com/tlyeungae/'
        };
        if (urls[arg]) { out('connecting to ' + arg + '...'); window.open(urls[arg], '_blank'); }
        else { out('ssh: unknown host: ' + escapeHtml(arg||''), 'err'); }
      },
      goto: function(arg){
        var tabs = ['home','research','discussion','code','teaching','investment','photo'];
        if (tabs.indexOf(arg) !== -1){
          out('navigating to <span class="kw">#' + arg + '</span>...');
          window.location.hash = '#' + arg;
          setTimeout(hide, 300);
        } else { out('goto: unknown destination: ' + escapeHtml(arg||''), 'err'); }
      },
      theme: function(arg){
        if (arg !== 'dark' && arg !== 'light') {
          out('theme: usage: theme [dark|light]', 'err'); return;
        }
        if (arg === 'light'){
          document.documentElement.setAttribute('data-theme','light');
          localStorage.setItem('theme','light');
        } else {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme','dark');
        }
        // refresh toggle label
        var $btn = $('#theme-toggle');
        if ($btn.length) {
          var isLight = arg === 'light';
          $btn.html(isLight ? '&lt; NIGHT' : '&lt; DAY');
        }
        out('theme set to <span class="kw">' + arg + '</span>');
      },
      date: function(){
        try {
          out(new Intl.DateTimeFormat('en-GB', {
            timeZone:'Europe/Zurich', dateStyle:'full', timeStyle:'long'
          }).format(new Date()));
        } catch(e) { out(new Date().toString()); }
      },
      echo: function(arg){ out(escapeHtml(arg || '')); },
      clear: function(){ $output.empty(); greet(); },
      sudo: function(){ out('nice try.', 'err'); },
      exit: function(){ hide(); },
      konami: function(){ out('try \u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192 b a', 'dim'); }
    };

    function exec(raw){
      var cmd = raw.trim();
      out('<span class="cmd-prompt">tly@usi:~ $</span> ' + escapeHtml(cmd), 'echo');
      if (!cmd) return;
      var parts = cmd.split(/\s+/);
      var c = parts[0].toLowerCase();
      var arg = parts.slice(1).join(' ').toLowerCase();
      if (COMMANDS[c]) COMMANDS[c](arg);
      else out('command not found: ' + escapeHtml(c) + '. type \'help\'.', 'err');
    }

    function greet(){
      out('<span class="dim">// tly-001 terminal \u00b7 type \'help\' or hit esc to close</span>');
    }
    greet();

    // Global key handler — open with ` outside inputs
    document.addEventListener('keydown', function(e){
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        $term.hasClass('open') ? hide() : show();
      } else if (e.key === 'Escape' && $term.hasClass('open')) {
        hide();
      }
    });

    // Input handler
    $input.on('keydown', function(e){
      if (e.key === 'Enter') {
        var v = $input.val();
        if (v.trim()) { history.unshift(v); hPos = -1; }
        exec(v);
        $input.val('');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hPos < history.length - 1) { hPos++; $input.val(history[hPos]); }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hPos > 0) { hPos--; $input.val(history[hPos]); }
        else { hPos = -1; $input.val(''); }
      } else if (e.key === 'Escape') {
        e.preventDefault(); hide();
      } else if (e.key === 'Tab') {
        // crude tab completion
        e.preventDefault();
        var v = $input.val().trim();
        if (!v.includes(' ')) {
          var matches = Object.keys(COMMANDS).filter(function(k){ return k.startsWith(v); });
          if (matches.length === 1) $input.val(matches[0] + ' ');
          else if (matches.length > 1) out(matches.join('  '), 'dim');
        }
      }
    });

    $close.on('click', hide);
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

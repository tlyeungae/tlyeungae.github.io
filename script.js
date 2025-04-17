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

document.addEventListener('DOMContentLoaded', () => {
  // 1) grab only the photo container
  const photoSection = document.getElementById('photo');
  if (!photoSection) return; 

  // 2) build the button
  const btn = document.createElement('button');
  btn.textContent = photoSection.classList.contains('hide') 
    ? 'Show Photos' 
    : 'Hide Photos';
  btn.style.display = 'block';
  btn.style.margin = '1rem 0';

  // 3) wire up the toggle
  btn.addEventListener('click', () => {
    const isHidden = photoSection.classList.toggle('hide');
    btn.textContent = isHidden ? 'Show Photos' : 'Hide Photos';
  });

  // 4) insert it just before the photo section
  photoSection.parentNode.insertBefore(btn, photoSection);
});
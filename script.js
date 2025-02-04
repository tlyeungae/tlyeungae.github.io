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

  $(document).ready(function() {
    // Get elements
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.querySelector(".lightbox-content");
    const captionText = document.getElementById("lightbox-caption");
    const closeBtn = document.querySelector(".lightbox-close");
  
    // When a thumbnail is clicked:
    $(".photo-item a").on("click", function(e) {
      e.preventDefault(); // Prevent default link behavior
  
      // Get the href (full-size image) and data-caption
      const fullSizeImageSrc = $(this).attr("href");
      const caption = $(this).data("caption");
  
      // Populate and show the lightbox
      lightboxImg.src = fullSizeImageSrc;
      captionText.textContent = caption || "";
      lightbox.style.display = "flex"; // use flex to center horizontally
    });
  
    // Close the lightbox
    closeBtn.onclick = function() {
      lightbox.style.display = "none";
      lightboxImg.src = "";
    };
  
    // Also close on click outside the image
    lightbox.addEventListener("click", function(e) {
      if (e.target === lightbox) {
        lightbox.style.display = "none";
        lightboxImg.src = "";
      }
    });
  });
})(jQuery);
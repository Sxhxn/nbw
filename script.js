(function(){
  "use strict";

  /* ---------- Header scroll state + progress bar ---------- */
  var header = document.getElementById('siteHeader');
  var scrollBar = document.getElementById('scrollBar');

  function onScroll(){
    var y = window.scrollY || document.documentElement.scrollTop;
    if(header){ header.classList.toggle('scrolled', y > 40); }
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
    if(scrollBar){ scrollBar.style.width = pct + '%'; }
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click', function(){
      var isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded','false');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15, rootMargin:'0px 0px -60px 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---------- Generic carousel builder ---------- */
  function initCarousel(opts){
    var root = document.getElementById(opts.rootId);
    var track = document.getElementById(opts.trackId);
    var prevBtn = document.getElementById(opts.prevId);
    var nextBtn = document.getElementById(opts.nextId);
    var dotsWrap = document.getElementById(opts.dotsId);
    if(!root || !track) return;

    var slides = Array.prototype.slice.call(track.children);
    var dots = [];

    slides.forEach(function(_, i){
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Go to slide ' + (i+1));
      b.addEventListener('click', function(){ goTo(i); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });

    function activeIndex(){
      var scrollLeft = track.scrollLeft;
      var width = track.clientWidth;
      return Math.round(scrollLeft / width);
    }

    function updateDots(){
      var idx = activeIndex();
      dots.forEach(function(d,i){ d.classList.toggle('active', i === idx); });
    }

    function goTo(i){
      var width = track.clientWidth;
      track.scrollTo({ left: i * width, behavior: 'smooth' });
    }

    prevBtn && prevBtn.addEventListener('click', function(){
      var idx = activeIndex();
      goTo(Math.max(0, idx - 1));
    });
    nextBtn && nextBtn.addEventListener('click', function(){
      var idx = activeIndex();
      goTo(Math.min(slides.length - 1, idx + 1));
    });

    var scrollTimeout;
    track.addEventListener('scroll', function(){
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateDots, 80);
    }, {passive:true});

    window.addEventListener('resize', function(){
      goTo(activeIndex());
    });

    updateDots();

    /* Optional autoplay for image-only carousels */
    if(opts.autoplay){
      var timer;
      function start(){
        timer = setInterval(function(){
          var idx = activeIndex();
          var nextIdx = (idx + 1) % slides.length;
          goTo(nextIdx);
        }, opts.interval || 5000);
      }
      function stop(){ clearInterval(timer); }
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      root.addEventListener('touchstart', stop, {passive:true});
      start();
    }

    /* Pause other videos when one plays (video carousels) */
    if(opts.isVideo){
      var videos = track.querySelectorAll('video');
      videos.forEach(function(v){
        v.addEventListener('play', function(){
          videos.forEach(function(other){
            if(other !== v) other.pause();
          });
        });
      });
    }
  }

  initCarousel({
    rootId:'imgCarousel', trackId:'imgTrack', prevId:'imgPrev', nextId:'imgNext', dotsId:'imgDots',
    autoplay:true, interval:5200
  });

  initCarousel({
    rootId:'vidCarousel', trackId:'vidTrack', prevId:'vidPrev', nextId:'vidNext', dotsId:'vidDots',
    isVideo:true
  });

})();

/*!
 * main.js â€” Interface That Stand's Out
 * All interactive effects, GSAP smooth scroll & animations
 * Fixed for Computer (Desktop) & Mobile
 */
(function () {
  'use strict';

  var reduced     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Enable desktop features on larger screens (>768px) OR devices with fine pointer
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.innerWidth > 768;

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     1. GSAP SMOOTH SCROLL (replaces Lenis)
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    // Smooth anchor navigation
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          gsap.to(window, {
            duration: 1.2,
            scrollTo: { y: target, offsetY: 24 },
            ease: 'power3.inOut'
          });
        }
      });
    });

    // Momentum mousewheel smooth scrolling for computer / desktop
    if (finePointer) {
      var targetScrollY = window.scrollY;
      var isWheeling = false;

      window.addEventListener('wheel', function (e) {
        // Prevent interfering with nested scrollables
        var target = e.target;
        while (target && target !== document.body) {
          if (target.scrollHeight > target.clientHeight && ['auto', 'scroll'].indexOf(window.getComputedStyle(target).overflowY) !== -1) {
            return;
          }
          target = target.parentElement;
        }

        var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        targetScrollY = Math.max(0, Math.min(maxScroll, targetScrollY + e.deltaY));

        gsap.to(window, {
          duration: 0.75,
          scrollTo: { y: targetScrollY, autoKill: true },
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }, { passive: true });

      // Keep targetScrollY in sync when dragged or key-scrolled
      window.addEventListener('scroll', function () {
        if (!gsap.isTweening(window)) {
          targetScrollY = window.scrollY;
        }
      }, { passive: true });
    }
  } else {
    // Fallback native smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     2. HERO TITLE LETTER CASCADE
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var titleEl = document.querySelector('.hero__title');
  if (titleEl) {
    var whole = document.createElement('span');
    whole.className = 'sr-only';
    whole.textContent = Array.prototype.map.call(titleEl.querySelectorAll('.line'), function (l) {
      return l.textContent;
    }).join(' ');
    titleEl.insertBefore(whole, titleEl.firstChild);

    var charIdx = 0;
    Array.prototype.forEach.call(titleEl.querySelectorAll('.line'), function (line) {
      var text = line.textContent;
      line.setAttribute('aria-hidden', 'true');
      line.textContent = '';
      text.split(' ').forEach(function (word, wi) {
        if (wi) line.appendChild(document.createTextNode(' '));
        var w = document.createElement('span');
        w.style.display = 'inline-block';
        w.style.whiteSpace = 'nowrap';
        for (var c = 0; c < word.length; c++) {
          var s = document.createElement('span');
          s.className = 'ch';
          s.textContent = word[c];
          s.style.setProperty('--i', charIdx++);
          s.style.setProperty('--r', (Math.random() * 14 - 7).toFixed(1) + 'deg');
          w.appendChild(s);
        }
        line.appendChild(w);
      });
    });
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     3. GSAP SCROLL POP-IN (data-pop elements)
     Works reliably on computer and mobile
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var popItems = Array.prototype.slice.call(document.querySelectorAll('[data-pop]'));
  if (popItems.length) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      popItems.forEach(function (el) {
        el.classList.add('pre');
        var delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: function () {
            setTimeout(function () {
              el.classList.add('on');
              el.classList.remove('pre');
            }, delay * 1000);
          }
        });
      });
    } else if ('IntersectionObserver' in window) {
      popItems.forEach(function (el) { el.classList.add('pre'); });
      var popObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('on');
            entry.target.classList.remove('pre');
            popObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      popItems.forEach(function (el) { popObserver.observe(el); });
    } else {
      popItems.forEach(function (el) { el.classList.add('on'); });
    }
  } else {
    popItems.forEach(function (el) { el.classList.add('on'); });
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     4. AWWWARDS WORD REVEAL ON SCROLL
     Works on ALL screen sizes (computer + mobile)
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var textRevealEls = document.querySelectorAll('.text-reveal');
  var wordBlocks = [];

  function tokenizeWords() {
    textRevealEls.forEach(function (el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          return /\S/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      var textNodes = [];
      while (walker.nextNode()) { textNodes.push(walker.currentNode); }

      var spanList = [];
      textNodes.forEach(function (node) {
        var frag = document.createDocumentFragment();
        var words = node.nodeValue.split(/(\s+)/);
        words.forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) {
            frag.appendChild(document.createTextNode(' '));
          } else {
            var s = document.createElement('span');
            s.className = 'rw';
            s.textContent = w;
            var cleanWord = w.replace(/[.,:;*'"â€œâ€â€™]/g, '');
            if (/^(imagine|design|code|build|Creative|Developer|Agency|AI\/ML)$/i.test(cleanWord)) {
              s.classList.add('keyword');
            }
            frag.appendChild(s);
            spanList.push(s);
          }
        });
        node.parentNode.replaceChild(frag, node);
      });

      wordBlocks.push({ el: el, words: spanList, count: spanList.length, litIndex: 0 });
    });
  }

  tokenizeWords();

  var timelineWrapper = document.querySelector('.journey-timeline-wrapper');
  var timelineFill    = document.querySelector('.timeline-fill');

  function updateTextRevealFallback() {
    if (!wordBlocks.length) return;
    var vh = window.innerHeight;
    var revealBottomTrigger = vh * 0.90;
    var revealTopTrigger = vh * 0.35;

    wordBlocks.forEach(function (block) {
      if (!block.words.length) return;
      var rect = block.el.getBoundingClientRect();
      var totalRange = (revealBottomTrigger - revealTopTrigger) + rect.height;
      var currentOffset = revealBottomTrigger - rect.top;
      var progress = Math.max(0, Math.min(1, currentOffset / totalRange));
      var targetLit = Math.round(progress * block.count);

      if (targetLit > block.litIndex) {
        for (var i = block.litIndex; i < targetLit; i++) block.words[i].classList.add('lit');
        block.litIndex = targetLit;
      } else if (targetLit < block.litIndex) {
        for (var j = block.litIndex - 1; j >= targetLit; j--) block.words[j].classList.remove('lit');
        block.litIndex = targetLit;
      }
    });

    if (timelineWrapper && timelineFill) {
      var tRect = timelineWrapper.getBoundingClientRect();
      var tProg = (vh * 0.72 - tRect.top) / (tRect.height + vh * 0.2);
      timelineFill.style.height = (Math.max(0, Math.min(1, tProg)) * 100).toFixed(1) + '%';
    }
  }

  // GSAP ScrollTrigger word reveal â€” works seamlessly on computer AND mobile
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    wordBlocks.forEach(function (block) {
      if (!block.words.length) return;
      ScrollTrigger.create({
        trigger: block.el,
        start: 'top 90%',
        end: 'bottom 40%',
        scrub: true,
        onUpdate: function (self) {
          var target = Math.round(self.progress * block.count);
          if (target > block.litIndex) {
            for (var i = block.litIndex; i < target; i++) block.words[i].classList.add('lit');
            block.litIndex = target;
          } else if (target < block.litIndex) {
            for (var j = block.litIndex - 1; j >= target; j--) block.words[j].classList.remove('lit');
            block.litIndex = target;
          }
        }
      });
    });

    if (timelineWrapper && timelineFill) {
      ScrollTrigger.create({
        trigger: timelineWrapper,
        start: 'top 72%',
        end: 'bottom 20%',
        scrub: true,
        onUpdate: function (self) {
          timelineFill.style.height = (self.progress * 100).toFixed(1) + '%';
        }
      });
    }

    // Refresh ScrollTrigger after creating all triggers
    ScrollTrigger.refresh();

    // Refresh ScrollTrigger when images and fonts finish loading
    window.addEventListener('load', function () {
      ScrollTrigger.refresh();
    });
  } else if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    window.addEventListener('scroll', updateTextRevealFallback, { passive: true });
    updateTextRevealFallback();
  }


  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     5. PUFFY ANIMATION & MASCOT INTERACTIONS
     FIXED: Fully interactive on Computer AND Mobile
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var mascotList = document.querySelectorAll('.mascot');
  var particleIcons  = ['â˜…', 'âœ¦', 'â—', 'â™¥', 'â–²', 'âœ¨', 'âš¡', 'ðŸ’«'];
  var particleColors = ['#f26430', '#1f6b42', '#34d399', '#06b6d4', '#8b5cf6', '#eab308', '#ff7a3d'];

  function spawnParticles(mascot, originX, originY) {
    var rect = mascot.getBoundingClientRect();
    var cx = (originX !== undefined && originX !== null) ? (originX - rect.left) : (rect.width / 2);
    var cy = (originY !== undefined && originY !== null) ? (originY - rect.top) : (rect.height / 2);
    var count = 12;

    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'click-particle';
      p.textContent = particleIcons[Math.floor(Math.random() * particleIcons.length)];
      p.style.color = particleColors[Math.floor(Math.random() * particleColors.length)];
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';

      var angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      var dist = 50 + Math.random() * 60;
      var vx = Math.cos(angle) * dist;
      var vy = Math.sin(angle) * dist - 30;
      var vr = (Math.random() * 360 - 180) + 'deg';

      p.style.setProperty('--vx', vx.toFixed(1) + 'px');
      p.style.setProperty('--vy', vy.toFixed(1) + 'px');
      p.style.setProperty('--vr', vr);

      mascot.appendChild(p);
      p.addEventListener('animationend', function () {
        if (p.parentNode) p.parentNode.removeChild(p);
      });
    }
  }

  mascotList.forEach(function (m) {
    var lastTap = -1000;
    var floatTarget = m.querySelector('.float') || m;

    function triggerPuffyAction(e) {
      var now = performance.now();
      if (now - lastTap < 360) return;
      lastTap = now;

      // CSS keyframe animation trigger
      m.classList.remove('wiggle', 'squish');
      void m.offsetWidth;
      m.classList.add('squish');

      // GSAP super-puffy elastic squish (works on computer and mobile!)
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(floatTarget,
          { scaleX: 1, scaleY: 1 },
          {
            keyframes: [
              { scaleX: 1.34, scaleY: 0.68, duration: 0.16, ease: 'power2.out' },
              { scaleX: 0.82, scaleY: 1.28, duration: 0.22, ease: 'power2.inOut' },
              { scaleX: 1.12, scaleY: 0.92, duration: 0.18, ease: 'elastic.out(1.2, 0.4)' },
              { scaleX: 1, scaleY: 1, duration: 0.2, ease: 'power1.out' }
            ],
            overwrite: 'auto'
          }
        );
      }

      var cx = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
      var cy = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
      spawnParticles(m, cx, cy);
    }

    // Hover effect on computer
    if (finePointer) {
      m.addEventListener('mouseenter', function () {
        if (!m.classList.contains('squish')) {
          m.classList.remove('wiggle');
          void m.offsetWidth;
          m.classList.add('wiggle');
        }
      });
    }

    // Click on computer / Tap on mobile
    m.addEventListener('click', function (e) {
      triggerPuffyAction(e);
    });

    m.addEventListener('animationend', function (e) {
      if ((e.animationName || '').indexOf('mascot-') !== -1) {
        m.classList.remove('wiggle', 'squish');
      }
    });
  });

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     6. TAPE MARQUEE â€” right-to-left, scroll-surges
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var tapeTrack = document.querySelector('.tape__track');
  var tape      = document.querySelector('.tape');
  var mX = 0, mV = 1.4, tapeHover = false, singleLoopWidth = 0;

  function measureTape() {
    if (tapeTrack && tapeTrack.children[0]) {
      singleLoopWidth = tapeTrack.children[0].offsetWidth;
    }
  }

  if (tapeTrack) {
    tapeTrack.classList.add('is-js');
    measureTape();
    window.addEventListener('resize', measureTape);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureTape);
    if (tape) {
      tape.addEventListener('pointerenter', function () { tapeHover = true; });
      tape.addEventListener('pointerleave', function () { tapeHover = false; });
    }
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     7. POINTER PARALLAX & MAGNETIC BUTTONS (Computer only)
     KEY FIX: Uses CSS custom properties (--tx, --ty)
     so parallax does NOT override puffy squish animation!
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var stage       = document.querySelector('.stage');
  var stageMascots = stage ? Array.prototype.slice.call(stage.querySelectorAll('.mascot')) : [];
  var ptr         = { x: 0, y: 0, targetX: 0, targetY: 0 };
  var mags        = [];
  var signupCard  = document.querySelector('.signup .card');
  var cardTilt    = { rx: 0, ry: 0, targetRx: 0, targetRy: 0 };

  if (finePointer) {
    stageMascots.forEach(function (m, idx) {
      m.dataset.depth = ['0.6', '1.1', '0.75'][idx % 3];
    });

    if (stage) {
      stage.addEventListener('mousemove', function (e) {
        var r = stage.getBoundingClientRect();
        ptr.targetX = ((e.clientX - r.left) / r.width) * 2 - 1;
        ptr.targetY = ((e.clientY - r.top) / r.height) * 2 - 1;
      });
      stage.addEventListener('mouseleave', function () {
        ptr.targetX = 0;
        ptr.targetY = 0;
      });
    }

    document.querySelectorAll('.pill--accent, .btn').forEach(function (el) {
      var state = { x: 0, y: 0, targetX: 0, targetY: 0, el: el };
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var cap = 18;
        state.targetX = Math.max(-cap, Math.min(cap, (e.clientX - (r.left + r.width / 2)) * 0.28));
        state.targetY = Math.max(-cap, Math.min(cap, (e.clientY - (r.top + r.height / 2)) * 0.28));
      });
      el.addEventListener('mouseleave', function () {
        state.targetX = 0;
        state.targetY = 0;
      });
      mags.push(state);
    });

    if (signupCard) {
      signupCard.addEventListener('mousemove', function (e) {
        var r = signupCard.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        cardTilt.targetRx = -dy * 7;
        cardTilt.targetRy = dx * 9;
      });
      signupCard.addEventListener('mouseleave', function () {
        cardTilt.targetRx = 0;
        cardTilt.targetRy = 0;
      });
    }
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     8. SVG ARROW DRAW ON SCROLL
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var arrowSvg = document.querySelector('.arrow');
  if (arrowSvg && 'IntersectionObserver' in window) {
    try {
      arrowSvg.querySelectorAll('path').forEach(function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
      });
      var arrowObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            arrowSvg.classList.add('drawn');
            arrowObs.disconnect();
          }
        });
      }, { threshold: 0.35 });
      arrowObs.observe(arrowSvg);
    } catch (e) {
      console.warn('Arrow stroke error', e);
    }
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     9. MASTER RAF LOOP
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var lastTime = performance.now();
  var lastScrollY = window.scrollY || 0;
  var heroTitle = document.querySelector('.hero__title');

  function tick(t) {
    requestAnimationFrame(tick);
    var dt = Math.min(Math.max((t - lastTime) / 1000, 0.001), 0.05);
    lastTime = t;

    var currentY = window.scrollY || window.pageYOffset || 0;
    var scrollVel = (currentY - lastScrollY) / dt;
    lastScrollY = currentY;

    // A) Tape Marquee
    if (tapeTrack) {
      if (singleLoopWidth <= 0 && tapeTrack.children[0]) singleLoopWidth = tapeTrack.children[0].offsetWidth;
      if (singleLoopWidth > 0) {
        var surge = Math.min(Math.abs(scrollVel) * 0.28, 420);
        var targetSpeed = (tapeHover ? 0.35 : 1.5) + (surge * dt);
        mV += (targetSpeed - mV) * Math.min(1, dt * 4);
        mX -= mV;
        if (mX <= -singleLoopWidth) mX += singleLoopWidth;
        tapeTrack.style.transform = 'translate3d(' + mX.toFixed(2) + 'px, 0, 0)';
      }
    }

    // B) Hero Parallax
    if (heroTitle) {
      heroTitle.style.transform = 'translate3d(0, ' + (currentY * 0.12).toFixed(1) + 'px, 0)';
    }

    // C) Mascot Parallax via CSS variables --tx, --ty
    // This allows CSS transforms (squish, wiggle, bounce) to work simultaneously!
    if (finePointer && stageMascots.length) {
      var sf = Math.min(1, dt * 5.5);
      ptr.x += (ptr.targetX - ptr.x) * sf;
      ptr.y += (ptr.targetY - ptr.y) * sf;
      stageMascots.forEach(function (m) {
        var d = parseFloat(m.dataset.depth || '1');
        m.style.setProperty('--tx', (ptr.x * 22 * d).toFixed(1) + 'px');
        m.style.setProperty('--ty', (ptr.y * 14 * d).toFixed(1) + 'px');
      });
    }

    // D) Magnetic Buttons
    if (finePointer && mags.length) {
      var mf = Math.min(1, dt * 8);
      mags.forEach(function (st) {
        st.x += (st.targetX - st.x) * mf;
        st.y += (st.targetY - st.y) * mf;
        st.el.style.transform = 'translate3d(' + st.x.toFixed(1) + 'px, ' + st.y.toFixed(1) + 'px, 0)';
      });
    }

    // E) Signup Card 3D Tilt
    if (finePointer && signupCard) {
      var tf2 = Math.min(1, dt * 6);
      cardTilt.rx += (cardTilt.targetRx - cardTilt.rx) * tf2;
      cardTilt.ry += (cardTilt.targetRy - cardTilt.ry) * tf2;
      signupCard.style.transform = 'rotateX(' + cardTilt.rx.toFixed(2) + 'deg) rotateY(' + cardTilt.ry.toFixed(2) + 'deg)';
    }
  }

  requestAnimationFrame(tick);

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     10. FORM & MODAL DIALOG
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var form        = document.querySelector('.signup__form');
  var modal       = document.getElementById('success-modal');
  var lastFocused = null;

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('[data-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (input && input.checkValidity()) {
        openModal();
        form.reset();
      } else if (input) {
        input.reportValidity();
      }
    });
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close') || e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeModal();
  });

})();
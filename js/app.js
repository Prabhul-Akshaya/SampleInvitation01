/*!
 * Wedding Invitation — app.js
 * ---------------------------------------------------------------
 * This file contains NO wedding-specific content. Every name, date,
 * address, message, image path and color comes from wedding.json.
 * To create a new invitation, edit wedding.json and the files in
 * /images — this script never needs to change.
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';

  var DATA_URL = 'wedding.json';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Populated once wedding.json loads. */
  var weddingData = null;

  /** Lightbox state */
  var galleryImages = [];
  var lightboxIndex = 0;
  var lastFocusedBeforeLightbox = null;

  /** Countdown timer handle so it can be cleared if needed. */
  var countdownTimerId = null;

  var ICON_MAP = {
    heart: 'icon-heart',
    ring: 'icon-ring',
    lotus: 'icon-lotus',
    star: 'icon-star',
    pin: 'icon-pin',
    calendar: 'icon-calendar',
    clock: 'icon-clock'
  };

  document.addEventListener('DOMContentLoaded', init);

  /* ======================================================================
     BOOTSTRAP
     ====================================================================== */

  async function init() {
    initializeNav();
    initializeLightbox();
    initializeScrollIndicator();

    try {
      weddingData = await loadWeddingData();
    } catch (err) {
      console.error('[wedding] Failed to load wedding.json:', err);
      showLoadError();
      return;
    }

    applyTheme(weddingData.theme);
    applyDocumentMeta(weddingData.meta, weddingData.couple);

    renderHero(weddingData);
    renderInvitation(weddingData);
    renderCountdown(weddingData);
    renderStory(weddingData);
    renderEvents(weddingData);
    renderCouplePhoto(weddingData);
    renderGallery(weddingData);
    renderVenue(weddingData);
    renderRSVP(weddingData);
    renderClosing(weddingData);
    renderFooter(weddingData);

    initializeMusic(weddingData.music);
    initializeAnimations();

    hideLoader();
  }

  /** 1. Fetch wedding.json and parse it. */
  function loadWeddingData() {
    return fetch(DATA_URL, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) {
        throw new Error('HTTP ' + res.status + ' while fetching ' + DATA_URL);
      }
      return res.json();
    });
  }

  function showLoadError() {
    var loader = document.getElementById('loader');
    if (!loader) return;
    loader.innerHTML = '';
    var msg = document.createElement('p');
    msg.className = 'loader__text';
    msg.style.maxWidth = '320px';
    msg.style.padding = '0 24px';
    msg.style.textAlign = 'center';
    msg.textContent =
      'We could not load the invitation details. Please make sure wedding.json is in the same folder as index.html, then refresh the page.';
    loader.appendChild(msg);
  }

  function hideLoader() {
    var loader = document.getElementById('loader');
    if (!loader) return;
    loader.classList.add('is-hidden');
    window.setTimeout(function () {
      loader.setAttribute('aria-hidden', 'true');
    }, 700);
  }

  /* ======================================================================
     GENERIC HELPERS
     ====================================================================== */

  function get(obj, path, fallback) {
    var parts = path.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
      if (current === undefined || current === null) return fallback;
      current = current[parts[i]];
    }
    return current === undefined || current === null || current === '' ? fallback : current;
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = byId(id);
    if (!el) return;
    el.textContent = value || '';
  }

  function hideEl(el) {
    if (el) el.setAttribute('hidden', '');
  }

  function showEl(el) {
    if (el) el.removeAttribute('hidden');
  }

  function hideSection(id) {
    hideEl(byId(id));
  }

  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function makeIconUse(symbolId) {
    var svgNS = 'http://www.w3.org/2000/svg';
    var xlinkNS = 'http://www.w3.org/1999/xlink';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(svgNS, 'use');
    use.setAttributeNS(xlinkNS, 'href', '#' + symbolId);
    use.setAttribute('href', '#' + symbolId);
    svg.appendChild(use);
    return svg;
  }

  /**
   * Wires an <img> to a data-driven src with graceful fallback.
   * If src is empty, or the image fails to load, `onMissing` runs
   * (typically hiding the image or its parent container) instead of
   * leaving a broken-image icon on the page.
   */
  function setImage(imgEl, src, alt, onMissing) {
    if (!imgEl) return;
    var fallback = onMissing || function () { imgEl.style.display = 'none'; };
    if (!src) {
      fallback();
      return;
    }
    imgEl.addEventListener(
      'error',
      function handleError() {
        imgEl.removeEventListener('error', handleError);
        fallback();
      },
      { once: true }
    );
    imgEl.src = src;
    imgEl.alt = alt || '';
  }

  /* ======================================================================
     THEME + DOCUMENT META
     ====================================================================== */

  function applyTheme(theme) {
    if (!theme) return;
    var root = document.documentElement.style;
    var map = {
      primary: '--color-primary',
      primaryDark: '--color-primary-dark',
      secondary: '--color-secondary',
      secondaryLight: '--color-secondary-light',
      background: '--color-background',
      surface: '--color-surface',
      text: '--color-text',
      textMuted: '--color-text-muted',
      accent: '--color-accent',
      fontDisplay: '--font-display',
      fontBody: '--font-body',
      fontScript: '--font-script'
    };
    Object.keys(map).forEach(function (key) {
      if (theme[key]) root.setProperty(map[key], theme[key]);
    });
  }

  function applyDocumentMeta(meta, couple) {
    var displayName = get(couple, 'displayName', null) ||
      (couple && couple.bride && couple.groom ? couple.bride + ' & ' + couple.groom : null);
    var title = get(meta, 'siteTitle', null) || (displayName ? displayName + ' — Wedding Invitation' : 'Wedding Invitation');
    document.title = title;

    var description = get(meta, 'description', null);
    if (description) {
      var descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute('content', description);
    }
  }

  /* ======================================================================
     2 & 3 — HERO
     ====================================================================== */

  function renderHero(data) {
    var couple = data.couple || {};
    var invitation = data.invitation || {};
    var date = data.date || {};
    var location = data.location || {};

    setImage(byId('heroImage'), couple.heroImage, [couple.bride, couple.groom].filter(Boolean).join(' & '));
    setText('heroEyebrow', get(invitation, 'eyebrow', 'Together with their families'));
    setText('heroBride', couple.bride || '');
    setText('heroGroom', couple.groom || '');
    setText('heroDate', date.display || '');
    setText('heroPlace', location.city || location.venue || '');
  }

  /* ======================================================================
     4 — INVITATION MESSAGE
     ====================================================================== */

  function renderInvitation(data) {
    var invitation = data.invitation || {};
    var families = data.families || {};

    setText('invitationEyebrow', get(invitation, 'eyebrow', 'Together with their families'));
    setText('invitationTitle', get(invitation, 'title', 'With joyful hearts'));
    setText('invitationMessage', get(invitation, 'message', ''));

    var container = byId('invitationFamilies');
    if (!container) return;
    container.innerHTML = '';

    var sides = [families.bride, families.groom].filter(Boolean);
    if (sides.length === 0) {
      hideEl(container);
      return;
    }

    sides.forEach(function (side) {
      var card = createEl('div', 'family-card');
      if (side.heading) card.appendChild(createEl('p', 'family-card__heading', side.heading));
      if (side.name) card.appendChild(createEl('p', 'family-card__name', side.name));
      if (side.parents) card.appendChild(createEl('p', 'family-card__parents', side.parents));
      container.appendChild(card);
    });
  }

  /* ======================================================================
     5 — COUNTDOWN
     ====================================================================== */

  function renderCountdown(data) {
    var countdown = data.countdown || {};
    var iso = get(data, 'date.iso', null);

    setText('countdownHeading', get(countdown, 'heading', 'Counting down to forever'));

    var timerEl = byId('countdownTimer');
    var completeEl = byId('countdownComplete');
    if (!timerEl) return;

    if (!iso) {
      hideSection('countdown');
      return;
    }

    var targetTime = new Date(iso).getTime();
    if (isNaN(targetTime)) {
      hideSection('countdown');
      return;
    }

    var units = [
      { key: 'days', label: 'Days' },
      { key: 'hours', label: 'Hours' },
      { key: 'minutes', label: 'Minutes' },
      { key: 'seconds', label: 'Seconds' }
    ];

    timerEl.innerHTML = '';
    var valueEls = {};
    units.forEach(function (unit) {
      var block = createEl('div', 'countdown__unit');
      var value = createEl('p', 'countdown__value', '00');
      value.setAttribute('data-unit', unit.key);
      var line = createEl('span', 'countdown__value-line');
      var label = createEl('p', 'countdown__label', unit.label);
      block.appendChild(value);
      block.appendChild(line);
      block.appendChild(label);
      timerEl.appendChild(block);
      valueEls[unit.key] = value;
    });

    function tick() {
      var diff = targetTime - Date.now();
      if (diff <= 0) {
        window.clearInterval(countdownTimerId);
        hideEl(timerEl);
        if (completeEl) {
          completeEl.textContent = get(countdown, 'completedMessage', 'The celebration has begun.');
          showEl(completeEl);
        }
        return;
      }
      var totalSeconds = Math.floor(diff / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      valueEls.days.textContent = String(days);
      valueEls.hours.textContent = pad2(hours);
      valueEls.minutes.textContent = pad2(minutes);
      valueEls.seconds.textContent = pad2(seconds);
    }

    tick();
    countdownTimerId = window.setInterval(tick, 1000);
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  /* ======================================================================
     6 — OUR STORY
     ====================================================================== */

  function renderStory(data) {
    var story = data.story || {};
    if (story.enabled === false) {
      hideSection('story');
      return;
    }

    setText('storyTitle', get(story, 'title', 'Our Story'));

    var paragraphsEl = byId('storyParagraphs');
    var paragraphs = Array.isArray(story.paragraphs) ? story.paragraphs.filter(Boolean) : [];
    if (paragraphsEl) {
      paragraphsEl.innerHTML = '';
      if (paragraphs.length === 0) {
        hideEl(paragraphsEl);
      } else {
        showEl(paragraphsEl);
        paragraphs.forEach(function (p) {
          paragraphsEl.appendChild(createEl('p', null, p));
        });
      }
    }

    var timeline = Array.isArray(data.storyTimeline) ? data.storyTimeline.filter(Boolean) : [];
    var timelineEl = byId('storyTimelineList');
    if (!timelineEl) return;
    timelineEl.innerHTML = '';

    if (timeline.length === 0) {
      hideEl(timelineEl);
      return;
    }
    showEl(timelineEl);

    timeline.forEach(function (item, index) {
      var li = createEl('li', 'timeline-item' + (index % 2 === 1 ? ' timeline-item--reverse' : ''));

      if (item.image) {
        var mediaDiv = createEl('div', 'timeline-item__media');
        var img = document.createElement('img');
        img.loading = 'lazy';
        setImage(img, item.image, item.title || '', function () {
          mediaDiv.remove();
          li.classList.add('timeline-item--text-only');
        });
        mediaDiv.appendChild(img);
        li.appendChild(mediaDiv);
      } else {
        li.classList.add('timeline-item--text-only');
      }

      var body = createEl('div', 'timeline-item__body');
      if (item.date) body.appendChild(createEl('p', 'timeline-item__date', item.date));
      if (item.title) body.appendChild(createEl('h3', 'timeline-item__title', item.title));
      if (item.description) body.appendChild(createEl('p', 'timeline-item__desc', item.description));
      li.appendChild(body);

      timelineEl.appendChild(li);
    });
  }

  /* ======================================================================
     7 — WEDDING EVENTS
     ====================================================================== */

  function renderEvents(data) {
    var events = Array.isArray(data.events) ? data.events.filter(Boolean) : [];
    var listEl = byId('eventsList');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (events.length === 0) {
      hideSection('events');
      return;
    }

    events.forEach(function (event) {
      var card = createEl('article', 'event-card');

      var iconWrap = createEl('div', 'event-card__icon');
      iconWrap.appendChild(makeIconUse(ICON_MAP[event.icon] || ICON_MAP.heart));
      card.appendChild(iconWrap);

      var hasThumb = !!event.image;
      var content = createEl('div', 'event-card__content' + (hasThumb ? ' event-card__content--with-thumb' : ''));

      var body = createEl('div', 'event-card__body');
      if (event.name) body.appendChild(createEl('h3', 'event-card__name', event.name));

      var meta = createEl('div', 'event-card__meta');
      if (event.date) meta.appendChild(metaItem('icon-calendar', event.date));
      if (event.time) meta.appendChild(metaItem('icon-clock', event.time));
      if (event.venue) meta.appendChild(metaItem('icon-pin', event.venue));
      if (meta.children.length) body.appendChild(meta);

      if (event.description) body.appendChild(createEl('p', 'event-card__desc', event.description));

      if (event.mapUrl) {
        var link = document.createElement('a');
        link.className = 'event-card__link';
        link.href = event.mapUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.appendChild(makeIconUse('icon-pin'));
        link.appendChild(document.createTextNode('View Location'));
        body.appendChild(link);
      }

      if (hasThumb) {
        var thumb = createEl('div', 'event-card__thumb');
        var img = document.createElement('img');
        img.loading = 'lazy';
        setImage(img, event.image, event.name || '', function () {
          thumb.remove();
        });
        thumb.appendChild(img);
        content.appendChild(thumb);
      }

      content.appendChild(body);
      card.appendChild(content);
      listEl.appendChild(card);
    });

    function metaItem(iconId, text) {
      var span = createEl('span');
      span.appendChild(makeIconUse(iconId));
      span.appendChild(document.createTextNode(text));
      return span;
    }
  }

  /* ======================================================================
     8 — COUPLE PHOTO
     ====================================================================== */

  function renderCouplePhoto(data) {
    var couple = data.couple || {};
    if (!couple.coupleImage) {
      hideSection('couple');
      return;
    }
    setImage(byId('coupleImage'), couple.coupleImage, [couple.bride, couple.groom].filter(Boolean).join(' & '), function () {
      hideSection('couple');
    });
  }

  /* ======================================================================
     9 — PHOTO GALLERY + LIGHTBOX
     ====================================================================== */

  function renderGallery(data) {
    var gallery = Array.isArray(data.gallery) ? data.gallery.filter(Boolean) : [];
    var grid = byId('galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    galleryImages = [];

    if (gallery.length === 0) {
      hideSection('gallery');
      return;
    }

    var coupleNames = [get(data, 'couple.bride', ''), get(data, 'couple.groom', '')].filter(Boolean).join(' & ');

    gallery.forEach(function (src, index) {
      var alt = 'Wedding photo ' + (index + 1) + (coupleNames ? ' of ' + coupleNames : '');
      galleryImages.push({ src: src, alt: alt });

      var item = createEl('div', 'gallery__item');
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'View photo ' + (index + 1) + ' of ' + gallery.length + ' in full screen');

      var img = document.createElement('img');
      img.loading = 'lazy';
      setImage(img, src, alt, function () {
        item.remove();
      });
      item.appendChild(img);

      item.addEventListener('click', function () {
        openLightbox(index);
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });

      grid.appendChild(item);
    });
  }

  function initializeLightbox() {
    var lightbox = byId('lightbox');
    var imageEl = byId('lightboxImage');
    var counterEl = byId('lightboxCounter');
    var closeBtn = byId('lightboxClose');
    var prevBtn = byId('lightboxPrev');
    var nextBtn = byId('lightboxNext');
    if (!lightbox) return;

    function update() {
      var item = galleryImages[lightboxIndex];
      if (!item) return;
      imageEl.src = item.src;
      imageEl.alt = item.alt;
      counterEl.textContent = lightboxIndex + 1 + ' / ' + galleryImages.length;
    }

    function next() {
      lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
      update();
    }

    function prev() {
      lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
      update();
    }

    window.openLightboxInternal = function (index) {
      if (!galleryImages.length) return;
      lightboxIndex = index;
      lastFocusedBeforeLightbox = document.activeElement;
      update();
      showEl(lightbox);
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    function close() {
      hideEl(lightbox);
      document.body.style.overflow = '';
      if (lastFocusedBeforeLightbox && typeof lastFocusedBeforeLightbox.focus === 'function') {
        lastFocusedBeforeLightbox.focus();
      }
    }

    closeBtn.addEventListener('click', close);
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hasAttribute('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Touch swipe support
    var touchStartX = null;
    lightbox.addEventListener(
      'touchstart',
      function (e) {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      'touchend',
      function (e) {
        if (touchStartX === null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) {
          if (dx < 0) next();
          else prev();
        }
        touchStartX = null;
      },
      { passive: true }
    );

    window.__closeLightbox = close;
  }

  function openLightbox(index) {
    if (typeof window.openLightboxInternal === 'function') {
      window.openLightboxInternal(index);
    }
  }

  /* ======================================================================
     10 — VENUE
     ====================================================================== */

  function renderVenue(data) {
    var location = data.location || {};
    var section = byId('venue');

    setText('venueName', location.venue || '');
    setText('venueAddress', location.address || '');

    var mapLink = byId('venueMapLink');
    if (mapLink) {
      if (location.mapUrl) {
        mapLink.href = location.mapUrl;
        showEl(mapLink);
      } else {
        hideEl(mapLink);
      }
    }

    var img = byId('venueImage');
    if (data.venueImage) {
      setImage(img, data.venueImage, location.venue || 'Wedding venue', function () {
        img.closest('.venue__media').style.display = 'none';
        if (section) section.classList.add('venue--single');
      });
      if (section) section.classList.remove('venue--single');
    } else {
      if (img && img.closest('.venue__media')) img.closest('.venue__media').style.display = 'none';
      if (section) section.classList.add('venue--single');
    }
  }

  /* ======================================================================
     11 — RSVP
     ====================================================================== */

  function renderRSVP(data) {
    var rsvp = data.rsvp || {};
    if (rsvp.enabled === false) {
      hideSection('rsvp');
      return;
    }

    setText('rsvpHeading', get(rsvp, 'heading', 'Please join us'));
    setText('rsvpMessage', get(rsvp, 'message', ''));

    var deadlineEl = byId('rsvpDeadline');
    if (deadlineEl) {
      if (rsvp.deadline) {
        deadlineEl.textContent = 'Kindly RSVP by ' + rsvp.deadline;
        showEl(deadlineEl);
      } else {
        hideEl(deadlineEl);
      }
    }

    var button = byId('rsvpButton');
    if (button) {
      if (rsvp.whatsapp) {
        var digits = String(rsvp.whatsapp).replace(/[^\d]/g, '');
        var coupleName =
          get(data, 'couple.displayName', null) ||
          [get(data, 'couple.bride', ''), get(data, 'couple.groom', '')].filter(Boolean).join(' & ');
        var template = get(rsvp, 'messageTemplate', 'Hello! I would like to RSVP for the wedding of {couple}.');
        var message = template.replace('{couple}', coupleName);
        button.href = 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message);
        showEl(button);
      } else {
        hideEl(button);
      }
    }

    var contactEl = byId('rsvpContact');
    if (contactEl) {
      var bits = [rsvp.contactName, rsvp.phone].filter(Boolean);
      if (bits.length) {
        contactEl.textContent = bits.join(' \u00B7 ');
        showEl(contactEl);
      } else {
        hideEl(contactEl);
      }
    }
  }

  /* ======================================================================
     12 — CLOSING
     ====================================================================== */

  function renderClosing(data) {
    var closing = data.closing || {};
    var lines = Array.isArray(closing.lines) ? closing.lines.filter(Boolean) : [];
    var lineIds = ['closingLine1', 'closingLine2', 'closingLine3'];

    lineIds.forEach(function (id, i) {
      var el = byId(id);
      if (!el) return;
      if (lines[i]) {
        el.textContent = lines[i];
        showEl(el);
      } else {
        hideEl(el);
      }
    });

    var couple = data.couple || {};
    var displayName = couple.displayName || [couple.bride, couple.groom].filter(Boolean).join(' & ');
    setText('closingNames', displayName);
    setText('closingDate', get(data, 'date.display', ''));

    var img = byId('closingImage');
    var src = closing.image || couple.heroImage;
    setImage(img, src, displayName);
  }

  /* ======================================================================
     13 — FOOTER
     ====================================================================== */

  function renderFooter(data) {
    var footer = data.footer || {};
    setText('footerText', get(footer, 'text', 'Made with love'));
    setText('footerCredit', get(footer, 'credit', ''));
  }

  /* ======================================================================
     MUSIC
     ====================================================================== */

  function initializeMusic(music) {
    var toggle = byId('musicToggle');
    var audio = byId('bgMusic');
    if (!toggle || !audio) return;

    if (!music || music.enabled !== true || !music.file) {
      hideEl(toggle);
      return;
    }

    audio.src = music.file;
    audio.loop = music.loop !== false;

    // NOTE: autoplay is intentionally never triggered automatically, even if
    // music.autoplay is true in wedding.json — most mobile browsers block
    // unmuted autoplay, and an invitation that suddenly plays sound on load
    // is a poor first impression. Playback always starts from a user tap.
    showEl(toggle);

    toggle.addEventListener('click', function () {
      if (audio.paused) {
        audio
          .play()
          .then(function () {
            toggle.classList.add('is-playing');
            toggle.setAttribute('aria-label', 'Pause background music');
          })
          .catch(function (err) {
            console.warn('[wedding] Could not start playback:', err);
          });
      } else {
        audio.pause();
        toggle.classList.remove('is-playing');
        toggle.setAttribute('aria-label', 'Play background music');
      }
    });

    audio.addEventListener('ended', function () {
      if (!audio.loop) {
        toggle.classList.remove('is-playing');
        toggle.setAttribute('aria-label', 'Play background music');
      }
    });
  }

  /* ======================================================================
     FLOATING NAVIGATION
     ====================================================================== */

  function initializeNav() {
    var nav = byId('floatingNav');
    var toggle = byId('navToggle');
    var menu = byId('navMenu');
    if (!nav || !toggle || !menu) return;

    function open() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function toggleMenu() {
      if (nav.classList.contains('is-open')) close();
      else open();
    }

    toggle.addEventListener('click', toggleMenu);

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    // Scrollspy: highlight the current section's nav link.
    var links = Array.prototype.slice.call(menu.querySelectorAll('[data-nav-link]'));
    var sectionIds = links
      .map(function (a) {
        return a.getAttribute('href').replace('#', '');
      })
      .filter(function (id) {
        return byId(id);
      });

    if (!('IntersectionObserver' in window) || sectionIds.length === 0) return;

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = menu.querySelector('[href="#' + entry.target.id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.remove('is-active');
            });
            link.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sectionIds.forEach(function (id) {
      spy.observe(byId(id));
    });
  }

  /* ======================================================================
     SCROLL INDICATOR
     ====================================================================== */

  function initializeScrollIndicator() {
    var btn = byId('scrollIndicator');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var target = byId('invitation');
      if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ======================================================================
     SCROLL-TRIGGERED REVEAL ANIMATIONS
     ====================================================================== */

  function initializeAnimations() {
    var targets = Array.prototype.slice.call(document.querySelectorAll('.reveal, .event-card, .gallery__item'));
    if (targets.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }
})();

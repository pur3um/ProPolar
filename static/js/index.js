// Helpers from the Academic Project Page Template, trimmed to what this page uses.
// The carousel, video, and "more works" code of the template is removed, so the page
// no longer needs jQuery and no longer throws on load or on the Escape key.

function copyBibTeX() {
  var code = document.getElementById('bibtex-code');
  var button = document.querySelector('.copy-bibtex-btn');
  if (!code || !button) return;
  var label = button.querySelector('.copy-text');
  var text = code.textContent;

  function done() {
    button.classList.add('copied');
    if (label) label.textContent = 'Copied';
    setTimeout(function () {
      button.classList.remove('copied');
      if (label) label.textContent = 'Copy';
    }, 2000);
  }

  function fallback() {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      done();
    } catch (err) {
      console.error('Copy failed:', err);
    }
    document.body.removeChild(area);
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(fallback);
  } else {
    fallback();
  }
}

function scrollToTop() {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

window.addEventListener('scroll', function () {
  var button = document.querySelector('.scroll-to-top');
  if (!button) return;
  button.classList.toggle('visible', window.pageYOffset > 300);
}, { passive: true });

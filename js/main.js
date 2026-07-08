/* ------------------------------------------------------------------
   Rachel Sargent — front-end interactions only.

   The page's HTML is generated at build time by build.py from content.json,
   so there is NO content fetching or rendering here. This file only adds the
   two progressive-enhancement touches: the floating section nav (scroll-spy +
   show/hide) and the on-scroll reveals. To change content, edit content.json.
   ------------------------------------------------------------------ */

/* Scroll-spy: highlight the section-nav link for the section in view.
   The nav pill is always visible; this just moves the active underline. */
function initSectionNav() {
  const links = Array.from(document.querySelectorAll(".section-link"));
  if (!links.length || !("IntersectionObserver" in window)) return;

  const sections = links
    .map((l) => document.getElementById(l.dataset.section))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((l) => l.classList.toggle("is-active", l.dataset.section === id));
  };
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    // Active band sits in the upper-middle of the viewport
    { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));
}

/* Reveal .on-scroll elements as they enter the viewport */
function initScrollReveal() {
  const items = document.querySelectorAll(".on-scroll");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );
  items.forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", function () {
  initScrollReveal();
  initSectionNav();
});

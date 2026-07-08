/* ------------------------------------------------------------------
   Rachel Sargent — front-end interactions only.

   The page's HTML is generated at build time by build.py from content.json,
   so there is NO content fetching or rendering here. This file only adds the
   two progressive-enhancement touches: the floating section nav (scroll-spy +
   show/hide) and the on-scroll reveals. To change content, edit content.json.
   ------------------------------------------------------------------ */

/* Scroll-spy + visibility for the floating bottom section nav.
   Content is never hidden — this only moves an underline and shows the pill. */
function initSectionNav() {
  const nav = document.getElementById("section-nav");
  const links = Array.from(document.querySelectorAll(".section-link"));
  if (!nav || !links.length || !("IntersectionObserver" in window)) return;

  const sections = links
    .map((l) => document.getElementById(l.dataset.section))
    .filter(Boolean);

  // --- Scroll-spy: mark the section currently in view ---
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

  // --- Visibility: show after the hero, hide over the footer ---
  const hero = document.getElementById("hero");
  const footer = document.querySelector("footer");
  let pastHero = false;
  let footerVisible = false;
  const update = () =>
    nav.classList.toggle("nav-visible", pastHero && !footerVisible);

  if (hero) {
    new IntersectionObserver(
      ([e]) => {
        pastHero = !e.isIntersecting;
        update();
      },
      { threshold: 0 }
    ).observe(hero);
  } else {
    pastHero = true;
  }

  if (footer) {
    new IntersectionObserver(
      ([e]) => {
        footerVisible = e.isIntersecting;
        update();
      },
      { threshold: 0 }
    ).observe(footer);
  }

  update();
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

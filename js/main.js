/* ------------------------------------------------------------------
   Rachel Sargent — site logic
   Reads content.json and renders the page. No framework, no build step.
   To change the site's words and books, edit content.json — not this file.
   ------------------------------------------------------------------ */

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* Fallback SVG cover drawn when a book has no `cover` image */
function placeholderCover(title = "", author = "") {
  const t = escapeHtml(title).slice(0, 40);
  const a = escapeHtml(author).slice(0, 40);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600" role="img" aria-label="${t}">
      <rect width="400" height="600" fill="#DFE7EE"/>
      <rect x="16" y="16" width="368" height="568" fill="none" stroke="#AEBECB" stroke-width="1.5"/>
      <text x="200" y="270" text-anchor="middle" fill="#1B2530" font-family="Georgia, serif" font-size="26" font-style="italic">${t}</text>
      <text x="200" y="330" text-anchor="middle" fill="#5C6A78" font-family="Georgia, serif" font-size="16" letter-spacing="2">${a}</text>
    </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function renderBio(data) {
  const set = (field, value) => {
    document.querySelectorAll(`[data-field="${field}"]`).forEach((el) => {
      el.textContent = value || "";
    });
  };
  set("name", data.name);

  // Intro: accepts a single string or a list of paragraphs
  const introEl = document.getElementById("intro");
  if (introEl) {
    const paragraphs = Array.isArray(data.intro) ? data.intro : [data.intro];
    introEl.innerHTML = paragraphs
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");
  }

  // Contact email
  const emailEl = document.getElementById("contact-email");
  if (emailEl && data.email) {
    emailEl.textContent = data.email;
    emailEl.href = "mailto:" + data.email;
  }

  // Social links
  const socialList = document.getElementById("social-list");
  if (socialList && Array.isArray(data.social)) {
    socialList.innerHTML = data.social
      .map(
        (s) =>
          `<li><a class="nav-link" href="${escapeHtml(s.href)}">${escapeHtml(
            s.label
          )}</a></li>`
      )
      .join("");
  }
}

function renderBooks(gridId, books = []) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!books.length) {
    grid.innerHTML = `<li class="col-span-full text-muted italic">Books coming soon.</li>`;
    return;
  }

  grid.innerHTML = books
    .map((book, i) => {
      const title = escapeHtml(book.title);
      const author = escapeHtml(book.author);
      const meta = book.category ? escapeHtml(book.category) : "";
      const cover = book.cover
        ? escapeHtml(book.cover)
        : placeholderCover(book.title, book.author);

      const inner = `
        <div class="book-cover">
          <img src="${cover}" alt="Cover of ${title}" loading="lazy"
               onerror="this.onerror=null;this.src='${placeholderCover(
                 book.title,
                 book.author
               )}'" />
        </div>
        <div class="mt-4">
          <h3 class="font-display text-lg leading-snug tracking-tight">${title}</h3>
          ${author ? `<p class="text-muted text-sm mt-1 italic">${author}</p>` : ""}
          ${meta ? `<p class="text-muted text-xs tracking-wide mt-1.5">${meta}</p>` : ""}
        </div>`;

      const body = book.link
        ? `<a class="book-card group" href="${escapeHtml(
            book.link
          )}" target="_blank" rel="noopener">${inner}</a>`
        : `<div class="book-card">${inner}</div>`;

      return `<li class="on-scroll" style="transition-delay:${(i % 4) * 70}ms">${body}</li>`;
    })
    .join("");
}

function renderWriting(pieces = []) {
  const list = document.getElementById("writing-list");
  if (!list) return;

  if (!pieces.length) {
    list.innerHTML = `<li class="writing-row text-muted italic">Writing coming soon.</li>`;
    return;
  }

  list.innerHTML = pieces
    .map((p, i) => {
      const title = escapeHtml(p.title);
      const pub = escapeHtml(p.publication);
      const year = p.year ? escapeHtml(p.year) : "";
      const excerpt = p.excerpt ? escapeHtml(p.excerpt) : "";
      const hasLink = p.link && p.link !== "#";

      const titleMarkup = hasLink
        ? `<a href="${escapeHtml(
            p.link
          )}" target="_blank" rel="noopener" class="writing-link">${title}<span class="arrow"> ↗</span></a>`
        : title;

      const metaParts = [];
      if (pub) metaParts.push(`<span class="italic">${pub}</span>`);
      if (year) metaParts.push(year);
      const meta = metaParts.join(" · ");

      return `
        <li class="writing-row on-scroll" style="transition-delay:${(i % 6) * 60}ms">
          <div class="flex flex-col md:flex-row md:items-baseline md:justify-between md:gap-6">
            <h3 class="font-display text-lg leading-snug tracking-tight">${titleMarkup}</h3>
            ${meta ? `<p class="text-muted text-xs tracking-wide mt-1 md:mt-0 md:text-right md:whitespace-nowrap shrink-0">${meta}</p>` : ""}
          </div>
          ${excerpt ? `<p class="text-muted text-sm mt-1.5 leading-relaxed">${excerpt}</p>` : ""}
        </li>`;
    })
    .join("");
}

function renderAwards(awards = []) {
  const list = document.getElementById("awards-list");
  if (!list) return;

  if (!awards.length) {
    list.innerHTML = `<li class="writing-row text-muted italic">Awards coming soon.</li>`;
    return;
  }

  list.innerHTML = awards
    .map((a, i) => {
      const title = escapeHtml(a.title);
      const detail = a.detail ? escapeHtml(a.detail) : "";
      const year = a.year ? escapeHtml(a.year) : "";

      return `
        <li class="writing-row on-scroll" style="transition-delay:${(i % 6) * 60}ms">
          <div class="flex flex-col md:flex-row md:items-baseline md:justify-between md:gap-6">
            <h3 class="font-display text-lg leading-snug tracking-tight">${title}</h3>
            ${year ? `<p class="text-muted text-xs tracking-wide mt-1 md:mt-0 md:text-right md:whitespace-nowrap shrink-0">${year}</p>` : ""}
          </div>
          ${detail ? `<p class="text-muted text-sm mt-1.5 leading-relaxed">${detail}</p>` : ""}
        </li>`;
    })
    .join("");
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

/* Reveal the page (it starts hidden so content doesn't pop in after paint) */
function revealPage() {
  document.documentElement.classList.remove("loading");
}

/* Kick the fetch off immediately, before DOMContentLoaded, to shave latency */
const contentPromise = fetch("content.json", { cache: "no-cache" }).then((res) => {
  if (!res.ok) throw new Error(`content.json returned ${res.status}`);
  return res.json();
});

async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();

  try {
    const data = await contentPromise;
    renderBio(data);
    renderBooks("books-edited", data.booksEdited);
    renderBooks("books-coedited", data.booksCoedited);
    renderWriting(data.writing);
    renderAwards(data.awards);
    initScrollReveal();
  } catch (err) {
    console.error("Could not load content.json:", err);
    const grid = document.getElementById("books-edited");
    if (grid) {
      grid.innerHTML = `<li class="col-span-full text-muted italic">Content failed to load. If you're opening this file directly, run it through a local server (see README).</li>`;
    }
  } finally {
    // Content is now in the DOM (or failed) — show the page as one complete paint
    revealPage();
  }
}

document.addEventListener("DOMContentLoaded", init);

// Safety net: never leave the page hidden if something stalls
setTimeout(revealPage, 2000);

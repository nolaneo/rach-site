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
      <rect width="400" height="600" fill="#E7E7E5"/>
      <rect x="16" y="16" width="368" height="568" fill="none" stroke="#BDBDBB" stroke-width="1.5"/>
      <text x="200" y="270" text-anchor="middle" fill="#1C1C1B" font-family="Georgia, serif" font-size="26" font-style="italic">${t}</text>
      <text x="200" y="330" text-anchor="middle" fill="#6E6E6C" font-family="Georgia, serif" font-size="16" letter-spacing="2">${a}</text>
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

function renderBooks(books = []) {
  const grid = document.getElementById("books-grid");
  if (!grid) return;

  if (!books.length) {
    grid.innerHTML = `<li class="col-span-full text-muted italic">Books coming soon.</li>`;
    return;
  }

  grid.innerHTML = books
    .map((book, i) => {
      const title = escapeHtml(book.title);
      const author = escapeHtml(book.author);
      const year = book.year ? escapeHtml(book.year) : "";
      const role = book.role ? escapeHtml(book.role) : "";
      const cover = book.cover
        ? escapeHtml(book.cover)
        : placeholderCover(book.title, book.author);

      const meta = [role, year].filter(Boolean).join(" · ");

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
          )}" target="_blank" rel="noopener" class="hover:text-muted transition-colors">${title}<span class="text-muted"> ↗</span></a>`
        : title;

      return `
        <li class="writing-row on-scroll" style="transition-delay:${(i % 6) * 60}ms">
          <div>
            <h3 class="font-display text-xl md:text-2xl font-light tracking-tight leading-snug">${titleMarkup}</h3>
            ${excerpt ? `<p class="text-muted mt-1.5 leading-relaxed">${excerpt}</p>` : ""}
          </div>
          <div class="text-sm text-muted tracking-wide whitespace-nowrap">
            ${pub ? `<span class="italic">${pub}</span>` : ""}${pub && year ? " · " : ""}${year}
          </div>
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

async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();

  try {
    const res = await fetch("content.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`content.json returned ${res.status}`);
    const data = await res.json();

    renderBio(data);
    renderBooks(data.books);
    renderWriting(data.writing);
    initScrollReveal();
  } catch (err) {
    console.error("Could not load content.json:", err);
    const grid = document.getElementById("books-grid");
    if (grid) {
      grid.innerHTML = `<li class="col-span-full text-muted italic">Content failed to load. If you're opening this file directly, run it through a local server (see README).</li>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", init);

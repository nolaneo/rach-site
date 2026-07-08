#!/usr/bin/env python3
"""
build.py — generate index.html from content.json + template.html.

No dependencies, no framework. Reads the editable content (content.json),
renders every section to plain HTML, drops it into template.html, and writes a
fully-rendered index.html. Run it directly (`python3 build.py`) or let the
GitHub Action run it on deploy. For a live-reloading local preview, use dev.py.
"""

import json
import os
import urllib.parse
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def esc(value=""):
    """HTML-escape text (mirrors the old client-side escapeHtml)."""
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def placeholder_cover(title="", author=""):
    """Fallback SVG cover (data URI) drawn when a book has no cover image."""
    t = esc(title)[:40]
    a = esc(author)[:40]
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" '
        'width="400" height="600" role="img" aria-label="{t}">'
        '<rect width="400" height="600" fill="#DFE7EE"/>'
        '<rect x="16" y="16" width="368" height="568" fill="none" stroke="#AEBECB" stroke-width="1.5"/>'
        '<text x="200" y="270" text-anchor="middle" fill="#1B2530" '
        'font-family="Georgia, serif" font-size="26" font-style="italic">{t}</text>'
        '<text x="200" y="330" text-anchor="middle" fill="#5C6A78" '
        'font-family="Georgia, serif" font-size="16" letter-spacing="2">{a}</text>'
        "</svg>"
    ).format(t=t, a=a)
    # quote() encodes quotes/apostrophes too, so it is safe inside attributes.
    return "data:image/svg+xml;charset=utf-8," + urllib.parse.quote(svg)


def render_intro(intro):
    paragraphs = intro if isinstance(intro, list) else [intro]
    return "".join(f"<p>{esc(p)}</p>" for p in paragraphs if p)


def render_books(books):
    if not books:
        return '<li class="col-span-full text-muted italic">Books coming soon.</li>'

    out = []
    for i, book in enumerate(books):
        title = esc(book.get("title", ""))
        author = esc(book.get("author", ""))
        meta = esc(book["category"]) if book.get("category") else ""
        placeholder = placeholder_cover(book.get("title", ""), book.get("author", ""))
        cover = esc(book["cover"]) if book.get("cover") else placeholder

        author_html = f'<p class="text-muted text-sm mt-1 italic">{author}</p>' if author else ""
        meta_html = f'<p class="text-muted text-xs tracking-wide mt-1.5">{meta}</p>' if meta else ""

        inner = (
            '\n        <div class="book-cover">'
            f'\n          <img src="{cover}" alt="Cover of {title}" loading="lazy"'
            f"\n               onerror=\"this.onerror=null;this.src='{placeholder}'\" />"
            "\n        </div>"
            '\n        <div class="mt-4">'
            f'\n          <h3 class="font-display text-lg leading-snug tracking-tight">{title}</h3>'
            f"\n          {author_html}"
            f"\n          {meta_html}"
            "\n        </div>"
        )

        if book.get("link"):
            body = (
                f'<a class="book-card group" href="{esc(book["link"])}" '
                f'target="_blank" rel="noopener">{inner}</a>'
            )
        else:
            body = f'<div class="book-card">{inner}</div>'

        delay = (i % 3) * 70
        out.append(f'<li class="on-scroll" style="transition-delay:{delay}ms">{body}</li>')
    return "".join(out)


def render_writing(pieces):
    if not pieces:
        return '<li class="writing-row text-muted italic">Writing coming soon.</li>'

    out = []
    for i, p in enumerate(pieces):
        title = esc(p.get("title", ""))
        pub = esc(p.get("publication", ""))
        year = esc(p["year"]) if p.get("year") else ""
        excerpt = esc(p["excerpt"]) if p.get("excerpt") else ""
        has_link = p.get("link") and p.get("link") != "#"

        if has_link:
            title_html = (
                f'<a href="{esc(p["link"])}" target="_blank" rel="noopener" '
                f'class="writing-link">{title}</a>'
            )
        else:
            title_html = title

        meta_parts = []
        if pub:
            meta_parts.append(f'<span class="italic">{pub}</span>')
        if year:
            meta_parts.append(year)
        meta = " · ".join(meta_parts)
        meta_html = (
            f'<p class="text-muted text-xs tracking-wide mt-1 md:mt-0 md:text-right '
            f'md:whitespace-nowrap shrink-0">{meta}</p>'
            if meta
            else ""
        )
        excerpt_html = (
            f'<p class="text-muted text-sm mt-1.5 leading-relaxed">{excerpt}</p>'
            if excerpt
            else ""
        )
        delay = (i % 6) * 60
        out.append(
            f'<li class="writing-row on-scroll" style="transition-delay:{delay}ms">'
            '<div class="flex flex-col md:flex-row md:items-baseline md:justify-between md:gap-6">'
            f'<h3 class="font-display text-lg leading-snug tracking-tight">{title_html}</h3>'
            f"{meta_html}</div>{excerpt_html}</li>"
        )
    return "".join(out)


def render_awards(awards):
    if not awards:
        return '<li class="writing-row text-muted italic">Awards coming soon.</li>'

    out = []
    for i, a in enumerate(awards):
        title = esc(a.get("title", ""))
        detail = esc(a["detail"]) if a.get("detail") else ""
        year = esc(a["year"]) if a.get("year") else ""

        year_html = (
            f'<p class="text-muted text-xs tracking-wide mt-1 md:mt-0 md:text-right '
            f'md:whitespace-nowrap shrink-0">{year}</p>'
            if year
            else ""
        )
        detail_html = (
            f'<p class="text-muted text-sm mt-1.5 leading-relaxed">{detail}</p>'
            if detail
            else ""
        )
        delay = (i % 6) * 60
        out.append(
            f'<li class="writing-row on-scroll" style="transition-delay:{delay}ms">'
            '<div class="flex flex-col md:flex-row md:items-baseline md:justify-between md:gap-6">'
            f'<h3 class="font-display text-lg leading-snug tracking-tight">{title}</h3>'
            f"{year_html}</div>{detail_html}</li>"
        )
    return "".join(out)


def render_social(social):
    return "".join(
        f'<li><a class="nav-link" href="{esc(s.get("href", ""))}">{esc(s.get("label", ""))}</a></li>'
        for s in (social or [])
    )


def build():
    data = json.loads((ROOT / "content.json").read_text(encoding="utf-8"))
    template = (ROOT / "template.html").read_text(encoding="utf-8")

    name = esc(data.get("name", ""))
    email = data.get("email", "")

    replacements = {
        "{{NAME}}": name,
        "{{INTRO}}": render_intro(data.get("intro", [])),
        "{{EMAIL_HREF}}": ("mailto:" + esc(email)) if email else "#",
        "{{EMAIL_TEXT}}": esc(email),
        "{{BOOKS_EDITED}}": render_books(data.get("booksEdited", [])),
        "{{BOOKS_COEDITED}}": render_books(data.get("booksCoedited", [])),
        "{{WRITING}}": render_writing(data.get("writing", [])),
        "{{AWARDS}}": render_awards(data.get("awards", [])),
        "{{SOCIAL}}": render_social(data.get("social", [])),
        "{{YEAR}}": str(datetime.now().year),
    }

    html = template
    for token, value in replacements.items():
        html = html.replace(token, value)

    # Write atomically so the dev server never serves a half-written file.
    out_path = ROOT / "index.html"
    tmp_path = ROOT / "index.html.tmp"
    tmp_path.write_text(html, encoding="utf-8")
    os.replace(tmp_path, out_path)
    return out_path


if __name__ == "__main__":
    path = build()
    print(f"Built {path.relative_to(ROOT)}")

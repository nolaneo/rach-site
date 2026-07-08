# How to edit the website

Hi! This guide explains how to update your site without needing any technical
tools. Everything you'll normally change lives in **one file: `content.json`**.

When you save a change, GitHub automatically rebuilds the site and it goes live
in about a minute. (Behind the scenes a small script turns `content.json` into
the finished page — you never have to touch that. Just edit `content.json`.)

---

## The golden rules

`content.json` is written in a format called JSON. It's fussy about
punctuation, so keep these three rules in mind:

1. **Keep the quotation marks.** Every piece of text sits inside `"double quotes"`.
   Change the words, but leave the quotes.
2. **Keep the commas** between items — but **not** after the *last* item in a list.
3. If something looks broken after an edit, you probably deleted a `"`, `,`,
   `{`, or `}` by accident. Undo and try again.

> Tip: paste your finished text into <https://jsonlint.com> to check it's valid
> before saving. It will point to any mistakes.

---

## Editing on GitHub (no software needed)

1. Go to the repository on GitHub.
2. Click the **`content.json`** file.
3. Click the **pencil icon** (✏️ "Edit this file") in the top-right.
4. Make your changes.
5. Scroll down, click the green **Commit changes** button, then **Commit** again.
6. Wait ~1 minute, then refresh your live site to see the update.

---

## Changing your intro / bio

Near the top of `content.json` you'll see:

```json
"name": "Rachel Sargent",
"intro": [
  "Your first paragraph goes here...",
  "Your second paragraph goes here..."
],
"email": "rmsargent11@gmail.com",
```

- **name** — your name, shown at the top of the page.
- **intro** — your introduction, written as a list of paragraphs. Each
  paragraph sits inside its own `"quotes"`, separated by commas. Add a line to
  add a paragraph, or delete a line to remove one (no comma after the last one).
- **email** — where the "Get in touch" button points (this is public on the site).

Just replace the text between the quotes.

---

## The sections of the site

Below the intro, the page has these sections, each with its own list in
`content.json`:

| Section on the page      | List in `content.json` |
| ------------------------ | ---------------------- |
| Books I've Edited        | `booksEdited`          |
| Books I've Co-Edited     | `booksCoedited`        |
| Fiction                  | `writing`              |
| Awards & Honors          | `awards`               |

---

## Adding or changing a book

Both book lists (`booksEdited` and `booksCoedited`) work the same way. Each book
looks like this:

```json
{
  "title": "Evil Genius",
  "author": "Claire Oshetsky",
  "category": "Novel",
  "cover": "images/covers/evil-genius.jpg",
  "link": ""
}
```

- **title / author** — the book's details.
- **category** — a short label under the author, e.g. `Novel`, `Stories`,
  `Poems`, `Memoir`, `Nonfiction`. Leave as `""` to show nothing.
- **cover** — the path to the cover image (see below).
- **link** — an optional web address (e.g. the publisher's page). Leave it as
  `""` if there isn't one; the cover just won't be clickable.

**To add a book**, copy one whole block (from `{` to `}`), paste it into the
list, add a comma between blocks, and edit the details. Order in the file =
order on the page.

**To remove a book**, delete its whole `{ ... }` block (and the comma next to it).

### Adding a cover image

1. On GitHub, open the **`images/covers`** folder.
2. Click **Add file → Upload files** and drag in your cover (JPG or PNG is fine).
3. Commit the upload.
4. In `content.json`, set that book's `"cover"` to
   `"images/covers/your-file-name.jpg"`.

If you leave a cover out or the file can't be found, the site automatically
shows a neat placeholder with the title on it — nothing will look broken.

---

## Adding a piece of writing

Find the `"writing"` section. Each piece looks like this:

```json
{
  "title": "What Comes After",
  "publication": "Gulf Coast",
  "year": 2024,
  "link": "https://gulfcoastmag.org/stories/what-comes-after,4611?"
}
```

- **link** — the web address of the story. Leave it as `""` if it isn't
  online; the title just won't be clickable.

---

## Adding an award or honor

Find the `"awards"` section. Each entry looks like this:

```json
{
  "title": "Finalist — Tucson Festival of Books Literary Awards: Short Story",
  "detail": "For the short story “Your Life Will Begin Shortly”",
  "year": 2023
}
```

- **title** — the main line (the award).
- **detail** — the smaller line underneath (optional; use `""` for none).
- **year** — shown on the right.

---

That's it. If you ever get stuck, ask Eoin — but honestly, you've got this. 📚

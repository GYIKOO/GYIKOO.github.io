# Xinyi Gao's homepage

Personal academic homepage at <https://gyikoo.me/>, deployed from the root of
`main` through GitHub Pages. No build step is required.

## Editing the site

- `index.html`: biography, publications, news, experience, contact links and SEO.
- `style.css`: Editorial theme plus the personal green palette and custom styles.
- `script.js`: theme toggle, anchor navigation and upstream's optional config renderer.
- `profile.jpg`: profile photograph.
- `CNAME`: custom domain. Preserve this file during template updates.

The static HTML is the source of truth for personal content. The upstream
`config.js` sample is deliberately omitted and is not loaded by `index.html`.
Its renderer assumes a single publication list and Education/Experience columns;
enabling it directly would lose our Conference/Journal and Teaching/Work grouping,
rich biography links and other custom markup. Migrate those explicitly before
opting into configuration-driven content. The current site works without JavaScript.

## Upstream relationship

Template: [Galaxy-Dawn/academic-homepage-templates](https://github.com/Galaxy-Dawn/academic-homepage-templates),
directory `themes/editorial`, under the original [MIT license](LICENSE).
See [UPSTREAM.md](UPSTREAM.md) for pinned commits, adopted changes and the update procedure.

The repository began with an independent initial commit. The first synchronization
joins its existing history to the extracted Editorial history using a merge commit.
This avoids replacing the live homepage with the upstream theme gallery or adding
other themes and preview images. GitHub's fork badge is not required for this workflow.

**Merge synchronization pull requests using Create a merge commit.** Squash or
rebase merging drops the upstream parent relationship and undermines later merges.

## Validation

Run `node --test tests/navigation.test.cjs` (Node.js 22 or later). The same checks
run on pull requests and pushes to `main`. Before publishing a template update,
preview `index.html` and check desktop/mobile layouts, dark/light mode, anchor
navigation, keyboard navigation and personal content. Automated checks do not
replace visual review.

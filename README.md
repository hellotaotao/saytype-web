# TypeAloud Website

Product marketing homepage for TypeAloud, a Tauri desktop voice input app. macOS is the primary tested path; Windows and Linux builds remain experimental.

## Product message

The homepage leads with local transcription, no account and no subscription. Both languages present local benefits before the short workflow; optional cloud features are disclosed below the primary pitch. Download prerequisites appear before the final download action. These claims apply to local transcription, not optional cloud services.

Hold `Ctrl+Shift`, speak, release: TypeAloud transcribes with the configured engine and inserts text at the cursor. `Escape` cancels. Local Qwen3 transcription needs no account or API key after the model download. Optional Groq/OpenAI transcription uploads audio to the configured provider using the user's own key; provider charges may apply.

Copy is checked against `../SayType` at tag `v1.15.2`, especially `README.md`, `docs/local-asr.md`, `docs/cloud-transcription.md`, `docs/dictation-recovery.md`, the Settings UI, and the updater implementation. Hardware-aware onboarding/default changes in the desktop working tree are not advertised as released behavior.

- Uses the system-default microphone; select the device in operating-system sound settings.
- Qwen3-ASR 0.6B is the recommended local model (~1 GB download). Qwen3-ASR 1.7B (~2.52 GB) and Nemotron live transcription are experimental.
- Apple Silicon is recommended for local dictation, not a universal installation requirement.
- History stores completed transcripts for copying. Failed transcription can be retried with the current engine when its audio was saved.
- Updates download in the background; the user chooses when to restart.
- Microphone and macOS Accessibility permissions are required for the complete macOS workflow.

## Languages

All six routes reuse `src/SiteHeader.tsx` with identical navigation and download controls. The separate EN / 中文 segmented control sits between navigation and download on desktop; mobile uses a shared logo/language row followed by navigation. The route is the language source of truth: English uses `/`, `/updates`, `/changelog`; Simplified Chinese uses `/zh`, `/zh/updates`, `/zh/changelog`. Navigation stays in the current language. Switching preserves the equivalent page, query string and hash, and refreshing preserves the language without cookies or browser-language redirects.

Chinese milestones live in `src/content/milestones.zh.json` and share IDs and source versions with the English milestones. Chinese release history displays upstream Chinese notes first with English originals in a disclosure. The two English-only legacy releases use explicitly labeled website translations from `src/content/release-translations.zh.json`. Future English-only releases show an explicit fallback notice; raw release bodies remain unchanged. Real product screenshots retain the language in which they were captured.

## Product visuals

The home page no longer embeds app screenshots. Its product visuals are drawn in CSS and scale as one image:

- `src/DictationDemo.tsx` — the looping hold / speak / release demo in the hero (shown under the workflow heading below 900px). The floating prompt follows the app's `input-prompt.css`.
- `src/Illustrations.tsx` — the any-app cards in the product section, the three workflow step tiles and the local-benefit icons.

Every scene rests on a complete static frame when `prefers-reduced-motion` is set. `public/og-image.jpg` is a 1200 x 630 capture of the hero used for link previews; recapture it when the hero changes.

## Implementation

- React, Vite and TypeScript; no additional runtime dependency for motion.
- `src/content/productMessaging.ts` holds the structured English product copy; `src/content/homeCopy.ts` holds its Chinese translations.
- `src/motion.ts` runs the one-time section reveals and scopes their lifecycle to the page. The hero entrance is CSS; both use transform/opacity only. The looping product scenes live in `DictationDemo.css` and `Illustrations.css`.
- Reduced motion disables entrance, reveals, scene loops, transitions and smooth scrolling. No hidden-by-default reveal content. Observers, animations, frame requests and listeners are cleaned up.
- Downloads resolve current GitHub assets on a normal click. Modified clicks, metadata errors or missing assets open the latest release page instead of a pinned obsolete installer.

## Development and validation

```bash
npm install
npm run lint
npx tsc -b --pretty false
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4175
```

Check the page at 320, 390, 768, 1100, 1280 and 1440px: anchor navigation, model disclosure, per-platform download links, download fallback, reduced motion, console/network errors and overflow. Production output is `dist/`. Deployments are separate from local validation.

## Comparison and guide pages

Four search-intent pages exist in both languages (`/wispr-flow-alternative`, `/typeless-alternative`, `/offline-dictation-mac`, `/chinese-english-dictation`, and the same under `/zh`). Copy, page titles, descriptions and FAQs live in `src/content/landingPages.json`; `src/landing/LandingPage.tsx` renders them and `src/landing/GuideLinks.tsx` links to them from every page. To add a page, add its entry to the JSON and its id to `landingPageIds` in `src/i18n.ts`; routing, pre-rendering, the sitemap and FAQ structured data follow.

Competitor prices, limits and platforms are quoted from the official pages listed in each entry's `sources`, with the `checked` date shown under the table. Recheck them when that date gets old. TypeAloud claims on these pages follow the same rule as the homepage: nothing the released app does not do (no AI rewriting, no mobile app).

## Product updates and release history

- `/updates` is a curated timeline of product capabilities, including introduction versions and later refinements. Content lives in `src/content/milestones.json`.
- `/changelog` includes every published stable GitHub Release in `src/content/releases.json`, grouped by year and minor version. Patch notes use native disclosures; all text is present in the initial HTML. The English site shows English first and retains available Chinese notes in a separate disclosure.
- `npm run build` pre-renders all six language/page combinations, adds localized metadata, self-referencing canonicals and reciprocal `hreflang` links, and generates `sitemap.xml` and `robots.txt`. It checks the generated HTML and source links. Clean-URL HTML files and directory-index mirrors keep both slash variants readable in local preview; Vercel canonicalizes to the non-trailing-slash URL. No visitor-time GitHub or AI request is needed. All pages hydrate the static HTML; explicit layout previews are client-rendered.
- Release bodies are preserved verbatim in the snapshot. The display removes repeated installer instructions and renders a safe Markdown subset without executable HTML. Historical notes describe that release, not current support or recommendations. Versions `v1.3.3` and `v1.3.4` have installer-only placeholder notes and are explicitly marked missing. The 2025 archive predates the current Tauri implementation.
- Eight initial milestones were checked against the published release bodies. In particular, local transcription first appeared in **v1.4.0**, not the onboarding expansion in v1.5.0; saved-audio recovery began in **v1.8.0**, before its broader coverage in v1.13.3. No release-note claim is a substitute for real-device validation.

### Synchronization

Requires Node 22 or later. `GH_TOKEN` / `GITHUB_TOKEN` is optional for public reads but avoids low unauthenticated API limits.

```bash
cp src/content/releases.json /tmp/typealoud-releases-before.json
npm run releases:sync
# Offline import of an unmodified GitHub Releases API JSON array:
npm run releases:sync -- --from-file /path/to/releases.json
```

The importer paginates, excludes drafts/prereleases, detects revised notes, and writes atomically only after successful validation. A partial fetch, missing previously published release, or replacement of real notes by a placeholder fails without overwriting the snapshot. Resolve actual upstream removals manually. A missing note on a new release remains a visible gap; a later sync imports its completed body.

`.github/workflows/sync-releases.yml` checks daily, can be dispatched manually, and accepts `repository_dispatch` with event type `typealoud-release-notes-ready`. For immediate updates, send that event from the desktop release pipeline **after** its `gh release edit --notes-file` succeeds, using a token with access to this website repository. The daily check is the fallback for late/edited notes. No desktop-pipeline credentials or remote configuration are created by this change.

The workflow opens a single content PR rather than publishing automatically. Enable GitHub Actions' **Allow GitHub Actions to create and approve pull requests** repository setting for PR creation. It preserves an open review PR without overwriting reviewer edits; after merging or closing it, the next run catches up. The branch is reserved for this workflow. There is no automatic merge. Website deployment follows the repository's existing deployment process after an approved merge.

### Optional AI-assisted editorial drafts

Configure `ANTHROPIC_API_KEY` as an Actions secret and `ANTHROPIC_MODEL` as an Actions variable (or environment variables locally). No model is hardcoded. The pipeline still syncs release notes when AI is not configured.

```bash
npm run updates:draft -- --baseline /tmp/typealoud-releases-before.json
```

Only added/revised release notes plus the existing curated milestones are sent to the API. The command writes review-only proposals into `content-drafts/updates.json`; it never edits published milestones. It validates source versions, existing milestone IDs, schema and coverage. Review each proposed introduction against older releases before adding a new milestone. To publish a reviewed proposal, edit `src/content/milestones.json` and its matching Chinese entries in `src/content/milestones.zh.json`, remove the consumed draft, and run the validation commands above. AI failures do not block release-note synchronization; no API call occurs when nothing changed.

After starting the production preview, run `npm run test:http -- http://127.0.0.1:4186` (use your preview port) to verify actual route responses. This catches SPA fallback responses that look correct after JavaScript but initially serve homepage metadata instead of release content.

## Polish relay

`POST /v1/polish` (`api/polish.js`, `relay/`) forwards dictated text from the app to the polish model and returns the cleaned text. It stores counters only, never text. See [relay/README.md](relay/README.md).

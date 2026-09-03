# Lolz visual system extracted for INFERNO

Source: `references/reference.html` (SingleFile snapshot saved 2026-08-23). The prompt's expected `references/lolz/reference.html` path was not present, so the existing root-level reference was analyzed instead.

## Core values

| Role | Extracted value | Reference evidence |
| --- | --- | --- |
| Primary font | `-apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif` | Computed `body` stack |
| Base type | `14px`, weight `400`, line-height `1.28` | Computed `body` |
| Primary green | `#00ba78` | `--primaryMedium` and active/link states |
| Dark green | `#228e5d` | `--primaryLighter` and icon/button states |
| Page background | `#0c0f0e` | Computed `body` |
| Content surface | `#111615` | `--contentBackground`, panels |
| Subtle surface | `#181e1c` | Button/menu hover surface |
| Active surface | `#1e2725` | Neutral button and border surface |
| Hover surface | `#242f2b` | Panel/thread hover surface |
| Primary text | `#d6d6d6` | `--contentText`, computed `body` |
| Strong text | `#f5f5f5` | Primary button/account text |
| Muted text | `#8ca29a` | `--mutedTextColor` |
| Deep muted text | `#4a5450` | `--mutedTextColorStill` |
| Error | `#e64646` | Error/negative action styling |
| Border | `#1e2725` | Sidebar and discussion panels |
| Hover border | `#242f2b` | Discussion panel hover inset |
| Focus ring | `#2e614a` | Focused text controls |

## Geometry and interaction

- Desktop shell: `1081px` (`#headerMover`); navigation content is `1076px`.
- Fixed translucent header: `44px`, `rgb(12 15 14 / 62%)`, `blur(10px)`.
- Header at `max-width: 1024px`: `52px`.
- Desktop content begins `16px` below the header (`y = 60px`).
- Standard panel radius: `12px`; mobile/controls commonly use `10px`.
- Standard neutral/primary control: `34px` high, `14px`, weight `500`, `10px` radius.
- Header avatar: `30px`; content/reply avatar: `40px`; both circular.
- Panel spacing: `12px` between feed panels; sidebar sections use `15px`.
- Common transition: `0.15s`; selected navigation transitions also use `0.2s`.
- Primary button gradient: `linear-gradient(88deg, #20764e 0%, #2a8f5c 50%, #20764e 100%)`.
- Primary button hover layer: `linear-gradient(88deg, #1c6946 0%, #329c6c 50%, #1d8254 100%)`.
- Neutral button active state scales to `0.97`.

## Relevant breakpoints

- `1220px`: full-width navigation/page content.
- `1024px`: header becomes `52px`; desktop search/sidebar patterns collapse.
- `610px`: narrow navigation/content adjustments.
- `480px`: mobile panels and controls use full-width layouts and tighter radii.

Only reusable values needed by the current INFERNO login, auth-state, header, and dashboard screens were carried into production CSS.

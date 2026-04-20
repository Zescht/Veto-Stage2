# Changelog

## 2026-04-20

### Bug fixes
- **FOKUS veto table not rendering** — `fks-map-control-data.js` was never committed to git, so GitHub Pages returned a 404 on it. Because app.js referenced `fksMapControlData` without a `typeof` guard, this caused a `ReferenceError` that crashed rendering for the FOKUS team. Fixed by committing the file and wrapping the reference in a `safeFksMapControlData` guard so the site degrades gracefully even if the script fails to load.
- **Script caching** — All script version strings bumped to `20260420a` to force browsers to re-fetch fresh JS after the above fix.

### Data added
- Added 12 FKS retake / post-plant position JSON files (`data/fks_*`) for all 6 maps (Bind, Breeze, Fracture, Lotus, Pearl, Split) on both CT and T sides.
- Added `fks-map-control-data.js` — map control / rotation data for FOKUS.

### Previous session (2026-04-19)
- Added FOKUS map-control and rotation panels to the Map-Info view.
- Extended retake and post-plant panels to all maps for both SGE and FKS.
- Added coordinate rotation support for Split (clockwise 90°).
- Added rotation pattern time-window filter buttons.
- Renamed "Operator FK" labels to "Sniper FK" throughout.

## 2026-04-16

### Features
- Added rotation pattern time-bucket filter buttons (0–10s, 10–20s, 20–30s) to map-control panels.
- Extended site stats and post-plant panels to all maps.

## 2026-04-14

### Features
- Added Map-Info view with early positioning, sniper kills, and retake position panels for SGE across all 5 maps.
- Added FKS veto data and team profile.

# VETO_ARCHITECT — VCL EMEA 2026 Scouting Site

Standalone scouting tool for **Eintracht Frankfurt (SGE)** covering the VCL EMEA 2026 Stage 2 top cut.

**Live site:** https://zescht.github.io/Veto-Stage2/

---

## Views

### Veto
Match-by-match veto history for the five Stage 2 teams: SGE, FKS, ATN, DXG, ECO.

### Map-Info
Per-team, per-map, per-side scouting panels:
- **Position at First Kill** — where each player stood at the FK moment, bucketed by timing
- **Position OP-Kill** — Operator / Marshal kills by site and side
- **Retake Positions** — CT player positions at spike-plant, grouped by site
- **Post-Plant Positions** — T-side positions after plant
- **Rotation Patterns** — full-round player movement trails with time-bucket filters
- **Site Stats** — attack/defence round-win rates per site

---

## Data scope

Matches from **2026-04-01 onwards** only.

SGE matches in database:
- 2026-04-05 vs DXG (Lotus, Split, Pearl)
- 2026-04-07 vs ATN (Pearl, Lotus, Split)
- 2026-04-12 vs FKS (Lotus, Bind)
- 2026-04-14 vs RZN (Lotus, Split)

---

## Stack

Vanilla JS · no build step · Space Grotesk + Inter · dark theme  
Data pipeline: Python scripts → static JS data files → GitHub Pages

---

## Versions

| Version | Description |
|---|---|
| v1.0.0 | Stable baseline — all panels live, pre rotation-bucket-filter feature |

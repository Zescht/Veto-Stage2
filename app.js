const stepConfig = [
  { key: "ban1", label: "Ban 1" },
  { key: "ban2", label: "Ban 2" },
  { key: "pick1", label: "Pick 1" },
  { key: "pick2", label: "Pick 2" },
  { key: "ban3", label: "Ban 3" },
  { key: "ban4", label: "Ban 4" }
];

const allVetoHistoryData = {
  ...vetoHistoryData,
  ...(typeof extraVetoHistoryData !== "undefined" ? extraVetoHistoryData : {})
};
const allPickMeta = {
  ...vetoPickMeta,
  ...(typeof extraVetoPickMeta !== "undefined" ? extraVetoPickMeta : {})
};
const allScoreMeta = {
  ...(typeof extraVetoScoreMeta !== "undefined" ? extraVetoScoreMeta : {})
};
const allRowMeta = {
  ...(typeof extraVetoRowMeta !== "undefined" ? extraVetoRowMeta : {})
};
const allMapInfo = {
  ...(typeof mapInfoData !== "undefined" ? mapInfoData : {}),
  ...(typeof extraMapInfoData !== "undefined" ? extraMapInfoData : {})
};
const allDefensiveEarly = typeof defensiveEarlyData !== "undefined" ? defensiveEarlyData : {};
  const MAP_IMAGE_VERSION = "20260412-riot";
  const MAP_IMAGE_ASPECTS = {
    Bind: 1,
    Breeze: 1,
    Corrode: 1,
    Fracture: 1,
    Haven: 1,
    Lotus: 1,
    Pearl: 1,
    Split: 1
  };
  const MAP_IMAGE_PATHS = {
    Bind: `./maps/Bind.png?v=${MAP_IMAGE_VERSION}`,
    Breeze: `./maps/Breeze.png?v=${MAP_IMAGE_VERSION}`,
    Fracture: `./maps/Fracture.png?v=${MAP_IMAGE_VERSION}`,
    Haven: `./maps/Haven.png?v=${MAP_IMAGE_VERSION}`,
    Lotus: `./maps/Lotus.png?v=${MAP_IMAGE_VERSION}`,
    Pearl: `./maps/Pearl.png?v=${MAP_IMAGE_VERSION}`,
    Split: `./maps/Split.png?v=${MAP_IMAGE_VERSION}`,
    Corrode: `./maps/Corrode.png?v=${MAP_IMAGE_VERSION}`
  };
const ROTATED_MAPS_CW = new Set(["Haven"]);
const calibrationOverrides = {
  "dortmund|Haven|ct": [
    { x: 29.842180774748922, y: 54.85201460119412 },
    { x: 47.77618364418939, y: 91.34925893677281 },
    { x: 67.57532281205165, y: 59.01612972672995 },
    { x: 42.03730272596843, y: 48.973263835731785 }
  ],
  "dortmund|Haven|t": []
};

const teamOrder = ["fokus", "eintracht", "attax", "dortmund", "eco"].filter((key) => allVetoHistoryData[key]);
let activeTeam = teamOrder[0];
let activeView = "veto";
let startDateFilter = "";
let activeMap = "Bind";
let activeFkType = "operator";
let activeSideView = "ct";
let activeDefensiveFkFilter = "all";
let activeDefensiveMap = "Bind";
const selectedPlayerFilters = {};
const selectedDefensivePlayerFilters = {};

const viewVetoButton = document.getElementById("view-veto");
const viewMapButton = document.getElementById("view-map");
const sideControls = document.getElementById("side-controls");
const sideCtButton = document.getElementById("side-ct");
const sideTButton = document.getElementById("side-t");
const teamSelect = document.getElementById("team-select");
const historyBody = document.getElementById("history-body");
const tableTitle = document.getElementById("table-title");
const tableSubtitle = document.getElementById("table-subtitle");
const startButton = document.getElementById("start-button");
const startDateInput = document.getElementById("start-date");
const resetDateButton = document.getElementById("reset-date");
const heroTitle = document.getElementById("hero-title");
const heroCopy = document.getElementById("hero-copy");
const firstBanList = document.getElementById("first-ban-list");
const firstPickList = document.getElementById("first-pick-list");
const mostPlayedList = document.getElementById("most-played-list");
const timeframeControls = document.getElementById("timeframe-controls");
const vetoView = document.getElementById("veto-view");
const mapView = document.getElementById("map-view");
const mapInfoToolbar = document.getElementById("map-info-toolbar");
const mapModuleEyebrow = document.getElementById("map-module-eyebrow");
const mapInfoTitle = document.getElementById("map-info-title");
const mapInfoCopy = document.getElementById("map-info-copy");
const fkTypeSelect = document.getElementById("fk-type-select");
const mapSelect = document.getElementById("map-select");
const playerFilterShell = document.getElementById("player-filter-shell");
const playerFilterSummary = document.getElementById("player-filter-summary");
const playerFilterList = document.getElementById("player-filter-list");
const playerFilterAll = document.getElementById("player-filter-all");
const playerFilterNone = document.getElementById("player-filter-none");
const mapSampleCard = document.getElementById("map-sample-card");
const mapWarning = document.getElementById("map-warning");
const calibrationPanel = document.getElementById("calibration-panel");
const calibrationToggle = document.getElementById("calibration-toggle");
const calibrationReset = document.getElementById("calibration-reset");
const calibrationExport = document.getElementById("calibration-export");
const mapPlaceholder = document.getElementById("map-placeholder");
const heatmapGrid = document.getElementById("heatmap-grid");
const defensiveModule = document.getElementById("defensive-module");
const defensiveTitle = document.getElementById("defensive-title");
const defensiveCopy = document.getElementById("defensive-copy");
const defensivePanels = document.getElementById("defensive-panels");
const defensiveSampleCard = document.getElementById("defensive-sample-card");
const defensiveFkSelect = document.getElementById("defensive-fk-select");
const defensiveMapSelect = document.getElementById("defensive-map-select");
const defensivePlayerControls = document.getElementById("defensive-player-controls");
const defensivePlayerRow = document.getElementById("defensive-player-row");
const defensivePlayerAll = document.getElementById("defensive-player-all");
const defensivePlayerNone = document.getElementById("defensive-player-none");
const ctCount = document.getElementById("ct-count");
const tCount = document.getElementById("t-count");
const ctHeatTitle = document.getElementById("ct-heat-title");
const tHeatTitle = document.getElementById("t-heat-title");
const ctHeatmap = document.getElementById("ct-heatmap");
const tHeatmap = document.getElementById("t-heatmap");
let calibrationMode = false;
let dragState = null;

const DEFENSIVE_MAP_ORDER = ["Bind", "Breeze", "Lotus", "Split", "Pearl", "Haven", "Fracture", "Corrode", "Abyss", "Sunset", "Icebox"];

function getRowLookupKey(row) {
  return `${row.date}|${row.opponentAbbr ?? row.opponent}`;
}

function getStepMeta(row, stepKey) {
  const sourceMeta = allPickMeta?.[activeTeam]?.[row.source]?.[stepKey];
  if (sourceMeta && Object.keys(sourceMeta).length) return sourceMeta;
  return allRowMeta?.[activeTeam]?.[getRowLookupKey(row)]?.[stepKey] ?? {};
}

function getStepScore(row, stepKey, fallbackScore = "") {
  return (
    allScoreMeta?.[activeTeam]?.[row.source]?.[stepKey]?.score ??
    allRowMeta?.[activeTeam]?.[getRowLookupKey(row)]?.[stepKey]?.score ??
    fallbackScore ??
    ""
  );
}

function formatMapScore(score) {
  return score ? score.replace("-", ":") : "";
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit"
  }).formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value.toUpperCase() ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return { month, day };
}

function getFilteredRows(team) {
  return team.rows.filter((row) => !startDateFilter || row.date >= startDateFilter);
}

function countMaps(values) {
  const counts = new Map();
  for (const value of values) {
    if (!value || value === "-") continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });
}

function collectFirstTeamBan(row) {
  for (const key of ["ban1", "ban2"]) {
    const step = row[key];
    if (step?.ownerKind === "team" && step.map !== "-") return step.map;
  }
  return null;
}

function collectFirstTeamPick(row) {
  for (const key of ["pick1", "pick2"]) {
    const step = row[key];
    if (step?.ownerKind === "team" && step.map !== "-") return step.map;
  }
  return null;
}

function collectPlayedMaps(row) {
  const played = [];
  for (const key of ["pick1", "pick2"]) {
    const step = row[key];
    if (step?.map && step.map !== "-") played.push(step.map);
  }
  if (row.decider && getStepScore(row, "decider", row.deciderScore)) {
    played.push(row.decider);
  }
  return played;
}

function renderInsightList(target, entries, fallbackText = "No data") {
  if (!entries.length) {
    target.innerHTML = `<div class="insight-empty">${fallbackText}</div>`;
    return;
  }

  target.innerHTML = entries
    .map(
      ([map, count]) => `
        <div class="insight-row">
          <span class="insight-map">${map}</span>
          <span class="insight-count">${count}x</span>
        </div>
      `
    )
    .join("");
}

function renderInsights(team) {
  const rows = getFilteredRows(team);
  const firstBanCounts = countMaps(rows.map(collectFirstTeamBan)).slice(0, 3);
  const firstPickCounts = countMaps(rows.map(collectFirstTeamPick)).slice(0, 3);
  const playedCounts = countMaps(rows.flatMap(collectPlayedMaps)).slice(0, 3);

  renderInsightList(firstBanList, firstBanCounts);
  renderInsightList(firstPickList, firstPickCounts);
  renderInsightList(mostPlayedList, playedCounts);
}

function makeStepCell(step, row, stepKey) {
  const ownerText = step.ownerLabel === "-" ? "-" : step.ownerLabel;
  if (step.type === "pick") {
    const stepMeta = getStepMeta(row, stepKey);
    const scoreText = formatMapScore(getStepScore(row, stepKey, step.score));
    const pickLabel = step.ownerKind === "team" ? `${allVetoHistoryData[activeTeam].ownerLabel} PICK` : "OPPONENT PICK";
    return `
      <td class="map-cell">
        <div class="map-pill ${step.type} ${step.ownerKind}">
          ${scoreText ? `<p class="map-score">${scoreText}</p>` : ""}
          <p class="map-name">${step.map}</p>
          <div class="step-meta">${pickLabel}</div>
          ${stepMeta.teamStartSide ? `<div class="step-side">${stepMeta.teamStartSide}</div>` : ""}
        </div>
      </td>
    `;
  }
  return `
    <td class="map-cell">
      <div class="map-pill ${step.type} ${step.ownerKind}">
        <p class="map-name">${step.map}</p>
        <div class="owner-tag">${ownerText}</div>
      </div>
    </td>
  `;
}

function renderTable(team) {
  historyBody.innerHTML = getFilteredRows(team)
    .map((row) => {
      const { month, day } = formatDate(row.date);
      const deciderMeta = getStepMeta(row, "decider");
      const deciderScore = formatMapScore(getStepScore(row, "decider", row.deciderScore));
      const sourceMarkup = row.source
        ? `<a class="source-link" href="${row.source}" target="_blank" rel="noreferrer">${row.sourceLabel ?? "match page"}</a>`
        : `<span class="source-link source-text">${row.sourceLabel ?? "manual"}</span>`;
      return `
        <tr>
          <td>
            <div class="date-cell">
              <span class="date-label">${month} ${day}</span>
              <span class="year-tag">${row.date.slice(0, 4)}</span>
            </div>
          </td>
          <td class="opponent-cell">
            <div class="opponent-cell-wrap">
              <p class="opponent-name" title="${row.opponent}">${row.opponentAbbr ?? row.opponent}</p>
              ${sourceMarkup}
            </div>
          </td>
          ${stepConfig.map(({ key }) => makeStepCell(row[key], row, key)).join("")}
          <td class="map-cell">
            <div class="map-pill decider">
              ${deciderScore ? `<p class="map-score">${deciderScore}</p>` : ""}
              <p class="map-name">${row.decider}</p>
              <div class="step-meta">${deciderScore ? "DECIDER" : "REMAINING"}</div>
              ${deciderMeta.teamStartSide ? `<div class="step-side">${deciderMeta.teamStartSide}</div>` : ""}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderTeamSelect() {
  teamSelect.innerHTML = teamOrder
    .map((key) => `<option value="${key}">${allVetoHistoryData[key].name}</option>`)
    .join("");
  teamSelect.value = activeTeam;
}

function pluralizeSamples(count) {
  return `${count} sample${count === 1 ? "" : "s"}`;
}

function makeSampleChip(item) {
  return `<span class="sample-chip">${item.date.slice(5)} ${item.map} vs ${item.opponent}</span>`;
}

function applyHeatmapBackground(target, mapName) {
  const mapImage = MAP_IMAGE_PATHS[mapName];
  if (mapImage) {
    target.style.setProperty("--map-image", `url("${mapImage}")`);
    target.classList.add("has-map");
  } else {
    target.style.removeProperty("--map-image");
    target.classList.remove("has-map");
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCalibrationKey(teamKey, mapName, sideKey) {
  return `${teamKey}|${mapName}|${sideKey}|${activeFkType}`;
}

function getLegacyCalibrationKey(teamKey, mapName, sideKey) {
  return `${teamKey}|${mapName}|${sideKey}`;
}

function getFkTypeLabel() {
  return activeFkType === "all" ? "All First-Kill" : "Operator First-Kill";
}

function getMapPointsByType(mapData) {
  if (activeFkType === "all") {
    return {
      ct: mapData?.all_ct?.points ?? [],
      t: mapData?.all_t?.points ?? []
    };
  }
  return {
    ct: mapData?.ct?.points ?? [],
    t: mapData?.t?.points ?? []
  };
}

function getPlayerFilterKey() {
  return `${activeTeam}|${activeMap}|${activeFkType}`;
}

function getPlayerDisplayName(playerName) {
  const match = String(playerName ?? "").match(/^[A-Z0-9]{2,6}\s+(.+)$/);
  return match ? match[1] : String(playerName ?? "");
}

function collectPlayersFromPoints(ctPoints, tPoints) {
  return [...new Set([...ctPoints, ...tPoints].map((point) => point.player).filter(Boolean))].sort((a, b) =>
    getPlayerDisplayName(a).localeCompare(getPlayerDisplayName(b))
  );
}

function ensurePlayerFilterState(players) {
  const key = getPlayerFilterKey();
  if (!selectedPlayerFilters[key]) {
    selectedPlayerFilters[key] = {};
  }
  const state = selectedPlayerFilters[key];

  const validPlayers = new Set(players);
  Object.keys(state).forEach((player) => {
    if (!validPlayers.has(player)) {
      delete state[player];
    }
  });

  players.forEach((player) => {
    if (!(player in state)) {
      state[player] = true;
    }
  });

  return state;
}

function getSelectedPlayerSet(players) {
  const state = ensurePlayerFilterState(players);
  return new Set(players.filter((player) => state[player]));
}

function renderPlayerFilter(players) {
  if (!playerFilterShell || !playerFilterSummary || !playerFilterList || !playerFilterAll || !playerFilterNone) {
    return;
  }

  if (!players.length) {
    playerFilterShell.classList.add("hidden");
    return;
  }

  playerFilterShell.classList.remove("hidden");
  const state = ensurePlayerFilterState(players);
  const selectedCount = players.filter((player) => state[player]).length;
  playerFilterSummary.textContent = selectedCount === players.length ? "All" : `${selectedCount}/${players.length}`;

  playerFilterList.innerHTML = players
    .map((player) => {
      const checked = state[player] ? "checked" : "";
      const safeValue = encodeURIComponent(player);
      return `
        <label class="player-filter-item">
          <input type="checkbox" data-player-name="${safeValue}" ${checked} />
          <span>${getPlayerDisplayName(player)}</span>
        </label>
      `;
    })
    .join("");

  playerFilterAll.disabled = players.length === 0;
  playerFilterNone.disabled = players.length === 0;
}

function getDefensiveFilterKey(defensiveInfo) {
  return `${activeTeam}|${activeSideView}|${defensiveInfo?.map ?? "Bind"}|defensive`;
}

function collectDefensivePlayers(defensiveInfo) {
  const legendPlayers = (defensiveInfo?.legend ?? []).map((row) => row.player).filter(Boolean);
  if (legendPlayers.length) return legendPlayers;
  const seen = new Set();
  const out = [];
  ["lt10s", "lt20s", "lt30s"].forEach((key) => {
    (defensiveInfo?.thresholds?.[key]?.points ?? []).forEach((point) => {
      if (point?.player && !seen.has(point.player)) {
        seen.add(point.player);
        out.push(point.player);
      }
    });
  });
  return out;
}

function ensureDefensiveFilterState(defensiveInfo, players) {
  const key = getDefensiveFilterKey(defensiveInfo);
  if (!selectedDefensivePlayerFilters[key]) {
    selectedDefensivePlayerFilters[key] = {};
  }
  const state = selectedDefensivePlayerFilters[key];
  const valid = new Set(players);
  Object.keys(state).forEach((player) => {
    if (!valid.has(player)) delete state[player];
  });
  players.forEach((player) => {
    if (!(player in state)) state[player] = true;
  });
  return state;
}

function getSelectedDefensiveSet(defensiveInfo, players) {
  const state = ensureDefensiveFilterState(defensiveInfo, players);
  return new Set(players.filter((player) => state[player]));
}

function renderDefensivePlayerChips(defensiveInfo, players) {
  if (!defensivePlayerControls || !defensivePlayerRow || !defensivePlayerAll || !defensivePlayerNone) {
    return;
  }
  if (!players.length) {
    defensivePlayerControls.classList.add("hidden");
    defensivePlayerRow.innerHTML = "";
    return;
  }
  defensivePlayerControls.classList.remove("hidden");
  const state = ensureDefensiveFilterState(defensiveInfo, players);
  const colorByPlayer = Object.fromEntries((defensiveInfo?.legend ?? []).map((row) => [row.player, row.color]));
  defensivePlayerRow.innerHTML = players
    .map((player) => {
      const enabled = state[player] !== false;
      const color = colorByPlayer[player] ?? "#555";
      return `
        <button
          type="button"
          class="defensive-player-chip ${enabled ? "" : "off"}"
          data-def-player="${encodeURIComponent(player)}"
          aria-pressed="${enabled ? "true" : "false"}"
        >
          <span class="defensive-player-chip-dot" style="background:${color};"></span>
          <span>${getPlayerDisplayName(player)}</span>
        </button>
      `;
    })
    .join("");
  defensivePlayerAll.disabled = players.length === 0;
  defensivePlayerNone.disabled = players.length === 0;
}

function sortDefensiveMapNames(mapNames) {
  return [...mapNames].sort((a, b) => {
    const ai = DEFENSIVE_MAP_ORDER.indexOf(a);
    const bi = DEFENSIVE_MAP_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}

function getDefensiveMapPack(sidePack) {
  if (!sidePack) return {};
  if (sidePack.thresholds) {
    const mapKey = sidePack.map ?? "Bind";
    return { [mapKey]: sidePack };
  }
  return sidePack;
}

  function projectHeatmapPoint(point) {
    return {
      x: point.normX,
      y: point.normY
    };
  }

  function getContainedFrameStyle(mapName, canvasAspect = 1318 / 772) {
    const imageAspect = MAP_IMAGE_ASPECTS[mapName] ?? 1;
    let width = 100;
    let height = 100;
    let left = 0;
    let top = 0;

    if (canvasAspect > imageAspect) {
      width = (imageAspect / canvasAspect) * 100;
      left = (100 - width) / 2;
    } else if (canvasAspect < imageAspect) {
      height = (canvasAspect / imageAspect) * 100;
      top = (100 - height) / 2;
    }

    return `left:${left}%; top:${top}%; width:${width}%; height:${height}%;`;
  }

function getCalibratedPoint(point, mapName, sideKey, index) {
  const override =
    calibrationOverrides[getCalibrationKey(activeTeam, mapName, sideKey)]?.[index] ??
    calibrationOverrides[getLegacyCalibrationKey(activeTeam, mapName, sideKey)]?.[index];
  return override ?? projectHeatmapPoint(point);
}

function buildCalibrationExport() {
  return JSON.stringify(
    {
      team: activeTeam,
      map: activeMap,
      fkType: activeFkType,
      ct: calibrationOverrides[getCalibrationKey(activeTeam, activeMap, "ct")] ?? [],
      t: calibrationOverrides[getCalibrationKey(activeTeam, activeMap, "t")] ?? []
    },
    null,
    2
  );
}

function updateCalibrationPanel(infoAvailable) {
  if (!calibrationPanel || !calibrationToggle || !calibrationExport) {
    return;
  }
  const visible = activeView === "map" && infoAvailable;
  calibrationPanel.classList.toggle("hidden", !visible);
  if (!visible) return;

  calibrationToggle.textContent = calibrationMode ? "Disable Calibration" : "Enable Calibration";
  calibrationToggle.classList.toggle("active", calibrationMode);
  calibrationExport.value = buildCalibrationExport();
}

function setCalibrationOverride(sideKey, index, x, y) {
  const key = getCalibrationKey(activeTeam, activeMap, sideKey);
  calibrationOverrides[key] ||= [];
  calibrationOverrides[key][index] = {
    x: clamp(Number(x), 0, 100),
    y: clamp(Number(y), 0, 100)
  };
  if (calibrationExport) {
    calibrationExport.value = buildCalibrationExport();
  }
}

function beginHeatmapDrag(event) {
  if (!calibrationMode) return;
  const pointButton = event.target.closest(".heat-point.calibration-enabled");
  if (!pointButton) return;
  const canvas = pointButton.closest(".heatmap-canvas");
  if (!canvas) return;
  event.preventDefault();
  dragState = {
    canvas,
    sideKey: pointButton.dataset.sideKey,
    pointIndex: Number(pointButton.dataset.pointIndex),
    pointButton
  };
}

function updateHeatmapDrag(event) {
  if (!dragState) return;
  const rect = dragState.canvas.getBoundingClientRect();
  const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
  const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
  dragState.pointButton.style.left = `${x}%`;
  dragState.pointButton.style.top = `${y}%`;
  setCalibrationOverride(dragState.sideKey, dragState.pointIndex, x, y);
}

function endHeatmapDrag() {
  dragState = null;
}

  function renderHeatmap(target, points, sideLabel, mapName, sideKey, metricLabel) {
    applyHeatmapBackground(target, mapName);
    const frameStyle = getContainedFrameStyle(mapName);
    const mapImage = MAP_IMAGE_PATHS[mapName] ?? "";
    const frameClassList = [
      "heat-layer-frame",
      mapImage ? "has-map" : "",
      ROTATED_MAPS_CW.has(mapName) ? "rotate-cw" : ""
    ]
      .filter(Boolean)
      .join(" ");
    const frameInlineStyle = frameStyle;
    const mapImageMarkup = mapImage
      ? `<img class="heat-map-image" src="${mapImage}" alt="${mapName} map" loading="lazy" decoding="async" />`
      : "";
    if (!points.length) {
      target.innerHTML = `
        <div class="${frameClassList}" style="${frameInlineStyle}">
          ${mapImageMarkup}
          <div class="heatmap-empty">
          <p>No ${sideLabel} ${metricLabel.toLowerCase()} samples in the last 10 maps.</p>
          </div>
        </div>
      `;
      return;
    }
  
    const visualPoints = points.map((point, index) => {
      const killer = getCalibratedPoint(point, mapName, sideKey, index);
      const hasVictimCoords =
        point.victimNormX !== undefined &&
        point.victimNormY !== undefined &&
        point.victimNormX !== null &&
        point.victimNormY !== null;
      const victim = hasVictimCoords
        ? projectHeatmapPoint({ normX: point.victimNormX, normY: point.victimNormY })
        : null;
      return { point, index, killer, victim };
    });

    target.innerHTML = `
      <div class="${frameClassList}" style="${frameInlineStyle}">
        ${mapImageMarkup}
        <div class="heat-layer">
          <svg class="heat-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            ${visualPoints
              .filter((entry) => entry.victim)
              .map(
                (entry) => `
              <line class="heat-link" x1="${entry.killer.x}" y1="${entry.killer.y}" x2="${entry.victim.x}" y2="${entry.victim.y}"></line>
            `
              )
              .join("")}
          </svg>
          ${visualPoints
            .filter((entry) => entry.victim)
            .map(
              (entry) => `
            <span class="heat-victim-point" style="left:${entry.victim.x}%; top:${entry.victim.y}%"></span>
          `
            )
            .join("")}
        ${visualPoints
          .map((entry) => {
            const { point, index, killer } = entry;
            return `
            <button
              class="heat-point ${calibrationMode ? "calibration-enabled" : ""}"
              type="button"
              style="left:${killer.x}%; top:${killer.y}%"
              title="${point.player} -> ${point.victim ?? "?"} | ${point.date} vs ${point.opponent} | R${point.roundNum} | ${point.score}"
              aria-label="${point.player} ${point.date} versus ${point.opponent}"
              data-side-key="${sideKey}"
              data-point-index="${index}"
            >${calibrationMode ? `<span class="heat-point-label">${index + 1}</span>` : ""}</button>
            `;
          })
          .join("")}
        </div>
      </div>
    `;
  }

function renderDefensivePanels(info, selectedPlayers, fkOwnerFilter = "all") {
  if (!defensivePanels) return;
  const mapName = info.map || "Bind";
  const mapImage = MAP_IMAGE_PATHS[mapName] ?? "";
  const frameStyle = getContainedFrameStyle(mapName, 1);
  const frameClassList = [
    "heat-layer-frame",
    mapImage ? "has-map" : "",
    ROTATED_MAPS_CW.has(mapName) ? "rotate-cw" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const mapImageMarkup = mapImage
    ? `<img class="heat-map-image" src="${mapImage}" alt="${mapName} map" loading="lazy" decoding="async" />`
    : "";
  const legend = info.legend ?? [];
  const colorByPlayer = Object.fromEntries(legend.map((row) => [row.player, row.color]));
  const thresholds = [
    ["lt10s", "<10s"],
    ["lt20s", "<20s"],
    ["lt30s", "<30s"]
  ];
  const panelTitleBase =
    activeSideView === "ct" ? "Defending Team Positioning at the first kill" : "Attacking Team Positioning at the first kill";

  defensivePanels.innerHTML = thresholds
    .map(([key, label]) => {
      const bucket = info.thresholds?.[key] ?? { roundCount: 0, pointCount: 0, points: [] };
      const allPoints = bucket.points ?? [];
      const fkScopedPoints =
        fkOwnerFilter === "all" ? allPoints : allPoints.filter((point) => point.fkOwner === fkOwnerFilter);
      const points = fkScopedPoints.filter((point) => selectedPlayers.has(point.player));
      const roundCount = new Set(fkScopedPoints.map((point) => `${point.matchId}|${point.roundNum}`)).size;
      const pointsMarkup = points
        .map((point) => {
          const p = projectHeatmapPoint(point);
          const color = colorByPlayer[point.player] ?? "#444444";
          return `<span class="heat-point" style="left:${p.x}%; top:${p.y}%; background:${color};" title="${point.player} | ${point.date} vs ${point.opponent} | R${point.roundNum}"></span>`;
        })
        .join("");

      return `
        <article class="defensive-card">
          <div class="defensive-card-head">
            <h3>${panelTitleBase} (${label})</h3>
            <p class="defensive-card-meta">Rounds: ${roundCount} | Points: ${points.length}/${fkScopedPoints.length}</p>
          </div>
          <div class="defensive-map-wrap">
            <div class="defensive-map">
              <div class="${frameClassList}" style="${frameStyle}">
                ${mapImageMarkup}
                <div class="heat-layer">
                  ${pointsMarkup || '<div class="heatmap-empty"><p>No samples.</p></div>'}
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSideButtons() {
  sideCtButton?.classList.toggle("active", activeSideView === "ct");
  sideTButton?.classList.toggle("active", activeSideView === "t");
}

function renderMapInfo() {
  const team = allVetoHistoryData[activeTeam];
  const info = allMapInfo?.[activeTeam];
  const defensiveTeamPack = allDefensiveEarly?.[activeTeam];
  const hasDefensiveMode = Boolean(
    defensiveTeamPack &&
      (Object.keys(defensiveTeamPack.ct ?? {}).length > 0 || Object.keys(defensiveTeamPack.t ?? {}).length > 0)
  );
  const defensiveSidePackRaw = defensiveTeamPack?.[activeSideView];
  const defensiveMapPack = getDefensiveMapPack(defensiveSidePackRaw);
  const availableDefensiveMaps = sortDefensiveMapNames(Object.keys(defensiveMapPack));
  if (availableDefensiveMaps.length && !defensiveMapPack[activeDefensiveMap]) {
    activeDefensiveMap = availableDefensiveMaps[0];
  }
  const defensiveInfo = defensiveMapPack?.[activeDefensiveMap];

  renderSideButtons();

  if (hasDefensiveMode) {
    mapInfoToolbar.classList.add("hidden");
    heatmapGrid.classList.add("hidden");
    mapSampleCard.classList.add("hidden");
    mapPlaceholder.classList.add("hidden");
    playerFilterShell?.classList.add("hidden");
    defensivePlayerControls?.classList.add("hidden");
    calibrationPanel?.classList.add("hidden");
    if (playerFilterShell) playerFilterShell.open = false;

    if (!defensiveInfo) {
      defensiveModule.classList.add("hidden");
      mapWarning.classList.add("hidden");
      mapPlaceholder.classList.remove("hidden");
      mapPlaceholder.innerHTML = `
        <h3>${activeSideView.toUpperCase()}-side early positioning is not wired for this team yet.</h3>
        <p>Switch side or load the corresponding export.</p>
      `;
      mapInfoTitle.textContent = team.name;
      mapInfoCopy.textContent = `${activeSideView.toUpperCase()}-side module unavailable.`;
      return;
    }

    defensiveModule.classList.remove("hidden");
    if (defensiveFkSelect) {
      const teamLabel = team.ownerLabel ?? team.name;
      if (defensiveFkSelect.options[1]) defensiveFkSelect.options[1].textContent = `${teamLabel} FK`;
      if (defensiveFkSelect.options[2]) defensiveFkSelect.options[2].textContent = "Enemy FK";
      defensiveFkSelect.value = activeDefensiveFkFilter;
    }
    if (defensiveMapSelect) {
      defensiveMapSelect.innerHTML = availableDefensiveMaps.map((mapName) => `<option value="${mapName}">${mapName}</option>`).join("");
      defensiveMapSelect.value = activeDefensiveMap;
      defensiveMapSelect.disabled = availableDefensiveMaps.length === 0;
    }
    const defensivePlayers = collectDefensivePlayers(defensiveInfo);
    renderDefensivePlayerChips(defensiveInfo, defensivePlayers);
    const selectedDefensivePlayers = getSelectedDefensiveSet(defensiveInfo, defensivePlayers);
    const defensiveTeamName = defensiveInfo.name ?? defensiveInfo.team ?? team.name;
    defensiveTitle.textContent = defensiveTeamName;
    const sampleMaps = defensiveInfo.sampleMaps ?? defensiveInfo.selectedMaps ?? [];
    const sampleSize = defensiveInfo.sampleSize ?? sampleMaps.length;
    const mapName = defensiveInfo.map ?? "Bind";
    const sideCopyWord = activeSideView === "ct" ? "Defender" : "Attacker";
    defensiveCopy.textContent = `${sideCopyWord} positions at first-kill time from the last ${sampleSize} ${defensiveTeamName} ${mapName} maps.`;

    mapWarning.classList.remove("hidden");
    mapWarning.innerHTML = `
      <strong>Coverage warning:</strong> ${activeSideView.toUpperCase()} early-positioning currently covers ${mapName} only.
    `;

    renderDefensivePanels(defensiveInfo, selectedDefensivePlayers, activeDefensiveFkFilter);

    defensiveSampleCard.innerHTML = `
      <p class="map-sample-label">Last ${sampleSize} maps in sample</p>
      <div class="sample-chip-list">
        ${sampleMaps
          .map((item) => `<span class="sample-chip">${item.date.slice(5)} ${mapName} vs ${item.opponent}</span>`)
          .join("")}
      </div>
    `;
    return;
  }

  defensiveModule.classList.add("hidden");
  defensivePlayerControls?.classList.add("hidden");

  if (!info) {
    mapInfoToolbar.classList.remove("hidden");
    mapPlaceholder.classList.remove("hidden");
    heatmapGrid.classList.add("hidden");
    mapWarning.classList.add("hidden");
    mapSampleCard.classList.add("hidden");
    playerFilterShell?.classList.add("hidden");
    if (playerFilterShell) {
      playerFilterShell.open = false;
    }
    calibrationPanel?.classList.add("hidden");
    mapSelect.innerHTML = "";
    mapSelect.disabled = true;
    mapPlaceholder.innerHTML = `
      <h3>Map-Info is not wired for this team yet.</h3>
      <p>This team does not have a map-info export yet.</p>
    `;
    mapInfoTitle.textContent = team.name;
    mapInfoCopy.textContent = `${activeSideView.toUpperCase()} side map module.`;
    return;
  }

  mapInfoToolbar.classList.remove("hidden");
  mapPlaceholder.classList.add("hidden");
  heatmapGrid.classList.remove("hidden");
  mapSampleCard.classList.remove("hidden");
  mapSelect.disabled = false;

  const allowedMaps = info.currentMapPool ?? [];
  const preferredMap =
    allowedMaps.find((mapName) => {
      const mapData = info.maps?.[mapName];
      const metricPoints = activeFkType === "all"
        ? (mapData?.all_ct?.points?.length ?? 0) + (mapData?.all_t?.points?.length ?? 0)
        : (mapData?.ct?.points?.length ?? 0) + (mapData?.t?.points?.length ?? 0);
      return metricPoints > 0;
    }) ?? allowedMaps[0] ?? "Bind";

  if (!allowedMaps.includes(activeMap)) {
    activeMap = preferredMap;
  }

  mapSelect.innerHTML = allowedMaps
    .map((mapName) => `<option value="${mapName}">${mapName}</option>`)
    .join("");
  mapSelect.value = activeMap;
  fkTypeSelect.value = activeFkType;
  fkTypeSelect.disabled = false;

  const mapData = info.maps?.[activeMap] ?? { ct: { points: [] }, t: { points: [] }, all_ct: { points: [] }, all_t: { points: [] } };
  const metricPoints = getMapPointsByType(mapData);
  const allPlayers = collectPlayersFromPoints(metricPoints.ct, metricPoints.t);
  renderPlayerFilter(allPlayers);
  const selectedPlayers = getSelectedPlayerSet(allPlayers);
  const ctPointsFull = metricPoints.ct.filter((point) => selectedPlayers.has(point.player));
  const tPointsFull = metricPoints.t.filter((point) => selectedPlayers.has(point.player));
  const ctPoints = activeSideView === "ct" ? ctPointsFull : [];
  const tPoints = activeSideView === "t" ? tPointsFull : [];

  const metricLabel = getFkTypeLabel();
  mapModuleEyebrow.textContent = `${activeSideView.toUpperCase()} - ${metricLabel} Heatmaps`;
  mapInfoTitle.textContent = team.name;
  mapInfoCopy.textContent = `${activeSideView.toUpperCase()} side ${metricLabel.toLowerCase()} heatmaps from the last ${info.sampleSize} ${team.name} maps.`;
  ctHeatTitle.textContent = `${metricLabel} Positions`;
  tHeatTitle.textContent = `${metricLabel} Positions`;

  mapSampleCard.innerHTML = `
    <p class="map-sample-label">Last ${info.sampleSize} maps in sample</p>
    <div class="sample-chip-list">
      ${info.sampleMaps.map(makeSampleChip).join("")}
    </div>
  `;

  if (info.missingCurrentPoolMaps?.length) {
    mapWarning.classList.remove("hidden");
    mapWarning.innerHTML = `
      <strong>Coverage warning:</strong> the last ${info.sampleSize} ${team.name} maps do not include
      ${info.missingCurrentPoolMaps.join(", ")} from the current map pool.
    `;
  } else {
    mapWarning.classList.add("hidden");
    mapWarning.innerHTML = "";
  }

  ctCount.textContent = pluralizeSamples(ctPoints.length);
  tCount.textContent = pluralizeSamples(tPoints.length);
  updateCalibrationPanel(true);
  renderHeatmap(ctHeatmap, ctPoints, "CT-side", activeMap, "ct", metricLabel);
  renderHeatmap(tHeatmap, tPoints, "T-side", activeMap, "t", metricLabel);
}

function renderHero(team) {
  if (activeView === "veto") {
    heroTitle.textContent = "Veto History";
    heroCopy.innerHTML = `Historical pick/ban performance for <span class="team-accent" id="hero-team">${team.name}</span>`;
  } else {
    heroTitle.textContent = "Map Info";
    heroCopy.innerHTML = `${activeSideView.toUpperCase()} side analytics for <span class="team-accent" id="hero-team">${team.name}</span>`;
  }
}

function renderVisibility() {
  const mapMode = activeView === "map";
  viewVetoButton.classList.toggle("active", !mapMode);
  viewMapButton.classList.toggle("active", mapMode);
  vetoView.classList.toggle("hidden", mapMode);
  mapView.classList.toggle("hidden", !mapMode);
  timeframeControls.classList.toggle("hidden", mapMode);
  sideControls?.classList.toggle("hidden", !mapMode);
}

function renderVeto(team) {
  tableTitle.textContent = `${team.name} Veto History`;
  tableSubtitle.textContent = startDateFilter
    ? `${team.subtitle} starting ${startDateFilter}`
    : team.subtitle;
  startDateInput.value = startDateFilter;
  renderInsights(team);
  renderTable(team);
}

function render() {
  const team = allVetoHistoryData[activeTeam];
  renderTeamSelect();
  renderHero(team);
  renderVisibility();
  renderVeto(team);
  renderMapInfo();
}

viewVetoButton.addEventListener("click", () => {
  activeView = "veto";
  render();
});

viewMapButton.addEventListener("click", () => {
  activeView = "map";
  render();
});

teamSelect.addEventListener("change", (event) => {
  activeTeam = event.target.value;
  activeDefensiveFkFilter = "all";
  activeDefensiveMap = "Bind";
  if (activeTeam === "eco") {
    activeFkType = "all";
  } else if (activeFkType !== "operator" && activeFkType !== "all") {
    activeFkType = "operator";
  }
  render();
});

sideCtButton?.addEventListener("click", () => {
  activeSideView = "ct";
  renderHero(allVetoHistoryData[activeTeam]);
  renderMapInfo();
  renderSideButtons();
});

sideTButton?.addEventListener("click", () => {
  activeSideView = "t";
  renderHero(allVetoHistoryData[activeTeam]);
  renderMapInfo();
  renderSideButtons();
});

mapSelect.addEventListener("change", (event) => {
  activeMap = event.target.value;
  renderMapInfo();
});

fkTypeSelect.addEventListener("change", (event) => {
  activeFkType = event.target.value;
  renderMapInfo();
  renderHero(allVetoHistoryData[activeTeam]);
});

if (playerFilterList) {
  playerFilterList.addEventListener("change", (event) => {
    const input = event.target.closest("input[data-player-name]");
    if (!input) return;
    const key = getPlayerFilterKey();
    selectedPlayerFilters[key] ||= {};
    const playerName = decodeURIComponent(input.dataset.playerName ?? "");
    selectedPlayerFilters[key][playerName] = input.checked;
    renderMapInfo();
  });
}

if (playerFilterAll) {
  playerFilterAll.addEventListener("click", () => {
    const key = getPlayerFilterKey();
    selectedPlayerFilters[key] ||= {};
    Object.keys(selectedPlayerFilters[key]).forEach((player) => {
      selectedPlayerFilters[key][player] = true;
    });
    renderMapInfo();
  });
}

if (playerFilterNone) {
  playerFilterNone.addEventListener("click", () => {
    const key = getPlayerFilterKey();
    selectedPlayerFilters[key] ||= {};
    Object.keys(selectedPlayerFilters[key]).forEach((player) => {
      selectedPlayerFilters[key][player] = false;
    });
    renderMapInfo();
  });
}

if (defensivePlayerRow) {
  defensivePlayerRow.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-def-player]");
    if (!button) return;
    const info = allDefensiveEarly?.[activeTeam];
    if (!info) return;
    const sideInfo = info?.[activeSideView];
    if (!sideInfo) return;
    const key = getDefensiveFilterKey(sideInfo);
    selectedDefensivePlayerFilters[key] ||= {};
    const playerName = decodeURIComponent(button.dataset.defPlayer ?? "");
    const current = selectedDefensivePlayerFilters[key][playerName] !== false;
    selectedDefensivePlayerFilters[key][playerName] = !current;
    renderMapInfo();
  });
}

if (defensivePlayerAll) {
  defensivePlayerAll.addEventListener("click", () => {
    const info = allDefensiveEarly?.[activeTeam];
    if (!info) return;
    const sideInfo = info?.[activeSideView];
    if (!sideInfo) return;
    const players = collectDefensivePlayers(sideInfo);
    const key = getDefensiveFilterKey(sideInfo);
    selectedDefensivePlayerFilters[key] ||= {};
    players.forEach((player) => {
      selectedDefensivePlayerFilters[key][player] = true;
    });
    renderMapInfo();
  });
}

if (defensivePlayerNone) {
  defensivePlayerNone.addEventListener("click", () => {
    const info = allDefensiveEarly?.[activeTeam];
    if (!info) return;
    const sideInfo = info?.[activeSideView];
    if (!sideInfo) return;
    const players = collectDefensivePlayers(sideInfo);
    const key = getDefensiveFilterKey(sideInfo);
    selectedDefensivePlayerFilters[key] ||= {};
    players.forEach((player) => {
      selectedDefensivePlayerFilters[key][player] = false;
    });
    renderMapInfo();
  });
}

if (defensiveFkSelect) {
  defensiveFkSelect.addEventListener("change", (event) => {
    activeDefensiveFkFilter = event.target.value;
    renderMapInfo();
  });
}

if (defensiveMapSelect) {
  defensiveMapSelect.addEventListener("change", (event) => {
    activeDefensiveMap = event.target.value;
    renderMapInfo();
  });
}

if (calibrationToggle) {
  calibrationToggle.addEventListener("click", () => {
    calibrationMode = !calibrationMode;
    renderMapInfo();
  });
}

if (calibrationReset) {
  calibrationReset.addEventListener("click", () => {
    delete calibrationOverrides[getCalibrationKey(activeTeam, activeMap, "ct")];
    delete calibrationOverrides[getCalibrationKey(activeTeam, activeMap, "t")];
    delete calibrationOverrides[getLegacyCalibrationKey(activeTeam, activeMap, "ct")];
    delete calibrationOverrides[getLegacyCalibrationKey(activeTeam, activeMap, "t")];
    renderMapInfo();
  });
}

startButton.addEventListener("click", () => {
  startDateInput.showPicker?.();
  startDateInput.focus();
});

startDateInput.addEventListener("change", (event) => {
  startDateFilter = event.target.value;
  render();
});

resetDateButton.addEventListener("click", () => {
  startDateFilter = "";
  render();
});

ctHeatmap.addEventListener("pointerdown", beginHeatmapDrag);
tHeatmap.addEventListener("pointerdown", beginHeatmapDrag);
window.addEventListener("pointermove", updateHeatmapDrag);
window.addEventListener("pointerup", endHeatmapDrag);
window.addEventListener("pointercancel", endHeatmapDrag);

render();

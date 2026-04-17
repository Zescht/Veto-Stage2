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
const allDefensiveRetake = {};
const allPostPlantData = {};
const allSiteStats = {};
const RETAKE_DATA_VERSION = "20260416e";
const RETAKE_DATA_SOURCES = [
  { team: "eintracht", side: "ct", map: "Bind",   url: `./data/sge_bind_ct_retake_positions_last3.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", side: "ct", map: "Breeze", url: `./data/sge_breeze_ct_retake_positions_last3.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", side: "ct", map: "Lotus",  url: `./data/sge_lotus_ct_retake_positions_last3.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", side: "ct", map: "Pearl",  url: `./data/sge_pearl_ct_retake_positions_last3.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", side: "ct", map: "Split",  url: `./data/sge_split_ct_retake_positions_last3.json?v=${RETAKE_DATA_VERSION}` },
];
const POSTPLANT_DATA_SOURCES = [
  { team: "eintracht", map: "Lotus", url: `./data/sge_lotus_t_postplant_positions_last3.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", map: "Bind",  url: `./data/sge_bind_t_postplant_positions_last3.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", map: "Pearl", url: `./data/sge_pearl_t_postplant_positions_last3.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", map: "Split", url: `./data/sge_split_t_postplant_positions_last3.json?v=${RETAKE_DATA_VERSION}` },
];
const SITE_STATS_SOURCES = [
  { team: "eintracht", map: "Lotus", url: `./data/sge_lotus_site_stats.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", map: "Bind",  url: `./data/sge_bind_site_stats.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", map: "Pearl", url: `./data/sge_pearl_site_stats.json?v=${RETAKE_DATA_VERSION}` },
  { team: "eintracht", map: "Split", url: `./data/sge_split_site_stats.json?v=${RETAKE_DATA_VERSION}` },
];
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

const teamOrder = ["fokus", "eintracht", "attax"].filter((key) => allVetoHistoryData[key]);
let activeTeam = teamOrder[0];
let activeView = "veto";
let startDateFilter = "";
let activeMap = "Bind";
let activeFkType = "operator";
let activeSideView = "ct";
let activeDefensiveMap = "Bind";
let ppActiveSite = "All";
let rtActiveSite = "All";
let retakeActiveSites = new Set(["A", "B", "C"]);
let ppInlineActiveSites = new Set(["A", "B", "C"]);
let lastDefensiveInfo = null;
let activeRotationTrail = null;
let activeRotationBuckets = new Set(); // empty = show all

const ROTATION_BUCKETS = [
  { key: "1:40-1:20", min:     0, max:  20000, label: "1:40–1:20" },
  { key: "1:20-1:00", min: 20000, max:  40000, label: "1:20–1:00" },
  { key: "1:00-0:40", min: 40000, max:  60000, label: "1:00–0:40" },
  { key: "0:40-0:00", min: 60000, max: 100000, label: "0:40–0:00" },
  { key: "afterplant", min: null, max: null,   label: "Afterplant" },
];
const selectedPlayerFilters = {};
const selectedDefensivePlayerFilters = {};

const viewVetoButton = document.getElementById("view-veto");
const viewMapButton = document.getElementById("view-map");
const viewPostPlantButton = document.getElementById("view-postplant");
const postplantView = document.getElementById("postplant-view");
const mainToolbar = document.getElementById("main-toolbar");
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

function getRetakeInfo(teamKey, sideKey, mapName) {
  return allDefensiveRetake?.[teamKey]?.[sideKey]?.[mapName] ?? null;
}

function collectRetakePoints(retakeInfo) {
  if (!retakeInfo?.sites) return [];
  const siteOrder = ["A", "B", "C"];
  return siteOrder.flatMap((site) => retakeInfo.sites?.[site]?.points ?? []);
}

function collectAllDefensivePlayers(defensiveInfo) {
  const seen = new Set();
  const out = [];
  const fromEarly = collectDefensivePlayers(defensiveInfo);
  const fromSniper = collectPlayersFromPoints(defensiveInfo?.sniper?.points ?? [], []);
  const mapName = defensiveInfo?.map ?? "Bind";
  const retakeInfo = getRetakeInfo(activeTeam, activeSideView, mapName);
  const fromRetake = collectPlayersFromPoints(collectRetakePoints(retakeInfo), []);
  [...fromEarly, ...fromSniper, ...fromRetake].forEach((player) => {
    if (player && !seen.has(player)) {
      seen.add(player);
      out.push(player);
    }
  });
  return sortByPlayerOrder(out);
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
  defensivePlayerRow.innerHTML = players
    .map((player) => {
      const enabled = state[player] !== false;
      const color = getPlayerColor(player);
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
              title="${point.player} -> ${point.victim ?? "?"} | ${point.date} vs ${point.opponent} | R${point.roundNum + 1} | ${point.score}"
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

function fmtRoundTime(ms) {
  const s = Math.max(0, 100 - Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function buildPlayerLegendMarkup(players) {
  if (!players.length) return "";
  return `<div class="retake-player-legend">${players.map(p =>
    `<span class="retake-legend-item">
      <span class="retake-legend-dot" style="background:${getPlayerColor(p)};"></span>
      <span class="retake-legend-name">${p.replace(/^SGE\s+/, "")}</span>
    </span>`
  ).join("")}</div>`;
}

function buildMapControlMarkup(mapName, side, frameClassList, frameStyle, mapImageMarkup, selectedPlayers, sidebarMarkup) {
  const mcSide = mapControlData?.[mapName]?.[side];
  if (!mcSide) return "";

  const windows = [
    { key: "0_10",  label: "0–10s" },
    { key: "10_20", label: "10–20s" },
    { key: "20_30", label: "20–30s" },
  ];

  const cards = windows.map(({ key, label }) => {
    const allPoints = mcSide.mapControl?.[key] ?? [];
    const points = allPoints.filter(pt => selectedPlayers.has(pt.player));
    const roundCount = new Set(allPoints.map(pt => `${pt.matchId}|${pt.roundNum}`)).size;
    const dotsMarkup = points.map(pt =>
      `<span class="heat-point" style="left:${pt.normX}%;top:${pt.normY}%;background:${getPlayerColor(pt.player)};" title="${pt.player} | R${pt.roundNum + 1} | ${pt.date} vs ${pt.opponent} | ${fmtRoundTime(pt.timeMs)}"></span>`
    ).join("");
    return `
      <article class="defensive-card">
        <div class="defensive-card-head">
          <h3>${label}</h3>
          <p class="defensive-card-meta">Rounds: ${roundCount} | Points: ${points.length}/${allPoints.length}</p>
        </div>
        <div class="defensive-map-wrap">
          <div class="defensive-map">
            <div class="${frameClassList}" style="${frameStyle}">
              ${mapImageMarkup}
              <div class="heat-layer">
                ${dotsMarkup || '<div class="heatmap-empty"><p>No samples.</p></div>'}
              </div>
            </div>
          </div>
        </div>
      </article>`;
  }).join("");

  return `
    <div class="defensive-topic-divider" role="presentation"></div>
    <section class="defensive-topic">
      <h3 class="defensive-topic-title">Map Control</h3>
      <div class="early-positioning-layout">
        ${sidebarMarkup}
        <div class="defensive-topic-grid">${cards}</div>
      </div>
    </section>`;
}

function snapMatchesBuckets(snapTimeMs, plantTimeMs) {
  if (activeRotationBuckets.size === 0) return true;
  for (const key of activeRotationBuckets) {
    if (key === "afterplant") {
      if (plantTimeMs != null && snapTimeMs >= plantTimeMs) return true;
    } else {
      const b = ROTATION_BUCKETS.find(b => b.key === key);
      if (b && snapTimeMs >= b.min && snapTimeMs < b.max) return true;
    }
  }
  return false;
}

function buildRotationMarkup(mapName, side, frameClassList, frameStyle, mapImageMarkup, selectedPlayers, sidebarMarkup) {
  const mcSide = mapControlData?.[mapName]?.[side];
  if (!mcSide) return "";

  const rounds = mcSide.rotations ?? [];
  if (!rounds.length) return "";

  const hasSelection = activeRotationTrail !== null;
  let svgLines = "";
  let dotsMarkup = "";
  const visiblePlayers = new Set();

  for (const roundTrails of rounds) {
    for (const trail of roundTrails) {
      if (!selectedPlayers.has(trail.player)) continue;
      const plantTimeMs = trail.plantTimeMs ?? null;
      const snaps = trail.snapshots;
      const visibleSnaps = snaps.filter(s => snapMatchesBuckets(s.timeMs, plantTimeMs));
      if (!visibleSnaps.length) continue;

      visiblePlayers.add(trail.player);
      const color = getPlayerColor(trail.player);
      const trailId = `${trail.matchId}|${trail.roundNum}`;
      const isActive = activeRotationTrail === trailId;
      const lineOpacity = hasSelection ? (isActive ? 1.0 : 0.06) : 0.35;
      const dotOpacity  = hasSelection ? (isActive ? 1.0 : 0.1)  : 0.75;
      const strokeW     = isActive ? 0.6 : 0.35;

      // Build polyline segments — only connect consecutive visible snaps
      if (activeRotationBuckets.size === 0 && snaps.length >= 2) {
        // No filter: single polyline through all snaps
        const pts = snaps.map(s => `${s.normX},${s.normY}`).join(" ");
        svgLines += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${strokeW}" opacity="${lineOpacity}"/>`;
      } else {
        // Filtered: split into segments of consecutive visible snaps
        let segment = [];
        for (let i = 0; i < snaps.length; i++) {
          if (snapMatchesBuckets(snaps[i].timeMs, plantTimeMs)) {
            segment.push(snaps[i]);
          } else {
            if (segment.length >= 2) {
              const pts = segment.map(s => `${s.normX},${s.normY}`).join(" ");
              svgLines += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${strokeW}" opacity="${lineOpacity}"/>`;
            }
            segment = [];
          }
        }
        if (segment.length >= 2) {
          const pts = segment.map(s => `${s.normX},${s.normY}`).join(" ");
          svgLines += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${strokeW}" opacity="${lineOpacity}"/>`;
        }
      }

      for (const snap of visibleSnaps) {
        dotsMarkup += `<span class="heat-point rotation-dot" data-trail-id="${trailId}" style="left:${snap.normX}%;top:${snap.normY}%;background:${color};opacity:${dotOpacity};cursor:pointer;" title="${trail.player} | R${trail.roundNum + 1} | ${fmtRoundTime(snap.timeMs)} | ${trail.date} vs ${trail.opponent}"></span>`;
      }
    }
  }

  const legendMarkup = buildPlayerLegendMarkup(sortByPlayerOrder([...visiblePlayers]));

  const roundCount = new Set(
    rounds.flatMap(rt => rt.filter(t => selectedPlayers.has(t.player)).map(t => `${t.matchId}|${t.roundNum}`))
  ).size;

  const bucketButtons = ROTATION_BUCKETS.map(b => {
    const active = activeRotationBuckets.has(b.key);
    return `<button type="button" class="rotation-bucket-btn${active ? " active" : ""}" data-rotation-bucket="${b.key}">${b.label}</button>`;
  }).join("");

  return `
    <article class="defensive-card">
      <div class="defensive-card-head">
        <p class="defensive-card-meta">Rounds: ${roundCount}</p>
      </div>
      <div class="rotation-bucket-row">${bucketButtons}</div>
      <div class="defensive-map-wrap">
        <div class="defensive-map">
          <div class="${frameClassList}" style="${frameStyle}">
            ${mapImageMarkup}
            <svg class="rotation-svg" viewBox="0 0 100 100" preserveAspectRatio="none">${svgLines}</svg>
            <div class="heat-layer">${dotsMarkup}</div>
            ${legendMarkup}
          </div>
        </div>
      </div>
    </article>`;
}

function renderDefensivePanels(info) {
  if (!defensivePanels) return;
  lastDefensiveInfo = info;
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
  // Only early-positioning players drive the sidebar filter
  const earlyPlayers = collectDefensivePlayers(info);
  const selectedPlayers = getSelectedDefensiveSet(info, earlyPlayers);
  const earlyFilterState = ensureDefensiveFilterState(info, earlyPlayers);
  const sidebarChipsMarkup = earlyPlayers
    .map((player) => {
      const enabled = earlyFilterState[player] !== false;
      const color = getPlayerColor(player);
      return `
        <button type="button" class="defensive-player-chip ${enabled ? "" : "off"}" data-def-player="${encodeURIComponent(player)}" aria-pressed="${enabled}">
          <span class="defensive-player-chip-dot" style="background:${color};"></span>
          <span>${getPlayerDisplayName(player)}</span>
        </button>
      `;
    })
    .join("");
  const sidebarMarkup = earlyPlayers.length
    ? `<div class="early-player-sidebar">
        <div class="early-player-actions">
          <button type="button" class="defensive-player-action" data-early-all>All</button>
          <button type="button" class="defensive-player-action" data-early-none>None</button>
        </div>
        ${sidebarChipsMarkup}
      </div>`
    : "";
  const timingPanels = [
    ["lt10s", "<10s"],
    ["lt20s", "<20s"],
    ["lt30s", "<30s"]
  ];
  const earlyTopicTitle = activeSideView === "ct" ? "Position at First Kill" : "Position at First Kill";
  const earlyTopicTooltip = "Player positions on the map at the exact moment the first kill of the round occurs. Grouped by when that kill happened: \u003C10s, \u003C20s, \u003C30s from round start. Each colored dot is one player\u2019s location. Use the player menu on the left to isolate individuals.";
  const sniperTopicTitle = activeSideView === "ct" ? "Position OP-Kill" : "Position OP-Kill";
  const sniperTopicTooltip = "Map positions where the defending team landed a kill with the Operator (sniper rifle). Each colored dot represents one kill, colored by the player who made it. All rounds in the sample are shown \u2014 no player filter applied.";

  const timingMarkup = timingPanels
    .map(([key, label]) => {
      const allPoints = info.thresholds?.[key]?.points ?? [];
      const points = allPoints.filter((point) => selectedPlayers.has(point.player));
      const roundCount = new Set(allPoints.map((point) => `${point.matchId}|${point.roundNum}`)).size;
      const pointsMarkup = points
        .map((point) => {
          const p = projectHeatmapPoint(point);
          const color = getPlayerColor(point.player);
          return `<span class="heat-point" style="left:${p.x}%; top:${p.y}%; background:${color};" title="${point.player} | ${point.date} vs ${point.opponent} | R${point.roundNum + 1}"></span>`;
        })
        .join("");

      return `
        <article class="defensive-card">
          <div class="defensive-card-head">
            <h3>${label}</h3>
            <p class="defensive-card-meta">Rounds: ${roundCount} | Points: ${points.length}/${allPoints.length}</p>
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

  const sniperAllPoints = info?.sniper?.points ?? [];
  const sniperPoints = sniperAllPoints; // unfiltered — sidebar only affects early positioning
  const sniperRoundCount = new Set(sniperAllPoints.map((point) => `${point.matchId}|${point.roundNum}`)).size;
  const sniperVisual = sniperPoints.map((point) => {
    const killer = projectHeatmapPoint(point);
    const hasVictim = point.victimNormX != null && point.victimNormY != null;
    const victim = hasVictim ? projectHeatmapPoint({ normX: point.victimNormX, normY: point.victimNormY }) : null;
    return { point, killer, victim };
  });

  const sniperSvgLines = sniperVisual
    .filter(e => e.victim)
    .map(e => `<line class="heat-link" x1="${e.killer.x}" y1="${e.killer.y}" x2="${e.victim.x}" y2="${e.victim.y}"></line>`)
    .join("");

  const sniperVictimDots = sniperVisual
    .filter(e => e.victim)
    .map(e => `<span class="heat-victim-point" style="left:${e.victim.x}%; top:${e.victim.y}%;" title="Victim: ${e.point.victim ?? "?"} | R${e.point.roundNum + 1} | ${e.point.date} vs ${e.point.opponent}"></span>`)
    .join("");

  const sniperKillerDots = sniperVisual
    .map(e => {
      const color = getPlayerColor(e.point.player);
      return `<span class="heat-point" style="left:${e.killer.x}%; top:${e.killer.y}%; background:${color};" title="${e.point.player} -> ${e.point.victim ?? "?"} | ${e.point.date} vs ${e.point.opponent} | R${e.point.roundNum + 1}"></span>`;
    })
    .join("");

  const sniperLegendPlayers = sortByPlayerOrder([...new Set(sniperPoints.map(pt => pt.player))]);
  const sniperLegendMarkup = sniperLegendPlayers.length
    ? `<div class="retake-player-legend">${sniperLegendPlayers.map(p =>
        `<span class="retake-legend-item"><span class="retake-legend-dot" style="background:${getPlayerColor(p)};"></span><span class="retake-legend-name">${p.replace(/^SGE\s+/, "")}</span></span>`
      ).join("")}</div>`
    : "";

  const sniperMarkup = `
    <article class="defensive-card">
      <div class="defensive-card-head">
        <h3>All Sniper Kills</h3>
        <p class="defensive-card-meta">Rounds: ${sniperRoundCount} | Points: ${sniperPoints.length}/${sniperAllPoints.length}</p>
      </div>
      <div class="defensive-map-wrap">
        <div class="defensive-map">
          <div class="${frameClassList}" style="${frameStyle}">
            ${mapImageMarkup}
            ${sniperPoints.length ? `
            <div class="heat-layer">
              <svg class="heat-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${sniperSvgLines}</svg>
              ${sniperVictimDots}
              ${sniperKillerDots}
            </div>` : '<div class="heatmap-empty"><p>No samples.</p></div>'}
            ${sniperLegendMarkup}
          </div>
        </div>
      </div>
    </article>
  `;

  // ── All SGE First Kills ─────────────────────────────────────────
  const allFkAllPoints = info?.all_fk?.points ?? [];
  const allFkRoundCount = new Set(allFkAllPoints.map(p => `${p.matchId}|${p.roundNum}`)).size;
  const allFkVisual = allFkAllPoints.map(point => {
    const killer = projectHeatmapPoint(point);
    const hasVictim = point.victimNormX != null && point.victimNormY != null;
    const victim = hasVictim ? projectHeatmapPoint({ normX: point.victimNormX, normY: point.victimNormY }) : null;
    return { point, killer, victim };
  });
  const allFkSvgLines = allFkVisual.filter(e => e.victim)
    .map(e => `<line class="heat-link" x1="${e.killer.x}" y1="${e.killer.y}" x2="${e.victim.x}" y2="${e.victim.y}"></line>`).join("");
  const allFkVictimDots = allFkVisual.filter(e => e.victim)
    .map(e => `<span class="heat-victim-point" style="left:${e.victim.x}%; top:${e.victim.y}%;" title="Victim: ${e.point.victim ?? "?"} | R${e.point.roundNum + 1} | ${e.point.date} vs ${e.point.opponent}"></span>`).join("");
  const allFkKillerDots = allFkVisual
    .map(e => {
      const color = getPlayerColor(e.point.player);
      return `<span class="heat-point" style="left:${e.killer.x}%; top:${e.killer.y}%; background:${color};" title="${e.point.player} -> ${e.point.victim ?? "?"} | ${e.point.date} vs ${e.point.opponent} | R${e.point.roundNum + 1} | ${fmtRoundTime(e.point.timeSinceRoundStartMillis)}"></span>`;
    }).join("");
  const allFkLegendPlayers = sortByPlayerOrder([...new Set(allFkAllPoints.map(p => p.player))]);
  const allFkLegendMarkup = allFkLegendPlayers.length
    ? `<div class="retake-player-legend">${allFkLegendPlayers.map(p =>
        `<span class="retake-legend-item"><span class="retake-legend-dot" style="background:${getPlayerColor(p)};"></span><span class="retake-legend-name">${p.replace(/^SGE\s+/, "")}</span></span>`
      ).join("")}</div>`
    : "";
  const allFkMarkup = `
    <article class="defensive-card">
      <div class="defensive-card-head">
        <h3>All First Kills</h3>
        <p class="defensive-card-meta">Rounds: ${allFkRoundCount} | Points: ${allFkAllPoints.length}</p>
      </div>
      <div class="defensive-map-wrap">
        <div class="defensive-map">
          <div class="${frameClassList}" style="${frameStyle}">
            ${mapImageMarkup}
            ${allFkAllPoints.length ? `
            <div class="heat-layer">
              <svg class="heat-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${allFkSvgLines}</svg>
              ${allFkVictimDots}
              ${allFkKillerDots}
            </div>` : '<div class="heatmap-empty"><p>No samples.</p></div>'}
            ${allFkLegendMarkup}
          </div>
        </div>
      </div>
    </article>
  `;

  const retakeInfo = getRetakeInfo(activeTeam, activeSideView, mapName);
  const retakeAllPoints = collectRetakePoints(retakeInfo);
  const retakeSiteOrder = ["A", "B", "C"];
  const siteColor = { A: "#df3a3a", B: "#2f68e8", C: "#0d8d52" };
  const retakeSiteChips = retakeSiteOrder
    .map((site) => {
      const rounds = retakeInfo?.sites?.[site]?.roundCount ?? 0;
      const points = retakeInfo?.sites?.[site]?.pointCount ?? 0;
      const isActive = retakeActiveSites.has(site);
      const opacity = isActive ? "1" : "0.35";
      return `<span class="retake-site-chip retake-site-chip-${site}" data-site="${site}" onclick="toggleRetakeSite('${site}')" style="cursor:pointer;opacity:${opacity};" title="Click to toggle Site ${site}">${site}: ${rounds}R / ${points}P</span>`;
    })
    .join("");
  const retakePoints = retakeAllPoints.filter((point) => retakeActiveSites.has(String(point.site || "").toUpperCase()));
  const retakeRoundCount = new Set(retakePoints.map((point) => `${point.matchId}|${point.roundNum}`)).size;
  const retakePointsMarkup = retakePoints
    .map((point) => {
      const p = projectHeatmapPoint(point);
      const color = getPlayerColor(point.player);
      const site = String(point.site || "").toUpperCase();
      const ring = siteColor[site] ?? "#888";
      return `
        <span class="heat-point retake-point" style="left:${p.x}%; top:${p.y}%; background:${color}; box-shadow: 0 0 0 1.4px ${ring};" title="${point.player} | Site ${site || "?"} | ${point.date} vs ${point.opponent} | R${point.roundNum + 1}"></span>
        <span class="retake-site-tag retake-site-tag-${site}" style="left:calc(${p.x}% + 6px); top:calc(${p.y}% - 8px);">${site || "?"}</span>
      `;
    })
    .join("");
  const retakeLegendPlayers = sortByPlayerOrder([...new Set(retakePoints.map(pt => pt.player))]);
  const retakeLegendMarkup = retakeLegendPlayers.length
    ? `<div class="retake-player-legend">${retakeLegendPlayers.map(p =>
        `<span class="retake-legend-item"><span class="retake-legend-dot" style="background:${ppGetColor(p)};"></span><span class="retake-legend-name">${ppShortName(p)}</span></span>`
      ).join("")}</div>`
    : "";

  const retakeMarkup = retakeInfo && activeSideView === "ct"
    ? `
    <article class="defensive-card">
      <div class="retake-site-chip-row">${retakeSiteChips}</div>
      <div class="defensive-map-wrap">
        <div class="defensive-map">
          <div class="${frameClassList}" style="${frameStyle}">
            ${mapImageMarkup}
            <div class="heat-layer">
              ${retakePointsMarkup || '<div class="heatmap-empty"><p>No samples.</p></div>'}
            </div>
            ${retakeLegendMarkup}
          </div>
        </div>
      </div>
    </article>
    `
    : "";

  // Post-Plant Positioning: T-side only (SGE planted the spike)
  let ppInlineMarkup = "";
  const ppData = allPostPlantData?.eintracht?.[mapName];
  if (ppData && activeSideView === "t") {
    const ppSiteColor = { A: "#df3a3a", B: "#2f68e8", C: "#0d8d52" };
    const ppSites = Object.keys(ppData.sites).sort();

    const ppSiteChips = ppSites.map((site) => {
      const sitePts = ppData.sites[site]?.points ?? [];
      const rounds = ppData.sites[site]?.roundCount ?? 0;
      const pts = sitePts.length;
      const isActive = ppInlineActiveSites.has(site);
      const opacity = isActive ? "1" : "0.35";
      return `<span class="retake-site-chip retake-site-chip-${site}" data-site="${site}" onclick="togglePpInlineSite('${site}')" style="cursor:pointer;opacity:${opacity};" title="Click to toggle Site ${site}">${site}: ${rounds}R / ${pts}P</span>`;
    }).join("");

    const allPpPts = ppSites
      .filter(s => ppInlineActiveSites.has(s))
      .flatMap(s => ppData.sites[s]?.points ?? []);

    const ppDotsMarkup = allPpPts.length
      ? allPpPts.map(pt => {
          const p = projectHeatmapPoint(pt);
          const color = ppGetColor(pt.player);
          const ring = ppSiteColor[pt.site] ?? "#888";
          const site = pt.site ?? "";
          return `
            <span class="heat-point retake-point" style="left:${p.x}%;top:${p.y}%;background:${color};box-shadow:0 0 0 1.4px ${ring};" title="${ppShortName(pt.player)} | Site ${site} | R${pt.roundNum + 1} | ${pt.date} vs ${pt.opponent}"></span>
            <span class="retake-site-tag retake-site-tag-${site}" style="left:calc(${p.x}% + 6px);top:calc(${p.y}% - 8px);">${site}</span>
          `;
        }).join("")
      : '<div class="heatmap-empty"><p>No samples.</p></div>';

    const ppLegendPlayers = sortByPlayerOrder([...new Set(allPpPts.map(pt => pt.player))]);
    const ppLegendMarkup = ppLegendPlayers.length
      ? `<div class="retake-player-legend">${ppLegendPlayers.map(p =>
          `<span class="retake-legend-item"><span class="retake-legend-dot" style="background:${ppGetColor(p)};"></span><span class="retake-legend-name">${ppShortName(p)}</span></span>`
        ).join("")}</div>`
      : "";

    ppInlineMarkup = `
      <article class="defensive-card">
        <div class="retake-site-chip-row">${ppSiteChips}</div>
        <div class="defensive-map-wrap">
          <div class="defensive-map">
            <div class="${frameClassList}" style="${frameStyle}">
              ${mapImageMarkup}
              <div class="heat-layer">${ppDotsMarkup}</div>
              ${ppLegendMarkup}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // ── Site stats table ─────────────────────────────────────────────
  let siteStatsMarkup = "";
  const statsData = allSiteStats?.eintracht?.[mapName];
  if (statsData) {
    const fmt = (v, suffix = "") => v != null ? `${v}${suffix}` : "—";
    const fmtTime = (v) => v != null ? `${v}s` : "—";

    if (activeSideView === "t") {
      const ts = statsData.t_side;
      const sites = Object.keys(ts.sites).sort();
      const rows = sites.map((site) => {
        const s = ts.sites[site];
        return `<tr>
          <td class="sst-site sst-site-${site}">${site}</td>
          <td>${fmt(s.pct_plant, "%")}</td>
          <td>${fmt(s.pct_win, "%")}</td>
          <td>${fmtTime(s.avg_plant_time)}</td>
          <td>${fmtTime(s.min_plant_time)} / ${fmtTime(s.max_plant_time)}</td>
          <td>${fmtTime(s.fk_to_plant_avg)}</td>
        </tr>`;
      }).join("");
      siteStatsMarkup = `
        <div class="site-stats-wrap">
          <table class="site-stats-table">
            <thead><tr>
              <th>SITE</th><th>% PLANT</th><th>% WIN</th>
              <th>TIME TO PLANT</th><th>MIN / MAX</th><th>FK → PLANT</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    } else {
      const cs = statsData.ct_side;
      const sites = Object.keys(cs.sites).sort();
      const rows = sites.map((site) => {
        const s = cs.sites[site];
        return `<tr>
          <td class="sst-site sst-site-${site}">${site}</td>
          <td>${fmt(s.pct_defuse_share, "%")}</td>
          <td>${fmt(s.pct_defuse_win, "%")}</td>
          <td>${fmtTime(s.avg_defuse_time)}</td>
          <td>${fmtTime(s.fk_after_plant_avg)}</td>
        </tr>`;
      }).join("");
      siteStatsMarkup = `
        <div class="site-stats-wrap">
          <table class="site-stats-table">
            <thead><tr>
              <th>SITE</th><th>% DEFUSE</th><th>% DEFUSEWIN</th>
              <th>TIME TO DEFUSE</th><th>FK AFTER PLANT</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }
  }

  defensivePanels.innerHTML = `
    ${siteStatsMarkup}
    <section class="defensive-topic">
      <h3 class="defensive-topic-title" title="${earlyTopicTooltip}">${earlyTopicTitle}</h3>
      <div class="early-positioning-layout">
        ${sidebarMarkup}
        <div class="defensive-topic-grid">
          ${timingMarkup}
        </div>
      </div>
    </section>
    <div class="defensive-topic-divider" role="presentation"></div>
    <div class="defensive-support-columns">
      <section class="defensive-topic">
        <h3 class="defensive-topic-title" title="${sniperTopicTooltip}">${sniperTopicTitle}</h3>
        ${sniperMarkup}
      </section>
      <section class="defensive-topic">
        <h3 class="defensive-topic-title">All First Kills</h3>
        ${allFkMarkup}
      </section>
    </div>
    ${buildMapControlMarkup(mapName, activeSideView, frameClassList, frameStyle, mapImageMarkup, selectedPlayers, sidebarMarkup)}
    ${(() => {
      const rotationCard = buildRotationMarkup(mapName, activeSideView, frameClassList, frameStyle, mapImageMarkup, selectedPlayers, sidebarMarkup);
      if (!rotationCard) return "";
      const secondaryCard = retakeMarkup
        ? `<div><h3 class="defensive-topic-title">Retake positions</h3>${retakeMarkup}</div>`
        : ppInlineMarkup
        ? `<div><h3 class="defensive-topic-title">Post-Plant positioning</h3>${ppInlineMarkup}</div>`
        : "";
      return `
        <div class="defensive-topic-divider" role="presentation"></div>
        <div class="early-positioning-layout">
          ${sidebarMarkup}
          <div class="${secondaryCard ? "defensive-support-columns" : ""}">
            <div>
              <h3 class="defensive-topic-title">Rotation Patterns</h3>
              ${rotationCard}
            </div>
            ${secondaryCard}
          </div>
        </div>`;
    })()}
  `;
}

function toggleRetakeSite(site) {
  if (retakeActiveSites.has(site)) {
    retakeActiveSites.delete(site);
  } else {
    retakeActiveSites.add(site);
  }
  if (lastDefensiveInfo) renderDefensivePanels(lastDefensiveInfo);
}
window.toggleRetakeSite = toggleRetakeSite;

function togglePpInlineSite(site) {
  if (ppInlineActiveSites.has(site)) {
    ppInlineActiveSites.delete(site);
  } else {
    ppInlineActiveSites.add(site);
  }
  if (lastDefensiveInfo) renderDefensivePanels(lastDefensiveInfo);
}
window.togglePpInlineSite = togglePpInlineSite;

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
    if (defensiveMapSelect) {
      defensiveMapSelect.innerHTML = availableDefensiveMaps.map((mapName) => `<option value="${mapName}">${mapName}</option>`).join("");
      defensiveMapSelect.value = activeDefensiveMap;
      defensiveMapSelect.disabled = availableDefensiveMaps.length === 0;
    }
    const defensiveTeamName = defensiveInfo.name ?? defensiveInfo.team ?? team.name;
    defensiveTitle.textContent = defensiveTeamName;
    const sampleMaps = defensiveInfo.sampleMaps ?? defensiveInfo.selectedMaps ?? [];
    const sampleSize = defensiveInfo.sampleSize ?? sampleMaps.length;
    const mapName = defensiveInfo.map ?? "Bind";
    const sideCopyWord = activeSideView === "ct" ? "Defender" : "Attacker";
    const retakeInfo = getRetakeInfo(activeTeam, activeSideView, mapName);
    defensiveCopy.textContent = retakeInfo
      ? `${sideCopyWord} positions at first-kill time, sniper-kill positions, and retake (spike planted) positions from the last ${sampleSize} ${defensiveTeamName} ${mapName} maps.`
      : `${sideCopyWord} positions at first-kill time and sniper-kill positions from the last ${sampleSize} ${defensiveTeamName} ${mapName} maps.`;

    mapWarning.classList.add("hidden");
    renderDefensivePanels(defensiveInfo);

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
  const vetoMode = activeView === "veto";
  const mapMode = activeView === "map";
  viewVetoButton.classList.toggle("active", vetoMode);
  viewMapButton.classList.toggle("active", mapMode);
  vetoView.classList.toggle("hidden", !vetoMode);
  mapView.classList.toggle("hidden", !mapMode);
  timeframeControls.classList.toggle("hidden", !vetoMode);
  sideControls?.classList.toggle("hidden", !mapMode);
  mainToolbar?.classList.remove("hidden");
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

/* ── Post-Plant / Retake Module ── */

// Canonical player colors — keyed by short name (without "SGE " prefix).
// Used everywhere: early positioning, sniper kills, retake, post-plant.
const SGE_PLAYER_COLORS = {
  "Jamelinho": "#e53935",
  "Fizzy":     "#f1d500",
  "MONSTEERR": "#00e676",
  "azury":     "#ff4dac",
  "musashi":   "#1f4fd6",
  "Ben1":      "#ff7f0e",
};
const SGE_PLAYER_ORDER = ["Jamelinho", "Fizzy", "MONSTEERR", "azury", "musashi", "Ben1"];

function sortByPlayerOrder(players) {
  return [...players].sort((a, b) => {
    const ai = SGE_PLAYER_ORDER.indexOf(a.replace(/^SGE\s+/, ""));
    const bi = SGE_PLAYER_ORDER.indexOf(b.replace(/^SGE\s+/, ""));
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function getPlayerColor(name) {
  const short = name.replace(/^SGE\s+/, "");
  return SGE_PLAYER_COLORS[short] ?? "#888888";
}

function ppGetColor(player) {
  return getPlayerColor(player);
}

function ppShortName(player) {
  return player.replace(/^SGE\s+/, "");
}

function ppGetPoints(category, site) {
  if (!postPlantData) return [];
  const cat = postPlantData[category];
  if (site === "All") {
    return ["A", "B", "C"].flatMap(s => cat[s]?.points ?? []);
  }
  return cat[site]?.points ?? [];
}

function positionPpTooltip(e) {
  const tip = document.getElementById("pp-tooltip");
  if (!tip) return;
  let x = e.clientX + 14, y = e.clientY + 14;
  if (x + 230 > window.innerWidth) x = e.clientX - 230;
  tip.style.left = x + "px";
  tip.style.top = y + "px";
}

function renderPpDots(containerId, points) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!points.length) {
    container.innerHTML = '<div class="pp-map-empty">No data for this selection.</div>';
    return;
  }
  container.innerHTML = points.map((pt, i) => {
    const color = ppGetColor(pt.player);
    return `<span class="pp-dot"
      style="left:${pt.normX * 100}%;top:${pt.normY * 100}%;background:${color};"
      data-pp-i="${i}"
    ></span>`;
  }).join("");
  container.querySelectorAll(".pp-dot").forEach(dot => {
    dot.addEventListener("mouseenter", (e) => {
      const pt = points[+dot.dataset.ppI];
      const tip = document.getElementById("pp-tooltip");
      if (!tip) return;
      tip.style.display = "block";
      tip.innerHTML =
        `<strong>${ppShortName(pt.player)}</strong><br>` +
        `Site ${pt.site} · Round ${pt.roundNum + 1}<br>` +
        `${pt.date} vs ${pt.opponent}`;
      positionPpTooltip(e);
    });
    dot.addEventListener("mouseleave", () => {
      const tip = document.getElementById("pp-tooltip");
      if (tip) tip.style.display = "none";
    });
  });
}

function renderPpStats(containerId, points) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const rounds = new Set(points.map(pt => `${pt.matchId}|${pt.roundNum}`)).size;
  el.innerHTML = `<span>Rounds: <strong>${rounds}</strong></span><span>Points: <strong>${points.length}</strong></span>`;
}

function renderPpSiteTabs(containerId, category, activeLocal, setActive, isOrange) {
  const el = document.getElementById(containerId);
  if (!el || !postPlantData) return;
  el.innerHTML = ["All", "A", "B", "C"].map(s => {
    const count = s === "All"
      ? ["A", "B", "C"].reduce((n, x) => n + (postPlantData[category][x]?.count ?? 0), 0)
      : (postPlantData[category][s]?.count ?? 0);
    const cls = s === activeLocal
      ? `active${isOrange ? " pp-tab--orange" : ""}`
      : "";
    return `<button class="pp-site-tab ${cls}" data-pp-cat="${category}" data-pp-site="${s}">${s} (${count})</button>`;
  }).join("");
  el.querySelectorAll(".pp-site-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      setActive(btn.dataset.ppSite);
      renderPostPlant();
    });
  });
}

function renderPpLegend(players) {
  const el = document.getElementById("pp-legend");
  if (!el) return;
  el.innerHTML = players.map(p =>
    `<span class="pp-legend-item">
      <span class="pp-legend-dot" style="background:${ppGetColor(p)};"></span>
      <span>${ppShortName(p)}</span>
    </span>`
  ).join("");
}

function renderPostPlant() {
  if (!postPlantData) return;

  const ppSubtitleEl = document.getElementById("pp-subtitle");
  if (ppSubtitleEl) {
    ppSubtitleEl.textContent =
      `${postPlantData.sampleSize} Lotus maps · ${postPlantData.matches.map(m => m.date).join(", ")}`;
  }
  const ppMatchChipsEl = document.getElementById("pp-match-chips");
  if (ppMatchChipsEl) {
    ppMatchChipsEl.innerHTML = postPlantData.matches.map(m =>
      `<span class="pp-match-chip">${m.date} vs ${m.opponent}</span>`
    ).join("");
  }

  const allPlayers = [...new Set([
    ...Object.values(postPlantData.postPlant).flatMap(s => s.points.map(p => p.player)),
    ...Object.values(postPlantData.retake).flatMap(s => s.points.map(p => p.player)),
  ])].sort();
  renderPpLegend(allPlayers);

  const ppPoints = ppGetPoints("postPlant", ppActiveSite);
  const rtPoints = ppGetPoints("retake", rtActiveSite);

  renderPpDots("pp-dots", ppPoints);
  renderPpDots("rt-dots", rtPoints);
  renderPpStats("pp-stats", ppPoints);
  renderPpStats("rt-stats", rtPoints);

  const ppCountEl = document.getElementById("pp-count");
  if (ppCountEl) ppCountEl.textContent = `${ppPoints.length} pts`;
  const rtCountEl = document.getElementById("rt-count");
  if (rtCountEl) rtCountEl.textContent = `${rtPoints.length} pts`;

  renderPpSiteTabs("pp-tabs", "postPlant", ppActiveSite, (s) => { ppActiveSite = s; }, true);
  renderPpSiteTabs("rt-tabs", "retake", rtActiveSite, (s) => { rtActiveSite = s; }, false);
}

async function preloadSiteStats() {
  for (const source of SITE_STATS_SOURCES) {
    try {
      const resp = await fetch(source.url, { cache: "no-store" });
      if (!resp.ok) continue;
      const payload = await resp.json();
      allSiteStats[source.team] ||= {};
      allSiteStats[source.team][source.map] = payload;
    } catch (_) { /* non-critical */ }
  }
  if (activeView === "map") renderMapInfo();
}

async function preloadPostPlantData() {
  for (const source of POSTPLANT_DATA_SOURCES) {
    try {
      const resp = await fetch(source.url, { cache: "no-store" });
      if (!resp.ok) continue;
      const payload = await resp.json();
      allPostPlantData[source.team] ||= {};
      allPostPlantData[source.team][source.map] = payload;
    } catch (_error) {
      // Non-critical; site stays usable without this data.
    }
  }
  if (activeView === "map") renderMapInfo();
}

async function preloadRetakeData() {
  for (const source of RETAKE_DATA_SOURCES) {
    try {
      const resp = await fetch(source.url, { cache: "no-store" });
      if (!resp.ok) continue;
      const payload = await resp.json();
      allDefensiveRetake[source.team] ||= {};
      allDefensiveRetake[source.team][source.side] ||= {};
      allDefensiveRetake[source.team][source.side][source.map] = payload;
    } catch (_error) {
      // Keep site usable even if optional retake overlays fail to load.
    }
  }
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


document.addEventListener("mousemove", (e) => {
  const tip = document.getElementById("pp-tooltip");
  if (tip?.style.display === "block") positionPpTooltip(e);
});

teamSelect.addEventListener("change", (event) => {
  activeTeam = event.target.value;
  activeDefensiveMap = "Bind";
  retakeActiveSites = new Set(["A", "B", "C"]);
  ppInlineActiveSites = new Set(["A", "B", "C"]);
  if (activeTeam === "eco") {
    activeFkType = "all";
  } else if (activeFkType !== "operator" && activeFkType !== "all") {
    activeFkType = "operator";
  }
  render();
});

sideCtButton?.addEventListener("click", () => {
  activeSideView = "ct";
  activeRotationTrail = null;
  activeRotationBuckets = new Set();
  retakeActiveSites = new Set(["A", "B", "C"]);
  ppInlineActiveSites = new Set(["A", "B", "C"]);
  renderHero(allVetoHistoryData[activeTeam]);
  renderMapInfo();
  renderSideButtons();
});

sideTButton?.addEventListener("click", () => {
  activeSideView = "t";
  activeRotationTrail = null;
  activeRotationBuckets = new Set();
  retakeActiveSites = new Set(["A", "B", "C"]);
  ppInlineActiveSites = new Set(["A", "B", "C"]);
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

if (defensivePanels) {
  defensivePanels.addEventListener("click", (event) => {
    const teamPack = allDefensiveEarly?.[activeTeam];
    if (!teamPack) return;
    const sidePack = getDefensiveMapPack(teamPack?.[activeSideView]);
    const activeInfo = sidePack?.[activeDefensiveMap] ?? Object.values(sidePack ?? {})[0];
    if (!activeInfo) return;
    const key = getDefensiveFilterKey(activeInfo);
    selectedDefensivePlayerFilters[key] ||= {};

    if (event.target.closest("[data-early-all]")) {
      collectDefensivePlayers(activeInfo).forEach((player) => {
        selectedDefensivePlayerFilters[key][player] = true;
      });
      renderMapInfo();
      return;
    }
    if (event.target.closest("[data-early-none]")) {
      collectDefensivePlayers(activeInfo).forEach((player) => {
        selectedDefensivePlayerFilters[key][player] = false;
      });
      renderMapInfo();
      return;
    }
    const rotationDot = event.target.closest(".rotation-dot[data-trail-id]");
    if (rotationDot) {
      const trailId = rotationDot.dataset.trailId;
      activeRotationTrail = activeRotationTrail === trailId ? null : trailId;
      renderMapInfo();
      return;
    }
    const bucketBtn = event.target.closest(".rotation-bucket-btn[data-rotation-bucket]");
    if (bucketBtn) {
      const key = bucketBtn.dataset.rotationBucket;
      if (activeRotationBuckets.has(key)) {
        activeRotationBuckets.delete(key);
      } else {
        activeRotationBuckets.add(key);
      }
      renderMapInfo();
      return;
    }

    const button = event.target.closest("button[data-def-player]");
    if (!button) return;
    const playerName = decodeURIComponent(button.dataset.defPlayer ?? "");
    const current = selectedDefensivePlayerFilters[key][playerName] !== false;
    selectedDefensivePlayerFilters[key][playerName] = !current;
    renderMapInfo();
  });
}

if (defensiveMapSelect) {
  defensiveMapSelect.addEventListener("change", (event) => {
    activeDefensiveMap = event.target.value;
    activeRotationTrail = null;
    activeRotationBuckets = new Set();
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
preloadRetakeData();
preloadPostPlantData();
preloadSiteStats();

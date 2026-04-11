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
const teamOrder = ["fokus", "eintracht", "attax", "dortmund"].filter((key) => allVetoHistoryData[key]);
let activeTeam = teamOrder[0];
let startDateFilter = "";

const teamSwitch = document.getElementById("team-switch");
const historyBody = document.getElementById("history-body");
const tableTitle = document.getElementById("table-title");
const tableSubtitle = document.getElementById("table-subtitle");
const startButton = document.getElementById("start-button");
const startDateInput = document.getElementById("start-date");
const resetDateButton = document.getElementById("reset-date");
const heroTeam = document.getElementById("hero-team");
const firstBanList = document.getElementById("first-ban-list");
const firstPickList = document.getElementById("first-pick-list");
const mostPlayedList = document.getElementById("most-played-list");

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
              <a class="source-link" href="${row.source}" target="_blank" rel="noreferrer">${row.sourceLabel ?? "match page"}</a>
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

function renderSwitch() {
  teamSwitch.innerHTML = teamOrder
    .map((key) => {
      const team = allVetoHistoryData[key];
      return `
        <button class="team-button ${key === activeTeam ? "active" : ""}" data-team="${key}">
          ${team.name}
        </button>
      `;
    })
    .join("");

  teamSwitch.querySelectorAll(".team-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeTeam = button.dataset.team;
      render();
    });
  });
}

function render() {
  const team = allVetoHistoryData[activeTeam];
  tableTitle.textContent = `${team.name} Veto History`;
  tableSubtitle.textContent = startDateFilter
    ? `${team.subtitle} starting ${startDateFilter}`
    : team.subtitle;
  heroTeam.textContent = team.name;
  startDateInput.value = startDateFilter;
  renderSwitch();
  renderInsights(team);
  renderTable(team);
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

render();

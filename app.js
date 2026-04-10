const stepConfig = [
  { key: "ban1", label: "Ban 1" },
  { key: "ban2", label: "Ban 2" },
  { key: "pick1", label: "Pick 1" },
  { key: "pick2", label: "Pick 2" },
  { key: "ban3", label: "Ban 3" },
  { key: "ban4", label: "Ban 4" }
];

const teamOrder = ["fokus", "eintracht"];
let activeTeam = teamOrder[0];
let startDateFilter = "";

const teamSwitch = document.getElementById("team-switch");
const summaryGrid = document.getElementById("summary-grid");
const historyBody = document.getElementById("history-body");
const tableTitle = document.getElementById("table-title");
const tableSubtitle = document.getElementById("table-subtitle");
const startButton = document.getElementById("start-button");
const startDateInput = document.getElementById("start-date");
const resetDateButton = document.getElementById("reset-date");

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

function getTeamOwnedMaps(rows, predicate) {
  const maps = [];
  for (const row of rows) {
    for (const { key } of stepConfig) {
      const step = row[key];
      if (!step || step.map === "-" || step.ownerKind !== "team") continue;
      if (predicate(step)) {
        maps.push(step.map);
      }
    }
  }
  return maps;
}

function topFrequency(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
}

function makeStepCell(step) {
  const ownerText = step.ownerLabel === "-" ? "-" : step.ownerLabel;
  return `
    <td>
      <div class="map-pill ${step.type} ${step.ownerKind}">
        <p class="map-name">${step.map}</p>
        <div class="owner-tag">${ownerText}</div>
      </div>
    </td>
  `;
}

function renderSummary(team) {
  const filteredRows = getFilteredRows(team);
  const [topBan, topBanCount] = topFrequency(
    getTeamOwnedMaps(filteredRows, (step) => step.type === "ban")
  );
  const [topPick, topPickCount] = topFrequency(
    getTeamOwnedMaps(filteredRows, (step) => step.type === "pick")
  );
  const [topDecider, topDeciderCount] = topFrequency(
    filteredRows.map((row) => row.decider).filter((value) => value && value !== "-")
  );
  const latest = filteredRows[0];

  const cards = [
    {
      label: "Series Logged",
      value: String(filteredRows.length),
      meta: "Liquipedia match pages"
    },
    {
      label: "Most Common Team Ban",
      value: topBan ?? "n/a",
      meta: topBan ? `${topBanCount} times` : "No data"
    },
    {
      label: "Most Common Team Pick",
      value: topPick ?? "n/a",
      meta: topPick ? `${topPickCount} times` : "No data"
    },
    {
      label: "Most Common Decider",
      value: topDecider ?? "n/a",
      meta: topDecider && latest ? `${topDeciderCount} times, latest vs ${latest.opponentAbbr ?? latest.opponent}` : "No data"
    }
  ];

  summaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <p class="label">${card.label}</p>
          <p class="value">${card.value}</p>
          <p class="meta">${card.meta}</p>
        </article>
      `
    )
    .join("");
}

function renderTable(team) {
  historyBody.innerHTML = getFilteredRows(team)
    .map((row) => {
      const { month, day } = formatDate(row.date);
      return `
        <tr>
          <td>
            <span class="date-label">${month} ${day}</span>
            <span class="year-tag">${row.date.slice(0, 4)}</span>
          </td>
          <td class="opponent-cell">
            <p class="opponent-name" title="${row.opponent}">${row.opponentAbbr ?? row.opponent} <span class="score-tag">(${row.score})</span></p>
            <a class="source-link" href="${row.source}" target="_blank" rel="noreferrer">match page</a>
          </td>
          ${stepConfig.map(({ key }) => makeStepCell(row[key])).join("")}
          <td>
            <div class="map-pill decider">
              <p class="map-name">${row.decider}</p>
              <div class="owner-tag">remaining</div>
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
      const team = vetoHistoryData[key];
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
  const team = vetoHistoryData[activeTeam];
  tableTitle.textContent = `${team.name} Veto History`;
  tableSubtitle.textContent = startDateFilter
    ? `${team.subtitle} starting ${startDateFilter}`
    : team.subtitle;
  startDateInput.value = startDateFilter;
  renderSwitch();
  renderSummary(team);
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

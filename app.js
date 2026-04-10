const stepConfig = [
  { key: "ban1", label: "Ban 1", type: "ban", owner: "opp" },
  { key: "ban2", label: "Ban 2", type: "ban", owner: "team" },
  { key: "pick1", label: "Pick 1", type: "pick", owner: "opp" },
  { key: "pick2", label: "Pick 2", type: "pick", owner: "team" },
  { key: "ban3", label: "Ban 3", type: "ban", owner: "opp" },
  { key: "ban4", label: "Ban 4", type: "ban", owner: "team" }
];

const teamOrder = ["fokus", "eintracht"];
let activeTeam = teamOrder[0];

const teamSwitch = document.getElementById("team-switch");
const summaryGrid = document.getElementById("summary-grid");
const historyBody = document.getElementById("history-body");
const tableTitle = document.getElementById("table-title");
const tableSubtitle = document.getElementById("table-subtitle");

function frequency(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    const value = row[key];
    if (!value || value === "-") continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
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

function makeStepCell(row, config) {
  const map = row[config.key] || "-";
  const ownerText = config.owner === "team" ? "team" : "opp";
  return `
    <td>
      <div class="map-pill ${config.type} ${config.owner}">
        <p class="map-name">${map}</p>
        <div class="owner-tag">${ownerText}</div>
      </div>
    </td>
  `;
}

function renderSummary(team) {
  const [topBan, topBanCount] = frequency(team.rows, "ban2");
  const [topPick, topPickCount] = frequency(team.rows, "pick2");
  const [topDecider, topDeciderCount] = frequency(team.rows, "decider");
  const latest = team.rows[0];

  const cards = [
    {
      label: "Series Logged",
      value: String(team.rows.length),
      meta: "Liquipedia match pages"
    },
    {
      label: "Most Common Team Ban",
      value: topBan ?? "—",
      meta: topBan ? `${topBanCount} times` : "No data"
    },
    {
      label: "Most Common Team Pick",
      value: topPick ?? "—",
      meta: topPick ? `${topPickCount} times` : "No data"
    },
    {
      label: "Most Common Decider",
      value: topDecider ?? "—",
      meta: topDecider ? `${topDeciderCount} times, latest vs ${latest.opponent}` : "No data"
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
  historyBody.innerHTML = team.rows
    .map((row) => {
      const { month, day } = formatDate(row.date);
      return `
        <tr>
          <td>
            <span class="date-label">${month} ${day}</span>
            <span class="year-tag">${row.date.slice(0, 4)}</span>
          </td>
          <td class="opponent-cell">
            <p class="opponent-name">${row.opponent}</p>
            <a class="source-link" href="${row.source}" target="_blank" rel="noreferrer">match page</a>
          </td>
          ${stepConfig.map((config) => makeStepCell(row, config)).join("")}
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
  tableSubtitle.textContent = team.subtitle;
  renderSwitch();
  renderSummary(team);
  renderTable(team);
}

render();

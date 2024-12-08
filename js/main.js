const API_URL = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";

const homeSection = document.querySelector("section#home");
const raceSection = document.querySelector("section#race");
const modal = document.querySelector("#modal");

const constructorModal = document.querySelector("#constructor-modal");
const driverModal = document.querySelector("#driver-modal");
const circuitModal = document.querySelector("#circuit-modal");
const seasonSelect = document.querySelector("#season-select");
const raceYear = document.querySelector("#race-year");
const seasonResult = document.querySelector("ul#season-result");
const raceNoResult = document.querySelector("#race-no-result");
const raceResult = document.querySelector("#race-result");

const state = {
  season: null,
  races: {
    2020: [],
    2021: [],
    2022: [],
    2023: [],
  },
  currentRace: {},
};

const addRaceToLocalStorage = (season, race) => {
  localStorage.setItem(`apex-races-${season}`, JSON.stringify(race));
};

const changeView = (view) => {
  if (view === "home") {
    homeSection.classList.remove("hidden");
    raceSection.classList.add("hidden");
  } else {
    raceSection.classList.remove("hidden");
    homeSection.classList.add("hidden");
  }
};

const getRaces = async (season) => {
  const response = await fetch(`${API_URL}/races.php?season=${season}`);
  const data = await response.json();

  return data;
};

const getRaceQualifying = async (query) => {
  const response = await fetch(`${API_URL}/qualifying.php?${query}`);
  const data = await response.json();

  return data;
};

const getRaceResults = async (query) => {
  const response = await fetch(`${API_URL}/results.php?${query}`);
  const data = await response.json();

  return data;
};

const showRaceInfo = async (race) => {
  raceResult.classList.remove("hidden");
  raceNoResult.classList.add("hidden");

  race.qualifying = await getRaceQualifying("race=" + race.id);
  race.results = await getRaceResults("race=" + race.id);

  state.currentRace = race;
  updateRaceResultsHTML(race);
};

const updateRaceResultsHTML = (race) => {
  // First Div - Basic info
  const raceNameDiv = document.createElement("div");
  raceNameDiv.classList.add("text-2xl", "font-bold", "text-center");
  raceNameDiv.innerText = `Results for ${race.name}`;
  raceResult.appendChild(raceNameDiv);

  // Second Div - Round, Year, Circuit, etc.
  const detailsDiv = document.createElement("div");
  detailsDiv.className = "space-y-2";
  detailsDiv.innerHTML = `
      <p><strong>Round:</strong> ${race.round}</p>
      <p><strong>Year:</strong> ${race.year}</p>
      <p>
        <strong>Circuit:</strong>
  <button onclick="openModal('circuit', '${race.circuit.ref}')" class="text-blue-500 hover:underline">
          ${race.circuit.name}
        </button>
      </p>
      <p><strong>Date:</strong> ${race.date}</p>
      <p>
        <strong>More Info:</strong>
        <a href="${race.url}" target="_blank" class="text-blue-500 hover:underline">
          Wikipedia
        </a>
      </p>
    `;
  raceResult.appendChild(detailsDiv);

  // Third Div - Qualifying Table
  const qualifyingDiv = document.createElement("div");
  qualifyingDiv.classList.add("max-h-[400px]", "overflow-auto", "mt-8");
  qualifyingDiv.innerHTML = `<h2 class="text-lg text-center font-semibold mb-4 bg-white sticky top-0">Qualifying</h2>`;
  const qualifyingTable = document.createElement("table");
  qualifyingTable.className =
    "w-full border-collapse border border-gray-200 text-left";
  qualifyingTable.innerHTML = `
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2 border" onclick="sortTable('qualifying', 'position')">Position</th>
          <th class="p-2 border" onclick="sortTable('qualifying', 'driver')">Driver</th>
          <th class="p-2 border" onclick="sortTable('qualifying', 'constructor')">Constructor</th>
          <th class="p-2 border" onclick="sortTable('qualifying', 'q1')">Q1</th>
          <th class="p-2 border" onclick="sortTable('qualifying', 'q2')">Q2</th>
          <th class="p-2 border" onclick="sortTable('qualifying', 'q3')">Q3</th>
        </tr>
      </thead>
      <tbody id="qualifying"></tbody>
    `;
  qualifyingDiv.appendChild(qualifyingTable);
  raceResult.appendChild(qualifyingDiv);

  const qualifyingTBody = qualifyingTable.querySelector("tbody");
  race.qualifying.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="p-2 border">${entry.position}</td>
        <td class="p-2 border">
          <button onclick="openModal('driver', '${entry.driver.ref}')" class="text-blue-500 hover:underline">
            ${entry.driver.forename} ${entry.driver.surname}
          </button>
        </td>
        <td class="p-2 border">
          <button onclick="openModal('constructor', '${entry.constructor.ref}')" class="text-blue-500 hover:underline">
            ${entry.constructor.name}
          </button>
        </td>
        <td class="p-2 border">${entry.q1}</td>
        <td class="p-2 border">${entry.q2}</td>
        <td class="p-2 border">${entry.q3}</td>
      `;
    qualifyingTBody.appendChild(row);
  });

  // Fourth Div - Results Table
  const resultsDiv = document.createElement("div");
  resultsDiv.classList.add("max-h-[400px]", "overflow-auto", "mt-12");
  resultsDiv.innerHTML = `<h2 class="text-lg text-center font-semibold mb-4 sticky top-0 bg-white">Results</h2>`;

  let places = `<ul class="flex gap-10 justify-center text-center my-6">`;
  race.results.slice(0, 3).forEach((entry, i) => {
    places += `
    <li class="p-4 border">
      <button onclick="openModal('driver','${
        entry.driver.ref
      }')" class="text-blue-500 hover:underline">${entry.driver.forename} ${
      entry.driver.surname
    }</button>
      <p class="text-6xl font-bold">#${i + 1}</p>
    </li>
    `;
  });
  places += `</ul>`;
  resultsDiv.innerHTML += places;
  const resultsTable = document.createElement("table");
  resultsTable.className =
    "w-full border-collapse border border-gray-200 text-left";
  resultsTable.innerHTML = `
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2 border" onclick="sortTable('results', 'position')">Position</th>
          <th class="p-2 border" onclick="sortTable('results', 'driver')">Driver</th>
          <th class="p-2 border" onclick="sortTable('results', 'constructor')">Constructor</th>
          <th class="p-2 border">Laps</th>
          <th class="p-2 border">Points</th>
        </tr>
      </thead>
      <tbody id="results"></tbody>
    `;
  resultsDiv.appendChild(resultsTable);
  raceResult.appendChild(resultsDiv);

  const resultsTBody = resultsTable.querySelector("tbody");
  race.results.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="p-2 border">${entry.position}</td>
        <td class="p-2 border">
          <button onclick="openModal('driver', '${entry.driver.ref}')" class="text-blue-500 hover:underline">
            ${entry.driver.forename} ${entry.driver.surname}
          </button>
        </td>
        <td class="p-2 border">
          <button onclick="openModal('constructor', '${entry.constructor.ref}')" class="text-blue-500 hover:underline">
            ${entry.constructor.name}
          </button>
        </td>
        <td class="p-2 border">${entry.laps}</td>
        <td class="p-2 border">${entry.points}</td>
      `;
    resultsTBody.appendChild(row);
  });
};

function sortTable(tableType, column) {
  const tableBody = document.getElementById(tableType);
  const data =
    tableType === "qualifying"
      ? state.currentRace.qualifying
      : state.currentRace.results;

  // Determine the property to sort by
  const keyMap = {
    position: "position",
    driver: "driver",
    constructor: "constructor",
    laps: "laps",
    points: "points",
    q1: "q1",
    q2: "q2",
    q3: "q3",
  };

  // Sort the data
  const sortedData = [...data].sort((a, b) => {
    let valA, valB;

    // Handle driver and constructor sorting
    if (column === "driver") {
      valA = `${a.driver.forename} ${a.driver.surname}`.toLowerCase();
      valB = `${b.driver.forename} ${b.driver.surname}`.toLowerCase();
    } else if (column === "constructor") {
      valA = a.constructor.name.toLowerCase();
      valB = b.constructor.name.toLowerCase();
    } else {
      valA = a[keyMap[column]];
      valB = b[keyMap[column]];
    }

    // Convert to numbers for numeric sorting
    if (!isNaN(valA) && !isNaN(valB)) {
      valA = Number(valA);
      valB = Number(valB);
    }

    if (column.startsWith("q")) {
      [valA, valB] = [valB, valA];
    }

    // Ascending order
    return valA < valB ? -1 : valA > valB ? 1 : 0;
  });

  // Clear the table body and append sorted rows
  tableBody.innerHTML = "";

  sortedData.forEach((entry) => {
    const row = document.createElement("tr");
    if (tableType === "qualifying") {
      row.innerHTML = `
          <td class="p-2 border">${entry.position}</td>
          <td class="p-2 border">
            <button onclick="openModal('driver', '${entry.driver.ref}')" class="text-blue-500 hover:underline">
              ${entry.driver.forename} ${entry.driver.surname}
            </button>
          </td>
          <td class="p-2 border">
            <button onclick="openModal('constructor', '${entry.constructor.ref}')" class="text-blue-500 hover:underline">
              ${entry.constructor.name}
            </button>
          </td>
          <td class="p-2 border">${entry.q1}</td>
          <td class="p-2 border">${entry.q2}</td>
          <td class="p-2 border">${entry.q3}</td>
        `;
    } else if (tableType === "results") {
      row.innerHTML = `
          <td class="p-2 border">${entry.position}</td>
          <td class="p-2 border">
            <button onclick="openModal('driver', '${entry.driver.ref}')" class="text-blue-500 hover:underline">
              ${entry.driver.forename} ${entry.driver.surname}
            </button>
          </td>
          <td class="p-2 border">
            <button onclick="openModal('constructor', '${entry.constructor.ref}')" class="text-blue-500 hover:underline">
              ${entry.constructor.name}
            </button>
          </td>
          <td class="p-2 border">${entry.laps}</td>
          <td class="p-2 border">${entry.points}</td>
        `;
    }
    tableBody.appendChild(row);
  });
}

updateCircuitModalHTML = (data) => {
  circuitModal.innerHTML = `
    <h3 class="font-bold text-xl">Circuit Details</h3>
    <p>Name: ${data.name}</p>
    <p>${data.location}, ${data.country}</p>
    <a href="${data.url}" target="_blank" class="text-blue-400">More Details</a>
    <img src="https://placehold.co/400" class="max-w-400" />
  `;
};

const updateDriverModalHTML = (data) => {
  const leftHTML = `
    <h3 class="font-bold text-xl">Driver Details</h3>
    <p>Name: ${data.forename} ${data.surname}</p>
    <p>Nationality: ${data.nationality}</p>
    <a href="${data.url}" target="_blank" class="text-blue-400">More Details</a>
    <img src="https://placehold.co/400" />
  `;

  // Construct the right (article) HTML
  let rightHTML = `
    <h3 class="font-bold text-xl">Race Results</h3>
    <div class="max-h-[400px] overflow-auto">
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2 text-left">Round</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Driver</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Position</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Populate table rows with race results
  data.races.forEach((result) => {
    rightHTML += `
      <tr>
        <td class="border border-gray-300 px-4 py-2">${result.round}</td>
        <td class="border border-gray-300 px-4 py-2">${result.name}</td>
        <td class="border border-gray-300 px-4 py-2">${result.forename} ${result.surname}</td>
        <td class="border border-gray-300 px-4 py-2">${result.positionOrder}</td>
      </tr>
    `;
  });

  rightHTML += `</tbody></table></div>`;

  driverModal.innerHTML = `
    <aside class="w-1/4 pr-4 border-r flex flex-col gap-4">
      ${leftHTML}
    </aside>
    <article class="w-3/4 pl-4">
      ${rightHTML}
    </article>
  `;
};

const updateConstructorModalHTML = (data) => {
  const leftHTML = `
    <h3 class="font-bold text-xl">Constructor Details</h3>
    <p>Name: ${data.name}</p>
    <p>Nationality: ${data.nationality}</p>
    <a href="${data.url}" target="_blank" class="text-blue-400">More Details</a>
  `;

  // Construct the right (article) HTML
  let rightHTML = `
    <h3 class="font-bold text-xl">Race Results</h3>
    <div class="max-h-[400px] overflow-auto">
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2 text-left">Round</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Driver</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Position</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Populate table rows with race results
  data.races.forEach((result) => {
    rightHTML += `
      <tr>
        <td class="border border-gray-300 px-4 py-2">${result.round}</td>
        <td class="border border-gray-300 px-4 py-2">${result.name}</td>
        <td class="border border-gray-300 px-4 py-2">${result.forename} ${result.surname}</td>
        <td class="border border-gray-300 px-4 py-2">${result.positionOrder}</td>
      </tr>
    `;
  });

  rightHTML += `</tbody></table></div>`;

  constructorModal.innerHTML = `
    <aside class="w-1/4 pr-4 border-r flex flex-col gap-4">
      ${leftHTML}
    </aside>
    <article class="w-3/4 pl-4">
      ${rightHTML}
    </article>
  `;
};

const closeModal = () => {
  modal.classList.add("hidden");
};

const openModal = async (name, ref) => {
  constructorModal.classList.add("hidden");
  driverModal.classList.add("hidden");
  circuitModal.classList.add("hidden");

  if (name === "constructor") {
    const infoResponse = await fetch(`${API_URL}/constructors.php?ref=${ref}`);
    const data = await infoResponse.json();

    const raceResponse = await fetch(
      `${API_URL}/constructorResults.php?ref=${ref}&season=${state.season}`
    );

    data.races = await raceResponse.json();

    updateConstructorModalHTML(data);
    constructorModal.classList.remove("hidden");
  } else if (name === "driver") {
    const infoResponse = await fetch(`${API_URL}/drivers.php?ref=${ref}`);
    const data = await infoResponse.json();

    const raceResponse = await fetch(
      `${API_URL}/driverResults.php?driver=${ref}&season=${state.season}`
    );

    data.races = await raceResponse.json();

    updateDriverModalHTML(data);
    driverModal.classList.remove("hidden");
  } else if (name === "circuit") {
    const response = await fetch(`${API_URL}/circuits.php?ref=${ref}`);
    const data = await response.json();

    updateCircuitModalHTML(data);
    circuitModal.classList.remove("hidden");
  }

  modal.classList.remove("hidden");
};

const showSeasonInfo = (season) => {
  seasonResult.innerHTML = `
    <li class="grid grid-cols-[40px_1fr_70px] font-bold">
        <p>Rnd</p>
        <p>Name</p>
    </li>
    `;

  for (const race of state.races[season]) {
    const li = document.createElement("li");
    li.classList.add(
      "mt-2",
      "grid",
      "grid-cols-[40px_1fr_70px]",
      "items-center",
      "text-sm"
    );
    li.innerHTML = `
        <p>${race.round}</p>
        <p>${race.name}</p>
    `;

    const resultBtn = document.createElement("button");
    resultBtn.classList.add("p-1", "bg-white", "border", "border-blue-300");
    resultBtn.textContent = "results";
    resultBtn.addEventListener("click", () => showRaceInfo(race));

    li.append(resultBtn);
    seasonResult.append(li);
  }
};

const handleSeasonChange = async (event) => {
  const value = Number(event.target.value);
  state.season = value;
  console.log(value, state.races);
  raceYear.textContent = value;
  changeView("race");

  if (state.races[value].length === 0) {
    const races = await getRaces(value);
    addRaceToLocalStorage(value, races);
    state.races[value] = races;
  }

  showSeasonInfo(value);
};

const loadStateFromLS = () => {
  const seasons = [2020, 2021, 2022, 2023];
  for (const season of seasons) {
    const race = localStorage.getItem("apex-races-" + season);
    if (race) {
      state.races[season] = JSON.parse(race);
    }
  }
};

const main = () => {
  loadStateFromLS();
  seasonSelect.addEventListener("change", handleSeasonChange);
};

window.addEventListener("DOMContentLoaded", main);
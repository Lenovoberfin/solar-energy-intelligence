// ============================================================
// SOLAR ENERGY INTELLIGENCE
// DASHBOARD + OPEN-METEO + LOCAL LOTTIE
// WEATHER AUTO REFRESH: 30 MINUTES
// ============================================================


// ============================================================
// NAVIGATION
// ============================================================

const navButtons =
  document.querySelectorAll(".nav-button");

const pages =
  document.querySelectorAll(".page");


function openPage(pageId) {
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  navButtons.forEach((button) => {
    button.classList.remove("active");
  });

  const target =
    document.getElementById(pageId);

  if (target) {
    target.classList.add("active");
  }

  const nav =
    document.querySelector(
      `.nav-button[data-page="${pageId}"]`
    );

  if (nav) {
    nav.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetPage =
      button.dataset.page;


    if (
      !signedIn() ||
      !getUser()
    ) {
      openPage("profile");

      showNotification(
        "Please sign in to access the dashboard.",
        "error"
      );

      return;
    }


    openPage(targetPage);
  });
});


const profileButton =
  document.getElementById(
    "profileButton"
  );


if (profileButton) {
  profileButton.addEventListener(
    "click",
    () => {
      openPage("profile");
    }
  );
}


function updateAuthChromeVisibility() {
  const loggedIn =
    signedIn() &&
    Boolean(getUser());

  const body =
    document.body;

  const bottomNavigation =
    document.querySelector(
      ".bottom-navigation"
    );

  if (loggedIn) {
    body.classList.remove(
      "auth-pending",
      "auth-locked"
    );

    if (profileButton) {
      profileButton.style.removeProperty(
        "display"
      );
    }

    if (bottomNavigation) {
      bottomNavigation.style.removeProperty(
        "display"
      );
    }
  }

  else {
    body.classList.remove(
      "auth-pending"
    );

    body.classList.add(
      "auth-locked"
    );

    if (profileButton) {
      profileButton.style.setProperty(
        "display",
        "none",
        "important"
      );
    }

    if (bottomNavigation) {
      bottomNavigation.style.setProperty(
        "display",
        "none",
        "important"
      );
    }
  }
}


// ============================================================
// NOTIFICATION
// ============================================================

const appNotification =
  document.getElementById(
    "appNotification"
  );

const notificationText =
  document.getElementById(
    "notificationText"
  );

let notificationTimer;


function showNotification(
  message,
  type = "success"
) {
  if (
    !appNotification ||
    !notificationText
  ) {
    return;
  }

  notificationText.textContent =
    message;

  appNotification.classList.remove(
    "success",
    "error"
  );

  appNotification.classList.add(type);
  appNotification.classList.add("show");

  clearTimeout(notificationTimer);

  notificationTimer =
    setTimeout(() => {
      appNotification.classList.remove(
        "show"
      );
    }, 2500);
}


// ============================================================
// EMS DEMO DATA
// ============================================================

const emsData = {
  soc: 62,

  pvPower: 4.62,

  loadPower: 4.20,

  netPower: 0.42,

  temperature: 31.8,

  ldr: 70,

  state: 1,

  stateName: "NORMAL",

  charge: 1,

  discharge: 0,

  safetyFault: false,

  manualMode: false,

  fanOn: false,

  ledOn: false,

  relayOn: true
};


// ============================================================
// EMS
// ============================================================

function updateChargeDischarge() {
  emsData.charge = 0;
  emsData.discharge = 0;

  if (
    emsData.netPower > 0 &&
    emsData.soc < 100
  ) {
    emsData.charge = 1;
  }

  if (
    emsData.netPower < 0 &&
    emsData.soc > 10
  ) {
    emsData.discharge = 1;
  }
}


function updateDashboard() {
  setText(
    "homeSoc",
    `${emsData.soc}%`
  );

  setText(
    "homePv",
    `${emsData.pvPower.toFixed(2)} W`
  );

  setText(
    "homeLoad",
    `${emsData.loadPower.toFixed(2)} W`
  );

  const netText =
    emsData.netPower >= 0
      ? `+${emsData.netPower.toFixed(2)} W`
      : `${emsData.netPower.toFixed(2)} W`;

  setText(
    "homeNet",
    netText
  );

  setText(
    "homeNetDescription",
    emsData.netPower >= 0
      ? "Energy surplus"
      : "Energy deficit"
  );

  setText(
    "homeTemp",
    `${emsData.temperature.toFixed(1)} °C`
  );

  setText(
    "homeLdr",
    `${emsData.ldr}%`
  );

  setText(
    "homeStateName",
    emsData.stateName
  );

  setText(
    "homeStateNumber",
    emsData.state
  );

  const socProgress =
    document.getElementById(
      "socProgress"
    );

  if (socProgress) {
    socProgress.style.width =
      `${emsData.soc}%`;
  }

  setText(
    "chargeCommand",
    emsData.charge
  );

  setText(
    "dischargeCommand",
    emsData.discharge
  );

  setText(
    "energyPv",
    `${emsData.pvPower.toFixed(2)} W`
  );

  setText(
    "energyLoad",
    `${emsData.loadPower.toFixed(2)} W`
  );

  setText(
    "energyNet",
    netText
  );

  setText(
    "energySoc",
    `${emsData.soc}%`
  );


  let stateDescription =
    "Automatic energy management active";


  if (emsData.state === 2) {
    stateDescription =
      "Energy saving strategy active";
  }

  if (emsData.state === 3) {
    stateDescription =
      "Critical battery protection active";
  }

  if (emsData.state === 4) {
    stateDescription =
      "Remote manual control active";
  }

  if (emsData.state === 5) {
    stateDescription =
      "Safety protection active";
  }


  setText(
    "homeStateDescription",
    stateDescription
  );


  if (emsData.safetyFault) {
    setText(
      "safetyStatus",
      "Safety Fault Active"
    );

    setText(
      "safetyDescription",
      "Temperature safety limit exceeded."
    );
  }

  else {
    setText(
      "safetyStatus",
      "System Safe"
    );

    setText(
      "safetyDescription",
      "No active temperature fault detected."
    );
  }


  updatePVHealth();

  updateControl();
}


function setText(
  id,
  value
) {
  const element =
    document.getElementById(id);

  if (element) {
    element.textContent =
      value;
  }
}


// ============================================================
// PV HEALTH
// ============================================================

function updatePVHealth() {
  const card =
    document.getElementById(
      "pvHealthCard"
    );

  const title =
    document.getElementById(
      "pvHealthTitle"
    );

  const description =
    document.getElementById(
      "pvHealthDescription"
    );

  const status =
    document.getElementById(
      "pvHealthStatus"
    );


  if (
    !card ||
    !title ||
    !description ||
    !status
  ) {
    return;
  }


  const maxExpectedPv =
    6.85;


  const expectedPv =
    (emsData.ldr / 100) *
    maxExpectedPv;


  let difference =
    0;


  if (expectedPv > 0) {
    difference =
      (
        (
          emsData.pvPower -
          expectedPv
        ) /
        expectedPv
      ) * 100;
  }


  setText(
    "pvHealthLdr",
    `${emsData.ldr}%`
  );

  setText(
    "expectedPv",
    `${expectedPv.toFixed(2)} W`
  );

  setText(
    "actualPv",
    `${emsData.pvPower.toFixed(2)} W`
  );

  setText(
    "pvDifference",
    `${difference >= 0 ? "+" : ""}${difference.toFixed(1)}%`
  );


  card.classList.remove(
    "warning",
    "danger"
  );

  status.classList.remove(
    "warning",
    "danger"
  );


  if (
    emsData.ldr >= 60 &&
    difference < -40
  ) {
    card.classList.add(
      "danger"
    );

    status.classList.add(
      "danger"
    );

    title.textContent =
      "PV Performance Anomaly";

    description.textContent =
      "PV output is much lower than expected. Possible shading, dirt, panel orientation or electrical performance loss.";

    status.textContent =
      "CHECK PANEL";
  }

  else if (
    emsData.ldr >= 60 &&
    difference < -25
  ) {
    card.classList.add(
      "warning"
    );

    status.classList.add(
      "warning"
    );

    title.textContent =
      "Reduced PV Performance";

    description.textContent =
      "PV production is lower than expected. Check for partial shading, dirt or temporary environmental effects.";

    status.textContent =
      "WARNING";
  }

  else {
    title.textContent =
      "Panel Performance Normal";

    description.textContent =
      "PV generation is consistent with the measured light level.";

    status.textContent =
      "NORMAL";
  }
}


// ============================================================
// CONTROL
// ============================================================

const modeSwitch =
  document.getElementById(
    "modeSwitch"
  );

const modeSwitchText =
  document.getElementById(
    "modeSwitchText"
  );

const fanButton =
  document.getElementById(
    "fanButton"
  );

const ledButton =
  document.getElementById(
    "ledButton"
  );

const relayStatus =
  document.getElementById(
    "relayStatus"
  );


function updateControl() {
  setText(
    "controlStateName",
    emsData.stateName
  );

  setText(
    "controlStateNumber",
    emsData.state
  );


  if (emsData.safetyFault) {
    setText(
      "controlStateDescription",
      "Safety protection active. Remote commands are locked."
    );
  }

  else if (emsData.manualMode) {
    setText(
      "controlStateDescription",
      "Remote commands are currently available."
    );
  }

  else {
    setText(
      "controlStateDescription",
      "Automatic control active."
    );
  }


  if (
    modeSwitch &&
    modeSwitchText
  ) {
    if (emsData.manualMode) {
      modeSwitch.classList.add(
        "manual"
      );

      modeSwitchText.textContent =
        "MANUAL";
    }

    else {
      modeSwitch.classList.remove(
        "manual"
      );

      modeSwitchText.textContent =
        "AUTO";
    }
  }


  if (fanButton) {
    fanButton.disabled =
      !emsData.manualMode ||
      emsData.safetyFault;

    fanButton.textContent =
      emsData.fanOn
        ? "FAN ON"
        : "FAN OFF";

    fanButton.classList.toggle(
      "active",
      emsData.fanOn
    );
  }


  if (ledButton) {
    ledButton.disabled =
      !emsData.manualMode ||
      emsData.safetyFault;

    ledButton.textContent =
      emsData.ledOn
        ? "LED ON"
        : "LED OFF";

    ledButton.classList.toggle(
      "active",
      emsData.ledOn
    );
  }


  if (relayStatus) {
    relayStatus.textContent =
      emsData.relayOn
        ? "ON"
        : "OFF";

    relayStatus.classList.toggle(
      "on",
      emsData.relayOn
    );
  }
}


function calculateManualLoad() {
  let load =
    0;

  if (emsData.fanOn) {
    load +=
      2.5;
  }

  if (emsData.ledOn) {
    load +=
      1.7;
  }

  emsData.loadPower =
    load;

  emsData.relayOn =
    emsData.fanOn ||
    emsData.ledOn;

  emsData.netPower =
    emsData.pvPower -
    emsData.loadPower;

  updateChargeDischarge();

  updateDashboard();
}


if (modeSwitch) {
  modeSwitch.addEventListener(
    "click",
    () => {
      if (emsData.safetyFault) {
        showNotification(
          "Safety fault active. Manual control is locked.",
          "error"
        );

        return;
      }


      emsData.manualMode =
        !emsData.manualMode;


      if (emsData.manualMode) {
        emsData.state =
          4;

        emsData.stateName =
          "MANUAL";

        showNotification(
          "Manual Mode enabled."
        );
      }

      else {
        emsData.state =
          1;

        emsData.stateName =
          "NORMAL";

        emsData.fanOn =
          false;

        emsData.ledOn =
          false;

        emsData.loadPower =
          4.20;

        emsData.relayOn =
          true;

        emsData.netPower =
          emsData.pvPower -
          emsData.loadPower;

        updateChargeDischarge();

        showNotification(
          "Automatic EMS control enabled."
        );
      }


      updateDashboard();
    }
  );
}


if (fanButton) {
  fanButton.addEventListener(
    "click",
    () => {
      if (
        !emsData.manualMode ||
        emsData.safetyFault
      ) {
        return;
      }

      emsData.fanOn =
        !emsData.fanOn;

      calculateManualLoad();

      showNotification(
        emsData.fanOn
          ? "Fan turned on."
          : "Fan turned off."
      );
    }
  );
}


if (ledButton) {
  ledButton.addEventListener(
    "click",
    () => {
      if (
        !emsData.manualMode ||
        emsData.safetyFault
      ) {
        return;
      }

      emsData.ledOn =
        !emsData.ledOn;

      calculateManualLoad();

      showNotification(
        emsData.ledOn
          ? "LED turned on."
          : "LED turned off."
      );
    }
  );
}


// ============================================================
// WEATHER TABS
// ============================================================

const weatherTabs =
  document.querySelectorAll(
    ".weather-tab"
  );

const weatherPanels =
  document.querySelectorAll(
    ".weather-panel"
  );


weatherTabs.forEach(
  (tab) => {
    tab.addEventListener(
      "click",
      () => {
        weatherTabs.forEach(
          (item) => {
            item.classList.remove(
              "active"
            );
          }
        );


        weatherPanels.forEach(
          (panel) => {
            panel.classList.remove(
              "active"
            );
          }
        );


        tab.classList.add(
          "active"
        );


        const targetId =
          tab.dataset.weatherTab ===
          "today"
            ? "weatherToday"
            : "weatherWeek";


        document
          .getElementById(
            targetId
          )
          ?.classList
          .add("active");
      }
    );
  }
);


// ============================================================
// WEATHER CODES
// ============================================================

function weatherCodeToText(code) {
  if (code === 0) {
    return "Clear Sky";
  }

  if (
    code === 1 ||
    code === 2
  ) {
    return "Partly Cloudy";
  }

  if (code === 3) {
    return "Cloudy";
  }

  if (
    code === 45 ||
    code === 48
  ) {
    return "Foggy";
  }

  if (
    code >= 51 &&
    code <= 57
  ) {
    return "Drizzle";
  }

  if (
    code >= 61 &&
    code <= 67
  ) {
    return "Rainy";
  }

  if (
    code >= 71 &&
    code <= 77
  ) {
    return "Snowy";
  }

  if (
    code >= 80 &&
    code <= 82
  ) {
    return "Rain Showers";
  }

  if (
    code === 85 ||
    code === 86
  ) {
    return "Snow Showers";
  }

  if (code >= 95) {
    return "Storm";
  }

  return "Weather";
}


// ============================================================
// LOCAL LOTTIE
// ============================================================

function getWeatherLottiePath(
  code,
  radiation = 0
) {
  const night =
    Number(radiation) <= 0;


  if (code === 0) {
    return night
      ? "assets/weather/clear-night.json"
      : "assets/weather/sunny.json";
  }


  if (
    code === 1 ||
    code === 2
  ) {
    return "assets/weather/partly-cloudy.json";
  }


  if (code === 3) {
    return "assets/weather/cloudy.json";
  }


  if (
    code === 45 ||
    code === 48
  ) {
    return "assets/weather/fog.json";
  }


  if (
    code >= 51 &&
    code <= 67
  ) {
    return "assets/weather/rain.json";
  }


  if (
    code >= 71 &&
    code <= 77
  ) {
    return "assets/weather/snow.json";
  }


  if (
    code >= 80 &&
    code <= 82
  ) {
    return "assets/weather/rain.json";
  }


  if (
    code === 85 ||
    code === 86
  ) {
    return "assets/weather/snow.json";
  }


  if (code >= 95) {
    return "assets/weather/thunderstorms-rain.json";
  }


  return "assets/weather/cloudy.json";
}


function createLottiePlayer(
  code,
  radiation,
  size
) {
  const player =
    document.createElement(
      "lottie-player"
    );


  player.setAttribute(
    "src",
    getWeatherLottiePath(
      code,
      radiation
    )
  );


  player.setAttribute(
    "background",
    "transparent"
  );


  player.setAttribute(
    "speed",
    "1"
  );


  player.setAttribute(
    "loop",
    ""
  );


  player.setAttribute(
    "autoplay",
    ""
  );


  player.style.width =
    `${size}px`;

  player.style.height =
    `${size}px`;

  player.style.display =
    "block";

  player.style.margin =
    "0 auto";


  return player;
}


function updateMainWeatherLottie(
  code,
  radiation
) {
  const oldPlayer =
    document.getElementById(
      "weatherLottie"
    );


  if (!oldPlayer) {
    return;
  }


  const newPlayer =
    createLottiePlayer(
      code,
      radiation,
      180
    );


  newPlayer.id =
    "weatherLottie";


  oldPlayer.replaceWith(
    newPlayer
  );
}


// ============================================================
// ENERGY ESTIMATION
// ============================================================

function getPanelCapacity() {
  const user =
    getUser();


  if (
    user &&
    Number(
      user.panelCapacity
    ) > 0
  ) {
    return Number(
      user.panelCapacity
    );
  }


  return 13.7;
}


function estimateHourlyEnergy(
  radiation,
  panelCapacity
) {
  const normalizedSun =
    Math.max(
      0,
      Math.min(
        radiation / 1000,
        1.2
      )
    );


  const estimatedPower =
    panelCapacity *
    normalizedSun;


  return estimatedPower /
    1000;
}


function estimateDailyEnergy(
  hourlyRadiation,
  panelCapacity
) {
  let wattHours =
    0;


  hourlyRadiation.forEach(
    (radiation) => {
      const normalizedSun =
        Math.max(
          0,
          Math.min(
            radiation / 1000,
            1.2
          )
        );


      wattHours +=
        panelCapacity *
        normalizedSun;
    }
  );


  return wattHours /
    1000;
}


// ============================================================
// PROFILE STORAGE
// ============================================================

const USER_KEY =
  "solarEMSProfile";

const SESSION_KEY =
  "solarEMSSession";

const REMEMBER_KEY =
  "solarEMSRememberMe";


function getUser() {
  const raw =
    localStorage.getItem(
      USER_KEY
    );


  if (!raw) {
    return null;
  }


  try {
    return JSON.parse(raw);
  }

  catch {
    return null;
  }
}


function saveUser(user) {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}


function signedIn() {
  return (
    localStorage.getItem(
      SESSION_KEY
    ) === "true" ||
    sessionStorage.getItem(
      SESSION_KEY
    ) === "true"
  );
}


function setLoginSession(rememberMe) {
  localStorage.removeItem(
    SESSION_KEY
  );

  sessionStorage.removeItem(
    SESSION_KEY
  );


  if (rememberMe) {
    localStorage.setItem(
      SESSION_KEY,
      "true"
    );

    localStorage.setItem(
      REMEMBER_KEY,
      "true"
    );
  }

  else {
    sessionStorage.setItem(
      SESSION_KEY,
      "true"
    );

    localStorage.removeItem(
      REMEMBER_KEY
    );
  }
}


function clearLoginSession() {
  localStorage.removeItem(
    SESSION_KEY
  );

  sessionStorage.removeItem(
    SESSION_KEY
  );

  localStorage.removeItem(
    REMEMBER_KEY
  );
}


// ============================================================
// WEATHER LOCATION
// ============================================================

async function geocodeCity(
  cityName
) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(cityName)}` +
    "&count=1" +
    "&language=en" +
    "&format=json";


  const response =
    await fetch(url);


  if (!response.ok) {
    throw new Error(
      "Location request failed"
    );
  }


  const data =
    await response.json();


  if (
    !data.results ||
    !data.results.length
  ) {
    throw new Error(
      "Location not found"
    );
  }


  return data.results[0];
}


function getBrowserPosition() {
  return new Promise(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation not supported"
          )
        );

        return;
      }


      navigator.geolocation
        .getCurrentPosition(
          (position) => {
            resolve({
              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,

              name:
                "Current Location"
            });
          },

          () => {
            reject(
              new Error(
                "Location permission denied"
              )
            );
          },

          {
            enableHighAccuracy:
              false,

            timeout:
              8000,

            maximumAge:
              600000
          }
        );
    }
  );
}


async function resolveWeatherLocation() {
  const user =
    getUser();


  const profileLocation =
    user?.location?.trim();


  if (profileLocation) {
    return await geocodeCity(
      profileLocation
    );
  }


  try {
    return await getBrowserPosition();
  }

  catch {
    return await geocodeCity(
      "Izmir"
    );
  }
}


// ============================================================
// OPEN-METEO
// ============================================================

async function fetchWeatherForecast(
  latitude,
  longitude
) {
  const hourlyVariables = [
    "temperature_2m",
    "relative_humidity_2m",
    "cloud_cover",
    "weather_code",
    "shortwave_radiation"
  ].join(",");


  const dailyVariables = [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min"
  ].join(",");


  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&hourly=${hourlyVariables}` +
    `&daily=${dailyVariables}` +
    "&forecast_days=7" +
    "&timezone=auto";


  const response =
    await fetch(url);


  if (!response.ok) {
    throw new Error(
      "Weather request failed"
    );
  }


  return await response.json();
}


// ============================================================
// CHART REFERENCES
// ============================================================

let temperatureForecastChart =
  null;

let solarForecastChart =
  null;

let weeklyEnergyForecastChart =
  null;


// ============================================================
// CURRENT WEATHER
// ============================================================

function findCurrentWeatherIndex(
  forecast
) {
  const now =
    new Date();


  let bestIndex =
    0;

  let smallestDifference =
    Infinity;


  forecast.hourly.time.forEach(
    (time, index) => {
      const date =
        new Date(time);

      const difference =
        Math.abs(
          date.getTime() -
          now.getTime()
        );


      if (
        difference <
        smallestDifference
      ) {
        smallestDifference =
          difference;

        bestIndex =
          index;
      }
    }
  );


  return bestIndex;
}


function renderCurrentWeather(
  forecast
) {
  const index =
    findCurrentWeatherIndex(
      forecast
    );


  const temperature =
    forecast.hourly
      .temperature_2m[
        index
      ];


  const humidity =
    forecast.hourly
      .relative_humidity_2m[
        index
      ];


  const cloud =
    forecast.hourly
      .cloud_cover[
        index
      ];


  const radiation =
    forecast.hourly
      .shortwave_radiation[
        index
      ];


  const code =
    forecast.hourly
      .weather_code[
        index
      ];


  setText(
    "currentWeatherText",
    weatherCodeToText(code)
  );


  setText(
    "currentWeatherTemp",
    `${Math.round(temperature)}°C`
  );


  setText(
    "currentHumidity",
    `${Math.round(humidity)}%`
  );


  setText(
    "currentCloudCover",
    `${Math.round(cloud)}%`
  );


  setText(
    "currentSolarRadiation",
    `${Math.round(radiation)} W/m²`
  );


  updateMainWeatherLottie(
    code,
    radiation
  );
}


// ============================================================
// HOURLY WEATHER
// ============================================================

function renderHourlyWeather(
  forecast
) {
  const container =
    document.getElementById(
      "hourlyWeatherList"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const now =
    new Date();


  const indexes =
    [];


  forecast.hourly.time.forEach(
    (time, index) => {
      const date =
        new Date(time);


      if (
        date >= now &&
        indexes.length < 6
      ) {
        indexes.push(
          index
        );
      }
    }
  );


  const labels =
    [];

  const temperatures =
    [];

  const radiations =
    [];


  let totalEnergy =
    0;


  const capacity =
    getPanelCapacity();


  indexes.forEach(
    (index) => {
      const date =
        new Date(
          forecast.hourly.time[
            index
          ]
        );


      const hour =
        date.toLocaleTimeString(
          [],
          {
            hour:
              "2-digit",

            minute:
              "2-digit"
          }
        );


      const temperature =
        forecast.hourly
          .temperature_2m[
            index
          ];


      const radiation =
        forecast.hourly
          .shortwave_radiation[
            index
          ];


      const code =
        forecast.hourly
          .weather_code[
            index
          ];


      const energy =
        estimateHourlyEnergy(
          radiation,
          capacity
        );


      totalEnergy +=
        energy;


      labels.push(hour);

      temperatures.push(
        temperature
      );

      radiations.push(
        radiation
      );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "hourly-item";


      const timeElement =
        document.createElement(
          "strong"
        );


      timeElement.textContent =
        hour;


      const animationBox =
        document.createElement(
          "div"
        );


      animationBox.style.margin =
        "8px 0";


      animationBox.appendChild(
        createLottiePlayer(
          code,
          radiation,
          64
        )
      );


      const temperatureElement =
        document.createElement(
          "p"
        );


      temperatureElement.textContent =
        `${Math.round(temperature)}°C`;


      const conditionElement =
        document.createElement(
          "p"
        );


      conditionElement.textContent =
        weatherCodeToText(
          code
        );


      conditionElement.style.color =
        "#7c8792";

      conditionElement.style.fontSize =
        "12px";

      conditionElement.style.marginTop =
        "6px";


      const radiationElement =
        document.createElement(
          "p"
        );


      radiationElement.textContent =
        `☀️ ${Math.round(radiation)} W/m²`;

      radiationElement.style.marginTop =
        "9px";


      const energyElement =
        document.createElement(
          "p"
        );


      energyElement.textContent =
        `⚡ ${energy.toFixed(3)} kWh`;

      energyElement.style.marginTop =
        "6px";


      card.appendChild(
        timeElement
      );

      card.appendChild(
        animationBox
      );

      card.appendChild(
        temperatureElement
      );

      card.appendChild(
        conditionElement
      );

      card.appendChild(
        radiationElement
      );

      card.appendChild(
        energyElement
      );


      container.appendChild(
        card
      );
    }
  );


  setText(
    "currentForecastEnergy",
    `${totalEnergy.toFixed(3)} kWh`
  );


  updateHourlyCharts(
    labels,
    temperatures,
    radiations
  );
}


// ============================================================
// HOURLY CHARTS
// ============================================================

function updateHourlyCharts(
  labels,
  temperatures,
  radiations
) {
  if (
    typeof Chart ===
    "undefined"
  ) {
    return;
  }


  if (
    temperatureForecastChart
  ) {
    temperatureForecastChart
      .destroy();
  }


  if (
    solarForecastChart
  ) {
    solarForecastChart
      .destroy();
  }


  const temperatureCanvas =
    document.getElementById(
      "temperatureForecastChart"
    );


  const solarCanvas =
    document.getElementById(
      "solarForecastChart"
    );


  if (temperatureCanvas) {
    temperatureForecastChart =
      new Chart(
        temperatureCanvas.getContext(
          "2d"
        ),

        {
          type:
            "line",

          data: {
            labels,

            datasets: [
              {
                label:
                  "Temperature",

                data:
                  temperatures,

                borderColor:
                  "#e98a4d",

                backgroundColor:
                  "rgba(233,138,77,0.08)",

                fill:
                  true,

                tension:
                  0.35
              }
            ]
          },

          options: {
            responsive:
              true,

            maintainAspectRatio:
              false,

            plugins: {
              legend: {
                display:
                  false
              }
            },

            scales: {
              y: {
                title: {
                  display:
                    true,

                  text:
                    "Temperature (°C)"
                }
              }
            }
          }
        }
      );
  }


  if (solarCanvas) {
    solarForecastChart =
      new Chart(
        solarCanvas.getContext(
          "2d"
        ),

        {
          type:
            "line",

          data: {
            labels,

            datasets: [
              {
                label:
                  "Solar Radiation",

                data:
                  radiations,

                borderColor:
                  "#e5ad3e",

                backgroundColor:
                  "rgba(229,173,62,0.08)",

                fill:
                  true,

                tension:
                  0.35
              }
            ]
          },

          options: {
            responsive:
              true,

            maintainAspectRatio:
              false,

            plugins: {
              legend: {
                display:
                  false
              }
            },

            scales: {
              y: {
                beginAtZero:
                  true,

                title: {
                  display:
                    true,

                  text:
                    "Solar Radiation (W/m²)"
                }
              }
            }
          }
        }
      );
  }
}


// ============================================================
// WEEKLY WEATHER
// ============================================================

function renderWeeklyWeather(
  forecast
) {
  const container =
    document.getElementById(
      "weeklyForecastCards"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const capacity =
    getPanelCapacity();


  const dayLabels =
    [];

  const energyValues =
    [];


  forecast.daily.time.forEach(
    (dateString, dayIndex) => {
      const date =
        new Date(
          `${dateString}T12:00`
        );


      const dayName =
        date.toLocaleDateString(
          "en-US",
          {
            weekday:
              "short"
          }
        );


      const code =
        forecast.daily
          .weather_code[
            dayIndex
          ];


      const maxTemp =
        forecast.daily
          .temperature_2m_max[
            dayIndex
          ];


      const minTemp =
        forecast.daily
          .temperature_2m_min[
            dayIndex
          ];


      const radiationValues =
        [];


      forecast.hourly.time.forEach(
        (time, index) => {
          if (
            time.startsWith(
              dateString
            )
          ) {
            radiationValues.push(
              forecast.hourly
                .shortwave_radiation[
                  index
                ]
            );
          }
        }
      );


      const maxRadiation =
        radiationValues.length
          ? Math.max(
              ...radiationValues
            )
          : 0;


      const energy =
        estimateDailyEnergy(
          radiationValues,
          capacity
        );


      dayLabels.push(
        dayName
      );


      energyValues.push(
        energy
      );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "forecast-card";


      const dayElement =
        document.createElement(
          "span"
        );


      dayElement.className =
        "card-label";


      dayElement.textContent =
        dayName;


      const animationBox =
        document.createElement(
          "div"
        );


      animationBox.style.margin =
        "8px 0";


      animationBox.appendChild(
        createLottiePlayer(
          code,
          maxRadiation,
          76
        )
      );


      const tempElement =
        document.createElement(
          "strong"
        );


      tempElement.textContent =
        `${Math.round(maxTemp)}° / ${Math.round(minTemp)}°`;


      const conditionElement =
        document.createElement(
          "p"
        );


      conditionElement.textContent =
        weatherCodeToText(
          code
        );


      conditionElement.style.color =
        "#7c8792";

      conditionElement.style.marginTop =
        "8px";


      const radiationElement =
        document.createElement(
          "p"
        );


      radiationElement.textContent =
        `☀️ ${Math.round(maxRadiation)} W/m²`;

      radiationElement.style.marginTop =
        "10px";


      const energyElement =
        document.createElement(
          "p"
        );


      energyElement.textContent =
        `⚡ ${energy.toFixed(3)} kWh`;

      energyElement.style.marginTop =
        "7px";


      card.appendChild(
        dayElement
      );

      card.appendChild(
        animationBox
      );

      card.appendChild(
        tempElement
      );

      card.appendChild(
        conditionElement
      );

      card.appendChild(
        radiationElement
      );

      card.appendChild(
        energyElement
      );


      container.appendChild(
        card
      );
    }
  );


  updateWeeklyChart(
    dayLabels,
    energyValues
  );
}


// ============================================================
// WEEKLY CHART
// ============================================================

function updateWeeklyChart(
  labels,
  values
) {
  if (
    typeof Chart ===
    "undefined"
  ) {
    return;
  }


  if (
    weeklyEnergyForecastChart
  ) {
    weeklyEnergyForecastChart
      .destroy();
  }


  const canvas =
    document.getElementById(
      "weeklyEnergyForecastChart"
    );


  if (!canvas) {
    return;
  }


  weeklyEnergyForecastChart =
    new Chart(
      canvas.getContext(
        "2d"
      ),

      {
        type:
          "bar",

        data: {
          labels,

          datasets: [
            {
              label:
                "Estimated Energy",

              data:
                values,

              backgroundColor:
                "#e5ad3e",

              borderRadius:
                8
            }
          ]
        },

        options: {
          responsive:
            true,

          maintainAspectRatio:
            false,

          plugins: {
            legend: {
              display:
                false
            }
          },

          scales: {
            y: {
              beginAtZero:
                true,

              title: {
                display:
                  true,

                text:
                  "Energy (kWh)"
              }
            }
          }
        }
      }
    );
}


// ============================================================
// WEATHER LOADER
// ============================================================

let weatherLoading =
  false;


async function loadRealWeather(
  silent = false
) {
  if (weatherLoading) {
    return;
  }


  weatherLoading =
    true;


  try {
    if (!silent) {
      showNotification(
        "Loading weather data..."
      );
    }


    const location =
      await resolveWeatherLocation();


    const forecast =
      await fetchWeatherForecast(
        location.latitude,
        location.longitude
      );


    renderCurrentWeather(
      forecast
    );


    renderHourlyWeather(
      forecast
    );


    renderWeeklyWeather(
      forecast
    );


    if (!silent) {
      showNotification(
        `Weather updated for ${location.name || "your location"}.`
      );
    }
  }

  catch (error) {
    console.error(
      "Weather error:",
      error
    );


    if (!silent) {
      showNotification(
        "Weather data could not be loaded.",
        "error"
      );
    }
  }

  finally {
    weatherLoading =
      false;
  }
}


// ============================================================
// HISTORY
// ============================================================

const historyData = [
  {
    day: "Mon",
    forecast: 0.086,
    actual: 0.081
  },

  {
    day: "Tue",
    forecast: 0.083,
    actual: 0.080
  },

  {
    day: "Wed",
    forecast: 0.061,
    actual: 0.058
  },

  {
    day: "Thu",
    forecast: 0.091,
    actual: 0.094
  },

  {
    day: "Fri",
    forecast: 0.094,
    actual: 0.090
  },

  {
    day: "Sat",
    forecast: 0.072,
    actual: 0.069
  },

  {
    day: "Sun",
    forecast: 0.055,
    actual: 0.052
  }
];


const historyTable =
  document.getElementById(
    "historyTable"
  );


if (historyTable) {
  historyTable.innerHTML =
    "";


  historyData.forEach(
    (item) => {
      const error =
        Math.abs(
          item.forecast -
          item.actual
        );


      const errorPercent =
        item.actual > 0
          ? (
              error /
              item.actual
            ) * 100
          : 0;


      const row =
        document.createElement(
          "div"
        );


      row.className =
        "table-row";


      row.innerHTML = `
        <span>${item.day}</span>
        <span>${item.forecast.toFixed(3)} kWh</span>
        <span>${item.actual.toFixed(3)} kWh</span>
        <span>${errorPercent.toFixed(1)}%</span>
      `;


      historyTable.appendChild(
        row
      );
    }
  );
}


// ============================================================
// CHART DEFAULTS
// ============================================================

if (
  typeof Chart !==
  "undefined"
) {
  Chart.defaults.font.family =
    "Inter";

  Chart.defaults.color =
    "#7c8792";
}


// ============================================================
// ENERGY CHART
// ============================================================

const powerCanvas =
  document.getElementById(
    "powerChart"
  );


if (
  powerCanvas &&
  typeof Chart !==
    "undefined"
) {
  new Chart(
    powerCanvas.getContext(
      "2d"
    ),

    {
      type:
        "line",

      data: {
        labels: [
          "08:00",
          "10:00",
          "12:00",
          "14:00",
          "16:00",
          "18:00"
        ],

        datasets: [
          {
            label:
              "PV Power",

            data: [
              1.5,
              3.4,
              5.8,
              7.2,
              5.9,
              2.6
            ],

            borderColor:
              "#e5ad3e",

            tension:
              0.35
          },

          {
            label:
              "Load Power",

            data: [
              4.2,
              4.2,
              4.2,
              4.2,
              4.2,
              4.2
            ],

            borderColor:
              "#5ca8df",

            tension:
              0.35
          },

          {
            label:
              "Net Power",

            data: [
              -2.7,
              -0.8,
              1.6,
              3.0,
              1.7,
              -1.6
            ],

            borderColor:
              "#58ad6f",

            tension:
              0.35
          }
        ]
      },

      options: {
        responsive:
          true,

        maintainAspectRatio:
          false,

        plugins: {
          legend: {
            position:
              "bottom"
          }
        }
      }
    }
  );
}


// ============================================================
// SOC CHART
// ============================================================

const socCanvas =
  document.getElementById(
    "socChart"
  );


if (
  socCanvas &&
  typeof Chart !==
    "undefined"
) {
  new Chart(
    socCanvas.getContext(
      "2d"
    ),

    {
      type:
        "line",

      data: {
        labels: [
          "08:00",
          "10:00",
          "12:00",
          "14:00",
          "16:00",
          "18:00"
        ],

        datasets: [
          {
            label:
              "Battery SOC",

            data: [
              56,
              55,
              57,
              60,
              62,
              61
            ],

            borderColor:
              "#58ad6f",

            backgroundColor:
              "rgba(88,173,111,0.10)",

            fill:
              true,

            tension:
              0.35
          }
        ]
      },

      options: {
        responsive:
          true,

        maintainAspectRatio:
          false,

        plugins: {
          legend: {
            display:
              false
          }
        },

        scales: {
          y: {
            min:
              0,

            max:
              100
          }
        }
      }
    }
  );
}


// ============================================================
// HISTORY CHART
// ============================================================

const historyCanvas =
  document.getElementById(
    "historyChart"
  );


if (
  historyCanvas &&
  typeof Chart !==
    "undefined"
) {
  new Chart(
    historyCanvas.getContext(
      "2d"
    ),

    {
      type:
        "bar",

      data: {
        labels:
          historyData.map(
            (item) =>
              item.day
          ),

        datasets: [
          {
            label:
              "Forecast",

            data:
              historyData.map(
                (item) =>
                  item.forecast
              ),

            backgroundColor:
              "#e5ad3e",

            borderRadius:
              8
          },

          {
            label:
              "Actual",

            data:
              historyData.map(
                (item) =>
                  item.actual
              ),

            backgroundColor:
              "#58ad6f",

            borderRadius:
              8
          }
        ]
      },

      options: {
        responsive:
          true,

        maintainAspectRatio:
          false,

        plugins: {
          legend: {
            position:
              "bottom"
          }
        }
      }
    }
  );
}


// ============================================================
// PROFILE AUTH
// ============================================================

const authTabs =
  document.querySelectorAll(
    ".auth-tab"
  );

const authPanels =
  document.querySelectorAll(
    ".auth-panel"
  );


function showAuthPanel(name) {
  authTabs.forEach(
    (tab) => {
      tab.classList.remove(
        "active"
      );
    }
  );


  authPanels.forEach(
    (panel) => {
      panel.classList.remove(
        "active"
      );
    }
  );


  const panel =
    document.getElementById(
      `${name}Panel`
    );


  panel?.classList.add(
    "active"
  );


  const tab =
    document.querySelector(
      `[data-auth-tab="${name}"]`
    );


  tab?.classList.add(
    "active"
  );
}


authTabs.forEach(
  (tab) => {
    tab.addEventListener(
      "click",
      () => {
        showAuthPanel(
          tab.dataset.authTab
        );
      }
    );
  }
);


// ============================================================
// PASSWORD BUTTONS
// ============================================================

document
  .querySelectorAll(
    ".password-toggle"
  )
  .forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          const input =
            document.getElementById(
              button.dataset.target
            );


          if (!input) {
            return;
          }


          input.type =
            input.type === "password"
              ? "text"
              : "password";
        }
      );
    }
  );


// ============================================================
// REGISTER
// ============================================================

document
  .getElementById(
    "registerForm"
  )
  ?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();


      const fullName =
        document
          .getElementById(
            "registerFullName"
          )
          .value
          .trim();


      const username =
        document
          .getElementById(
            "registerUsername"
          )
          .value
          .trim();


      const email =
        document
          .getElementById(
            "registerEmail"
          )
          .value
          .trim();


      const password =
        document
          .getElementById(
            "registerPassword"
          )
          .value;


      const confirm =
        document
          .getElementById(
            "registerPasswordConfirm"
          )
          .value;


      if (
        password !==
        confirm
      ) {
        showNotification(
          "Passwords do not match.",
          "error"
        );

        return;
      }


      const user = {
        fullName,
        username,
        email,

        // Demo only.
        password,

        systemName:
          "Home Solar EMS",

        panelCapacity:
          13.7,

        location:
          "",

        photo:
          ""
      };


      saveUser(user);


      event.target.reset();


      showAuthPanel(
        "login"
      );


      showNotification(
        "Profile created."
      );
    }
  );


// ============================================================
// LOGIN
// ============================================================

document
  .getElementById(
    "loginForm"
  )
  ?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();


      const identifier =
        document
          .getElementById(
            "loginIdentifier"
          )
          .value
          .trim();


      const password =
        document
          .getElementById(
            "loginPassword"
          )
          .value;


      const user =
        getUser();


      if (!user) {
        showNotification(
          "No profile found.",
          "error"
        );

        return;
      }


      const validIdentifier =
        identifier ===
          user.username ||
        identifier ===
          user.email;


      if (
        !validIdentifier ||
        password !==
          user.password
      ) {
        showNotification(
          "Incorrect login information.",
          "error"
        );

        return;
      }


      const rememberMe =
        document
          .getElementById(
            "rememberMe"
          )
          ?.checked === true;


      setLoginSession(
        rememberMe
      );


      event.target.reset();

      updateAuthChromeVisibility();

      updateProfileUI();


      openPage("home");


      showNotification(
        "Signed in successfully."
      );


      loadRealWeather();
    }
  );


// ============================================================
// FORGOT PASSWORD
// ============================================================

document
  .getElementById(
    "forgotPasswordButton"
  )
  ?.addEventListener(
    "click",
    () => {
      showAuthPanel(
        "forgot"
      );
    }
  );


document
  .getElementById(
    "backToLoginButton"
  )
  ?.addEventListener(
    "click",
    () => {
      showAuthPanel(
        "login"
      );
    }
  );


document
  .getElementById(
    "forgotPasswordForm"
  )
  ?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      showNotification(
        "Demo password reset request created."
      );

      showAuthPanel(
        "login"
      );
    }
  );


// ============================================================
// LOGOUT
// ============================================================

document
  .getElementById(
    "logoutButton"
  )
  ?.addEventListener(
    "click",
    () => {
      clearLoginSession();

      updateAuthChromeVisibility();

      updateProfileUI();


      openPage("profile");


      showNotification(
        "Signed out."
      );
    }
  );


// ============================================================
// SETTINGS
// ============================================================

document
  .getElementById(
    "profileSettingsForm"
  )
  ?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();


      const user =
        getUser();


      if (!user) {
        return;
      }


      user.systemName =
        document
          .getElementById(
            "systemNameInput"
          )
          .value
          .trim();


      user.panelCapacity =
        Number(
          document
            .getElementById(
              "panelCapacityInput"
            )
            .value
        );


      user.location =
        document
          .getElementById(
            "systemLocationInput"
          )
          .value
          .trim();


      saveUser(user);


      updateProfileUI();


      showNotification(
        "Profile settings saved."
      );


      loadRealWeather();
    }
  );


// ============================================================
// PROFILE PHOTO
// ============================================================

document
  .getElementById(
    "profilePhotoInput"
  )
  ?.addEventListener(
    "change",
    (event) => {
      const file =
        event.target.files[0];


      if (!file) {
        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        () => {
          const image =
            new Image();


          image.onload =
            () => {
              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                300;

              canvas.height =
                300;


              const ctx =
                canvas.getContext(
                  "2d"
                );


              const scale =
                Math.max(
                  300 /
                    image.width,

                  300 /
                    image.height
                );


              const width =
                image.width *
                scale;


              const height =
                image.height *
                scale;


              ctx.drawImage(
                image,

                (
                  300 -
                  width
                ) / 2,

                (
                  300 -
                  height
                ) / 2,

                width,

                height
              );


              const user =
                getUser();


              if (!user) {
                return;
              }


              user.photo =
                canvas.toDataURL(
                  "image/jpeg",
                  0.8
                );


              saveUser(user);


              updateProfileUI();
            };


          image.src =
            reader.result;
        };


      reader.readAsDataURL(
        file
      );
    }
  );


// ============================================================
// PROFILE UI
// ============================================================

function getInitials(name) {
  if (!name) {
    return "SE";
  }


  const parts =
    name
      .trim()
      .split(/\s+/);


  if (
    parts.length === 1
  ) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }


  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}


function updateProfileUI() {
  updateAuthChromeVisibility();

  const user =
    getUser();


  const loggedIn =
    signedIn();


  const auth =
    document.getElementById(
      "profileAuthContainer"
    );


  const content =
    document.getElementById(
      "profileContent"
    );


  const avatar =
    document.getElementById(
      "profileButtonAvatar"
    );


  if (
    loggedIn &&
    user
  ) {
    auth?.classList.add(
      "hidden"
    );

    content?.classList.remove(
      "hidden"
    );


    setText(
      "profileButtonTitle",
      "Profile"
    );


    setText(
      "profileButtonSubtitle",
      user.username
    );


    setText(
      "profileFullName",
      user.fullName
    );


    setText(
      "profileEmail",
      user.email
    );


    setText(
      "profileUsername",
      user.username
    );


    setText(
      "profileSystemName",
      user.systemName
    );


    setText(
      "profilePanelCapacity",
      `${user.panelCapacity} W`
    );


    const systemNameInput =
      document.getElementById(
        "systemNameInput"
      );


    const panelInput =
      document.getElementById(
        "panelCapacityInput"
      );


    const locationInput =
      document.getElementById(
        "systemLocationInput"
      );


    if (systemNameInput) {
      systemNameInput.value =
        user.systemName;
    }


    if (panelInput) {
      panelInput.value =
        user.panelCapacity;
    }


    if (locationInput) {
      locationInput.value =
        user.location ||
        "";
    }


    const initials =
      getInitials(
        user.fullName
      );


    const initialsElement =
      document.getElementById(
        "profileInitials"
      );


    const image =
      document.getElementById(
        "profileImage"
      );


    if (user.photo) {
      if (image) {
        image.src =
          user.photo;

        image.classList.remove(
          "hidden"
        );
      }


      initialsElement?.classList.add(
        "hidden"
      );


      if (avatar) {
        avatar.innerHTML =
          `<img src="${user.photo}" alt="Profile">`;
      }
    }

    else {
      image?.classList.add(
        "hidden"
      );


      initialsElement?.classList.remove(
        "hidden"
      );


      setText(
        "profileInitials",
        initials
      );


      if (avatar) {
        avatar.textContent =
          initials;
      }
    }
  }

  else {
    auth?.classList.remove(
      "hidden"
    );

    content?.classList.add(
      "hidden"
    );


    setText(
      "profileButtonTitle",
      "Profile"
    );


    setText(
      "profileButtonSubtitle",
      "Sign in"
    );


    if (avatar) {
      avatar.textContent =
        "👤";
    }


    showAuthPanel(
      "login"
    );
  }
}


// ============================================================
// INITIALIZATION
// ============================================================

function initializeApp() {
  updateAuthChromeVisibility();

  updateChargeDischarge();

  updateDashboard();

  updateProfileUI();


  if (
    signedIn() &&
    getUser()
  ) {
    openPage("home");

    loadRealWeather();
  }

  else {
    clearLoginSession();

    openPage("profile");
  }
}


initializeApp();


// ============================================================
// WEATHER AUTO REFRESH
// EVERY 30 MINUTES
// ============================================================

const WEATHER_REFRESH_INTERVAL =
  30 * 60 * 1000;


setInterval(
  () => {
    if (
      signedIn() &&
      getUser()
    ) {
      loadRealWeather(
        true
      );
    }
  },

  WEATHER_REFRESH_INTERVAL
);




// ============================================================
// PWA SPLASH SCREEN
// ============================================================

function hideAppSplash() {
  const splash =
    document.getElementById(
      "appSplash"
    );

  if (!splash) {
    return;
  }

  window.setTimeout(
    () => {
      splash.classList.add(
        "is-hidden"
      );

      window.setTimeout(
        () => {
          splash.remove();
        },
        500
      );
    },
    4000
  );
}

window.addEventListener(
  "load",
  hideAppSplash
);


// ============================================================
// PWA SERVICE WORKER
// ============================================================

if ("serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((registration) => {
          console.log(
            "PWA service worker registered:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error(
            "PWA service worker registration failed:",
            error
          );
        });
    }
  );
}

// ==== GLOBAL STATE ====
let currentDriver = { name: "", truck: "", language: "" };
let watchedStatus = {};
let lastAllowedTime = 0;

// ==== MOCK ASSIGNMENTS ====
const videoAssignments = {
  "John Doe": [
    {
      title: "Swahili Safety Talk",
      url: "https://raw.githubusercontent.com/Kwibu/API-3-Test/main/Safety%20Campaign%20for%20drivers%20(Swahili).mp4"
    },
    {
      title: "General Driving Rules",
      url: "https://raw.githubusercontent.com/Kwibu/API-3-Test/main/Safety%20Campaign%20for%20drivers%20(English).mp4"
    }
  ],
  "Jane Smith": [
    {
      title: "Portuguese Safety Guide",
      url: "https://raw.githubusercontent.com/Kwibu/API-3-Test/main/Safety%20Campaign%20for%20drivers%20(Portugal).mp4"
    }
  ]
};

// ==== LANGUAGE HANDLER ====
function proceedToLogin() {
  const lang = document.getElementById("languageSelect").value;
  if (!lang) return alert("Please choose a language.");
  currentDriver.language = lang;
  switchSection("languageSelectSection", "loginSection");
}

// ==== LOGIN & DASHBOARD LOADING ====
function loadDashboard() {
  const name = document.getElementById("driverName").value.trim();
  const truck = document.getElementById("truckNumber").value.trim();
  if (!name || !truck) return alert("Please enter your name and truck number.");

  currentDriver.name = name;
  currentDriver.truck = truck;

  const assigned = videoAssignments[name];
  if (!assigned || assigned.length === 0) {
    alert("No videos assigned to this driver.");
    return;
  }

  watchedStatus = {}; // reset progress
  displayVideos(assigned);
  switchSection("loginSection", "dashboardSection");
}

// ==== DISPLAY VIDEO LIST ====
function displayVideos(videos) {
  const container = document.getElementById("videoListContainer");
  container.innerHTML = "";

  videos.forEach((video, index) => {
    watchedStatus[index] = "Not Started";

    const div = document.createElement("div");
    div.className = "video-entry";
    div.innerText = `${video.title} — ${watchedStatus[index]}`;
    div.onclick = () => playVideo(index, video);

    container.appendChild(div);
  });
}

// ==== PLAY VIDEO ====
function playVideo(index, video) {
  const playerSection = document.getElementById("videoPlayerContainer");
  const player = document.getElementById("trainingVideo");
  const title = document.getElementById("currentVideoTitle");

  title.innerText = video.title;
  player.src = video.url;
  playerSection.style.display = "block";

  watchedStatus[index] = "In Progress";
  refreshVideoList();

  lastAllowedTime = 0;

  player.addEventListener("timeupdate", () => {
    lastAllowedTime = player.currentTime;

    if (player.duration - player.currentTime <= 5) {
      watchedStatus[index] = "Completed";
      refreshVideoList();
    }
  });

  player.addEventListener("seeking", () => {
    if (player.currentTime > lastAllowedTime) {
      player.currentTime = lastAllowedTime;
    }
  });

  player.addEventListener("ended", () => {
    watchedStatus[index] = "Completed";
    refreshVideoList();
  });
}

// ==== UPDATE VIDEO LIST DISPLAY ====
function refreshVideoList() {
  const videos = videoAssignments[currentDriver.name];
  const container = document.getElementById("videoListContainer");
  container.innerHTML = "";

  videos.forEach((video, index) => {
    const div = document.createElement("div");
    div.className = "video-entry " +
      (watchedStatus[index] === "Completed" ? "completed" :
       watchedStatus[index] === "In Progress" ? "inprogress" : "");

    div.innerText = `${video.title} — ${watchedStatus[index]}`;
    div.onclick = () => playVideo(index, video);

    container.appendChild(div);
  });
}

// ==== SECTION TOGGLING ====
function switchSection(hideId, showId) {
  document.getElementById(hideId).classList.remove("active");
  document.getElementById(showId).classList.add("active");
}

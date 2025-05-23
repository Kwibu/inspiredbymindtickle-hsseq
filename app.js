let currentDriver = { name: "", truck: "", language: "" };
let watchedStatus = {};
let lastAllowedTime = 0;
let videoAssignments = {};

function proceedToLogin() {
  const lang = document.getElementById("languageSelect").value;
  if (!lang) return alert("Please choose a language.");
  currentDriver.language = lang;
  switchSection("languageSelectSection", "loginSection");
}

async function fetchDriverVideos(name) {
  const response = await fetch(`https://script.google.com/macros/s/AKfycbzSHUSBRiMZmnO0IPcDvzTsgiHRypijvWooYF6t2Ut-7oCAK-fO9pgdXsVZ4t1PUwUn/exec?name=${encodeURIComponent(name)}`);
  const data = await response.json();
  return data;
}

async function loadDashboard() {
  const name = document.getElementById("driverName").value.trim();
  const truck = document.getElementById("truckNumber").value.trim();
  if (!name || !truck) return alert("Please enter your name and truck number.");

  currentDriver.name = name;
  currentDriver.truck = truck;

  const assigned = await fetchDriverVideos(name);
  if (!assigned || assigned.length === 0) {
    alert("No videos assigned.");
    return;
  }

  watchedStatus = {};
  assigned.forEach((v, i) => {
    watchedStatus[i] = v.status || "Not Started";
  });

  videoAssignments[name] = assigned;
  displayVideos(assigned);
  switchSection("loginSection", "dashboardSection");
}

function displayVideos(videos) {
  const container = document.getElementById("videoListContainer");
  container.innerHTML = "";

  videos.forEach((video, index) => {
    const div = document.createElement("div");
    div.className = "video-entry";
    div.innerText = `${video.title} — ${watchedStatus[index]}`;
    div.onclick = () => playVideo(index, video);
    container.appendChild(div);
  });
}

function playVideo(index, video) {
  const playerSection = document.getElementById("videoPlayerContainer");
  const player = document.getElementById("trainingVideo");
  const title = document.getElementById("currentVideoTitle");

  title.innerText = video.title;
  player.src = video.url;
  playerSection.style.display = "block";

  watchedStatus[index] = "In Progress";
  refreshVideoList();

  submitStatusUpdate({
    name: currentDriver.name,
    title: video.title,
    status: "Started"
  });

  lastAllowedTime = 0;

  player.addEventListener("timeupdate", () => {
    lastAllowedTime = player.currentTime;
  });

  player.addEventListener("seeking", () => {
    if (player.currentTime > lastAllowedTime) {
      player.currentTime = lastAllowedTime;
    }
  });

  player.addEventListener("ended", async () => {
    const duration = Math.round(player.duration / 60) + " minutes";

    const success = await submitStatusUpdate({
      name: currentDriver.name,
      title: video.title,
      status: "Completed",
      duration: duration
    });

    if (success) {
      watchedStatus[index] = "Completed";
      refreshVideoList();
      alert("✅ Video marked as completed.");
    } else {
      alert("⚠️ Failed to update completion status.");
    }
  });
}

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

function switchSection(hideId, showId) {
  document.getElementById(hideId).classList.remove("active");
  document.getElementById(showId).classList.add("active");
}

async function submitStatusUpdate({ name, title, status, duration = "" }) {
  const response = await fetch("https://script.google.com/macros/s/AKfycbzSHUSBRiMZmnO0IPcDvzTsgiHRypijvWooYF6t2Ut-7oCAK-fO9pgdXsVZ4t1PUwUn/exec", {
    method: "POST",
    body: JSON.stringify({ name, title, status, duration }),
    headers: { "Content-Type": "application/json" }
  });

  const result = await response.json();
  return result.success;
}

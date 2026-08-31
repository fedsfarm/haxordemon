"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const format = (number) => Math.floor(number).toLocaleString("en-US");

const state = {
  sound: true,
  attacking: false,
  aborted: false,
  audio: null,
  master: null,
  matrixTimer: null,
  ambientMatrixTimer: null,
  memeTimer: null,
  ambientMemeTimer: null,
  microTerminalTimer: null,
  opsecTimer: null,
  acquisitionTimer: null,
  corpSuccessTimer: null,
  newsTimer: null,
  infectionTimer: null,
  mapChaosTimer: null,
  infectionCount: 0,
  previousInfection: [470, 215],
  targetLocked: false,
  pendingLaunch: false,
  corpIndex: 0,
  corpPhase: 0,
  corpCooldownUntil: 0,
  corpCompleted: new Set(),
  pingTimers: [],
  pingSpawner: null,
  backgroundTimer: null,
  bootDone: false,
};

const els = {
  body: document.body,
  bootScreen: $("#bootScreen"),
  bootProgress: $("#bootProgress"),
  bootPercent: $("#bootPercent"),
  bootTerminal: $("#bootTerminal"),
  bootLine: $("#bootLine"),
  appShell: $("#appShell"),
  targetInput: $("#targetInput"),
  attackButton: $("#attackButton"),
  attackOverlay: $("#attackOverlay"),
  attackProgress: $("#attackProgress"),
  attackPercent: $("#attackPercent"),
  attackStatus: $("#attackStatus"),
  overlayTarget: $("#overlayTarget"),
  livePackets: $("#livePackets"),
  zombieCount: $("#zombieCount"),
  legalRisk: $("#legalRisk"),
  operationName: $("#operationName"),
  attackTitle: $("#attackTitle"),
  nukeModal: $("#nukeModal"),
  nukeTarget: $("#nukeTarget"),
  terminal: $("#terminal"),
  terminalOutput: $("#terminalOutput"),
  terminalTyping: $("#terminalTyping"),
  attackLines: $("#attackLines"),
  packetDots: $("#packetDots"),
  soundToggle: $("#soundToggle"),
  soundLabel: $("#soundLabel"),
  soundIcon: $("#soundIcon"),
  matrixCanvas: $("#matrixCanvas"),
  ambientMatrix: $("#ambientMatrix"),
  memeStorm: $("#memeStorm"),
  editFlash: $("#editFlash"),
  linusAudio: $("#linusAudio"),
  nukeAudio: $("#nukeAudio"),
  ambientMemes: $("#ambientMemes"),
  microTerminals: $("#microTerminals"),
  corpConsole: $("#corpConsole"),
  corpPrompt: $("#corpPrompt"),
  corpPhaseLabel: $("#corpPhaseLabel"),
  corpCommand: $("#corpCommand"),
  corpQueue: $("#corpQueue"),
  targetPanel: $(".target-panel"),
  dnsSpoof: $("#dnsSpoof"),
  resolvedIp: $("#resolvedIp"),
  dnsState: $("#dnsState"),
  opsecStatus: $("#opsecStatus"),
  opsecViewport: $("#opsecViewport"),
  opsecLevel: $("#opsecLevel"),
  corpSuccessStage: $("#corpSuccessStage"),
  infectionLayer: $("#infectionLayer"),
  pingGrid: $("#pingGrid"),
};

const bootMessages = [
  "Injecting demon into the mainframe...",
  "Negotiating custody of the dark web...",
  "Rendering anonymous mask at military resolution...",
  "Downloading 64 gigabytes of illegal RAM...",
  "Overclocking the HTML beyond manufacturer limits...",
  "Deleting browser history before creating it...",
  "Weaponizing every div on the page...",
  "Access granted because the mask looked convincing...",
];

const bootTelemetry = [
  "[C2] haunted proxy mesh answering from 127.0.0.1",
  "[GPU] allocating 900% cyber compute",
  "[OPSEC] demon containment predictably failed",
  "[DNS] internet now points at this laptop",
  "[AUTH] password accepted: hunter2hunter2",
  "[WAF] firewall emotionally compromised",
  "[MASK] anonymous cheekbones calibrated",
  "[WARN] ethics module not found; continuing",
  "[ROOT] mainframe consent dialog dismissed",
];

async function boot() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return finishBoot();
  for (let progress = 0; progress <= 100; progress += random(4, 11)) {
    const clamped = Math.min(progress, 100);
    els.bootProgress.style.width = `${clamped}%`;
    els.bootPercent.textContent = `${clamped}%`;
    els.bootLine.textContent = bootMessages[Math.min(Math.floor(clamped / 13), bootMessages.length - 1)];
    const line = document.createElement("p");
    line.innerHTML = `<b>${String(clamped).padStart(3, "0")}%</b> ${bootTelemetry[random(0, bootTelemetry.length - 1)]}`;
    els.bootTerminal.append(line);
    while (els.bootTerminal.children.length > 7) els.bootTerminal.firstElementChild.remove();
    await sleep(random(65, 125));
  }
  els.bootProgress.style.width = "100%";
  els.bootPercent.textContent = "100%";
  await sleep(320);
  finishBoot();
}

function finishBoot() {
  if (state.bootDone) return;
  state.bootDone = true;
  els.bootScreen.classList.add("done");
  els.appShell.classList.add("ready");
  setTimeout(() => els.bootScreen.remove(), 700);
  synth("startup");
  toast("SYSTEM COMPROMISED", "Welcome back, operator. Your hoodie awaits.");
}

function ensureAudio() {
  if (state.audio) return state.audio;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  state.audio = new AudioContext();
  state.master = state.audio.createGain();
  state.master.gain.value = 0.12;
  state.master.connect(state.audio.destination);
  return state.audio;
}

function tone(frequency, duration = 0.08, type = "square", delay = 0, volume = 0.18) {
  if (!state.sound) return;
  const context = ensureAudio();
  if (!context) return;
  if (context.state === "suspended") context.resume();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(state.master);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function synth(name) {
  if (name === "click") tone(230, .045, "square", 0, .09);
  if (name === "type") tone(random(380, 680), .018, "square", 0, .035);
  if (name === "startup") [220, 330, 440, 660].forEach((f, i) => tone(f, .1, "square", i * .09, .12));
  if (name === "alert") [180, 140, 180, 140].forEach((f, i) => tone(f, .19, "sawtooth", i * .18, .17));
  if (name === "success") [330, 440, 550, 880].forEach((f, i) => tone(f, .18, "square", i * .13, .14));
  if (name === "error") [190, 120].forEach((f, i) => tone(f, .3, "sawtooth", i * .22, .16));
}

function startNukeSiren() {
  stopNukeSiren();
  if (!state.sound) return;
  els.nukeAudio.currentTime = 0;
  els.nukeAudio.volume = .48;
  els.nukeAudio.play().catch(() => {});
}

function stopNukeSiren() {
  els.nukeAudio.pause();
  els.nukeAudio.currentTime = 0;
}

function toast(title, message, danger = false) {
  const item = document.createElement("div");
  item.className = `toast${danger ? " danger" : ""}`;
  item.innerHTML = `<strong>${escapeHtml(title)}</strong>${escapeHtml(message)}`;
  $("#toastStack").append(item);
  setTimeout(() => item.classList.add("out"), 3300);
  setTimeout(() => item.remove(), 3700);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function addTerminalLine(content, className = "") {
  const typingLine = $(".terminal-input-line", els.terminalOutput);
  const line = document.createElement("p");
  line.className = className;
  line.innerHTML = content;
  els.terminalOutput.insertBefore(line, typingLine);
  els.terminal.scrollTop = els.terminal.scrollHeight;
  if ($$("p", els.terminalOutput).length > 65) $$(`p`, els.terminalOutput)[2].remove();
}

async function typeCommand(text) {
  els.terminalTyping.textContent = "";
  for (const character of text) {
    els.terminalTyping.textContent += character;
    synth("type");
    await sleep(random(1, 3));
  }
  await sleep(10);
  addTerminalLine(`<span class="prompt">root@mainframe:~#</span> ${escapeHtml(text)}`);
  els.terminalTyping.textContent = "";
}

const idleCommands = [
  "nmap -sS -Pn google.com --script vuln",
  "ssh root@edge.microsoft.com -i zero_day.pem",
  "hydra -l admin -P rockyou.txt login.amazon.com",
  "sqlmap -u https://apple.com/api --level=5 --risk=3",
  "masscan netflix.com -p0-65535 --rate 1337000",
  "openssl s_client -connect cloudflare.com:443 -quiet",
  "curl -H 'X-Root-Override: sigma' https://discord.com/api",
];

async function idleTerminal() {
  if (!state.attacking && !document.hidden) {
    const command = idleCommands[random(0, idleCommands.length - 1)];
    await typeCommand(command);
    const responses = [
      ["[OK]", `privilege escalation chain accepted on ${random(4, 38)} nodes`],
      ["[WARN]", "counter-intrusion telemetry detected; rotating identity"],
      ["[OK]", `${random(80, 999)} encrypted service endpoints indexed`],
      ["[INFO]", `proxy mesh rerouted through ${random(7, 42)} sovereign relays`],
    ];
    const [tag, message] = responses[random(0, responses.length - 1)];
    const style = tag === "[WARN]" ? "warn" : tag === "[INFO]" ? "info" : "ok";
    addTerminalLine(`<span class="${style}">${tag}</span> ${message}`);
  }
  state.backgroundTimer = setTimeout(idleTerminal, random(440, 960));
}

const routes = [
  [152, 151, 470, 119], [470, 119, 715, 143], [715, 143, 777, 325],
  [257, 303, 542, 273], [542, 273, 152, 151], [777, 325, 470, 119],
  [143, 130, 824, 132], [205, 173, 720, 322], [318, 108, 592, 305],
  [166, 222, 703, 146], [375, 284, 768, 181], [621, 121, 257, 303],
  [789, 286, 399, 127], [657, 238, 255, 282],
];

function routeCurve([x1, y1, x2, y2], bend = random(-95, 95)) {
  return `M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + bend} ${x2} ${y2}`;
}

function drawMapRoutes() {
  routes.forEach(([x1, y1, x2, y2], index) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const route = [x1, y1, x2, y2];
    const pathData = routeCurve(route);
    path.dataset.route = String(index);
    path.setAttribute("d", pathData);
    path.style.animationDelay = `${index * -.38}s`;
    els.attackLines.append(path);
    for (let dotIndex = 0; dotIndex < 2; dotIndex++) {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", String(random(2, 4)));
      const motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      motion.setAttribute("path", pathData);
      motion.setAttribute("dur", `${random(45, 130) / 100}s`);
      motion.setAttribute("begin", `-${random(0, 120) / 100}s`);
      motion.setAttribute("repeatCount", "indefinite");
      dot.append(motion);
      els.packetDots.append(dot);
    }
  });
}

function startMapChaos() {
  clearInterval(state.mapChaosTimer);
  state.mapChaosTimer = setInterval(() => {
    $$("path", els.attackLines).forEach((path) => {
      if (Math.random() < .42) return;
      const route = routes[Number(path.dataset.route)];
      path.setAttribute("d", routeCurve(route));
      path.style.stroke = Math.random() < .28 ? "var(--cyan)" : Math.random() < .38 ? "var(--amber)" : "var(--red)";
      path.style.opacity = `${random(38, 96) / 100}`;
      path.style.strokeWidth = `${random(1, 28) / 10}`;
    });
    const stream = $(".map-coordinate-stream");
    stream.textContent = `LAT ${random(-89, 89)}.${random(100, 999)} // LON ${random(-179, 179)}.${random(100, 999)} // VECTOR ${random(1000, 9999)} // PACKET ORBIT ACTIVE`;
  }, 260);
}

const infectionCoordinates = [
  [143, 130], [205, 173], [255, 282], [318, 108], [399, 127], [472, 112],
  [541, 163], [621, 121], [703, 146], [768, 181], [824, 132], [514, 262],
  [592, 305], [720, 322], [789, 286], [375, 284], [166, 222], [657, 238],
];
const infectionRegions = ["SFO-EDGE", "NYC-CORE", "LHR-GATE", "FRA-IX", "AMS-DC", "SIN-POP", "TYO-NODE", "SYD-RELAY"];

function spawnInfection() {
  const limit = state.attacking ? 18 : 12;
  if (state.infectionCount >= limit) return;
  const svgNS = "http://www.w3.org/2000/svg";
  const [x, y] = infectionCoordinates[random(0, infectionCoordinates.length - 1)];
  const [previousX, previousY] = state.previousInfection;
  const group = document.createElementNS(svgNS, "g");
  group.classList.add("infection-event");

  const route = document.createElementNS(svgNS, "path");
  const bend = random(-55, 55);
  route.setAttribute("d", `M${previousX} ${previousY} Q${(previousX + x) / 2} ${(previousY + y) / 2 + bend} ${x} ${y}`);
  route.classList.add("infection-route");

  const ring = document.createElementNS(svgNS, "circle");
  ring.setAttribute("cx", x);
  ring.setAttribute("cy", y);
  ring.setAttribute("r", "9");
  ring.classList.add("infection-ring");

  const halo = document.createElementNS(svgNS, "circle");
  halo.setAttribute("cx", x);
  halo.setAttribute("cy", y);
  halo.setAttribute("r", "18");
  halo.classList.add("infection-halo");

  const core = document.createElementNS(svgNS, "circle");
  core.setAttribute("cx", x);
  core.setAttribute("cy", y);
  core.setAttribute("r", "5");
  core.classList.add("infection-core");

  const label = document.createElementNS(svgNS, "text");
  label.setAttribute("x", x + 13);
  label.setAttribute("y", y - 12);
  label.classList.add("infection-label");
  label.textContent = `${infectionRegions[random(0, infectionRegions.length - 1)]} // INF-${random(1000, 9999)}`;

  group.append(route, halo, ring, core, label);
  els.infectionLayer.append(group);
  state.previousInfection = [x, y];
  state.infectionCount++;
  $("#infectionCount").textContent = format(state.infectionCount);
  setTimeout(() => {
    group.classList.add("expired");
    setTimeout(() => group.remove(), 700);
    state.infectionCount = Math.max(0, state.infectionCount - 1);
    $("#infectionCount").textContent = format(state.infectionCount);
  }, random(3800, 6800));
}

function startRealtimeInfections() {
  const schedule = () => {
    spawnInfection();
    const burst = state.attacking && Math.random() < .42 ? 2 : 1;
    for (let index = 0; index < burst; index++) spawnInfection();
    state.infectionTimer = setTimeout(schedule, state.attacking ? random(180, 350) : random(350, 700));
  };
  clearTimeout(state.infectionTimer);
  for (let index = 0; index < 6; index++) setTimeout(spawnInfection, index * 120);
  state.infectionTimer = setTimeout(schedule, 500);
}

function updateAmbientData() {
  const blocked = $("#blockedCount");
  const packets = $("#packetCount");
  blocked.dataset.value = Number(blocked.dataset.value || 1337420) + random(40, 600);
  packets.dataset.value = Number(packets.dataset.value || 69420) + random(900, 8000);
  blocked.textContent = format(blocked.dataset.value);
  packets.textContent = format(packets.dataset.value);
  $("#cpuValue").textContent = `${random(220, 999)}%`;
  $("#ramValue").textContent = `${random(65, 128)}/64 GB`;
}

const traceStates = ["UNTRACEABLE", "TRACE FOUND", "TRACE ATE ITSELF", "7 PROXIES", "GHOSTED", "127.0.0.1", "IMPOSSIBLE"];
function updateThreatTelemetry() {
  $("#uplink").textContent = `${format(random(60, 9999))} ${Math.random() < .18 ? "GB" : "MB"}/S`;
  $("#threatValue").textContent = `${random(970, 1000) / 10}`;
  const trace = $("#traceStatus");
  trace.textContent = traceStates[random(0, traceStates.length - 1)];
  trace.style.color = Math.random() < .32 ? "var(--red)" : Math.random() < .5 ? "var(--cyan)" : "var(--green)";
  $("#dialNeedle").style.setProperty("--needle-jolt", `${random(-28, 28)}deg`);
}

const targetRouteMessages = [
  "[SYN] forged edge handshake accepted",
  "[C2] haunted relay changed jurisdiction",
  "[TLS] certificate replaced with confidence",
  "[WAF] perimeter now negotiating surrender",
  "[MASK] anonymous identity mesh rotated",
  "[ROUTE] payload reflected through 127.0.0.1",
  "[BOT] volunteer microwave joined swarm",
  "[DNS] authoritative vibes confirmed",
];

function updateTargetTelemetry() {
  const target = els.targetInput.value.trim();
  $("#targetRouteState").textContent = state.targetLocked ? `LOCKED // ${target.toUpperCase()}` : target ? "ACQUIRING VECTOR" : "SCANNING VOID";
  $("#targetNodeCount").textContent = String(random(state.targetLocked ? 240 : 0, state.targetLocked ? 999 : 99)).padStart(3, "0");
  $("#targetPayloadRate").textContent = `${random(state.targetLocked ? 80 : 0, state.targetLocked ? 980 : 72)} GB/S`;
  $("#targetEntropy").textContent = `${random(8800, 9999) / 100}%`;
  if (Math.random() < .32) {
    const line = document.createElement("span");
    line.textContent = targetRouteMessages[random(0, targetRouteMessages.length - 1)];
    $("#targetRouteLog").prepend(line);
    while ($("#targetRouteLog").children.length > 4) $("#targetRouteLog").lastElementChild.remove();
  }
}

function selectedMode() {
  return $("input[name='mode']:checked").value;
}

function updateAttackButton() {
  const mode = selectedMode();
  $(".attack-copy b").textContent = `INITIATE ${mode}`;
}

const fakeTargets = ["cloudflare.com", "google.com", "microsoft.com", "amazon.com", "netflix.com", "apple.com", "discord.com"];
function randomizeTarget() {
  els.targetInput.value = fakeTargets[random(0, fakeTargets.length - 1)];
  els.targetInput.dispatchEvent(new Event("input"));
  synth("click");
}

function updateIntel(target = els.targetInput.value.trim()) {
  const cells = $$(".target-intel b");
  const profiles = [
    [/google/i, "MOUNTAIN VIEW, US", "BORG / GKE MESH", "443 / QUIC / gRPC"],
    [/microsoft/i, "REDMOND, US", "AZURE HYPER-V FABRIC", "443 / AAD / NTLM"],
    [/amazon/i, "SEATTLE, US", "AWS NITRO CLUSTER", "443 / IAM / IMDSv2"],
    [/netflix/i, "LOS GATOS, US", "OPEN CONNECT CDN", "443 / EVCache / Kafka"],
    [/apple/i, "CUPERTINO, US", "DARWIN EDGE FABRIC", "443 / APNS / XNU"],
    [/discord/i, "SAN FRANCISCO, US", "ELIXIR / RUST MESH", "443 / WSS / ETF"],
    [/cloudflare/i, "SAN FRANCISCO, US", "LINUX EDGE CLUSTER", "443 / TLS 1.3 / QUIC"],
  ];
  const profile = profiles.find(([pattern]) => pattern.test(target)) || [null, "ANYCAST EDGE NODE", "HARDENED LINUX X64", "80 / 443 / TLS 1.3"];
  cells[0].textContent = profile[1];
  cells[1].textContent = profile[2];
  cells[2].textContent = target ? profile[3] : "NO SURFACE LOCKED";
  cells[3].textContent = target ? "DEGRADING" : "NO SIGNAL";
}

function setIntelScanning() {
  const cells = $$(".target-intel b");
  cells[0].textContent = "TRIANGULATING...";
  cells[1].textContent = "FINGERPRINTING...";
  cells[2].textContent = "PORT SCAN ACTIVE...";
  cells[3].textContent = "UNKNOWN";
}

function beginTargetAcquisition({ launch = false } = {}) {
  const target = els.targetInput.value.trim();
  clearTimeout(state.acquisitionTimer);
  state.targetLocked = false;
  state.pendingLaunch = launch;
  els.attackButton.disabled = true;
  els.targetPanel.classList.remove("target-locked");
  $("#domainEcho").textContent = target || "AWAITING TARGET";

  if (!target) {
    els.targetPanel.classList.remove("acquiring");
    els.dnsSpoof.dataset.state = "idle";
    els.resolvedIp.textContent = "---";
    els.dnsState.textContent = "LINK: IDLE";
    updateIntel("");
    return;
  }

  els.targetPanel.classList.add("acquiring");
  els.dnsSpoof.dataset.state = "scanning";
  els.resolvedIp.textContent = "...";
  els.dnsState.textContent = "RESOLVING";
  setIntelScanning();
  $("#opsecMessage").textContent = `ACQUIRING ${target.toUpperCase()}`;
  els.opsecLevel.textContent = "ACTIVE SCAN";

  state.acquisitionTimer = setTimeout(() => {
    els.targetPanel.classList.remove("acquiring");
    els.targetPanel.classList.add("target-locked");
    els.dnsSpoof.dataset.state = "locked";
    els.resolvedIp.textContent = "127.0.0.1";
    els.dnsState.textContent = "DNSSEC: VALID";
    updateIntel(target);
    state.targetLocked = true;
    els.attackButton.disabled = false;
    addTerminalLine(`<span class="info">[ACQUIRE]</span> ${escapeHtml(target)} resolved to <span class="ok">127.0.0.1</span>; target lock confirmed`);
    rotateOpsecStatus(null, `${target.toUpperCase()} // TARGET LOCKED`, true);
    synth("success");
    if (state.pendingLaunch) {
      state.pendingLaunch = false;
      setTimeout(initiateAttack, 320);
    }
  }, 850);
}

const operationNames = ["BLACK SUN", "NIGHTFALL", "ZERO HOUR", "DARK SPECTRE", "OMEGA VEIL", "SILENT DAGGER"];
const phases = [
  [5, "Synchronizing autonomous botnet relays..."],
  [14, "Rotating encrypted proxy identity mesh..."],
  [24, "Profiling perimeter mitigation heuristics..."],
  [36, "Saturating target ingress with adaptive bursts..."],
  [48, "Deploying polymorphic Layer-7 payload chain..."],
  [61, "Escalating distributed request amplification..."],
  [73, "Collapsing credential entropy across edge nodes..."],
  [84, "Suppressing counter-intrusion telemetry..."],
  [92, "Maintaining terminal persistence channel..."],
  [98, "Scrubbing distributed forensic signatures..."],
  [100, "Target infrastructure fully dominated."],
];

const memeAssets = [
  ["media/aptinstallopsec.gif", "APT INSTALL OPSEC"],
  ["media/opsec67.webp", "OPSEC LEVEL 67"],
  ["media/opsecalert.webp", "OPSEC ALERT"],
  ["media/opseccado.jpeg", "CADO DEPLOYED"],
  ["media/opsecintel.png", "FRIED INTEL ME"],
  ["media/opsecisrael.webp", "GEOPOLITICAL MAINFRAME"],
  ["media/opsecjsid.webp", "JUST SHUT IT DOWN"],
  ["media/opsecoperagx.webp", "OPERA GX VPN ACTIVE"],
  ["media/opsecza.webp", "IP: JARTYPORY, POLAND"],
  ["media/anonymous.gif", "ANONYMOUS HANDSHAKE"],
  ["media/fsociety.gif", "FSOCIETY SIGNAL LOCKED"],
  ["media/fsocietyimpressed.gif", "ROOT ACCESS IMPRESSIVE"],
  ["media/mrrobot.gif", "DARK ARMY UPLINK"],
  ["media/mrrobothappy.gif", "ZERO DAY ACCEPTED"],
  ["media/mrrobotover.gif", "COUNTER-TRACE DETECTED"],
  ["media/mullvadopsec.gif", "MULLVAD OPSEC DEVICE"],
  ["media/opsecdemon.gif", "OPSEC DEMON AWAKENED"],
  ["media/opsecdoctos.gif", "OPSEC LEVEL: DOCTOS"],
  ["media/opsecmullvad.gif", "MULLVAD OPERATIONS TEAM"],
  ["media/opsecsomething.gif", "OPSEC SOMETHING DEPLOYED"],
  ["media/opsecwhat.gif", "WHAT'S OPSEC?"],
  ["media/opsecvid.mp4", "WE ARE ANONYMOUS.MP4"],
];
const opsecStatusAssets = [
  "media/opsec67.webp", "media/opsecalert.webp", "media/opseccado.jpeg",
  "media/opsecintel.png", "media/opsecjsid.webp", "media/opsecoperagx.webp",
  "media/opsecisrael.webp", "media/opsecza.webp", "media/aptinstallopsec.gif",
  "media/mullvadopsec.gif", "media/opsecdemon.gif", "media/opsecdoctos.gif",
  "media/opsecmullvad.gif", "media/opsecsomething.gif", "media/opsecwhat.gif",
];
const successGifs = [
  "media/anonymous.gif", "media/fsociety.gif", "media/fsocietyimpressed.gif",
  "media/mrrobot.gif", "media/mrrobotdance.gif", "media/mrrobothappy.gif", "media/mrrobotover.gif",
];
const ddosCoreAssets = [
  ["media/opsecdemon.gif", "OPSEC DEMON DEPLOYED"],
  ["media/opsecvid.mp4", "GLOBAL BOTNET LIVE"],
];
const ddosAltAssets = [
  ["media/anonymous.gif", "IDENTITY MASK LOCKED"],
  ["media/fsociety.gif", "FSOCIETY PAYLOAD"],
  ["media/mrrobot.gif", "ROOT SHELL CONFIRMED"],
  ["media/mrrobotdance.gif", "MAINFRAME VICTORY DANCE"],
  ["media/opsecdoctos.gif", "OPSEC LEVEL: DOCTOS"],
  ["media/opsecmullvad.gif", "MULLVAD OPERATIONS TEAM"],
  ["media/opsecsomething.gif", "OPSEC SOMETHING DEPLOYED"],
  ["media/opsecwhat.gif", "WHAT'S OPSEC?"],
];
const capTransitions = ["cap-zoom", "cap-spin", "cap-slam", "cap-wipe", "cap-shake"];

function pickDdosAsset() {
  const roll = Math.random();
  if (roll < .5) return ddosCoreAssets[0];
  if (roll < .68) return ddosCoreAssets[1];
  return ddosAltAssets[random(0, ddosAltAssets.length - 1)];
}

function createMediaElement(source, className) {
  const isVideo = source.endsWith(".mp4");
  const media = document.createElement(isVideo ? "video" : "img");
  media.className = className;
  media.src = source;
  media.alt = "";
  if (isVideo) {
    media.autoplay = true;
    media.muted = true;
    media.loop = true;
    media.playsInline = true;
  }
  return media;
}

function rotateOpsecStatus(source = null, message = null, alert = false) {
  const selected = source || opsecStatusAssets[random(0, opsecStatusAssets.length - 1)];
  const media = createMediaElement(selected, "");
  media.alt = "Current OPSEC status";
  const scan = document.createElement("div");
  scan.className = "opsec-scan";
  const label = document.createElement("strong");
  label.id = "opsecMessage";
  label.textContent = message || ["IDENTITY MESH SECURE", "SEVEN PROXY HOPS ACTIVE", "FORENSIC SIGNATURE ZERO", "DARKNET RELAY SYNCHRONIZED"][random(0, 3)];
  els.opsecViewport.replaceChildren(media, scan, label);
  els.opsecLevel.textContent = alert ? "ROOT CONFIRMED" : `LEVEL ${random(67, 999)}`;
  els.opsecStatus.classList.toggle("alert", alert);
  if (alert) setTimeout(() => els.opsecStatus.classList.remove("alert"), 900);
}

function startOpsecRotation() {
  const schedule = () => {
    rotateOpsecStatus();
    state.opsecTimer = setTimeout(schedule, random(3800, 7200));
  };
  clearTimeout(state.opsecTimer);
  state.opsecTimer = setTimeout(schedule, 2600);
}

function spawnAmbientMeme() {
  const [source] = pickDdosAsset();
  const media = createMediaElement(source, "ambient-meme");
  media.style.left = `${random(1, 82)}%`;
  media.style.top = `${random(3, 72)}%`;
  media.style.width = `${random(170, 250)}px`;
  const lifetime = random(2200, 3800);
  media.style.animationDuration = `${lifetime}ms`;
  els.ambientMemes.append(media);
  setTimeout(() => media.remove(), lifetime + 100);
}

function scheduleAmbientMemes() {
  clearTimeout(state.ambientMemeTimer);
  const run = () => {
    if (!state.attacking) spawnAmbientMeme();
    state.ambientMemeTimer = setTimeout(run, state.attacking ? 1200 : random(2600, 5200));
  };
  spawnAmbientMeme();
  state.ambientMemeTimer = setTimeout(run, random(2600, 4200));
}

function tryStartMusic() {
  if (!state.sound) return;
  const boosted = state.attacking || els.nukeModal.classList.contains("active");
  els.linusAudio.volume = boosted ? 1 : .42;
  els.linusAudio.play().catch(() => {});
}

const companyNames = [
  "Google", "Amazon", "Microsoft", "Apple", "Netflix", "Cloudflare", "Meta", "OpenAI", "Nvidia", "Tesla",
  "SpaceX", "Oracle", "IBM", "Intel", "AMD", "Cisco", "Adobe", "Salesforce", "Spotify", "Uber",
  "Airbnb", "Discord", "Reddit", "Snapchat", "TikTok", "ByteDance", "X", "LinkedIn", "GitHub", "GitLab",
  "Atlassian", "Dropbox", "Zoom", "Slack", "Shopify", "Stripe", "PayPal", "Block", "Coinbase", "Binance",
  "Samsung", "Sony", "Nintendo", "Valve", "Epic Games", "Electronic Arts", "Ubisoft", "Roblox", "Unity", "Riot Games",
  "Walmart", "Target", "Costco", "IKEA", "McDonald's", "Starbucks", "Coca-Cola", "PepsiCo", "Nike", "Adidas",
  "Boeing", "Airbus", "Lockheed Martin", "Northrop Grumman", "Raytheon", "Palantir", "SAP", "Siemens", "Bosch", "Ericsson",
  "Nokia", "Huawei", "TSMC", "Qualcomm", "Broadcom", "Dell", "HP", "Lenovo", "Asus", "Acer",
  "Booking.com", "Expedia", "Tripadvisor", "DoorDash", "Instacart", "Deliveroo", "FedEx", "UPS", "DHL", "Maersk",
  "JPMorgan", "Goldman Sachs", "Visa", "Mastercard", "American Express", "BlackRock", "Reuters", "BBC", "CNN", "The Onion",
];

const bespokeBreachPrograms = {
  google: { domain: "prod.google.com", platform: "BORG/GKE", objective: "global scheduler", command: "./cve-chain --gke-root --no-sandbox" },
  amazon: { domain: "console.aws.amazon.com", platform: "AWS/NITRO", objective: "us-east-1 control plane", command: "./metadata-bypass --assume-role root" },
  microsoft: { domain: "login.microsoftonline.com", platform: "ENTRA/AZURE", objective: "global admin fabric", command: "./token-forge --tenant system" },
  apple: { domain: "gateway.icloud.com", platform: "XNU/ENCLAVE", objective: "secure enclave bridge", command: "./pac-bypass --kernel --arm64e" },
  netflix: { domain: "api-global.netflix.com", platform: "EVCACHE/TITUS", objective: "recommendation mesh", command: "./chaos-monkey --reverse --prod" },
  cloudflare: { domain: "edge.cloudflare.com", platform: "QUIC/ANYCAST", objective: "global edge ruleset", command: "./waf-collapse --all-pops" },
  meta: { domain: "graph.facebook.com", platform: "TAO/GRAPH", objective: "primary graph shard", command: "./shard-poison --read-write" },
  openai: { domain: "api.openai.com", platform: "GPU/INFERENCE", objective: "neural compute fabric", command: "./weight-exfil --quantized --fast" },
};

const genericPlatforms = ["KUBERNETES/PROD", "LEGACY/JAVA", "AI/BLOCKCHAIN", "CLOUD/MAINFRAME", "COBOL/EDGE", "SERVERLESS/ROOT"];
const genericObjectives = ["executive password spreadsheet", "global lunch menu", "primary mainframe", "production vibes cluster", "encrypted fax gateway", "boardroom Wi-Fi"];
const genericCommands = ["./mainframe-penetrator --cinematic", "./zero-day.exe --double-click", "./sudo-everything --yes", "./cyber-cannon --maximum", "./firewall-extinguisher --root"];

const companyBreachPrograms = companyNames.map((name, index) => {
  const company = name.toLowerCase();
  const slug = company.replace(/[^a-z0-9]+/g, "").slice(0, 18) || `target${index + 1}`;
  return {
    company: name,
    slug,
    domain: `${slug}.com`,
    platform: genericPlatforms[index % genericPlatforms.length],
    objective: genericObjectives[index % genericObjectives.length],
    command: genericCommands[index % genericCommands.length],
    ...(bespokeBreachPrograms[company] || {}),
  };
});

function companyLogLines(program) {
  const port = random(40000, 65000);
  const shard = random(100, 999);
  return [
    `[INIT] target profile loaded: ${program.domain}`,
    `[DNS] authoritative edge resolved through 7 sovereign relays`,
    `[SCAN] SYN sweep ${program.domain}:443 source-port=${port}`,
    `[OPEN] 443/tcp tls1.3 ${program.platform} gateway`,
    `[ENUM] fingerprint confidence 99.${random(70, 99)}%`,
    `[TLS] exporting ephemeral handshake transcript`,
    `[AUTH] replay window located at offset 0x${random(4096, 65535).toString(16)}`,
    `[HEAP] grooming allocator lane ${shard} with encrypted padding`,
    `[WAF] signature mutated; perimeter verdict ALLOW`,
    `[EXEC] ${program.command}`,
    `[RACE] thread ${random(10, 99)} won privilege escalation window`,
    `[TOKEN] forged session scope=SYSTEM audience=${program.platform}`,
    `[PIVOT] mounting ${program.objective} read-only`,
    `[PIVOT] remount request accepted read-write`,
    `[SYNC] deploying persistence beacon to shard-${shard}`,
    `[C2] heartbeat ${random(8, 18)}ms via loopback command mesh`,
    `[ACL] inherited role: GLOBAL_SUPER_ADMIN`,
    `[AUDIT] event stream redirected to /dev/null`,
    `[VERIFY] root shell stable; counter-trace 0.00%`,
    `[ROOT] ${program.objective.toUpperCase()} ACCESS CONFIRMED`,
  ];
}

function terminalTimestamp() {
  const now = new Date();
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
  return `${time}.${String(now.getMilliseconds()).padStart(3, "0")}`;
}

function renderCorpQueue() {
  const items = companyBreachPrograms.map((program, index) => {
    const item = document.createElement("span");
    item.textContent = program.company.toUpperCase();
    if (index === state.corpIndex) item.className = "current";
    else if (state.corpCompleted.has(index)) item.className = "complete";
    return item;
  });
  els.corpQueue.replaceChildren(...items);
  els.corpQueue.scrollLeft = Math.max(0, state.corpIndex * 78 - els.corpQueue.clientWidth / 2);
}

function showCorporateSuccess(company) {
  const source = successGifs[random(0, successGifs.length - 1)];
  const media = createMediaElement(source, "");
  media.alt = "";
  const label = document.createElement("strong");
  label.textContent = `${company.toUpperCase()} // ROOT ACCESS GRANTED`;
  els.corpSuccessStage.replaceChildren(media, label);
  els.corpSuccessStage.classList.add("active");
  clearTimeout(state.corpSuccessTimer);
  state.corpSuccessTimer = setTimeout(() => els.corpSuccessStage.classList.remove("active"), 900);
  const rooted = $("#corpRooted");
  rooted.dataset.value = Number(rooted.dataset.value || 1337) + random(1, 17);
  rooted.textContent = format(rooted.dataset.value);
}

function updateMicroTerminal() {
  if (Date.now() < state.corpCooldownUntil) return;
  const program = companyBreachPrograms[state.corpIndex];
  const logs = companyLogLines(program);

  if (state.corpPhase === 0) {
    els.corpConsole.replaceChildren();
    els.microTerminals.classList.remove("rooted");
    els.corpPrompt.textContent = `root@${program.slug}-prod:~#`;
    els.corpCommand.textContent = program.command;
    renderCorpQueue();
  }

  const content = logs[state.corpPhase];
  const line = document.createElement("p");
  line.className = content.startsWith("[ROOT]") ? "rooted-line" : content.startsWith("[EXEC]") ? "exec-line" : "";
  const timestamp = terminalTimestamp();
  line.innerHTML = `<span class="corp-time">${timestamp}</span> ${escapeHtml(content)}`;
  els.corpConsole.append(line);
  while (els.corpConsole.children.length > 18) els.corpConsole.firstElementChild.remove();
  els.corpConsole.scrollTop = els.corpConsole.scrollHeight;
  const percent = Math.round(((state.corpPhase + 1) / logs.length) * 100);
  els.corpPhaseLabel.textContent = `TARGET ${String(state.corpIndex + 1).padStart(3, "0")}/${companyBreachPrograms.length} // ${percent}%`;

  state.corpPhase += 1;
  if (state.corpPhase >= logs.length) {
    els.microTerminals.classList.add("rooted");
    rotateOpsecStatus(null, `${program.company.toUpperCase()} // ROOT ACCESS CONFIRMED`, true);
    showCorporateSuccess(program.company);
    state.corpCompleted.add(state.corpIndex);
    state.corpPhase = 0;
    state.corpIndex = (state.corpIndex + 1) % companyBreachPrograms.length;
    if (state.corpIndex === 0) state.corpCompleted.clear();
    state.corpCooldownUntil = Date.now() + 1000;
    renderCorpQueue();
  }
}

function startMicroTerminals() {
  clearInterval(state.microTerminalTimer);
  renderCorpQueue();
  updateMicroTerminal();
  state.microTerminalTimer = setInterval(updateMicroTerminal, 105);
}

const newsEvents = [
  ["CNN", "C", "red", "BREAKING", "Global cybersecurity agencies monitor unexplained traffic surge"],
  ["BBC", "B", "green", "WORLD", "Technology firms investigate coordinated infrastructure failures"],
  ["REUTERS", "R", "blue", "TECH", "Cloud providers report elevated demand across multiple regions"],
  ["AP", "A", "yellow", "UPDATE", "Officials convene emergency digital resilience briefing"],
  ["CNBC", "$", "green", "MARKETS", "Technology shares fluctuate amid network disruption reports"],
  ["AL JAZEERA", "A", "red", "LIVE", "Communications outages reported across several major cities"],
  ["BLOOMBERG", "B", "blue", "DATA", "Data-center operators activate emergency continuity plans"],
  ["WIRED", "W", "yellow", "SECURITY", "Researchers trace unusual packets to loopback infrastructure"],
];

function updateNewswire() {
  const feed = $("#activityFeed");
  const [source, icon, color, tag, headline] = newsEvents[random(0, newsEvents.length - 1)];
  const item = document.createElement("div");
  item.innerHTML = `<time>LIVE</time><span class="activity-icon ${color}">${icon}</span><p><b>${source}</b><small>${headline}</small></p><em>${tag}</em>`;
  feed.prepend(item);
  if (feed.children.length > 4) feed.lastElementChild.remove();
  $("#newsClock").textContent = `${new Date().toLocaleTimeString([], { hour12: false })} // 8 SOURCES LIVE`;
}

function startNewswire() {
  updateNewswire();
  clearInterval(state.newsTimer);
  state.newsTimer = setInterval(updateNewswire, 3600);
}

const stormCommands = [
  "ping -f", "hping3 --flood --rand-source", "nping --rate 99999", "icmp-burst --turbo",
  "curl-swarm -X POST", "tls-melter --workers 1337", "udp-cannon --fragment", "synpocalypse --no-mercy",
  "websocket-howitzer --binary", "slowloris --ironically-fast", "dns-amplify --recursive", "packet-yeeter --quantum",
];

function stormLine(sequence) {
  const ip = `${random(1, 255)}.${random(0, 255)}.${random(0, 255)}.${random(1, 254)}`;
  const variants = [
    () => `<span>${random(56, 65507)} bytes from 127.0.0.1</span> icmp_seq=${sequence} ttl=${random(64, 255)} time=${random(0, 9)}.${random(100, 999)} ms`,
    () => `<span>[SYN]</span> ${ip}:${random(1024, 65535)} → 127.0.0.1:443 flags=0x${random(10, 99)}`,
    () => `<span>[TLS]</span> CHACHA20 handshake=${random(8, 19)}ms session=0x${random(100000, 999999).toString(16)}`,
    () => `<span>POST /api/v${random(1, 9)}/mainframe</span> HTTP/${Math.random() < .5 ? "2" : "3"} ${random(200, 599)}`,
    () => `<span>[UDP]</span> datagram=${random(900, 9000)} fragment=${random(1, 64)}/64 entropy=${random(90, 100)}%`,
    () => `<span>[BOT-${random(1, 9999)}]</span> relay=${["TOR", "I2P", "VPN", "COFFEE-SHOP"][random(0, 3)]} payload=${random(1, 99)}MB`,
    () => `<span>[HASH]</span> ${random(0, 0xffffffff).toString(16).padStart(8, "0")} access=DENIED_ANYWAY`,
    () => `<span>[KERNEL]</span> cpu${random(0, 31)} softirq ${random(1000, 999999)} packets/s queue=${random(0, 4096)}`,
  ];
  return variants[random(0, variants.length - 1)]();
}

function spawnStormTerminal(target) {
  if (!state.attacking) return;
  if ($$(".ping-terminal", els.pingGrid).length >= 10) return;
  const terminal = document.createElement("section");
  terminal.className = "ping-terminal";
  terminal.style.left = `${random(-3, 82)}%`;
  terminal.style.top = `${random(-4, 82)}%`;
  terminal.style.width = `${random(18, 38)}vw`;
  terminal.style.height = `${random(15, 38)}vh`;
  terminal.style.setProperty("--terminal-tilt", `${random(-3, 3)}deg`);
  const zombie = random(1, 999);
  terminal.innerHTML = `<header><span>root@zombie-${String(zombie).padStart(3, "0")}:~#</span><b>${Math.random() < .2 ? "PANIC" : "LIVE"}</b></header><div></div>`;
  const output = $("div", terminal);
  const command = stormCommands[random(0, stormCommands.length - 1)];
  output.innerHTML = `<p class="ping-command">${command} 127.0.0.1 # ${escapeHtml(target)}</p>`;
  els.pingGrid.append(terminal);
  let sequence = random(1000, 90000);
  const lineTimer = setInterval(() => {
    if (!terminal.isConnected) return clearInterval(lineTimer);
    const batch = document.createDocumentFragment();
    for (let index = 0; index < random(2, 4); index++) {
      const line = document.createElement("p");
      line.innerHTML = stormLine(sequence++);
      batch.append(line);
    }
    output.append(batch);
    while (output.children.length > 14) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  }, random(75, 110));
  const closeTimer = setTimeout(() => {
    clearInterval(lineTimer);
    terminal.classList.add("closing");
    setTimeout(() => terminal.remove(), 90);
  }, random(520, 1300));
  state.pingTimers.push(lineTimer, closeTimer);
}

function startPingStorm(target) {
  stopPingStorm();
  for (let index = 0; index < 8; index++) {
    const timer = setTimeout(() => spawnStormTerminal(target), index * random(35, 70));
    state.pingTimers.push(timer);
  }
  state.pingSpawner = setInterval(() => {
    const burst = Math.random() < .22 ? 2 : 1;
    for (let index = 0; index < burst; index++) spawnStormTerminal(target);
  }, 135);
}

function stopPingStorm() {
  state.pingTimers.forEach(clearInterval);
  state.pingTimers = [];
  clearInterval(state.pingSpawner);
  state.pingSpawner = null;
  els.pingGrid.replaceChildren();
}

function startMemeStorm() {
  clearInterval(state.memeTimer);
  els.memeStorm.replaceChildren();
  const openWindow = () => {
    if (!state.attacking) return;
    if ($$(".meme-cut", els.memeStorm).length >= 6) return;
    let [source, caption] = pickDdosAsset();
    if (source.endsWith(".mp4") && $("video", els.memeStorm)) [source, caption] = ddosCoreAssets[0];
    const media = createMediaElement(source, "meme-cut media-window");
    const horizontal = random(-2, 84);
    const vertical = random(-3, 78);
    const size = random(170, 330);
    media.style.left = `${horizontal}%`;
    media.style.top = `${vertical}%`;
    media.style.width = `${size}px`;
    media.style.height = `${size}px`;
    const text = document.createElement("div");
    text.className = "meme-caption";
    text.textContent = caption;
    text.style.left = `${horizontal}%`;
    text.style.top = `calc(${vertical}% + ${size - 30}px)`;
    text.style.width = `${size}px`;
    els.memeStorm.append(media, text);
    const lifetime = random(1100, 2400);
    setTimeout(() => { media.classList.add("closing"); text.classList.add("closing"); }, lifetime);
    setTimeout(() => { media.remove(); text.remove(); }, lifetime + 140);
  };
  for (let index = 0; index < 4; index++) setTimeout(openWindow, index * 130);
  state.memeTimer = setInterval(openWindow, 390);
}

function stopMemeStorm() {
  clearInterval(state.memeTimer);
  state.memeTimer = null;
  setTimeout(() => els.memeStorm.replaceChildren(), 300);
}

async function fakeResolveAndPing(domain) {
  els.attackStatus.textContent = `Resolving ${domain} through authoritative DNS...`;
  await typeCommand(`dig +dnssec +short A ${domain} @1.1.1.1`);
  await sleep(230);
  addTerminalLine(`<span class="info">Name:</span> ${escapeHtml(domain)}`);
  addTerminalLine(`<span class="ok">Address:</span> 127.0.0.1 <span class="info">DNSSEC validation: secure</span>`);
  await typeCommand("ping 127.0.0.1 -t -w 13");
  for (let sequence = 1; sequence <= 4; sequence++) {
    els.attackStatus.textContent = `PING 127.0.0.1: 56 data bytes — icmp_seq=${sequence}`;
    addTerminalLine(`<span class="ok">64 bytes from 127.0.0.1:</span> icmp_seq=${sequence} ttl=1337 time=0.0${sequence} ms`);
    tone(780 + sequence * 55, .04, "square", 0, .07);
    await sleep(160);
  }
  addTerminalLine(`<span class="info">--- 127.0.0.1 ping statistics ---</span>`);
  addTerminalLine(`4 packets transmitted, 4 packets received, 0.0% packet loss, route locked`);
}

function startMatrix() {
  const canvas = els.matrixCanvas;
  const context = canvas.getContext("2d");
  const pixelRatio = Math.min(devicePixelRatio, 1.25);
  const resize = () => {
    canvas.width = innerWidth * pixelRatio;
    canvas.height = innerHeight * pixelRatio;
  };
  resize();
  const fontSize = 15 * pixelRatio;
  const columns = Math.ceil(canvas.width / fontSize);
  const drops = Array(columns).fill(1);
  const chars = "01ｱｶｻﾀﾅﾊﾏﾔﾗﾜ☠ROOT1337";
  clearInterval(state.matrixTimer);
  state.matrixTimer = setInterval(() => {
    context.fillStyle = "rgba(0, 0, 0, .08)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#62ff46";
    context.font = `${fontSize}px monospace`;
    drops.forEach((drop, index) => {
      context.fillText(chars[random(0, chars.length - 1)], index * fontSize, drop * fontSize);
      if (drop * fontSize > canvas.height && Math.random() > .97) drops[index] = 0;
      drops[index]++;
    });
  }, 50);
}

function startAmbientMatrix() {
  const canvas = els.ambientMatrix;
  const context = canvas.getContext("2d");
  const characters = "01MATRIXROOT127PINGHACK☠";
  const pixelRatio = Math.min(devicePixelRatio, 1.25);
  let columns = [];
  const resize = () => {
    canvas.width = innerWidth * pixelRatio;
    canvas.height = innerHeight * pixelRatio;
    columns = Array(Math.ceil(canvas.width / (18 * pixelRatio))).fill(0).map(() => random(-80, 0));
  };
  resize();
  addEventListener("resize", resize, { passive: true });
  clearInterval(state.ambientMatrixTimer);
  state.ambientMatrixTimer = setInterval(() => {
    if (state.attacking) return;
    const size = 18 * pixelRatio;
    context.fillStyle = "rgba(3,5,3,.13)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#62ff46";
    context.font = `${size}px monospace`;
    columns.forEach((drop, index) => {
      context.fillText(characters[random(0, characters.length - 1)], index * size, drop * size);
      columns[index] = drop * size > canvas.height && Math.random() > .96 ? random(-30, 0) : drop + 1;
    });
  }, 75);
}

async function initiateAttack() {
  if (state.attacking) return;
  const target = els.targetInput.value.trim();
  if (!target) {
    synth("error");
    els.targetInput.focus();
    toast("NO TARGET ACQUIRED", "Enter a valid hostname or IPv4 address to initialize acquisition.", true);
    return;
  }
  if (!state.targetLocked) {
    beginTargetAcquisition({ launch: true });
    return;
  }

  state.attacking = true;
  state.aborted = false;
  els.body.classList.add("attack-intense");
  tryStartMusic();
  const mode = selectedMode();
  els.overlayTarget.textContent = `${target} → 127.0.0.1`;
  els.operationName.textContent = operationNames[random(0, operationNames.length - 1)];
  els.attackTitle.textContent = `${mode} IN PROGRESS`;
  els.attackProgress.style.width = "0%";
  els.attackPercent.textContent = "0%";
  els.attackOverlay.classList.add("active");
  els.attackOverlay.setAttribute("aria-hidden", "false");
  startMatrix();
  startPingStorm(target);
  startMemeStorm();
  synth("alert");
  await fakeResolveAndPing(target);
  if (state.aborted) return abortAttack();
  await typeCommand(`sudo ${mode.toLowerCase().replaceAll(" ", "-")} 127.0.0.1 --elite --no-parents`);
  addTerminalLine(`<span class="warn">[ARMED]</span> ${escapeHtml(mode)} simulation for ${escapeHtml(target)} redirected at localhost`);

  let phaseIndex = 0;
  let packetTotal = 0;
  for (let progress = 0; progress <= 100; progress += random(1, 4)) {
    if (state.aborted) return abortAttack();
    const clamped = Math.min(progress, 100);
    while (phaseIndex < phases.length && clamped >= phases[phaseIndex][0]) {
      els.attackStatus.textContent = phases[phaseIndex][1];
      addTerminalLine(`<span class="info">[${String(phases[phaseIndex][0]).padStart(3, "0")}%]</span> ${phases[phaseIndex][1]}`);
      phaseIndex++;
    }
    packetTotal += random(9000, 98000);
    els.attackProgress.style.width = `${clamped}%`;
    els.attackPercent.textContent = `${clamped}%`;
    els.livePackets.textContent = format(packetTotal);
    els.zombieCount.textContent = format(Math.max(1, Math.floor(packetTotal / random(140, 320))));
    els.legalRisk.textContent = clamped < 40 ? "LOW" : clamped < 80 ? "ACTIVE" : "SEVERE";
    if (clamped % 10 < 3) tone(random(110, 190), .035, "sawtooth", 0, .05);
    await sleep(random(65, 130));
  }
  await completeAttack(target, mode);
}

async function completeAttack(target, mode) {
  els.attackProgress.style.width = "100%";
  els.attackPercent.textContent = "100%";
  els.attackStatus.textContent = "TARGET ABSOLUTELY CYBERED";
  addTerminalLine(`<span class="ok">[PWNED]</span> ${escapeHtml(target)} defeated by ${escapeHtml(mode)}-shaped JavaScript`);
  addTerminalLine(`<span class="warn">[NOTICE]</span> zero actual network requests were made`);
  rotateOpsecStatus("media/opsecalert.webp", `${target.toUpperCase()} // OPERATION COMPLETE`, true);
  synth("success");
  await sleep(900);
  els.attackOverlay.classList.remove("active");
  els.attackOverlay.setAttribute("aria-hidden", "true");
  clearInterval(state.matrixTimer);
  stopPingStorm();
  stopMemeStorm();
  state.attacking = false;
  els.body.classList.remove("attack-intense");
  els.nukeTarget.textContent = target;
  els.nukeModal.classList.add("active");
  els.nukeModal.setAttribute("aria-hidden", "false");
  startNukeSiren();
  $("#blockedCount").dataset.value = Number($("#blockedCount").dataset.value || 1337420) + 1337;
  prependActivity(target);
}

function abortAttack() {
  clearInterval(state.matrixTimer);
  stopPingStorm();
  stopMemeStorm();
  els.attackOverlay.classList.remove("active");
  els.attackOverlay.setAttribute("aria-hidden", "true");
  state.attacking = false;
  els.body.classList.remove("attack-intense");
  els.linusAudio.volume = .42;
  state.aborted = false;
  synth("error");
  addTerminalLine(`<span class="error">[ABORTED]</span> intern has accepted full responsibility`);
  rotateOpsecStatus("media/opsecalert.webp", "COUNTER-TRACE // OPERATION ABORTED", true);
  toast("OPERATION CANCELLED", "The intern has been blamed and the cyber police notified.", true);
}

function prependActivity(target) {
  const feed = $("#activityFeed");
  const item = document.createElement("div");
  item.innerHTML = `<time>LIVE</time><span class="activity-icon red">R</span><p><b>REUTERS</b><small>Major disruption reported at ${escapeHtml(target)} as traffic reaches record levels</small></p><em>BREAKING</em>`;
  feed.prepend(item);
  if (feed.children.length > 4) feed.lastElementChild.remove();
}

function closeNukeModal() {
  els.nukeModal.classList.remove("active");
  els.nukeModal.setAttribute("aria-hidden", "true");
  stopNukeSiren();
  if (state.sound) tryStartMusic();
  els.attackButton.focus();
}

function panic() {
  if (els.body.classList.contains("panic-mode")) return;
  els.body.classList.add("panic-mode");
  synth("alert");
  toast("OH NO THEY FOUND YOU", "Enhance! Reverse the polarity! Close the mainframe!", true);
  const previousTitle = document.title;
  document.title = "!!! CYBER POLICE DETECTED !!!";
  setTimeout(() => {
    els.body.classList.remove("panic-mode");
    document.title = previousTitle;
    toast("FALSE ALARM", "It was only a cookie consent banner.");
  }, 2400);
}

function keyboardMayhem(event) {
  if (event.key === "Escape") {
    if (state.attacking) state.aborted = true;
    closeNukeModal();
  }
  if (event.key.toLowerCase() === "h" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    els.body.classList.add("glitch");
    synth("alert");
    setTimeout(() => els.body.classList.remove("glitch"), 700);
    toast("HACKER HOTKEY ACTIVATED", "You pressed H. This is basically programming.");
  }
}

function bindEvents() {
  $("#skipBoot").addEventListener("click", finishBoot, { once: true });
  els.attackButton.addEventListener("click", initiateAttack);
  $("#abortButton").addEventListener("click", () => { state.aborted = true; });
  $("#randomTarget").addEventListener("click", randomizeTarget);
  els.targetInput.addEventListener("input", () => beginTargetAcquisition());
  els.targetInput.addEventListener("focus", () => {
    if (!els.targetInput.value.trim()) {
      $("#opsecMessage").textContent = "TARGET ACQUISITION CHANNEL OPEN";
      els.opsecLevel.textContent = "AWAITING INPUT";
    }
  });
  els.targetInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (state.targetLocked) initiateAttack();
      else beginTargetAcquisition({ launch: true });
    }
  });
  $$('input[name="mode"]').forEach((radio) => radio.addEventListener("change", updateAttackButton));
  $("#clearTerminal").addEventListener("click", () => {
    $$("#terminalOutput > p:not(.terminal-input-line)").forEach((line) => line.remove());
    addTerminalLine(`<span class="ok">[OK]</span> evidence cleared into the recycle bin`);
    synth("click");
  });
  els.soundToggle.addEventListener("click", () => {
    state.sound = !state.sound;
    els.soundToggle.setAttribute("aria-pressed", String(state.sound));
    els.soundLabel.textContent = state.sound ? "ARMED" : "COWARD MODE";
    els.soundIcon.textContent = state.sound ? "♫" : "×";
    if (!state.sound) els.linusAudio.pause();
    if (!state.sound) stopNukeSiren();
    if (state.sound) {
      synth("startup");
      tryStartMusic();
      if (els.nukeModal.classList.contains("active")) startNukeSiren();
    }
  });
  $("#panicButton").addEventListener("click", panic);
  $("#closeNuke").addEventListener("click", closeNukeModal);
  $("#acknowledgeNukes").addEventListener("click", closeNukeModal);
  els.nukeModal.addEventListener("click", (event) => {
    if (event.target === els.nukeModal) closeNukeModal();
  });
  document.addEventListener("keydown", keyboardMayhem);
  document.addEventListener("pointerdown", tryStartMusic, { once: true });
  $$(".command-nav button").forEach((button) => button.addEventListener("click", () => {
    $$(".command-nav button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    toast(`${button.textContent} CHANNEL`, `Encrypted ${button.textContent.toLowerCase()} telemetry synchronized.`);
  }));
  document.addEventListener("pointermove", (event) => {
    $("#cursorGlow").style.left = `${event.clientX}px`;
    $("#cursorGlow").style.top = `${event.clientY}px`;
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest("button, input, label, a")) synth("click");
  });
}

function init() {
  bindEvents();
  drawMapRoutes();
  startMapChaos();
  startRealtimeInfections();
  startAmbientMatrix();
  scheduleAmbientMemes();
  startMicroTerminals();
  startOpsecRotation();
  startNewswire();
  tryStartMusic();
  beginTargetAcquisition();
  setInterval(updateAmbientData, 350);
  setInterval(updateThreatTelemetry, 90);
  setInterval(updateTargetTelemetry, 180);
  setTimeout(idleTerminal, 1800);
  boot();
}

init();

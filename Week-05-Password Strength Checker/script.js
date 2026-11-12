(function () {
  var COMMON = ["password", "123456", "12345678", "123456789", "qwerty", "abc123", "111111", "letmein", "admin",
    "welcome", "iloveyou", "monkey", "dragon", "football", "login", "passw0rd", "master", "sunshine",
    "princess", "qwerty123", "1q2w3e4r", "000000", "trustno1"];
  var SEQUENCES = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
  var COLORS = ["var(--weak)", "var(--fair)", "var(--good)", "var(--strong)"];
  var LABELS = ["Weak", "Fair", "Good", "Strong"];

  var pw = document.getElementById("pw");
  var toggle = document.getElementById("toggle");
  var bars = document.querySelectorAll(".meter span");
  var verdict = document.getElementById("verdict");
  var crack = document.getElementById("crack");
  var sLen = document.getElementById("sLen");
  var sEnt = document.getElementById("sEnt");
  var sScore = document.getElementById("sScore");
  var checksEl = document.getElementById("checks");
  var tipsEl = document.getElementById("tips");

  // True if the password contains 4+ characters of a keyboard/alphabet/number run (forwards or backwards)
  function hasSequence(s) {
    var l = s.toLowerCase();
    for (var i = 0; i < SEQUENCES.length; i++) {
      var q = SEQUENCES[i];
      var r = q.split("").reverse().join("");
      for (var j = 0; j <= q.length - 4; j++) {
        if (l.indexOf(q.substr(j, 4)) > -1 || l.indexOf(r.substr(j, 4)) > -1) return true;
      }
    }
    return false;
  }

  // Size of the character set the password draws from
  function poolSize(s) {
    var p = 0;
    if (/[a-z]/.test(s)) p += 26;
    if (/[A-Z]/.test(s)) p += 26;
    if (/[0-9]/.test(s)) p += 10;
    if (/[^A-Za-z0-9]/.test(s)) p += 33;
    return p;
  }

  function formatTime(seconds) {
    if (seconds < 1) return "instantly";
    var year = 31557600;
    if (seconds >= year * 1e9) return "billions of years or more";
    if (seconds >= year * 1e6) return "millions of years";
    if (seconds >= year * 1000) return "thousands of years";
    var units = [["year", year], ["month", 2629800], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]];
    for (var i = 0; i < units.length; i++) {
      if (seconds >= units[i][1]) {
        var n = Math.round(seconds / units[i][1]);
        return n + " " + units[i][0] + (n === 1 ? "" : "s");
      }
    }
    return "instantly";
  }

  function analyse(s) {
    var len = s.length;
    var isCommon = COMMON.indexOf(s.toLowerCase()) > -1;
    var repeats = /(.)\1{2,}/.test(s);
    var seq = hasSequence(s);
    var unique = new Set(s.split("")).size;

    var checks = [
      { ok: len >= 12, text: "At least 12 characters" },
      { ok: /[a-z]/.test(s) && /[A-Z]/.test(s), text: "Upper and lower case letters" },
      { ok: /[0-9]/.test(s), text: "Contains a number" },
      { ok: /[^A-Za-z0-9]/.test(s), text: "Contains a symbol" },
      { ok: !isCommon, text: "Not a commonly used password" },
      { ok: !repeats, text: "No characters repeated 3+ times in a row" },
      { ok: !seq, text: "No keyboard or alphabet sequences" }
    ];

    // Entropy = length x log2(pool size), reduced for predictable patterns
    var entropy = len ? len * Math.log2(Math.max(poolSize(s), 2)) : 0;
    var penalty = 0;
    if (repeats) penalty += 0.15;
    if (seq) penalty += 0.2;
    if (unique < len * 0.5) penalty += 0.15;
    entropy *= (1 - penalty);
    if (isCommon) entropy = Math.min(entropy, 10);

    var score = len ? Math.max(0, Math.min(100, Math.round(entropy / 80 * 100))) : 0;
    var level = score < 30 ? 0 : score < 55 ? 1 : score < 80 ? 2 : 3;
    var seconds = Math.pow(2, entropy) / 2 / 1e10; // average case at 10 billion guesses per second

    var tips = [];
    if (len < 12) tips.push("Use at least 12 characters. Length matters most.");
    if (!/[A-Z]/.test(s) || !/[a-z]/.test(s)) tips.push("Mix upper and lower case letters.");
    if (!/[0-9]/.test(s)) tips.push("Add some numbers.");
    if (!/[^A-Za-z0-9]/.test(s)) tips.push("Add a symbol such as ! or #.");
    if (isCommon) tips.push("This is a very common password. Pick something unique.");
    if (repeats) tips.push("Avoid repeating the same character.");
    if (seq) tips.push("Avoid sequences like 1234 or qwerty.");
    if (!tips.length) tips.push("Looks good. Use a password manager and never reuse it.");

    return { len: len, entropy: entropy, score: score, level: level, seconds: seconds, checks: checks, tips: tips };
  }

  function render() {
    var s = pw.value;
    if (!s) {
      bars.forEach(function (b) { b.style.background = ""; });
      verdict.textContent = "Enter a password";
      verdict.style.color = "";
      crack.textContent = "";
      sLen.textContent = sEnt.textContent = sScore.textContent = "0";
      checksEl.innerHTML = "";
      tipsEl.innerHTML = "<li>Start typing to get suggestions.</li>";
      return;
    }

    var r = analyse(s);
    bars.forEach(function (b, i) { b.style.background = i <= r.level ? COLORS[r.level] : ""; });
    verdict.textContent = LABELS[r.level];
    verdict.style.color = COLORS[r.level];
    crack.textContent = "Estimated crack time: " + formatTime(r.seconds);
    sLen.textContent = r.len;
    sEnt.textContent = Math.round(r.entropy);
    sScore.textContent = r.score;

    checksEl.innerHTML = "";
    r.checks.forEach(function (c) {
      var li = document.createElement("li");
      li.className = c.ok ? "ok" : "bad";
      var ic = document.createElement("span");
      ic.className = "ic";
      ic.textContent = c.ok ? "\u2713" : "\u2715";
      var t = document.createElement("span");
      t.textContent = c.text;
      li.appendChild(ic);
      li.appendChild(t);
      checksEl.appendChild(li);
    });

    tipsEl.innerHTML = "";
    r.tips.forEach(function (tip) {
      var li = document.createElement("li");
      li.textContent = tip;
      tipsEl.appendChild(li);
    });
  }

  pw.addEventListener("input", render);
  toggle.addEventListener("click", function () {
    var show = pw.type === "password";
    pw.type = show ? "text" : "password";
    toggle.textContent = show ? "Hide" : "Show";
    toggle.setAttribute("aria-pressed", String(show));
  });
  render();
})();

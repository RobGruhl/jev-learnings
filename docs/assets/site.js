// Decision Tier — theme, menu, and the small interactive widgets. No dependencies.
(function () {
  const root = document.documentElement;

  // Theme toggle: flips between light and dark and remembers the choice.
  const themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("dt-theme", next); } catch (e) {}
  });

  // Phone menu.
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.getElementById("sidenav");
  if (menuBtn && nav) menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  const $ = (sel, el) => (el || document).querySelector(sel);
  const fmt = (x, d) => Number(x).toFixed(d);

  // Confidence explorer: a three-option Choice. Confidence follows TypeSafe's definition,
  // (n * peak - 1) / (n - 1): 0 for a flat distribution, 1 when one option has it all.
  const conf = $("#conf-widget");
  if (conf) {
    const sliders = [...conf.querySelectorAll("input[data-opt]")];
    const thr = $("#conf-thr", conf);
    const render = () => {
      const raw = sliders.map(s => Number(s.value));
      const total = raw.reduce((a, b) => a + b, 0) || 1;
      const p = raw.map(v => v / total);
      const peak = Math.max(...p);
      const n = p.length;
      const c = Math.max(0, Math.min(1, (n * peak - 1) / (n - 1)));
      const win = p.indexOf(peak);
      conf.querySelectorAll(".bars div").forEach((b, i) => {
        b.style.height = (p[i] * 100) + "%";
        b.classList.toggle("win", i === win);
        b.querySelector("span").textContent = Math.round(p[i] * 100) + "%";
      });
      sliders.forEach((s, i) => { $(`output[data-for="${i}"]`, conf).textContent = Math.round(p[i] * 100) + "%"; });
      $("#conf-thr-out", conf).textContent = fmt(thr.value, 2);
      $("#conf-val", conf).textContent = fmt(c, 2);
      $("#conf-pick", conf).textContent = ["billing", "technical", "account"][win];
      const v = $("#conf-verdict", conf);
      if (c >= Number(thr.value)) { v.className = "verdict act"; v.textContent = "Act: code routes the ticket to " + ["billing", "technical", "account"][win] + " with no one else involved."; }
      else { v.className = "verdict up"; v.textContent = "Escalate: confidence is under your line, so a larger model or a person takes this one."; }
    };
    [...sliders, thr].forEach(s => s.addEventListener("input", render));
    render();
  }

  // Doubt / novelty gauge: the bands used in the long-running operations agent.
  const gauge = $("#doubt-widget");
  if (gauge) {
    const d = $("#doubt-in", gauge), nv = $("#novelty-in", gauge), rep = $("#repeat-in", gauge);
    const render = () => {
      const dv = Number(d.value), nvv = Number(nv.value);
      $("#doubt-out", gauge).textContent = fmt(dv, 2);
      $("#novelty-out", gauge).textContent = fmt(nvv, 2);
      const v = $("#doubt-verdict", gauge);
      if (dv > 0.7 && nvv > 0.7) { v.className = "verdict up"; v.textContent = "Escalate now (both checks fired). New situation and a doubtful action: the LLM decides, then writes a playbook line and fixes the option generator."; }
      else if (dv > 0.7) { v.className = "verdict up"; v.textContent = "Escalate now (doubt). This action looks wrong for this state: the LLM overrides it, then fixes the planner or adds a code policy so the option isn't offered again."; }
      else if (nvv > 0.7) { v.className = "verdict up"; v.textContent = "Escalate now (novelty). The context doesn't cover this state: the LLM approves or redirects, then adds a playbook line so next time is routine."; }
      else if (dv >= 0.5 && rep.checked) { v.className = "verdict watch"; v.textContent = "Watch band, repeated: flat mid-band doubt on the same pick points to a context conflict, and doubt that rises over repeats points to a loop. Flag it for the next LLM wake."; }
      else if (dv >= 0.5) { v.className = "verdict watch"; v.textContent = "Watch band: log it and let it run. A single mid-band reading on a new kind of action is usually fine. Check the outcome."; }
      else { v.className = "verdict act"; v.textContent = "Act. Remember the limit: low doubt means the pick is reasonable among the options offered, not that the options were good."; }
    };
    [d, nv, rep].forEach(s => s.addEventListener("input", render));
    render();
  }

  // Cost calculator. Per-decision costs for one reference decision (see cost.html for the basis).
  const COST = {
    jev: 0.000063, luna: 0.000151, haiku: 0.00038, local: 0.0, open27: 0.00032,
    nimble: 0.00006, lunafaux: 0.000305, terrafaux: 0.00264,
    sonnet: 0.009, opus: 0.018, fable: 0.045, human: 0.50,
  };
  const calc = $("#cost-calc");
  if (calc) {
    const ids = ["cc-n", "cc-code", "cc-dm", "cc-llm", "cc-human", "cc-dmodel", "cc-lmodel", "cc-llmsize"];
    const el = Object.fromEntries(ids.map(i => [i, $("#" + i, calc)]));
    const money = x => x >= 100 ? "$" + Math.round(x).toLocaleString() : x >= 1 ? "$" + x.toFixed(2) : "$" + x.toFixed(3);
    const render = () => {
      const n = Math.max(0, Number(el["cc-n"].value) || 0) * 30;
      let shares = ["cc-code", "cc-dm", "cc-llm", "cc-human"].map(k => Number(el[k].value));
      const sum = shares.reduce((a, b) => a + b, 0) || 1;
      shares = shares.map(s => s / sum);
      const pct = x => (x < 0.1 ? (x * 100).toFixed(1) : Math.round(x * 100)) + "%";
      ["cc-code", "cc-dm", "cc-llm", "cc-human"].forEach((k, i) => { $(`output[data-for="${k}"]`, calc).textContent = pct(shares[i]); });
      const dm = COST[el["cc-dmodel"].value], lmSmall = COST[el["cc-lmodel"].value];
      const lm = lmSmall * Number(el["cc-llmsize"].value);
      $(`output[data-for="cc-llmsize"]`, calc).textContent = el["cc-llmsize"].value + "×";
      // Every decision that leaves code is first asked of the decision model; escalations pay for the next tier too.
      const leaveCode = shares[1] + shares[2] + shares[3];
      const toLlm = shares[2] + shares[3];
      // Both sides pay the same deep reads and the same people; they differ only in who makes the first pass.
      const upstairs = toLlm * lm + shares[3] * COST.human;
      const cascade = n * (leaveCode * dm + upstairs);
      const allLlm = n * (lmSmall + upstairs);
      $("#cc-cascade", calc).textContent = money(cascade);
      $("#cc-allllm", calc).textContent = money(allLlm);
      $("#cc-ratio", calc).textContent = cascade > 0 ? (allLlm / cascade).toFixed(1) + "×" : "∞";
      $("#cc-human-cost", calc).textContent = money(n * shares[3] * COST.human);
    };
    Object.values(el).forEach(e => e.addEventListener("input", render));
    render();
  }
})();

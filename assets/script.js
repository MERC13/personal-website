// Minimal interactivity for the portfolio
(function () {
  const state = {
    search: "",
    activeTags: new Set(),
    data: { projects: [] },
  };

  const els = {
    grid: document.getElementById("projectsGrid"),
    search: document.getElementById("searchInput"),
    chipRow: document.getElementById("tagChips"),
    year: document.getElementById("year"),
  };

  function loadData() {
    try {
      const raw = document.getElementById("projects-data").textContent;
      state.data = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse projects JSON.", e);
      state.data = { projects: [] };
    }
  }

  function uniqTags(projects) {
    const set = new Set();
    projects.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  }

  function matches(p) {
    const txt = (state.search || "").trim().toLowerCase();
    const tagOk = state.activeTags.size === 0 || (p.tags || []).some(t => state.activeTags.has(t));
    if (!txt) return tagOk;
    const hay = [
      p.title || "",
      p.description || "",
      ...(p.tags || []),
      ...(p.tech || [])
    ].join(" ").toLowerCase();
    return tagOk && hay.includes(txt);
  }

  function validLink(u) {
    return typeof u === "string" && (u = u.trim()) && u !== "#";
  }
  
  function projectCard(p) {
    const tags = (p.tags || []).map(t => `<span class="badge" aria-label="tag ${t}">#${t}</span>`).join("");
    const tech = (p.tech || []).map(t => `<span class="pill">${t}</span>`).join("");
  
    const links = [];
    if (validLink(p.repo_url)) {
      links.push(`<a class="btn" href="${p.repo_url}" target="_blank" rel="noopener">Code ↗</a>`);
    }
    if (validLink(p.demo_url)) {
      links.push(`<a class="btn" href="${p.demo_url}" target="_blank" rel="noopener">Demo ↗</a>`);
    }
    const actions = links.length ? `<div class="actions">${links.join("")}</div>` : "";
  
    return `
      <article class="card" aria-labelledby="t-${slug(p.title)}">
        <header>
          <h4 id="t-${slug(p.title)}">${p.title}</h4>
          <div class="badges">${tags}</div>
        </header>
        <p>${p.description || ""}</p>
        <div class="tech">${tech}</div>
        ${actions}
      </article>
    `;
  }
  

  function slug(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function render() {
    const projects = (state.data.projects || []).filter(matches);
    els.grid.innerHTML = projects.map(projectCard).join("") || `<p>No matching projects yet. Try clearing filters.</p>`;
  }

  function renderChips() {
    const tags = uniqTags(state.data.projects || []);
    els.chipRow.innerHTML = tags.map(t => `
      <button class="chip ${state.activeTags.has(t) ? "active": ""}" data-tag="${t}" aria-pressed="${state.activeTags.has(t)}">${t}</button>
    `).join("");
    // Wire chip clicks
    els.chipRow.querySelectorAll(".chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const tag = btn.dataset.tag;
        if (state.activeTags.has(tag)) state.activeTags.delete(tag); else state.activeTags.add(tag);
        renderChips();
        render();
      });
    });
  }

  function debounce(fn, ms) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  function init() {
    loadData();
    renderChips();
    render();
    els.search.addEventListener("input", debounce(e => {
      state.search = e.target.value;
      render();
    }, 120));
    els.year.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

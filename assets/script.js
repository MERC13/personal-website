// Progressive enhancement only. The page is complete without this file.
(function () {
  "use strict";

  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");
  var year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function label(next) {
    return "Switch to " + next + " theme";
  }

  if (toggle) {
    toggle.setAttribute("title", label(currentTheme() === "dark" ? "light" : "dark"));

    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";

      // Scope the cross-fade to this moment so hover states stay snappy.
      root.classList.add("theme-transition");
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      toggle.setAttribute("title", label(next === "dark" ? "light" : "dark"));

      window.setTimeout(function () {
        root.classList.remove("theme-transition");
      }, 250);
    });
  }
})();

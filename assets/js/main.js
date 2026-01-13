// Footer year
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// Mobile menu
const btn = document.querySelector(".menuBtn");
const mobileNav = document.querySelector(".mobileNav");

if (btn && mobileNav) {
  btn.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });

  mobileNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

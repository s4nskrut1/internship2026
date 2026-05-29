const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const dropdown = document.querySelector(".nav-dropdown");
const dropdownToggle = document.querySelector(".dropdown-toggle");
const navLinks = document.querySelectorAll(".nav-menu a");
const revealItems = document.querySelectorAll(".reveal");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (dropdown && dropdownToggle) {
  dropdownToggle.addEventListener("click", () => {
    if (window.innerWidth > 760) {
      return;
    }

    const isOpen = dropdown.classList.toggle("is-open");
    dropdownToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (event) => {
  if (!dropdown?.contains(event.target)) {
    dropdown?.classList.remove("is-open");
    dropdownToggle?.setAttribute("aria-expanded", "false");
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealItems.forEach((item) => observer.observe(item));

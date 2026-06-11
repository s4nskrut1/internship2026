const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const page = document.body.dataset.page;

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-page-link]").forEach((link) => {
  if (link.dataset.pageLink === page) {
    link.classList.add("active");
  }
});

document.querySelectorAll(".year").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const demoForm = document.querySelector("[data-demo-form]");
const formNote = document.querySelector("[data-form-note]");

if (demoForm && formNote) {
  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formNote.textContent = "Message sending is not enabled in this demo preview.";
  });
}

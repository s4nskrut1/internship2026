const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const page = document.body.dataset.page;
const STORAGE_KEY = "atlasStudioSubmissions";

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

function getStoredSubmissions() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function saveStoredSubmissions(submissions) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

function clearStoredSubmissions() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function generateSubmissionId() {
  return `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTimestamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${year}-${month}-${day} ${displayHour}:${minutes} ${meridiem}`;
}

function getFieldMessageElement(form, fieldName) {
  return form.querySelector(`[data-error-for="${fieldName}"]`);
}

function setFieldError(form, fieldName, message) {
  const field = form.elements[fieldName];
  const fieldMessage = getFieldMessageElement(form, fieldName);

  if (!field || !fieldMessage) {
    return;
  }

  field.classList.add("is-invalid");
  field.setAttribute("aria-invalid", "true");
  fieldMessage.textContent = message;
  fieldMessage.classList.add("is-visible");
}

function clearFieldError(form, fieldName) {
  const field = form.elements[fieldName];
  const fieldMessage = getFieldMessageElement(form, fieldName);

  if (!field || !fieldMessage) {
    return;
  }

  field.classList.remove("is-invalid");
  field.removeAttribute("aria-invalid");
  fieldMessage.textContent = "";
  fieldMessage.classList.remove("is-visible");
}

function setFormStatus(statusNode, message, type) {
  if (!statusNode) {
    return;
  }

  statusNode.textContent = message;
  statusNode.classList.remove("is-success", "is-error");

  if (type) {
    statusNode.classList.add(type === "success" ? "is-success" : "is-error");
  }
}

function validateSubmissionValues(values) {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.name) {
    errors.name = "Please enter your name.";
  } else if (values.name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!values.email) {
    errors.email = "Please enter your email.";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.message) {
    errors.message = "Please enter your message.";
  }

  return errors;
}

function getTrimmedFormValues(form) {
  return {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    message: form.elements.message.value.trim()
  };
}

function syncValidationState(form, values) {
  const errors = validateSubmissionValues(values);

  ["name", "email", "message"].forEach((fieldName) => {
    if (errors[fieldName]) {
      setFieldError(form, fieldName, errors[fieldName]);
    } else {
      clearFieldError(form, fieldName);
    }
  });

  return errors;
}

function validateSingleField(form, fieldName) {
  const values = getTrimmedFormValues(form);
  const errors = validateSubmissionValues(values);

  if (errors[fieldName]) {
    setFieldError(form, fieldName, errors[fieldName]);
  } else {
    clearFieldError(form, fieldName);
  }
}

function clearAllFieldErrors(form) {
  ["name", "email", "message"].forEach((fieldName) => {
    clearFieldError(form, fieldName);
  });
}

function initializeContactForm() {
  const contactForm = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");

  if (!contactForm) {
    return;
  }

  ["name", "email", "message"].forEach((fieldName) => {
    const field = contactForm.elements[fieldName];

    if (!field) {
      return;
    }

    field.addEventListener("blur", () => {
      validateSingleField(contactForm, fieldName);
    });

    field.addEventListener("input", () => {
      validateSingleField(contactForm, fieldName);
      setFormStatus(formStatus, "", "");
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formValues = getTrimmedFormValues(contactForm);
    const errors = syncValidationState(contactForm, formValues);

    if (Object.keys(errors).length > 0) {
      setFormStatus(formStatus, "Please correct the highlighted fields.", "error");
      return;
    }

    const submission = {
      id: generateSubmissionId(),
      name: formValues.name,
      email: formValues.email,
      message: formValues.message,
      timestamp: formatTimestamp(new Date())
    };

    try {
      const storedSubmissions = getStoredSubmissions();
      storedSubmissions.push(submission);
      saveStoredSubmissions(storedSubmissions);
      contactForm.reset();
      clearAllFieldErrors(contactForm);
      setFormStatus(formStatus, "Message saved successfully.", "success");
    } catch (error) {
      setFormStatus(formStatus, "Unable to save your message in this browser.", "error");
    }
  });
}

function createSubmissionCard(submission) {
  const article = document.createElement("article");
  article.className = "submission-card";

  const headingGroup = document.createElement("div");
  headingGroup.className = "submission-card-header";

  const name = document.createElement("h3");
  name.textContent = submission.name;

  const timestamp = document.createElement("p");
  timestamp.className = "submission-timestamp";
  timestamp.textContent = submission.timestamp;

  headingGroup.append(name, timestamp);

  const email = document.createElement("a");
  email.className = "submission-email";
  email.href = `mailto:${submission.email}`;
  email.textContent = submission.email;

  const message = document.createElement("p");
  message.className = "submission-message";
  message.textContent = submission.message;

  const actions = document.createElement("div");
  actions.className = "submission-actions";

  const deleteButton = document.createElement("button");
  deleteButton.className = "button-danger";
  deleteButton.type = "button";
  deleteButton.dataset.deleteSubmission = submission.id;
  deleteButton.textContent = "Delete";

  actions.append(deleteButton);
  article.append(headingGroup, email, message, actions);

  return article;
}

function createConfirmationController() {
  const dialog = document.querySelector("[data-confirm-dialog]");
  const titleNode = document.querySelector("[data-dialog-title]");
  const messageNode = document.querySelector("[data-dialog-message]");
  const cancelButton = document.querySelector("[data-dialog-cancel]");
  const confirmButton = document.querySelector("[data-dialog-confirm]");

  if (!dialog || !titleNode || !messageNode || !cancelButton || !confirmButton) {
    return {
      open: async ({ message }) => window.confirm(message)
    };
  }

  return {
    open({ title, message, confirmLabel }) {
      return new Promise((resolve) => {
        function closeDialog(result) {
          dialog.hidden = true;
          dialog.classList.remove("is-visible");
          confirmButton.textContent = "Confirm";
          cancelButton.removeEventListener("click", handleCancel);
          confirmButton.removeEventListener("click", handleConfirm);
          dialog.removeEventListener("click", handleBackdropClick);
          document.removeEventListener("keydown", handleEscape);
          resolve(result);
        }

        function handleCancel() {
          closeDialog(false);
        }

        function handleConfirm() {
          closeDialog(true);
        }

        function handleBackdropClick(event) {
          if (event.target === dialog) {
            closeDialog(false);
          }
        }

        function handleEscape(event) {
          if (event.key === "Escape") {
            closeDialog(false);
          }
        }

        titleNode.textContent = title;
        messageNode.textContent = message;
        confirmButton.textContent = confirmLabel || "Confirm";
        dialog.hidden = false;
        dialog.classList.add("is-visible");

        cancelButton.addEventListener("click", handleCancel);
        confirmButton.addEventListener("click", handleConfirm);
        dialog.addEventListener("click", handleBackdropClick);
        document.addEventListener("keydown", handleEscape);
        confirmButton.focus();
      });
    }
  };
}

function initializeSubmissionsPage() {
  const submissionsList = document.querySelector("[data-submissions-list]");
  const emptyState = document.querySelector("[data-empty-state]");
  const clearButton = document.querySelector("[data-clear-submissions]");
  const confirmation = createConfirmationController();

  if (!submissionsList || !emptyState || !clearButton) {
    return;
  }

  function renderSubmissions() {
    const submissions = getStoredSubmissions().slice().reverse();

    submissionsList.innerHTML = "";

    if (submissions.length === 0) {
      emptyState.hidden = false;
      clearButton.disabled = true;
      return;
    }

    emptyState.hidden = true;
    clearButton.disabled = false;

    submissions.forEach((submission) => {
      submissionsList.appendChild(createSubmissionCard(submission));
    });
  }

  submissionsList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest("[data-delete-submission]");

    if (!deleteButton) {
      return;
    }

    const submissionId = deleteButton.dataset.deleteSubmission;

    const shouldDelete = await confirmation.open({
      title: "Delete submission?",
      message: "This saved enquiry will be removed from LocalStorage.",
      confirmLabel: "Delete"
    });

    if (!shouldDelete) {
      return;
    }

    const remainingSubmissions = getStoredSubmissions().filter((submission) => submission.id !== submissionId);
    saveStoredSubmissions(remainingSubmissions);
    renderSubmissions();
  });

  clearButton.addEventListener("click", async () => {
    const shouldClear = await confirmation.open({
      title: "Clear all submissions?",
      message: "This will permanently remove every saved enquiry from LocalStorage.",
      confirmLabel: "Clear all"
    });

    if (!shouldClear) {
      return;
    }

    clearStoredSubmissions();
    renderSubmissions();
  });

  renderSubmissions();
}

initializeContactForm();
initializeSubmissionsPage();

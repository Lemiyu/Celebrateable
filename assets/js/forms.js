// Contact form handling
// EmailJS sends the enquiry to Ben (primary, controls success/error UI).
// Make webhook receives a copy in parallel for the Notion CRM (silent, fire-and-forget).

const PUBLIC_KEY = "6C1F8nVeYysBzes5c";
const SERVICE_ID = "service_9cybihr";
const TEMPLATE_ID = "template_lt1sxpo";

const form = document.getElementById("contact-form");

if (form) {
  const successBox = document.getElementById("contact-success");
  const submitBtn = form.querySelector('button[type="submit"]');
  const webhookUrl = form.dataset.webhook;
  const emailReady = Boolean(window.emailjs);

  if (emailReady) {
    emailjs.init({ publicKey: PUBLIC_KEY });
  }

  const showSendError = () => {
    alert("Sorry, something went wrong sending your message. Please email info@celebrateable.co.uk directly.");
  };

  // Fire-and-forget copy to Make. Failure is logged only, never shown to the user.
  const sendToWebhook = () => {
    if (!webhookUrl) return;

    fetch(webhookUrl, {
      method: "POST",
      body: new URLSearchParams(new FormData(form)),
      keepalive: true
    }).catch((err) => console.warn("Webhook error:", err));
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Honeypot — if filled, silently drop (a bot)
    if (form.website && form.website.value.trim() !== "") {
      return;
    }

    // Native validation (required fields, email format, consent)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // EmailJS failed to load — don't pretend it sent
    if (!emailReady) {
      showSendError();
      return;
    }

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    sendToWebhook();

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form)
      .then(() => {
        form.style.display = "none";
        if (successBox) successBox.style.display = "block";
      })
      .catch((err) => {
        console.error("EmailJS error:", err);
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        showSendError();
      });
  });
}
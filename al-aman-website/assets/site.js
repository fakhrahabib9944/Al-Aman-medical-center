/* =====================================================================
   FINAL PUBLISHING CONFIG (2 of 2) — clinic location
   Verified Google Maps location of Al Aman Medical Centre.
   Used by both the English and Urdu pages. If the location ever changes,
   update it here AND in the three data-maps links in each HTML page.
   ===================================================================== */
const CLINIC_MAPS_URL = "https://maps.app.goo.gl/ot8H29BSfZ6ZTW8P8";

const WHATSAPP_NUMBER = "923352575555";

const I18N = {
  en: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    errName: "Please enter the patient's name.",
    errPhone: "Please enter a phone number.",
    errPhoneInvalid: "Please check the number, e.g. 0300 1234567.",
    errReason: "Please choose a reason for your visit.",
    status: "WhatsApp is opening with your request. Please press send in WhatsApp. Your appointment is confirmed only when the clinic replies.",
    waIntro: "Assalam-o-Alaikum. I would like to request an appointment with Dr Fakhra Habib at Al Aman Medical Centre, Jampur.",
    waName: "Name", waPhone: "Phone", waReason: "Reason",
    waDate: "Preferred date", waTime: "Preferred time", waMsg: "Message",
    dateLocale: "en-GB",
    mapNoteVerified: "Al Aman Medical Centre, Choti Road, Jampur"
  },
  ur: {
    openMenu: "مینو کھولیں",
    closeMenu: "مینو بند کریں",
    errName: "براہِ کرم مریض کا نام لکھیں۔",
    errPhone: "براہِ کرم فون نمبر لکھیں۔",
    errPhoneInvalid: "براہِ کرم نمبر چیک کریں، مثلاً 0300 1234567",
    errReason: "براہِ کرم آنے کی وجہ منتخب کریں۔",
    status: "واٹس ایپ آپ کی درخواست کے ساتھ کھل رہا ہے۔ براہِ کرم واٹس ایپ میں سینڈ دبائیں۔ اپوائنٹمنٹ صرف کلینک کے جواب پر کنفرم ہو گی۔",
    waIntro: "السلام علیکم۔ الامان میڈیکل سنٹر جام پور میں ڈاکٹر فاخرہ حبیب سے اپوائنٹمنٹ کی درخواست ہے۔",
    waName: "نام", waPhone: "فون", waReason: "وجہ",
    waDate: "پسندیدہ تاریخ", waTime: "پسندیدہ وقت", waMsg: "پیغام",
    dateLocale: "ur-PK",
    mapNoteVerified: "الامان میڈیکل سنٹر، چوٹی روڈ، جام پور"
  }
};

(function () {
  const lang = document.documentElement.lang === "ur" ? "ur" : "en";
  const t = I18N[lang];
  const $ = id => document.getElementById(id);

  // Language switch: remember the choice and keep the visitor's place on the page
  document.querySelectorAll("[data-lang-link]").forEach(a => a.addEventListener("click", () => {
    try { localStorage.setItem("site-lang", a.dataset.langLink); } catch (e) {}
    if (location.hash) a.href = a.href.split("#")[0] + location.hash;
  }));

  // Verified clinic location
  if (CLINIC_MAPS_URL) {
    document.querySelectorAll("[data-maps]").forEach(a => a.href = CLINIC_MAPS_URL);
    const note = $("mapNote");
    if (note) note.textContent = t.mapNoteVerified;
  }

  // Footer year
  $("year").textContent = new Date().getFullYear();

  // Header shadow on scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Mobile menu
  const toggle = $("menuToggle");
  const links = $("navLinks");
  const setMenu = open => {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? t.closeMenu : t.openMenu);
  };
  toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && links.classList.contains("open")) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener("click", e => {
    if (links.classList.contains("open") && !links.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 1280) setMenu(false); });

  // Section highlighting and gentle reveal
  const navAnchors = [...links.querySelectorAll('a[href^="#"]:not(.btn)')];
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navAnchors.forEach(a => {
          const on = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("active", on);
          on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(s => spy.observe(s));

    const revealer = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); revealer.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(el => revealer.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  }

  // Date picker: no past dates
  const d = new Date();
  $("date").min = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  // Appointment form → WhatsApp
  const form = $("apptForm");
  const statusBox = $("formStatus");
  const val = id => $(id).value.trim();
  const REQUIRED = ["name", "phone", "reason"];

  function setError(id, msg) {
    const el = $(id);
    el.closest(".field").classList.toggle("invalid", !!msg);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    $(id + "-err").textContent = msg;
  }
  function validate(focusFirst) {
    const digits = val("phone").replace(/\D/g, "");
    setError("name", val("name").length < 2 ? t.errName : "");
    setError("phone", !digits ? t.errPhone : (digits.length < 10 || digits.length > 13) ? t.errPhoneInvalid : "");
    setError("reason", !val("reason") ? t.errReason : "");
    const bad = REQUIRED.filter(id => $(id).getAttribute("aria-invalid") === "true");
    if (bad.length && focusFirst) $(bad[0]).focus();
    return bad.length === 0;
  }
  REQUIRED.forEach(id => ["input", "change"].forEach(ev => $(id).addEventListener(ev, () => {
    if ($(id).getAttribute("aria-invalid") === "true") validate(false);
  })));

  function formatDate(iso) {
    const [y, m, day] = iso.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString(t.dateLocale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!validate(true)) return;
    const reason = $("reason").selectedOptions[0].textContent.trim();
    const time = val("time") ? $("time").selectedOptions[0].textContent.trim() : "";
    const lines = [
      t.waIntro, "",
      t.waName + ": " + val("name"),
      t.waPhone + ": " + val("phone"),
      t.waReason + ": " + reason
    ];
    if (val("date")) lines.push(t.waDate + ": " + formatDate(val("date")));
    if (time) lines.push(t.waTime + ": " + time);
    if (val("message")) lines.push(t.waMsg + ": " + val("message"));

    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    const win = window.open(url, "_blank");
    if (win) { win.opener = null; } else { window.location.href = url; }

    statusBox.hidden = false;
    statusBox.textContent = t.status;
  });

  // Privacy / disclaimer dialogs
  document.querySelectorAll("[data-dialog]").forEach(btn => btn.addEventListener("click", () => {
    const dlg = $(btn.dataset.dialog);
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }));
  document.querySelectorAll("dialog").forEach(dlg => {
    dlg.querySelector(".js-close").addEventListener("click", () => dlg.close ? dlg.close() : dlg.removeAttribute("open"));
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  });
})();

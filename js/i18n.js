// js/i18n.js
// i18n initialization for homepage and global use

// Translation resources for English, Mandarin, Hindi, Spanish
const resources = {
  en: {
    translation: {
      "Master Forex Trading": "Master Forex Trading",
      "Join our professional mentorship program and learn from experienced traders. Get access to exclusive strategies, live trading sessions, and personalized guidance to become a profitable trader.":
        "Join our professional mentorship program and learn from experienced traders. Get access to exclusive strategies, live trading sessions, and personalized guidance to become a profitable trader.",
      "Start Learning": "Start Learning",
      "Student Login": "Student Login",
      Courses: "Courses",
      Pricing: "Pricing",
      Reviews: "Reviews",
      FAQ: "FAQ",
      Admin: "Admin",
      "What You'll Learn": "What You'll Learn",
      "Choose Your Plan": "Choose Your Plan",
      "What Our Students Say": "What Our Students Say",
      "Frequently Asked Questions": "Frequently Asked Questions",
      "System Status": "System Status",
      "Ready to Start Your Trading Journey?":
        "Ready to Start Your Trading Journey?",
      "Choose Your Plan": "Choose Your Plan",
      "Contact Us": "Contact Us",
      // ...add more as needed
    },
  },
  zh: {
    translation: {
      "Master Forex Trading": "精通外汇交易",
      "Join our professional mentorship program and learn from experienced traders. Get access to exclusive strategies, live trading sessions, and personalized guidance to become a profitable trader.":
        "加入我们的专业指导计划，向经验丰富的交易员学习。获取独家策略、实时交易课程和个性化指导，成为盈利交易者。",
      "Start Learning": "开始学习",
      "Student Login": "学员登录",
      Courses: "课程",
      Pricing: "价格",
      Reviews: "评价",
      FAQ: "常见问题",
      Admin: "管理员",
      "What You'll Learn": "你将学到什么",
      "Choose Your Plan": "选择你的计划",
      "What Our Students Say": "学员评价",
      "Frequently Asked Questions": "常见问题解答",
      "System Status": "系统状态",
      "Ready to Start Your Trading Journey?": "准备好开始你的交易之旅了吗？",
      "Choose Your Plan": "选择你的计划",
      "Contact Us": "联系我们",
      // ...add more as needed
    },
  },
  hi: {
    translation: {
      "Master Forex Trading": "फॉरेक्स ट्रेडिंग में महारत हासिल करें",
      "Join our professional mentorship program and learn from experienced traders. Get access to exclusive strategies, live trading sessions, and personalized guidance to become a profitable trader.":
        "हमारे पेशेवर मेंटरशिप प्रोग्राम में शामिल हों और अनुभवी ट्रेडर्स से सीखें। विशेष रणनीतियाँ, लाइव ट्रेडिंग सत्र और व्यक्तिगत मार्गदर्शन प्राप्त करें।",
      "Start Learning": "शुरू करें",
      "Student Login": "छात्र लॉगिन",
      Courses: "कोर्स",
      Pricing: "मूल्य निर्धारण",
      Reviews: "समीक्षा",
      FAQ: "सामान्य प्रश्न",
      Admin: "प्रशासक",
      "What You'll Learn": "आप क्या सीखेंगे",
      "Choose Your Plan": "अपनी योजना चुनें",
      "What Our Students Say": "हमारे छात्रों की राय",
      "Frequently Asked Questions": "अक्सर पूछे जाने वाले प्रश्न",
      "System Status": "सिस्टम स्थिति",
      "Ready to Start Your Trading Journey?":
        "क्या आप अपनी ट्रेडिंग यात्रा शुरू करने के लिए तैयार हैं?",
      "Choose Your Plan": "अपनी योजना चुनें",
      "Contact Us": "संपर्क करें",
      // ...add more as needed
    },
  },
  es: {
    translation: {
      "Master Forex Trading": "Domina el Trading de Forex",
      "Join our professional mentorship program and learn from experienced traders. Get access to exclusive strategies, live trading sessions, and personalized guidance to become a profitable trader.":
        "Únete a nuestro programa de mentoría profesional y aprende de traders experimentados. Accede a estrategias exclusivas, sesiones de trading en vivo y orientación personalizada para convertirte en un trader rentable.",
      "Start Learning": "Comenzar a aprender",
      "Student Login": "Acceso de estudiante",
      Courses: "Cursos",
      Pricing: "Precios",
      Reviews: "Reseñas",
      FAQ: "Preguntas frecuentes",
      Admin: "Administrador",
      "What You'll Learn": "Lo que aprenderás",
      "Choose Your Plan": "Elige tu plan",
      "What Our Students Say": "Lo que dicen nuestros estudiantes",
      "Frequently Asked Questions": "Preguntas frecuentes",
      "System Status": "Estado del sistema",
      "Ready to Start Your Trading Journey?":
        "¿Listo para comenzar tu viaje de trading?",
      "Choose Your Plan": "Elige tu plan",
      "Contact Us": "Contáctanos",
      // ...add more as needed
    },
  },
};

// RTL language codes
const RTL_LANGS = ["ar", "he", "fa", "ur"];

function setDocumentDirection(lang) {
  document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
}

function detectBrowserLanguage() {
  const lang = navigator.language || navigator.userLanguage;
  if (!lang) return "en";
  if (resources[lang.slice(0, 2)]) return lang.slice(0, 2);
  return "en";
}

function updateContent() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = window.i18next.t(key);
  });
}

window.initI18n = function () {
  const userLang = detectBrowserLanguage();
  window.i18next = {
    language: userLang,
    t: function (key) {
      const lang = window.i18next.language;
      return (
        (resources[lang] && resources[lang].translation[key]) ||
        resources["en"].translation[key] ||
        key
      );
    },
    changeLanguage: function (lang) {
      window.i18next.language = lang;
      setDocumentDirection(lang);
      updateContent();
    },
  };
  setDocumentDirection(userLang);
  updateContent();

  // Language selector event
  const langSel = document.getElementById("lang-selector");
  if (langSel) {
    langSel.value = userLang;
    langSel.addEventListener("change", (e) => {
      window.i18next.changeLanguage(e.target.value);
    });
  }
};

document.addEventListener("DOMContentLoaded", window.initI18n);

"use strict";

const TASK_NAME = "TK_Reactor";
const TASK_TIMEOUT_MS = 12000;

/* =========================================================================
 * PROVIDER_REGISTRY — substitui PROVIDERS_META + EVENTS_META + PROVIDER_EVENTS
 * + CONDITION_OPERATORS(allowlist) + EVENT_ALLOWED_OPERATORS + SINGLE_ENDS_WITH_EVENTS
 * ========================================================================= */

const CONDITION_OPERATORS = {
  match: "Igual a",
  contains: "Contém",
  starts_with: "Começa com",
  ends_with: "Termina com",
  regex: "Regex"
};

const PROVIDER_REGISTRY = {
  keyboard: {
    name: "Keyboard",
    description: "Eventos relacionados à digitação",
    icon: "keyboard",
    implemented: true,
    events: {
      typed_text: {
        label: "Texto digitado",
        matchField: null,
        matchFieldOptions: null,
        allowedOperators: ["ends_with"],
        lockedCondition: true,
        variables: [
          { key: "trigger", label: "Gatilho reconhecido", example: "@pix" },
          {
            key: "input",
            label: "Texto digitado antes do gatilho",
            example: "Pode me mandar a chave "
          },
          {
            key: "app_package",
            label: "Pacote do app onde o campo está",
            example: "com.whatsapp"
          },
          { key: "app_name", label: "Nome amigável do app", example: "WhatsApp" }
        ]
      }
    }
  },
  app: {
    name: "App",
    description: "Eventos relacionados aos aplicativos",
    icon: "app",
    implemented: true,
    events: {
      app_opened: {
        label: "Aplicativo aberto",
        matchField: null,
        matchFieldOptions: null,
        allowedOperators: [
          "match",
          "contains",
          "starts_with",
          "ends_with",
          "regex"
        ],
        lockedCondition: false,
        variables: [
          {
            key: "app_package",
            label: "Pacote do app aberto",
            example: "com.whatsapp"
          },
          { key: "app_name", label: "Nome amigável do app", example: "WhatsApp" }
        ]
      }
    }
  },
  notification: {
    name: "Notification",
    description: "Eventos de notificações",
    icon: "bell",
    implemented: true,
    events: {
      notification_received: {
        label: "Notificação recebida",
        matchField: "body",
        matchFieldOptions: ["title", "body", "full_text", "app_package"],
        allowedOperators: [
          "match",
          "contains",
          "starts_with",
          "ends_with",
          "regex"
        ],
        lockedCondition: false,
        variables: [
          {
            key: "app_package",
            label: "Pacote do app que notificou",
            example: "com.whatsapp"
          },
          { key: "app_name", label: "Nome amigável do app", example: "WhatsApp" },
          { key: "title", label: "Título da notificação", example: "João Silva" },
          { key: "body", label: "Corpo da notificação", example: "Chegou o Pix?" },
          {
            key: "full_text",
            label: "Título + corpo concatenados",
            example: "João Silva Chegou o Pix?"
          }
        ]
      }
    }
  },
  clipboard: {
    name: "Clipboard",
    description: "Monitoramento da área de transferência",
    icon: "clipboard",
    implemented: false,
    events: {
      clipboard_changed: {
        label: "Clipboard alterado",
        matchField: null,
        matchFieldOptions: null,
        allowedOperators: [
          "match",
          "contains",
          "starts_with",
          "ends_with",
          "regex"
        ],
        lockedCondition: false,
        variables: [{ key: "text", label: "Conteúdo copiado", example: "https://..." }]
      }
    }
  },
  screen: {
    name: "Screen",
    description: "Monitoramento de texto na tela via Acessibilidade",
    icon: "eye",
    implemented: false,
    events: {
      screen_text_detected: {
        label: "Texto apareceu na tela",
        matchField: null,
        matchFieldOptions: null,
        allowedOperators: [
          "match",
          "contains",
          "starts_with",
          "ends_with",
          "regex"
        ],
        lockedCondition: false,
        variables: [
          { key: "text", label: "Texto detectado na tela", example: "..." },
          {
            key: "app_package",
            label: "Pacote do app em primeiro plano",
            example: "..."
          }
        ]
      }
    }
  }
};

function eventsOfProvider(providerId) {
  return Object.keys(PROVIDER_REGISTRY[providerId].events);
}

function eventDef(eventType) {
  for (const p of Object.keys(PROVIDER_REGISTRY)) {
    if (PROVIDER_REGISTRY[p].events[eventType]) return PROVIDER_REGISTRY[p].events[eventType];
  }
  return null;
}

function allowedOperatorsForEvent(eventType) {
  return eventDef(eventType).allowedOperators;
}

function isLockedConditionEvent(eventType) {
  return !!eventDef(eventType).lockedCondition;
}

function variablesOfEvent(eventType) {
  return eventDef(eventType).variables || [];
}

function hasMatchFieldChoice(eventType) {
  return !!eventDef(eventType).matchFieldOptions;
}

function isUnimplementedProvider(providerId) {
  return !PROVIDER_REGISTRY[providerId].implemented;
}

/* =========================================================================
 * ACTION_REGISTRY — substitui ACTION_TYPES_META + defaultActionConfig(switch)
 * ========================================================================= */

const ACTION_REGISTRY = {
  text_replacer: {
    label: "Text Replacer",
    archetype: "template",
    templateFields: ["text"],
    defaultConfig: () => ({ text: "" }),
    compatibleWith: evt => eventDef(evt).lockedCondition === true
  },
  clipboard: {
    label: "Definir Clipboard",
    archetype: "template",
    templateFields: ["text"],
    defaultConfig: () => ({ text: "" })
  },
  run_task: {
    label: "Executar Tarefa",
    archetype: "template",
    templateFields: ["par1", "par2"],
    defaultConfig: () => ({ task: "", par1: "", par2: "" })
  },
  open_url: {
    label: "Abrir URL",
    archetype: "template",
    templateFields: ["url"],
    defaultConfig: () => ({ url: "" })
  },
  notification: {
    label: "Criar Notificação",
    archetype: "template",
    templateFields: ["title", "body"],
    defaultConfig: () => ({ title: "", body: "" })
  },
  search: {
    label: "Pesquisar",
    archetype: "template",
    templateFields: ["query"],
    defaultConfig: () => ({ engine: "google", query: "{input}" })
  },
  open_app: {
    label: "Abrir App",
    archetype: "selector",
    defaultConfig: () => ({ package: "" })
  },
  click: {
    label: "Clicar na Tela",
    archetype: "selector",
    defaultConfig: () => ({ x: 0, y: 0 })
  },
  ai: {
    label: "Processar com IA",
    archetype: "processor",
    producesVariable: "ai_result",
    defaultConfig: evt => ({
      inputVariable: eventDef(evt).lockedCondition
        ? "input"
        : eventDef(evt).matchField || (variablesOfEvent(evt)[0] || {}).key || "",
      systemInstructions: "",
      outputMode: eventDef(evt).lockedCondition ? "replace_field" : "expose_variable"
    })
  },
  translate: {
    label: "Traduzir",
    archetype: "processor",
    producesVariable: "translate_result",
    defaultConfig: evt => ({
      inputVariable: eventDef(evt).lockedCondition
        ? "input"
        : eventDef(evt).matchField || (variablesOfEvent(evt)[0] || {}).key || "",
      language: "en",
      outputMode: eventDef(evt).lockedCondition ? "replace_field" : "expose_variable"
    })
  }
};

function allowedActionTypesForEvent(eventType) {
  return Object.keys(ACTION_REGISTRY).filter(type => {
    const meta = ACTION_REGISTRY[type];
    return meta.compatibleWith ? meta.compatibleWith(eventType) : true;
  });
}

function defaultActionConfig(type, eventType) {
  const meta = ACTION_REGISTRY[type];
  if (!meta) return {};
  return meta.defaultConfig(eventType);
}

function outputModeOptions(eventType) {
  const opts = [];
  if (isLockedConditionEvent(eventType)) opts.push(["replace_field", "Substituir campo"]);
  opts.push(["expose_variable", "Expor variável"]);
  return opts;
}

function outputModeHint(actionType, mode) {
  if (mode === "replace_field") {
    return "O resultado substitui todo o campo digitado.";
  }
  const varName = actionType === "translate" ? "translate_result" : "ai_result";
  return `O resultado fica disponível para a próxima ação da regra através de {${varName}}.`;
}

/* Variáveis disponíveis num ponto da regra: as do evento + ai_result/translate_result
 * de qualquer ação "processor" anterior na mesma regra (seção 7 do plano). */
function availableVariablesAt(draft, actionIndex) {
  const vars = variablesOfEvent(draft.event.type).slice();
  const limit = Math.min(actionIndex, draft.actions.length);
  for (let i = 0; i < limit; i++) {
    const prevAction = draft.actions[i];
    const meta = ACTION_REGISTRY[prevAction.type];
    if (meta && meta.archetype === "processor") {
      vars.push({
        key: meta.producesVariable,
        label: prevAction.type === "translate" ? "Resultado da tradução (ação anterior)" : "Resultado da IA (ação anterior)",
        example: prevAction.type === "translate" ? "Hello, how are you?" : "Resposta gerada pela IA"
      });
    }
  }
  return vars;
}

const SEARCH_ENGINES = [
  ["google", "Google"],
  ["bing", "Bing"],
  ["duckduckgo", "DuckDuckGo"],
  ["youtube", "YouTube"]
];

const LANG_OPTIONS = [
  ["en", "Inglês"],
  ["es", "Espanhol"],
  ["fr", "Francês"],
  ["de", "Alemão"],
  ["it", "Italiano"],
  ["pt", "Português"]
];

const GEMINI_MODEL_OPTIONS = [
  ["gemini-2.5-flash", "Gemini 2.5 Flash"],
  ["gemini-2.5-pro", "Gemini 2.5 Pro"],
  ["gemini-2.0-flash", "Gemini 2.0 Flash"]
];

const ICONS = {
  edit: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  copy: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
  up: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
  keyboard:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></svg>',
  app: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  clipboard:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 15h6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
};

/* =========================================================================
 * Configuração padrão — regras agrupadas por provider (seção 11 do plano)
 * ========================================================================= */

const DEFAULT_CONFIG = {
  providers: {
    keyboard: { enabled: true },
    app: { enabled: true },
    clipboard: { enabled: false },
    notification: { enabled: false },
    screen: { enabled: false }
  },
  rules_by_provider: {
    keyboard: [
      {
        id: "rule_seed1",
        enabled: true,
        name: "Resposta rápida Pix",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@pix" }],
        actions: [
          { type: "text_replacer", config: { text: "Chave PIX: 123.456.789-00" } }
        ]
      }
    ],
    app: [],
    notification: [
      {
        id: "rule_seed3",
        enabled: false,
        name: "Alerta de promoção",
        event: { type: "notification_received", matchField: "body" },
        conditions: [{ operator: "contains", value: "promoção" }],
        actions: [
          { type: "run_task", config: { task: "TK_DismissNotification" } }
        ]
      }
    ],
    clipboard: [],
    screen: []
  },
  settings: {
    theme: "dark",
    language: "pt",
    gemini: { model: "gemini-2.5-flash", apiKey: "" }
  }
};

function normalizeConfig(config) {
  const normalized = deepClone(config || {});
  if (!normalized.providers || typeof normalized.providers !== "object") {
    normalized.providers = {};
  }
  Object.keys(PROVIDER_REGISTRY).forEach(id => {
    if (
      !normalized.providers[id] ||
      typeof normalized.providers[id] !== "object"
    ) {
      normalized.providers[id] = { enabled: false };
    }
    if (isUnimplementedProvider(id)) {
      normalized.providers[id].enabled = false;
    }
  });
  if (
    !normalized.rules_by_provider ||
    typeof normalized.rules_by_provider !== "object"
  ) {
    normalized.rules_by_provider = {};
  }
  Object.keys(PROVIDER_REGISTRY).forEach(id => {
    if (!Array.isArray(normalized.rules_by_provider[id])) {
      normalized.rules_by_provider[id] = [];
    }
  });
  if (!normalized.settings || typeof normalized.settings !== "object") {
    normalized.settings = deepClone(DEFAULT_CONFIG.settings);
  }
  return normalized;
}

/* Achata rules_by_provider numa lista única (tela de Regras continua igual
 * visualmente); cada item leva um providerId atribuído na leitura, não
 * persistido (seção 11 do plano). */
function allRules() {
  const grouped = (appState.config && appState.config.rules_by_provider) || {};
  const result = [];
  Object.keys(PROVIDER_REGISTRY).forEach(providerId => {
    (grouped[providerId] || []).forEach(rule => {
      result.push(Object.assign({}, rule, { providerId }));
    });
  });
  return result;
}

/* Localiza em qual array/posição uma regra está, pelo id — usado por
 * toggle/duplicate/delete/edit para operar direto em rules_by_provider. */
function findRuleLocation(id) {
  const grouped = (appState.config && appState.config.rules_by_provider) || {};
  for (const providerId of Object.keys(PROVIDER_REGISTRY)) {
    const arr = grouped[providerId] || [];
    const index = arr.findIndex(r => r.id === id);
    if (index !== -1) return { providerId, index, arr, rule: arr[index] };
  }
  return null;
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, timeoutMessage) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function iconButton(className, iconName, title) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.title = title;
  btn.innerHTML = ICONS[iconName];
  return btn;
}

function countLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function renderCollection(container, items, emptyMessage, renderItem) {
  container.innerHTML = "";
  if (!items.length) {
    container.appendChild(el("div", "empty-hint", emptyMessage));
    return;
  }
  items.forEach((item, index) =>
    container.appendChild(renderItem(item, index))
  );
}

function emptyRule() {
  return {
    id: null,
    enabled: true,
    name: "",
    provider: "keyboard",
    event: { type: "typed_text" },
    conditions: [],
    actions: []
  };
}

function genId() {
  return `rule_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function cloneProviders(providers) {
  return deepClone(providers || {});
}

function providersEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function createTaskerEnvironment() {
  function isAvailable() {
    return typeof Tasker !== "undefined";
  }

  async function exportConfigDirect(config) {
    try {
      const dir = "/storage/emulated/0/Download";
      await Tasker.createDirectory({ dir, createParents: true });
      const fileName = `reactor-backup-${Date.now()}.json`;
      await Tasker.writeFile({
        path: `${dir}/${fileName}`,
        text: JSON.stringify(config, null, 2),
        append: false
      });
      return { ok: true, message: `Exportado para Download/${fileName}` };
    } catch (error) {
      return { ok: false, error: `Falha ao exportar: ${error.message}` };
    }
  }

  async function runAction(action, payload) {
    if (action === "export_config") {
      return exportConfigDirect((payload || {}).config);
    }

    const variables = {
      par1: action,
      par2: JSON.stringify(payload || {})
    };
    let raw = null;
    try {
      const result = await withTimeout(
        Tasker.runTaskForResult({ name: TASK_NAME, variables }),
        TASK_TIMEOUT_MS,
        `Tempo esgotado aguardando resposta da tarefa ${TASK_NAME}`
      );
      raw = result ? result.returnValue : null;
    } catch (error) {
      return {
        ok: false,
        error: `Falha ao chamar ${TASK_NAME}: ${error.message}`
      };
    }
    if (!raw) {
      return {
        ok: false,
        error: `Sem resposta da tarefa ${TASK_NAME}. Verifique se ela existe no Tasker.`
      };
    }
    const parsed = safeParseJSON(raw);
    return (
      parsed || {
        ok: false,
        error: "Resposta inválida da tarefa (JSON malformado)."
      }
    );
  }

  return { isAvailable, runAction };
}

function createWebEnvironment() {
  let store = null;
  let monitorActive = false;

  async function runAction(action, payload) {
    payload = payload || {};
    switch (action) {
      case "get_status":
        return {
          ok: true,
          monitorActive,
          config: store ? deepClone(store) : null
        };

      case "toggle_monitor":
        monitorActive = !monitorActive;
        return {
          ok: true,
          monitorActive,
          message: monitorActive ? "Monitor iniciado" : "Monitor parado"
        };

      case "save_config":
        store = deepClone(payload.config);
        return {
          ok: true,
          monitorActive,
          needsRestart: !!payload.providersChanged && monitorActive,
          message: "Configuração salva"
        };

      case "export_config":
        try {
          const blob = new Blob([JSON.stringify(payload.config, null, 2)], {
            type: "application/json"
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "reactor.json";
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          return { ok: true, monitorActive, message: "Configuração exportada" };
        } catch (error) {
          return { ok: false, error: `Falha ao exportar: ${error.message}` };
        }

      default:
        return { ok: false, error: `Ação desconhecida: ${action}` };
    }
  }

  return { isAvailable: () => true, runAction };
}

function selectEnvironment() {
  const taskerEnvironment = createTaskerEnvironment();
  return taskerEnvironment.isAvailable()
    ? taskerEnvironment
    : createWebEnvironment();
}

const environment = selectEnvironment();

const appState = {
  monitorActive: false,
  restarting: false,
  config: {
    providers: {},
    rules_by_provider: {},
    settings: {
      theme: "dark",
      language: "pt",
      gemini: { model: "gemini-2.5-flash", apiKey: "" }
    }
  },
  activeTab: "dashboard"
};

const dom = {};

function cacheDom() {
  dom.masterSwitch = document.getElementById("masterSwitch");
  dom.masterLed = document.getElementById("masterLed");
  dom.masterState = document.getElementById("masterState");

  dom.tabButtons = Array.from(document.querySelectorAll(".tab"));
  dom.pages = Array.from(document.querySelectorAll(".page"));

  dom.statRulesTotal = document.getElementById("statRulesTotal");
  dom.statRulesActive = document.getElementById("statRulesActive");
  dom.statProvidersActive = document.getElementById("statProvidersActive");
  dom.statMonitorState = document.getElementById("statMonitorState");
  dom.flowTrack = document.getElementById("flowTrack");
  dom.powerCardTitle = document.getElementById("powerCardTitle");
  dom.powerCardSubtitle = document.getElementById("powerCardSubtitle");
  dom.powerToggleBtn = document.getElementById("powerToggleBtn");

  dom.addRuleBtn = document.getElementById("addRuleBtn");
  dom.rulesCountLabel = document.getElementById("rulesCountLabel");
  dom.ruleList = document.getElementById("ruleList");

  dom.providersCountLabel = document.getElementById("providersCountLabel");
  dom.providerList = document.getElementById("providerList");

  dom.themeSelect = document.getElementById("themeSelect");
  dom.langSelect = document.getElementById("langSelect");
  dom.geminiModelSelect = document.getElementById("geminiModelSelect");
  dom.geminiApiKeyInput = document.getElementById("geminiApiKeyInput");
  dom.exportConfigBtn = document.getElementById("exportConfigBtn");
  dom.importConfigBtn = document.getElementById("importConfigBtn");
  dom.importFileInput = document.getElementById("importFileInput");

  dom.toast = document.getElementById("toast");
  dom.toastMsg = document.getElementById("toastMsg");
  dom.toastText = document.getElementById("toastText");
  dom.dialogRoot = document.getElementById("dialogRoot");
}

let toastTimer = null;
function showToast(message, isError) {
  dom.toastText.textContent = message;
  dom.toastMsg.className = `msg ${isError ? "err" : "ok"}`;
  dom.toast.style.display = "flex";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toast.style.display = "none";
  }, 3200);
}

function applyTheme(theme) {
  const value = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", value);
  document.documentElement.style.colorScheme = value;
}

async function performAction(action, payload) {
  const response = await environment.runAction(action, payload || {});
  if (typeof response.monitorActive === "boolean") {
    appState.monitorActive = response.monitorActive;
  }
  syncUI();

  const feedback = response.error || response.message;
  if (feedback) showToast(feedback, response.ok === false);

  return response;
}

async function toggleMonitorQuiet() {
  const response = await environment.runAction("toggle_monitor", {});
  if (typeof response.monitorActive === "boolean") {
    appState.monitorActive = response.monitorActive;
  }
  if (response.error) showToast(response.error, true);
  return response;
}

async function restartMonitor() {
  appState.restarting = true;
  syncUI();

  try {
    await toggleMonitorQuiet();
    // Dá tempo da assinatura RxJava antiga (debounce/takeUntil cruzam thread)
    // realmente se desinscrever antes de reabrir — sem isso, um evento de
    // acessibilidade em trânsito pode ser processado por ambas as assinaturas
    // e disparar uma regra em duplicidade.
    await sleep(400);
    await toggleMonitorQuiet();
  } finally {
    // Garante que o card nunca fique preso em "Reiniciando..." mesmo se a
    // tarefa do Tasker travar/estourar o timeout ou lançar um erro inesperado.
    appState.restarting = false;
    syncUI();
  }
}

async function performConfigMutation(mutateFn, successMessage) {
  const beforeProviders = cloneProviders(appState.config.providers);
  const backup = deepClone(appState.config);

  try {
    mutateFn();
  } catch (error) {
    showToast(error.message, true);
    syncUI();
    return { ok: false, error: error.message };
  }

  const providersChanged = !providersEqual(
    beforeProviders,
    appState.config.providers
  );
  const response = await environment.runAction("save_config", {
    config: appState.config,
    providersChanged
  });

  if (response.ok === false) {
    appState.config = backup;
  }
  if (typeof response.monitorActive === "boolean") {
    appState.monitorActive = response.monitorActive;
  }
  syncUI();

  const feedback =
    response.error ||
    response.message ||
    (response.ok !== false ? successMessage : null);
  if (feedback) showToast(feedback, response.ok === false);
  if (response.needsRestart) {
    await restartMonitor();
  }

  return response;
}

function switchTab(pageId) {
  appState.activeTab = pageId;
  dom.tabButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });
  dom.pages.forEach(page => {
    page.hidden = page.dataset.page !== pageId;
  });
}

function bindTabs() {
  dom.tabButtons.forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.page));
  });
}

function setMonitorControlsDisabled(disabled) {
  dom.masterSwitch.disabled = disabled;
  dom.powerToggleBtn.disabled = disabled;
}

function updateMasterPower() {
  setMonitorControlsDisabled(appState.restarting);

  if (appState.restarting) {
    dom.masterLed.className = "led restarting";
    dom.masterState.textContent = "REINICIANDO...";
    return;
  }

  dom.masterSwitch.checked = appState.monitorActive;
  dom.masterLed.className = `led ${appState.monitorActive ? "on" : "off"}`;
  dom.masterState.textContent = appState.monitorActive ? "ATIVO" : "PARADO";
}

function handleMonitorToggleRequest() {
  if (appState.restarting) return;
  performAction("toggle_monitor", {});
}

function updatePowerCard() {
  const restarting = appState.restarting;
  const active = appState.monitorActive;

  dom.powerCardTitle.textContent = restarting
    ? "Reiniciando monitor"
    : active
      ? "Monitor ativo"
      : "Monitor parado";
  dom.powerCardSubtitle.textContent = restarting
    ? "Aplicando mudança de providers…"
    : active
      ? "Reagindo a eventos em tempo real."
      : "Nenhum evento está sendo observado.";
  dom.powerToggleBtn.textContent = restarting
    ? "Reiniciando..."
    : active
      ? "Parar"
      : "Iniciar";
  dom.powerToggleBtn.classList.toggle("on", !restarting && active);
  dom.powerToggleBtn.classList.toggle("restarting", restarting);
}

function updateDashboardCards() {
  const rules = allRules();
  const providers = appState.config.providers || {};
  const providerIds = Object.keys(PROVIDER_REGISTRY);
  const activeRules = rules.filter(r => r.enabled).length;
  const activeProviders = providerIds.filter(
    id => providers[id] && providers[id].enabled
  ).length;

  dom.statRulesTotal.textContent = String(rules.length);
  dom.statRulesActive.textContent = String(activeRules);
  dom.statProvidersActive.textContent = `${activeProviders}/${providerIds.length}`;
  dom.statMonitorState.textContent = appState.restarting
    ? "Reiniciando"
    : appState.monitorActive
      ? "Ligado"
      : "Desligado";

  dom.flowTrack.classList.toggle(
    "live",
    appState.restarting || appState.monitorActive
  );

  updatePowerCard();
}

function providerBadge(providerId) {
  const meta = PROVIDER_REGISTRY[providerId];
  const badge = el("span", "provider-badge");
  badge.innerHTML = ICONS[meta.icon] || "";
  badge.appendChild(document.createTextNode(meta.name));
  return badge;
}

function buildRuleRow(rule) {
  const row = el("div", `rule-row${rule.enabled ? "" : " off"}`);
  row.dataset.ruleId = rule.id;

  const dot = el("span", "rule-dot");
  dot.dataset.action = "toggle";
  dot.title = "Ativar/Desativar";
  row.appendChild(dot);

  const info = el("div", "rule-info");
  const top = el("div", "rule-top");
  top.appendChild(el("span", "rule-name", rule.name));
  top.appendChild(providerBadge(rule.providerId));
  info.appendChild(top);

  const def = eventDef(rule.event.type);
  const flow = el("div", "rule-flow");
  flow.appendChild(
    el("span", "flow-part", def ? def.label : rule.event.type)
  );
  flow.appendChild(el("span", "flow-sep", "›"));
  flow.appendChild(
    el(
      "span",
      "flow-part",
      countLabel(rule.conditions.length, "condição", "condições")
    )
  );
  flow.appendChild(el("span", "flow-sep", "›"));
  flow.appendChild(
    el("span", "flow-part", countLabel(rule.actions.length, "ação", "ações"))
  );
  info.appendChild(flow);
  row.appendChild(info);

  const actions = el("div", "rule-actions");
  const editBtn = iconButton("icon-btn", "edit", "Editar");
  editBtn.dataset.action = "edit";
  const dupBtn = iconButton("icon-btn", "copy", "Duplicar");
  dupBtn.dataset.action = "duplicate";
  const delBtn = iconButton("icon-btn danger", "trash", "Excluir");
  delBtn.dataset.action = "delete";
  actions.appendChild(editBtn);
  actions.appendChild(dupBtn);
  actions.appendChild(delBtn);
  row.appendChild(actions);

  return row;
}

function renderRuleList() {
  renderCollection(
    dom.ruleList,
    allRules(),
    "Nenhuma regra cadastrada ainda.",
    buildRuleRow
  );
}

function updateRulesPageStats() {
  const rules = allRules();
  const activeCount = rules.filter(r => r.enabled).length;
  dom.rulesCountLabel.textContent = `${countLabel(rules.length, "regra", "regras")} · ${countLabel(
    activeCount,
    "ativa",
    "ativas"
  )}`;
}

function toggleRule(rule) {
  return performConfigMutation(() => {
    const loc = findRuleLocation(rule.id);
    if (!loc) throw new Error("Regra não encontrada");
    loc.rule.enabled = !loc.rule.enabled;
  }, "Regra atualizada");
}

function duplicateRule(rule) {
  return performConfigMutation(() => {
    const loc = findRuleLocation(rule.id);
    if (!loc) throw new Error("Regra não encontrada");
    const clone = deepClone(loc.rule);
    clone.id = genId();
    clone.name = `${clone.name} (cópia)`;
    loc.arr.splice(loc.index + 1, 0, clone);
  }, "Regra duplicada");
}

function deleteRule(rule) {
  return performConfigMutation(() => {
    const loc = findRuleLocation(rule.id);
    if (!loc) throw new Error("Regra não encontrada");
    loc.arr.splice(loc.index, 1);
  }, "Regra excluída");
}

function handleRuleListClick(event) {
  const target = event.target.closest("[data-action]");
  const row = event.target.closest("[data-rule-id]");
  if (!target || !row) return;
  const rule = allRules().find(r => r.id === row.dataset.ruleId);
  if (!rule) return;

  switch (target.dataset.action) {
    case "toggle":
      toggleRule(rule);
      break;
    case "edit":
      openRuleDialog(rule);
      break;
    case "duplicate":
      duplicateRule(rule);
      break;
    case "delete":
      deleteRule(rule);
      break;
  }
}

function bindRulesPage() {
  dom.addRuleBtn.addEventListener("click", () => openRuleDialog(null));
  dom.ruleList.addEventListener("click", handleRuleListClick);
}

function buildProviderRow(id) {
  const meta = PROVIDER_REGISTRY[id];
  const providers = appState.config.providers || {};
  const enabled = !!(providers[id] && providers[id].enabled);
  const live = enabled && appState.monitorActive;

  const row = el("div", `provider-row${enabled ? "" : " off"}`);
  row.dataset.providerId = id;

  const iconWrap = el("span", "provider-icon");
  iconWrap.innerHTML = ICONS[meta.icon] || "";
  row.appendChild(iconWrap);

  const info = el("div", "provider-info");
  const nameRow = el("div", "provider-name-row");
  nameRow.appendChild(el("span", "provider-name", meta.name));
  if (live) nameRow.appendChild(el("span", "chip ok", "monitorando"));
  info.appendChild(nameRow);
  info.appendChild(el("div", "provider-desc", meta.description));
  row.appendChild(info);

  const sw = el("label", "switch sm");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = enabled;
  sw.appendChild(input);
  sw.appendChild(el("span", "track"));
  sw.appendChild(el("span", "knob"));
  row.appendChild(sw);

  return row;
}

function updateProviderRow(row, id) {
  const providers = appState.config.providers || {};
  const enabled = !!(providers[id] && providers[id].enabled);
  const live = enabled && appState.monitorActive;

  row.classList.toggle("off", !enabled);

  const nameRow = row.querySelector(".provider-name-row");
  const chip = nameRow.querySelector(".chip.ok");
  if (live && !chip) {
    nameRow.appendChild(el("span", "chip ok", "monitorando"));
  } else if (!live && chip) {
    chip.remove();
  }

  const input = row.querySelector('input[type="checkbox"]');
  if (input.checked !== enabled) input.checked = enabled;
}

function renderProviderList() {
  const ids = Object.keys(PROVIDER_REGISTRY);
  const existingRows = new Map(
    Array.from(dom.providerList.children).map(row => [
      row.dataset.providerId,
      row
    ])
  );
  const sameStructure =
    existingRows.size === ids.length && ids.every(id => existingRows.has(id));

  if (!sameStructure) {
    renderCollection(
      dom.providerList,
      ids,
      "Nenhum provider disponível.",
      buildProviderRow
    );
    return;
  }

  // Atualiza as rows existentes em vez de recriá-las, preservando o nó do
  // input/knob para que a transição CSS do toggle seja exibida corretamente.
  ids.forEach(id => updateProviderRow(existingRows.get(id), id));
}

function updateProvidersPageStats() {
  const providers = appState.config.providers || {};
  const ids = Object.keys(PROVIDER_REGISTRY);
  const activeCount = ids.filter(
    id => providers[id] && providers[id].enabled
  ).length;
  dom.providersCountLabel.textContent = `${activeCount} de ${ids.length} ${
    activeCount === 1 ? "ativo" : "ativos"
  }`;
}

function setProviderEnabled(id, enabled) {
  return performConfigMutation(() => {
    appState.config.providers[id].enabled = enabled;
  }, "Provider atualizado");
}

function handleProviderListChange(event) {
  const input = event.target.closest('input[type="checkbox"]');
  const row = event.target.closest("[data-provider-id]");
  if (!input || !row) return;

  const id = row.dataset.providerId;
  const meta = PROVIDER_REGISTRY[id];

  if (isUnimplementedProvider(id)) {
    const triedToEnable = input.checked;
    input.checked = false;
    setProviderEnabled(id, false).then(() => {
      if (triedToEnable)
        showToast(`${meta.name} ainda não foi implementado`, true);
    });
    return;
  }

  setProviderEnabled(id, input.checked);
}

function bindProvidersPage() {
  dom.providerList.addEventListener("change", handleProviderListChange);
}

function applySettingsToForm() {
  const settings = appState.config.settings || DEFAULT_CONFIG.settings;
  const gemini = settings.gemini || DEFAULT_CONFIG.settings.gemini;
  dom.themeSelect.value = settings.theme || "dark";
  dom.langSelect.value = settings.language || "pt";
  dom.geminiModelSelect.value = gemini.model || "gemini-2.5-flash";
  dom.geminiApiKeyInput.value = gemini.apiKey || "";
}

function saveThemeSetting() {
  applyTheme(dom.themeSelect.value);
  performConfigMutation(() => {
    appState.config.settings.theme = dom.themeSelect.value;
  }, "Preferências salvas");
}

function saveLanguageSetting() {
  performConfigMutation(() => {
    appState.config.settings.language = dom.langSelect.value;
  }, "Preferências salvas");
}

function saveGeminiSettings() {
  performConfigMutation(() => {
    appState.config.settings.gemini = {
      model: dom.geminiModelSelect.value,
      apiKey: dom.geminiApiKeyInput.value
    };
  }, "Preferências salvas");
}

async function handleImportFile() {
  const file = dom.importFileInput.files[0];
  if (!file) return;
  const text = await file.text();
  const parsed = safeParseJSON(text);
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !parsed.providers ||
    !parsed.rules_by_provider ||
    typeof parsed.rules_by_provider !== "object"
  ) {
    showToast("Arquivo de configuração inválido", true);
    dom.importFileInput.value = "";
    return;
  }
  await performConfigMutation(() => {
    appState.config = normalizeConfig({
      providers: parsed.providers,
      rules_by_provider: parsed.rules_by_provider,
      settings: parsed.settings || deepClone(DEFAULT_CONFIG.settings)
    });
  }, "Configuração importada");
  applySettingsToForm();
  dom.importFileInput.value = "";
}

function bindSettingsPage() {
  dom.themeSelect.addEventListener("change", saveThemeSetting);
  dom.langSelect.addEventListener("change", saveLanguageSetting);
  dom.geminiModelSelect.addEventListener("change", saveGeminiSettings);
  dom.geminiApiKeyInput.addEventListener("change", saveGeminiSettings);
  dom.exportConfigBtn.addEventListener("click", () =>
    performAction("export_config", { config: appState.config })
  );
  dom.importConfigBtn.addEventListener("click", () =>
    dom.importFileInput.click()
  );
  dom.importFileInput.addEventListener("change", handleImportFile);
}

function syncUI() {
  updateMasterPower();
  updateDashboardCards();
  renderRuleList();
  updateRulesPageStats();
  renderProviderList();
  updateProvidersPageStats();
}

let dialogKeyHandler = null;

function closeDialog() {
  dom.dialogRoot.innerHTML = "";
  activeVarDropdown = null;
  if (dialogKeyHandler) {
    document.removeEventListener("keydown", dialogKeyHandler);
    dialogKeyHandler = null;
  }
}

function sectionLabel(number, text) {
  const label = el("div", "editor-section-label");
  if (number != null) label.appendChild(el("span", "n", `${number}·`));
  label.appendChild(document.createTextNode(text));
  return label;
}

function createBoundTextRow(label, obj, key, placeholder) {
  const row = el("div", "field-row");
  row.appendChild(el("label", null, label));
  const input = document.createElement("input");
  input.type = "text";
  input.value = obj[key] != null ? obj[key] : "";
  if (placeholder) input.placeholder = placeholder;
  input.addEventListener("input", () => {
    obj[key] = input.value;
  });
  row.appendChild(input);
  return row;
}

function createBoundNumberRow(label, obj, key) {
  const row = el("div", "field-row");
  row.appendChild(el("label", null, label));
  const input = document.createElement("input");
  input.type = "number";
  input.value = obj[key] != null ? obj[key] : 0;
  input.addEventListener("input", () => {
    obj[key] = Number(input.value) || 0;
  });
  row.appendChild(input);
  return row;
}

function createBoundSelectRow(label, obj, key, options) {
  const row = el("div", "field-row");
  row.appendChild(el("label", null, label));
  const select = document.createElement("select");
  options.forEach(([value, text]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
  });
  select.value = obj[key] || options[0][0];
  select.addEventListener("change", () => {
    obj[key] = select.value;
  });
  row.appendChild(select);
  return row;
}

/* Select vinculado a uma variável disponível naquele ponto da regra
 * (usado por inputVariable de ai/translate — seção 7 do plano). */
function createBoundVariableSelectRow(label, obj, key, vars) {
  const row = el("div", "field-row");
  row.appendChild(el("label", null, label));
  const select = document.createElement("select");
  const validKeys = vars.map(v => v.key);

  if (vars.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Nenhuma variável disponível";
    select.appendChild(option);
  } else {
    vars.forEach(v => {
      const option = document.createElement("option");
      option.value = v.key;
      option.textContent = `{${v.key}} — ${v.label}`;
      select.appendChild(option);
    });
  }

  if (validKeys.indexOf(obj[key]) === -1) {
    obj[key] = validKeys[0] || "";
  }
  select.value = obj[key];
  select.addEventListener("change", () => {
    obj[key] = select.value;
  });
  row.appendChild(select);
  return row;
}

function createBoundTextareaBlock(label, obj, key) {
  const block = el("div", "field-block");
  block.appendChild(el("label", "block-label", label));
  const textarea = document.createElement("textarea");
  textarea.value = obj[key] != null ? obj[key] : "";
  textarea.addEventListener("input", () => {
    obj[key] = textarea.value;
  });
  block.appendChild(textarea);
  return block;
}

/* Dropdown de variáveis disponíveis: uma por linha, com a explicação (label)
 * e o exemplo, para o usuário selecionar. Só aparece ao focar/clicar no
 * campo, e fecha ao clicar fora — ver attachVariableDropdown abaixo. */
function buildVariableDropdown(vars) {
  const dropdown = el("div", "var-dropdown");
  (vars || []).forEach(v => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "var-dd-item";
    item.dataset.varKey = v.key;

    const line1 = el("span", "var-dd-line1");
    line1.appendChild(el("span", "var-dd-key", `{${v.key}}`));
    if (v.label) line1.appendChild(el("span", "var-dd-label", v.label));
    item.appendChild(line1);

    if (v.example) {
      item.appendChild(el("span", "var-dd-example", `Ex: ${v.example}`));
    }
    dropdown.appendChild(item);
  });
  return dropdown;
}

/* Só um dropdown de variáveis fica aberto por vez em toda a página; um único
 * listener global cuida de fechar ao clicar fora, em vez de um listener novo
 * por campo (o que vazaria a cada re-render da lista de ações). */
let activeVarDropdown = null;

function closeActiveVarDropdown() {
  if (activeVarDropdown) activeVarDropdown.closeFn();
}

document.addEventListener("pointerdown", event => {
  if (activeVarDropdown && !activeVarDropdown.wrap.contains(event.target)) {
    closeActiveVarDropdown();
  }
});

/* Substitui o campo (input/textarea) já inserido em rowEl por uma versão
 * envolvida num wrapper posicionado, com o dropdown de variáveis anexado
 * logo abaixo — abre no foco do campo, insere {chave} no cursor ao clicar
 * numa linha, e fecha ao selecionar ou ao clicar fora. */
function attachVariableDropdown(rowEl, vars) {
  const fieldEl = rowEl.querySelector("input, textarea");
  if (!fieldEl || !vars || !vars.length) return;

  const wrap = el("div", "var-field-wrap");
  fieldEl.parentNode.insertBefore(wrap, fieldEl);
  wrap.appendChild(fieldEl);

  const dropdown = buildVariableDropdown(vars);
  wrap.appendChild(dropdown);

  function closeThisDropdown() {
    dropdown.classList.remove("open");
    if (activeVarDropdown && activeVarDropdown.wrap === wrap) {
      activeVarDropdown = null;
    }
  }
  function openThisDropdown() {
    closeActiveVarDropdown();
    dropdown.classList.add("open");
    activeVarDropdown = { wrap, closeFn: closeThisDropdown };
  }

  fieldEl.addEventListener("focus", openThisDropdown);
  // blur cobre navegação por teclado (Tab); selecionar um item não dispara
  // blur porque o pointerdown do dropdown já chama preventDefault().
  fieldEl.addEventListener("blur", closeThisDropdown);

  function selectItem(item) {
    const insertText = `{${item.dataset.varKey}}`;
    const start =
      fieldEl.selectionStart != null ? fieldEl.selectionStart : fieldEl.value.length;
    const end =
      fieldEl.selectionEnd != null ? fieldEl.selectionEnd : fieldEl.value.length;
    const current = fieldEl.value || "";
    fieldEl.value = current.slice(0, start) + insertText + current.slice(end);
    fieldEl.dispatchEvent(new Event("input"));

    closeThisDropdown();
    fieldEl.focus();
    const cursor = start + insertText.length;
    fieldEl.setSelectionRange(cursor, cursor);
  }

  // pointerdown (não click) para rodar antes do blur do campo, preservando
  // selectionStart/selectionEnd — é o evento nativo em qualquer input
  // (touch/mouse/caneta) no WebView do Tasker, sem depender da camada de
  // emulação mouse-a-partir-de-touch. preventDefault() aqui já suprime o
  // click sintetizado que viria em seguida no toque/clique normal.
  dropdown.addEventListener("pointerdown", event => {
    const item = event.target.closest(".var-dd-item");
    if (!item) return;
    event.preventDefault();
    selectItem(item);
  });

  // click como reforço só para ativação via teclado (Tab + Enter/Espaço),
  // que nunca passa por pointerdown — não duplica a inserção no toque/clique
  // porque o preventDefault() acima já impede esse click sintetizado.
  dropdown.addEventListener("click", event => {
    const item = event.target.closest(".var-dd-item");
    if (!item) return;
    selectItem(item);
  });
}

/* Anexa um campo templável ao container, com o dropdown de variáveis
 * disponíveis (se houver alguma) já vinculado ao campo. */
function appendTemplateFieldWithVariables(container, rowEl, vars) {
  container.appendChild(rowEl);
  attachVariableDropdown(rowEl, vars);
}

function buildActionConfigFields(container, action, draft, actionIndex) {
  container.innerHTML = "";
  const type = action.type;
  const config = action.config;
  const vars = availableVariablesAt(draft, actionIndex);

  if (type === "text_replacer" || type === "clipboard") {
    appendTemplateFieldWithVariables(
      container,
      createBoundTextareaBlock("Texto", config, "text"),
      vars
    );
    if (type === "text_replacer") {
      container.appendChild(
        el(
          "div",
          "hint",
          "Use {trigger} para inserir o texto do gatilho reconhecido. O texto digitado antes do gatilho (input) é mantido automaticamente antes do texto de substituição."
        )
      );
    }
  } else if (type === "run_task") {
    container.appendChild(
      createBoundTextRow("Tarefa", config, "task", "Nome da task no Tasker")
    );
    appendTemplateFieldWithVariables(
      container,
      createBoundTextRow("%par1", config, "par1"),
      vars
    );
    appendTemplateFieldWithVariables(
      container,
      createBoundTextRow("%par2", config, "par2"),
      vars
    );
  } else if (type === "open_app") {
    container.appendChild(
      createBoundTextRow("Pacote", config, "package", "com.exemplo.app")
    );
  } else if (type === "ai") {
    container.appendChild(
      createBoundVariableSelectRow("Variável de entrada", config, "inputVariable", vars)
    );
    container.appendChild(
      createBoundTextareaBlock(
        "Instruções do sistema",
        config,
        "systemInstructions"
      )
    );
    container.appendChild(
      createBoundSelectRow(
        "Modo de saída",
        config,
        "outputMode",
        outputModeOptions(draft.event.type)
      )
    );
    container.appendChild(
      el("div", "hint", outputModeHint("ai", config.outputMode))
    );
  } else if (type === "translate") {
    container.appendChild(
      createBoundVariableSelectRow("Variável de entrada", config, "inputVariable", vars)
    );
    container.appendChild(
      createBoundSelectRow("Idioma", config, "language", LANG_OPTIONS)
    );
    container.appendChild(
      createBoundSelectRow(
        "Modo de saída",
        config,
        "outputMode",
        outputModeOptions(draft.event.type)
      )
    );
    container.appendChild(
      el("div", "hint", outputModeHint("translate", config.outputMode))
    );
  } else if (type === "search") {
    container.appendChild(
      createBoundSelectRow("Mecanismo", config, "engine", SEARCH_ENGINES)
    );
    appendTemplateFieldWithVariables(
      container,
      createBoundTextRow("Consulta", config, "query", "{input}"),
      vars
    );
  } else if (type === "open_url") {
    appendTemplateFieldWithVariables(
      container,
      createBoundTextRow("URL", config, "url", "https://..."),
      vars
    );
  } else if (type === "notification") {
    appendTemplateFieldWithVariables(
      container,
      createBoundTextRow("Título", config, "title"),
      vars
    );
    appendTemplateFieldWithVariables(
      container,
      createBoundTextareaBlock("Mensagem", config, "body"),
      vars
    );
  } else if (type === "click") {
    container.appendChild(createBoundNumberRow("X", config, "x"));
    container.appendChild(createBoundNumberRow("Y", config, "y"));
  }
}

function renderConditionsList(container, draft) {
  container.innerHTML = "";
  const locked = isLockedConditionEvent(draft.event.type);

  if (locked && draft.conditions.length === 0) {
    draft.conditions.push({ operator: "ends_with", value: "" });
  }

  if (draft.conditions.length === 0) {
    container.appendChild(
      el(
        "div",
        "empty-hint",
        "Nenhuma condição — a regra sempre será executada."
      )
    );
  }

  draft.conditions.forEach((cond, index) => {
    const row = el("div", "condition-row");

    if (locked) {
      cond.operator = "ends_with";
      row.appendChild(
        el("span", "condition-op-label", CONDITION_OPERATORS.ends_with)
      );
    } else {
      const opSelect = document.createElement("select");
      allowedOperatorsForEvent(draft.event.type).forEach(op => {
        const option = document.createElement("option");
        option.value = op;
        option.textContent = CONDITION_OPERATORS[op];
        opSelect.appendChild(option);
      });
      opSelect.value = cond.operator;
      opSelect.addEventListener("change", () => {
        cond.operator = opSelect.value;
      });
      row.appendChild(opSelect);
    }

    const valInput = document.createElement("input");
    valInput.type = "text";
    valInput.value = cond.value;
    valInput.placeholder = locked ? "texto do gatilho" : "valor";
    valInput.addEventListener("input", () => {
      cond.value = valInput.value;
    });
    row.appendChild(valInput);

    if (!locked) {
      const delBtn = iconButton("icon-btn danger", "trash", "Remover condição");
      delBtn.addEventListener("click", () => {
        draft.conditions.splice(index, 1);
        renderConditionsList(container, draft);
      });
      row.appendChild(delBtn);
    }

    container.appendChild(row);
  });
}

function renderActionsList(container, draft) {
  container.innerHTML = "";
  activeVarDropdown = null;
  const allowedTypes = allowedActionTypesForEvent(draft.event.type);

  if (draft.actions.length === 0) {
    container.appendChild(
      el(
        "div",
        "empty-hint",
        "Nenhuma ação — adicione ao menos uma para que a regra tenha efeito."
      )
    );
  }

  draft.actions.forEach((action, index) => {
    const card = el("div", "action-card");
    const head = el("div", "action-card-head");

    const typeSelect = document.createElement("select");
    allowedTypes.forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = ACTION_REGISTRY[type].label;
      typeSelect.appendChild(option);
    });
    typeSelect.value = action.type;
    typeSelect.addEventListener("change", () => {
      action.type = typeSelect.value;
      action.config = defaultActionConfig(action.type, draft.event.type);
      renderActionsList(container, draft);
    });
    head.appendChild(typeSelect);

    const move = el("div", "action-card-move");
    const upBtn = iconButton("icon-btn", "up", "Mover para cima");
    upBtn.disabled = index === 0;
    upBtn.addEventListener("click", () => {
      if (index === 0) return;
      const tmp = draft.actions[index - 1];
      draft.actions[index - 1] = draft.actions[index];
      draft.actions[index] = tmp;
      renderActionsList(container, draft);
    });
    const downBtn = iconButton("icon-btn", "down", "Mover para baixo");
    downBtn.disabled = index === draft.actions.length - 1;
    downBtn.addEventListener("click", () => {
      if (index === draft.actions.length - 1) return;
      const tmp = draft.actions[index + 1];
      draft.actions[index + 1] = draft.actions[index];
      draft.actions[index] = tmp;
      renderActionsList(container, draft);
    });
    const delBtn = iconButton("icon-btn danger", "trash", "Remover ação");
    delBtn.addEventListener("click", () => {
      draft.actions.splice(index, 1);
      renderActionsList(container, draft);
    });
    move.appendChild(upBtn);
    move.appendChild(downBtn);
    move.appendChild(delBtn);
    head.appendChild(move);
    card.appendChild(head);

    const fields = el("div", "action-card-fields");
    buildActionConfigFields(fields, action, draft, index);
    card.appendChild(fields);

    container.appendChild(card);
  });
}

function openRuleDialog(existingRule) {
  closeDialog();
  const isEdit = !!existingRule;
  const draft = deepClone(existingRule || emptyRule());
  if (isEdit) draft.provider = existingRule.providerId;

  const overlay = el("div", "dialog-overlay");
  const dialog = el("div", "dialog wide");

  const head = el("div", "dialog-head");
  head.appendChild(el("b", null, isEdit ? "Editar Regra" : "Nova Regra"));
  const closeBtn = iconButton("dialog-close", "close", "Fechar");
  closeBtn.addEventListener("click", closeDialog);
  head.appendChild(closeBtn);
  dialog.appendChild(head);

  const body = el("div", "dialog-body");
  dialog.appendChild(body);

  const infoSection = el("div", "editor-section");
  infoSection.appendChild(sectionLabel(null, "Informações"));
  const nameRow = el("div", "field-row");
  nameRow.appendChild(el("label", null, "Nome"));
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = draft.name;
  nameInput.placeholder = "Nome da regra";
  nameRow.appendChild(nameInput);
  infoSection.appendChild(nameRow);
  const enabledRow = el("div", "field-row");
  enabledRow.appendChild(el("label", null, "Ativada"));
  const enabledInput = document.createElement("input");
  enabledInput.type = "checkbox";
  enabledInput.checked = draft.enabled;
  enabledInput.addEventListener("change", () => {
    draft.enabled = enabledInput.checked;
  });
  enabledRow.appendChild(enabledInput);
  infoSection.appendChild(enabledRow);
  body.appendChild(infoSection);

  const eventSection = el("div", "editor-section");
  eventSection.appendChild(sectionLabel(1, "Evento"));
  const providerRow = el("div", "field-row");
  providerRow.appendChild(el("label", null, "Provider"));
  const providerSelect = document.createElement("select");
  Object.keys(PROVIDER_REGISTRY).forEach(id => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = PROVIDER_REGISTRY[id].name;
    providerSelect.appendChild(option);
  });
  providerSelect.value = draft.provider;
  providerRow.appendChild(providerSelect);
  eventSection.appendChild(providerRow);

  const eventRow = el("div", "field-row");
  eventRow.appendChild(el("label", null, "Evento"));
  const eventSelect = document.createElement("select");
  eventRow.appendChild(eventSelect);
  eventSection.appendChild(eventRow);

  // Seletor "Campo de correspondência" — visível só quando o evento tem
  // matchFieldOptions (hoje, só notification_received) — seção 5 do plano.
  const matchFieldRow = el("div", "field-row");
  matchFieldRow.appendChild(el("label", null, "Campo"));
  const matchFieldSelect = document.createElement("select");
  matchFieldRow.appendChild(matchFieldSelect);
  eventSection.appendChild(matchFieldRow);
  matchFieldSelect.addEventListener("change", () => {
    draft.event.matchField = matchFieldSelect.value;
    updateCondHint();
  });

  const condHint = el("div", "hint");
  body.appendChild(eventSection);

  function refreshMatchFieldRow() {
    const hasChoice = hasMatchFieldChoice(draft.event.type);
    matchFieldRow.style.display = hasChoice ? "" : "none";
    if (!hasChoice) {
      delete draft.event.matchField;
      return;
    }
    const def = eventDef(draft.event.type);
    matchFieldSelect.innerHTML = "";
    def.matchFieldOptions.forEach(key => {
      const option = document.createElement("option");
      option.value = key;
      const varMeta = def.variables.find(v => v.key === key);
      option.textContent = varMeta ? `${varMeta.label} (${key})` : key;
      matchFieldSelect.appendChild(option);
    });
    if (
      !draft.event.matchField ||
      def.matchFieldOptions.indexOf(draft.event.matchField) === -1
    ) {
      draft.event.matchField = def.matchField || def.matchFieldOptions[0];
    }
    matchFieldSelect.value = draft.event.matchField;
  }

  function updateCondHint() {
    const def = eventDef(draft.event.type);
    if (def.lockedCondition) {
      condHint.textContent =
        "Condição fixa: a regra dispara quando o texto digitado termina com o valor abaixo.";
    } else if (hasMatchFieldChoice(draft.event.type)) {
      const fieldKey = draft.event.matchField || def.matchField;
      const varMeta = def.variables.find(v => v.key === fieldKey);
      condHint.textContent = `As condições abaixo são testadas contra: ${
        varMeta ? varMeta.label : fieldKey
      }.`;
    } else {
      condHint.textContent = "";
    }
  }

  function refreshEventOptions() {
    eventSelect.innerHTML = "";
    eventsOfProvider(providerSelect.value).forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = eventDef(type).label;
      eventSelect.appendChild(option);
    });
    const stillValid =
      draft.event.type &&
      PROVIDER_REGISTRY[providerSelect.value].events[draft.event.type];
    eventSelect.value = stillValid
      ? draft.event.type
      : eventsOfProvider(providerSelect.value)[0];
    draft.event.type = eventSelect.value;
  }
  refreshEventOptions();

  const condSection = el("div", "editor-section");
  condSection.appendChild(sectionLabel(2, "Condições"));
  condSection.appendChild(condHint);
  const condList = el("div");
  condSection.appendChild(condList);
  const addCondBtn = el("button", "add-row-btn");
  addCondBtn.type = "button";
  addCondBtn.innerHTML = `${ICONS.plus}<span>Adicionar condição</span>`;
  addCondBtn.addEventListener("click", () => {
    draft.conditions.push({ operator: "contains", value: "" });
    renderConditionsList(condList, draft);
  });
  condSection.appendChild(addCondBtn);
  body.appendChild(condSection);

  const actSection = el("div", "editor-section");
  actSection.appendChild(sectionLabel(3, "Ações"));
  const actList = el("div");
  actSection.appendChild(actList);
  const addActBtn = el("button", "add-row-btn");
  addActBtn.type = "button";
  addActBtn.innerHTML = `${ICONS.plus}<span>Adicionar ação</span>`;
  addActBtn.addEventListener("click", () => {
    const allowedTypes = allowedActionTypesForEvent(draft.event.type);
    const defaultType =
      allowedTypes.indexOf("text_replacer") !== -1
        ? "text_replacer"
        : allowedTypes[0];
    draft.actions.push({
      type: defaultType,
      config: defaultActionConfig(defaultType, draft.event.type)
    });
    renderActionsList(actList, draft);
  });
  actSection.appendChild(addActBtn);
  body.appendChild(actSection);

  function refreshEventDependents() {
    const locked = isLockedConditionEvent(draft.event.type);

    if (locked) {
      const preservedValue =
        draft.conditions.length === 1 ? draft.conditions[0].value : "";
      if (
        draft.conditions.length !== 1 ||
        draft.conditions[0].operator !== "ends_with"
      ) {
        draft.conditions = [{ operator: "ends_with", value: preservedValue }];
      }
    }
    refreshMatchFieldRow();
    updateCondHint();
    renderConditionsList(condList, draft);
    addCondBtn.style.display = locked ? "none" : "flex";

    const allowedTypes = allowedActionTypesForEvent(draft.event.type);
    const beforeCount = draft.actions.length;
    draft.actions = draft.actions.filter(
      action => allowedTypes.indexOf(action.type) !== -1
    );

    // Normaliza configs de ai/translate que ficaram inválidas após a troca
    // de evento (outputMode "replace_field" só vale para evento locked;
    // inputVariable precisa apontar para uma variável ainda disponível).
    draft.actions.forEach((action, idx) => {
      if (action.type === "ai" || action.type === "translate") {
        if (!locked && action.config.outputMode === "replace_field") {
          action.config.outputMode = "expose_variable";
        }
        const availableKeys = availableVariablesAt(draft, idx).map(v => v.key);
        if (availableKeys.indexOf(action.config.inputVariable) === -1) {
          action.config.inputVariable = availableKeys[0] || "";
        }
      }
    });

    const removedCount = beforeCount - draft.actions.length;
    renderActionsList(actList, draft);
    if (removedCount > 0) {
      showToast(
        `${removedCount} ${
          removedCount === 1 ? "ação removida" : "ações removidas"
        } por não serem compatíveis com este evento`,
        true
      );
    }
  }

  providerSelect.addEventListener("change", () => {
    draft.provider = providerSelect.value;
    refreshEventOptions();
    refreshEventDependents();
  });
  eventSelect.addEventListener("change", () => {
    draft.event.type = eventSelect.value;
    refreshEventDependents();
  });

  refreshEventDependents();

  const foot = el("div", "dialog-foot");
  const cancelBtn = el("button", "btn btn-ghost", "Cancelar");
  cancelBtn.type = "button";
  cancelBtn.addEventListener("click", closeDialog);
  const saveBtn = el("button", "btn btn-accent", "Salvar");
  saveBtn.type = "button";
  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) {
      showToast("Informe um nome para a regra", true);
      return;
    }
    if (draft.actions.length === 0) {
      showToast("Adicione ao menos uma ação", true);
      return;
    }
    if (isLockedConditionEvent(draft.event.type)) {
      const cond = draft.conditions[0];
      if (!cond || !cond.value || !cond.value.trim()) {
        showToast("Informe o texto do gatilho (condição 'Termina com')", true);
        return;
      }
    }
    const response = await performConfigMutation(
      () => {
        const persistedRule = {
          id: isEdit ? existingRule.id : genId(),
          enabled: draft.enabled,
          name,
          event: deepClone(draft.event),
          conditions: deepClone(draft.conditions),
          actions: deepClone(draft.actions)
        };

        if (isEdit) {
          const loc = findRuleLocation(existingRule.id);
          if (!loc) throw new Error("Regra não encontrada");
          if (loc.providerId === draft.provider) {
            loc.arr[loc.index] = persistedRule;
          } else {
            loc.arr.splice(loc.index, 1);
            if (!Array.isArray(appState.config.rules_by_provider[draft.provider])) {
              appState.config.rules_by_provider[draft.provider] = [];
            }
            appState.config.rules_by_provider[draft.provider].push(persistedRule);
          }
        } else {
          if (!Array.isArray(appState.config.rules_by_provider[draft.provider])) {
            appState.config.rules_by_provider[draft.provider] = [];
          }
          appState.config.rules_by_provider[draft.provider].push(persistedRule);
        }
      },
      isEdit ? "Regra atualizada" : "Regra criada"
    );
    if (response.ok !== false) closeDialog();
  });
  foot.appendChild(cancelBtn);
  foot.appendChild(saveBtn);
  dialog.appendChild(foot);

  overlay.appendChild(dialog);
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeDialog();
  });
  dialogKeyHandler = event => {
    if (event.key === "Escape") closeDialog();
  };
  document.addEventListener("keydown", dialogKeyHandler);

  dom.dialogRoot.appendChild(overlay);
  nameInput.focus();
}

function bindGlobalEvents() {
  bindTabs();
  dom.masterSwitch.addEventListener("change", handleMonitorToggleRequest);
  dom.powerToggleBtn.addEventListener("click", handleMonitorToggleRequest);
  bindRulesPage();
  bindProvidersPage();
  bindSettingsPage();
}

async function boot() {
  cacheDom();
  bindGlobalEvents();
  switchTab(appState.activeTab);
  applyTheme(appState.config.settings.theme);
  syncUI();
  applySettingsToForm();

  const status = await environment.runAction("get_status", {});
  if (status.ok === false) {
    showToast(status.error || "Falha ao carregar status", true);
    return;
  }
  appState.monitorActive = !!status.monitorActive;

  if (status.config) {
    appState.config = normalizeConfig(status.config);
    applyTheme(appState.config.settings.theme);
    syncUI();
    applySettingsToForm();
    return;
  }

  appState.config = normalizeConfig(DEFAULT_CONFIG);
  applyTheme(appState.config.settings.theme);
  syncUI();
  applySettingsToForm();
  const saveResponse = await environment.runAction("save_config", {
    config: appState.config,
    providersChanged: true
  });
  if (saveResponse.ok === false) {
    showToast(
      saveResponse.error || "Falha ao salvar configuração padrão",
      true
    );
  }
}

boot();

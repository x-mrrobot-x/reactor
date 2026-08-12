const TASK_NAME = "RC 02 - MONITOR CONTROL";
const TASK_TIMEOUT_MS = 12000;

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
          {
            key: "app_name",
            label: "Nome amigável do app",
            example: "WhatsApp"
          }
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
          {
            key: "app_name",
            label: "Nome amigável do app",
            example: "WhatsApp"
          }
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
          {
            key: "app_name",
            label: "Nome amigável do app",
            example: "WhatsApp"
          },
          {
            key: "title",
            label: "Título da notificação",
            example: "João Silva"
          },
          {
            key: "body",
            label: "Corpo da notificação",
            example: "Chegou o Pix?"
          },
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
        variables: [
          { key: "text", label: "Conteúdo copiado", example: "https://..." }
        ]
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
    if (PROVIDER_REGISTRY[p].events[eventType])
      return PROVIDER_REGISTRY[p].events[eventType];
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

const ACTION_REGISTRY = {
  text_replacer: {
    label: "Text Replacer",
    archetype: "template",
    templateFields: ["text"],
    defaultConfig: () => ({ text: "" }),
    compatibleWith: eventType => eventDef(eventType).lockedCondition === true
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
    defaultConfig: eventType => ({
      inputVariable: eventDef(eventType).lockedCondition
        ? "input"
        : eventDef(eventType).matchField ||
          (variablesOfEvent(eventType)[0] || {}).key ||
          "",
      systemInstructions: "",
      outputMode: eventDef(eventType).lockedCondition
        ? "replace_field"
        : "expose_variable"
    })
  },
  translate: {
    label: "Traduzir",
    archetype: "processor",
    producesVariable: "translate_result",
    defaultConfig: eventType => ({
      inputVariable: eventDef(eventType).lockedCondition
        ? "input"
        : eventDef(eventType).matchField ||
          (variablesOfEvent(eventType)[0] || {}).key ||
          "",
      language: "en",
      outputMode: eventDef(eventType).lockedCondition
        ? "replace_field"
        : "expose_variable"
    })
  }
};

function allowedActionTypesForEvent(eventType) {
  return Object.keys(ACTION_REGISTRY).filter(type => {
    const meta = ACTION_REGISTRY[type];
    return meta.compatibleWith ? meta.compatibleWith(eventType) : true;
  });
}

function defaultActionConfig(actionType, eventType) {
  const meta = ACTION_REGISTRY[actionType];
  if (!meta) return {};
  return meta.defaultConfig(eventType);
}

function outputModeOptions(eventType) {
  const opts = [];
  if (isLockedConditionEvent(eventType))
    opts.push(["replace_field", "Substituir campo"]);
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

function availableVariablesAt(draft, actionIndex) {
  const vars = variablesOfEvent(draft.event.type).slice();
  const limit = Math.min(actionIndex, draft.actions.length);
  for (let i = 0; i < limit; i++) {
    const prevAction = draft.actions[i];
    const meta = ACTION_REGISTRY[prevAction.type];
    if (meta && meta.archetype === "processor") {
      vars.push({
        key: meta.producesVariable,
        label:
          prevAction.type === "translate"
            ? "Resultado da tradução (ação anterior)"
            : "Resultado da IA (ação anterior)",
        example:
          prevAction.type === "translate"
            ? "Hello, how are you?"
            : "Resposta gerada pela IA"
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
  chevron:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
};

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
          {
            type: "text_replacer",
            config: { text: "Chave PIX: 123.456.789-00" }
          }
        ]
      },
      {
        id: "rule_seed4",
        enabled: true,
        name: "Perguntar para IA",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@ia" }],
        actions: [
          {
            type: "ai",
            config: {
              inputVariable: "input",
              systemInstructions:
                "Você é um assistente de respostas rápidas integrado ao teclado do usuário. Responda à pergunta ou pedido de forma direta, objetiva e curta — preferencialmente em uma ou duas frases, sem saudações, introduções ou explicações desnecessárias. Vá direto ao ponto, como se estivesse completando o texto que a pessoa está digitando. Não use markdown, listas ou formatação, apenas texto corrido. Se a resposta exigir um dado factual ou numérico, informe apenas o essencial.",
              outputMode: "replace_field"
            }
          }
        ]
      },

      {
        id: "rule_seed5",
        enabled: true,
        name: "Traduzir para Inglês",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@en" }],
        actions: [
          {
            type: "translate",
            config: {
              inputVariable: "input",
              language: "en",
              outputMode: "replace_field"
            }
          }
        ]
      },
      {
        id: "rule_seed6",
        enabled: true,
        name: "Traduzir para Português",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@pt" }],
        actions: [
          {
            type: "translate",
            config: {
              inputVariable: "input",
              language: "pt",
              outputMode: "replace_field"
            }
          }
        ]
      },
      {
        id: "rule_seed7",
        enabled: true,
        name: "Traduzir para Espanhol",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@es" }],
        actions: [
          {
            type: "translate",
            config: {
              inputVariable: "input",
              language: "es",
              outputMode: "replace_field"
            }
          }
        ]
      },

      {
        id: "rule_seed8",
        enabled: true,
        name: "Deixar texto formal",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@formal" }],
        actions: [
          {
            type: "ai",
            config: {
              inputVariable: "input",
              systemInstructions:
                "Reescreva o texto do usuário utilizando um tom formal e profissional, adequado para e-mails corporativos ou comunicações oficiais. Mantenha o mesmo significado e intenção da mensagem original, apenas ajustando vocabulário, gramática e estrutura das frases para soar mais educado e respeitoso. Não adicione saudações, despedidas ou informações que não estavam no texto original. Responda apenas com o texto reescrito, sem comentários adicionais.",
              outputMode: "replace_field"
            }
          }
        ]
      },
      {
        id: "rule_seed9",
        enabled: true,
        name: "Deixar texto casual",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@casual" }],
        actions: [
          {
            type: "ai",
            config: {
              inputVariable: "input",
              systemInstructions:
                "Reescreva o texto do usuário utilizando um tom casual e descontraído, como numa conversa com um amigo próximo. Simplifique frases muito formais e use uma linguagem mais leve e natural, sem soar deselegante. Mantenha o significado original da mensagem. Responda apenas com o texto reescrito, sem comentários adicionais.",
              outputMode: "replace_field"
            }
          }
        ]
      },
      {
        id: "rule_seed10",
        enabled: true,
        name: "Corrigir texto",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@corrigir" }],
        actions: [
          {
            type: "ai",
            config: {
              inputVariable: "input",
              systemInstructions:
                "Corrija a ortografia, a gramática e a pontuação do texto do usuário, mantendo o sentido, o tom e o estilo originais da mensagem. Não reescreva além do necessário para corrigir os erros — preserve a forma como a pessoa se expressa. Responda apenas com o texto corrigido, sem explicações sobre o que foi alterado.",
              outputMode: "replace_field"
            }
          }
        ]
      },
      {
        id: "rule_seed11",
        enabled: true,
        name: "Resumir texto",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@resumir" }],
        actions: [
          {
            type: "ai",
            config: {
              inputVariable: "input",
              systemInstructions:
                "Resuma o texto do usuário de forma clara e objetiva, mantendo apenas as informações mais importantes. O resumo deve ser significativamente mais curto que o original, preservando o sentido central da mensagem. Responda apenas com o resumo, sem introduções como 'aqui está o resumo' ou comentários adicionais.",
              outputMode: "replace_field"
            }
          }
        ]
      },
      {
        id: "rule_seed12",
        enabled: true,
        name: "Adicionar emojis",
        event: { type: "typed_text" },
        conditions: [{ operator: "ends_with", value: "@emoji" }],
        actions: [
          {
            type: "ai",
            config: {
              inputVariable: "input",
              systemInstructions:
                "Reescreva o texto do usuário adicionando emojis relevantes e adequados ao contexto, de forma natural e sem exagero. Não altere o conteúdo ou o significado da mensagem original — apenas insira emojis nos pontos em que fizer sentido para deixar o texto mais expressivo. Responda apenas com o texto com os emojis adicionados.",
              outputMode: "replace_field"
            }
          }
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

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function qs(selector, scope) {
  return (scope || document).querySelector(selector);
}

function qsa(selector, scope) {
  return Array.from((scope || document).querySelectorAll(selector));
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

function generateRuleId() {
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

  const pendingCalls = new Map();

  function generateCallId() {
    return `call_${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }

  function registerPendingCall(id) {
    return new Promise(resolve => {
      const timer = setTimeout(() => expirePendingCall(id), TASK_TIMEOUT_MS);
      pendingCalls.set(id, { resolve, timer });
    });
  }

  function clearPendingCall(id) {
    const entry = pendingCalls.get(id);
    if (entry) clearTimeout(entry.timer);
    pendingCalls.delete(id);
  }

  function settlePendingCall(id, payload) {
    const entry = pendingCalls.get(id);
    if (!entry) {
      console.warn(`onTaskResponse: id desconhecido ou já resolvido (${id})`);
      return;
    }
    clearPendingCall(id);
    entry.resolve(payload);
  }

  function expirePendingCall(id) {
    const entry = pendingCalls.get(id);
    if (!entry) return;
    clearPendingCall(id);
    entry.resolve({
      ok: false,
      error: `Tempo esgotado aguardando resposta da tarefa ${TASK_NAME} (${TASK_TIMEOUT_MS}ms).`
    });
  }

  function settleDispatchFailure(id, message) {
    const entry = pendingCalls.get(id);
    if (!entry) return;
    clearPendingCall(id);
    entry.resolve({ ok: false, error: message });
  }

  function onTaskResponse(base64) {
    let jsonText;
    try {
      jsonText = decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      console.warn("onTaskResponse: falha ao decodificar base64", error);
      return;
    }

    const parsed = safeParseJSON(jsonText);
    if (!parsed) {
      console.warn("onTaskResponse: JSON inválido", jsonText);
      return;
    }

    if (!parsed.id) {
      console.warn("onTaskResponse: resposta sem id", parsed);
      return;
    }

    settlePendingCall(
      parsed.id,
      parsed.payload || { ok: false, error: "Payload ausente na resposta." }
    );
  }
  window.onTaskResponse = onTaskResponse;

  async function dispatchTask(action, payload) {
    let id = generateCallId();
    while (pendingCalls.has(id)) id = generateCallId();

    const promise = registerPendingCall(id);

    const variables = {
      action: action,
      config: JSON.stringify(payload || {}),
      call_id: id
    };

    try {
      await Tasker.runTask({ name: TASK_NAME, variables, priority: 5 });
    } catch (error) {
      settleDispatchFailure(
        id,
        `Falha ao despachar ${TASK_NAME}: ${error.message}`
      );
    }

    return promise;
  }

  function runAction(action, payload) {
    if (action === "export_config") {
      return exportConfigDirect((payload || {}).config);
    }
    return dispatchTask(action, payload);
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
  busyProviderIds: new Set(),
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

const DOM_SELECTORS = {
  header: "header",
  scrollContainer: ".app",
  masterSwitch: "#masterSwitch",
  masterLed: "#masterLed",
  masterState: "#masterState",

  statRulesTotal: "#statRulesTotal",
  statRulesActive: "#statRulesActive",
  statProvidersActive: "#statProvidersActive",
  statMonitorState: "#statMonitorState",
  flowTrack: "#flowTrack",
  powerCardTitle: "#powerCardTitle",
  powerCardSubtitle: "#powerCardSubtitle",
  powerToggleBtn: "#powerToggleBtn",

  addRuleBtn: "#addRuleBtn",
  rulesCountLabel: "#rulesCountLabel",
  ruleList: "#ruleList",
  ruleSearchInput: "#ruleSearchInput",

  providersCountLabel: "#providersCountLabel",
  providerList: "#providerList",

  themeSelect: "#themeSelect",
  langSelect: "#langSelect",
  geminiModelSelect: "#geminiModelSelect",
  geminiApiKeyInput: "#geminiApiKeyInput",
  geminiApiKeyWarning: "#geminiApiKeyWarning",
  exportConfigBtn: "#exportConfigBtn",
  importConfigBtn: "#importConfigBtn",
  importFileInput: "#importFileInput",

  toast: "#toast",
  toastMsg: "#toastMsg",
  toastText: "#toastText",
  dialogRoot: "#dialogRoot"
};

const DOM_SELECTOR_LISTS = {
  tabButtons: ".tab",
  pages: ".page"
};

function cacheDom() {
  Object.keys(DOM_SELECTORS).forEach(key => {
    dom[key] = qs(DOM_SELECTORS[key]);
  });
  Object.keys(DOM_SELECTOR_LISTS).forEach(key => {
    dom[key] = qsa(DOM_SELECTOR_LISTS[key]);
  });
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

let configMutationQueue = Promise.resolve();

function performConfigMutation(mutateFn, successMessage) {
  const task = configMutationQueue.then(() =>
    runConfigMutation(mutateFn, successMessage)
  );
  configMutationQueue = task.catch(() => {});
  return task;
}

async function runConfigMutation(mutateFn, successMessage) {
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
    (response.ok !== false
      ? successMessage || response.message
      : response.message);
  if (feedback) showToast(feedback, response.ok === false);

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
  resetContentScroll();
}

function bindTabs() {
  dom.tabButtons.forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.page));
  });
}

function updateMasterPower() {
  dom.masterSwitch.checked = appState.monitorActive;
  dom.masterLed.className = `led ${appState.monitorActive ? "on" : "off"}`;
  dom.masterState.textContent = appState.monitorActive ? "ATIVO" : "PARADO";
}

function handleMonitorToggleRequest() {
  performAction("toggle_monitor", {});
}

function updatePowerCard() {
  const active = appState.monitorActive;

  dom.powerCardTitle.textContent = active ? "Monitor ativo" : "Monitor parado";
  dom.powerCardSubtitle.textContent = active
    ? "Reagindo a eventos em tempo real."
    : "Nenhum evento está sendo observado.";
  dom.powerToggleBtn.textContent = active ? "Parar" : "Iniciar";
  dom.powerToggleBtn.classList.toggle("on", active);
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
  dom.statMonitorState.textContent = appState.monitorActive
    ? "Ligado"
    : "Desligado";

  dom.flowTrack.classList.toggle("live", appState.monitorActive);

  updatePowerCard();
}

function providerBadge(providerId) {
  const meta = PROVIDER_REGISTRY[providerId];
  const badge = el("span", "provider-badge");
  badge.innerHTML = ICONS[meta.icon] || "";
  badge.appendChild(document.createTextNode(meta.name));
  return badge;
}

const expandedRules = new Set();

function actionSummary(action) {
  const meta = ACTION_REGISTRY[action.type];
  const label = meta ? meta.label : action.type;
  const cfg = action.config || {};
  let detail = "";
  if (cfg.text) detail = cfg.text;
  else if (cfg.url) detail = cfg.url;
  else if (cfg.query) detail = cfg.query;
  else if (cfg.title) detail = cfg.title;
  else if (cfg.task) detail = cfg.task;
  else if (cfg.package) detail = cfg.package;
  else if (cfg.language) detail = `para ${cfg.language}`;
  else if (cfg.systemInstructions) detail = cfg.systemInstructions;
  else if (cfg.x != null && cfg.y != null && action.type === "click")
    detail = `${cfg.x}, ${cfg.y}`;
  if (detail.length > 60) detail = `${detail.slice(0, 60)}…`;
  return { label, detail };
}

function conditionSummary(cond) {
  const op = CONDITION_OPERATORS[cond.operator] || cond.operator;
  const field = cond.field ? `${cond.field} ` : "";
  return `${field}${op} “${cond.value || ""}”`;
}

function ruleSearchText(rule) {
  const def = eventDef(rule.event.type);
  const meta = PROVIDER_REGISTRY[rule.providerId];
  const parts = [
    rule.name,
    def ? def.label : rule.event.type,
    meta ? meta.name : rule.providerId
  ];
  (rule.conditions || []).forEach(c => parts.push(c.value));
  (rule.actions || []).forEach(a => {
    const s = actionSummary(a);
    parts.push(s.label, s.detail);
  });
  return parts.join(" ").toLowerCase();
}

function buildRuleDetails(rule) {
  const details = el("div", "rule-details");
  const def = eventDef(rule.event.type);

  const metaGrid = el("div", "rule-meta-grid");
  function metaItem(label, value) {
    const item = el("div", "rule-meta-item");
    item.appendChild(el("span", "rule-meta-label", label));
    item.appendChild(el("span", "rule-meta-value", value));
    metaGrid.appendChild(item);
  }
  metaItem("Status", rule.enabled ? "Ativa" : "Inativa");
  metaItem("Evento", def ? def.label : rule.event.type);
  metaItem(
    "Provider",
    PROVIDER_REGISTRY[rule.providerId]
      ? PROVIDER_REGISTRY[rule.providerId].name
      : rule.providerId
  );
  if (rule.event.matchField) metaItem("Campo avaliado", rule.event.matchField);
  details.appendChild(metaGrid);

  const condBlock = el("div", "rule-block");
  condBlock.appendChild(
    el("div", "rule-block-title", `Condições (${rule.conditions.length})`)
  );
  if (!rule.conditions.length) {
    condBlock.appendChild(
      el("div", "rule-block-empty", "Sem condições — sempre executa.")
    );
  } else {
    rule.conditions.forEach(cond => {
      condBlock.appendChild(el("div", "rule-line", conditionSummary(cond)));
    });
  }
  details.appendChild(condBlock);

  const actBlock = el("div", "rule-block");
  actBlock.appendChild(
    el("div", "rule-block-title", `Ações (${rule.actions.length})`)
  );
  if (!rule.actions.length) {
    actBlock.appendChild(el("div", "rule-block-empty", "Nenhuma ação."));
  } else {
    rule.actions.forEach((action, index) => {
      const info = actionSummary(action);
      const line = el("div", "rule-line");
      line.appendChild(el("span", "rule-line-idx", `${index + 1}`));
      line.appendChild(el("span", "rule-line-main", info.label));
      if (info.detail)
        line.appendChild(el("span", "rule-line-sub", info.detail));
      actBlock.appendChild(line);
    });
  }
  details.appendChild(actBlock);

  const actions = el("div", "rule-actions");
  const toggleBtn = el(
    "button",
    "btn-ghost-sm",
    rule.enabled ? "Desativar" : "Ativar"
  );
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  const editBtn = iconButton("icon-btn", "edit", "Editar");
  editBtn.dataset.action = "edit";
  const dupBtn = iconButton("icon-btn", "copy", "Duplicar");
  dupBtn.dataset.action = "duplicate";
  const delBtn = iconButton("icon-btn danger", "trash", "Excluir");
  delBtn.dataset.action = "delete";
  actions.appendChild(toggleBtn);
  actions.appendChild(editBtn);
  actions.appendChild(dupBtn);
  actions.appendChild(delBtn);
  details.appendChild(actions);

  return details;
}

function buildRuleRow(rule) {
  const expanded = expandedRules.has(rule.id);
  const row = el(
    "div",
    `card rule-row${rule.enabled ? "" : " off"}${expanded ? " expanded" : ""}`
  );
  row.dataset.ruleId = rule.id;

  const head = el("div", "rule-head");
  head.dataset.action = "expand";

  const dot = el("span", "rule-dot");
  head.appendChild(dot);

  const info = el("div", "rule-info");
  const top = el("div", "rule-top");
  top.appendChild(el("span", "rule-name", rule.name));
  top.appendChild(providerBadge(rule.providerId));
  info.appendChild(top);

  const def = eventDef(rule.event.type);
  const flow = el("div", "rule-flow");
  flow.appendChild(el("span", "flow-part", def ? def.label : rule.event.type));
  flow.appendChild(el("span", "flow-sep", "›"));
  flow.appendChild(
    el("span", "flow-part", countLabel(rule.actions.length, "ação", "ações"))
  );
  info.appendChild(flow);
  head.appendChild(info);

  const chevron = el("span", "rule-chevron");
  chevron.innerHTML = ICONS.chevron;
  head.appendChild(chevron);
  row.appendChild(head);

  if (expanded) row.appendChild(buildRuleDetails(rule));

  return row;
}

let ruleSearchQuery = "";

function filteredRules() {
  const q = ruleSearchQuery.trim().toLowerCase();
  const rules = allRules();
  if (!q) return rules;
  return rules.filter(rule => ruleSearchText(rule).includes(q));
}

function renderRuleList() {
  const rules = filteredRules();
  renderCollection(
    dom.ruleList,
    rules,
    ruleSearchQuery.trim()
      ? "Nenhuma regra encontrada para esta busca."
      : "Nenhuma regra cadastrada ainda.",
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
  const nextEnabled = !rule.enabled;
  return performConfigMutation(
    () => {
      const loc = findRuleLocation(rule.id);
      if (!loc) throw new Error("Regra não encontrada");
      loc.rule.enabled = nextEnabled;
    },
    nextEnabled ? "Regra ativada" : "Regra desativada"
  );
}

function duplicateRule(rule) {
  return performConfigMutation(() => {
    const loc = findRuleLocation(rule.id);
    if (!loc) throw new Error("Regra não encontrada");
    const clone = deepClone(loc.rule);
    clone.id = generateRuleId();
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

function confirmDeleteRule(rule) {
  const overlay = el("div", "dialog-overlay");
  const dialog = el("div", "dialog confirm-dialog");

  const iconWrap = el("div", "confirm-icon");
  iconWrap.innerHTML = ICONS.alert;
  dialog.appendChild(iconWrap);

  dialog.appendChild(el("h3", "confirm-title", "Excluir regra?"));
  dialog.appendChild(
    el(
      "p",
      "confirm-text",
      `A regra “${rule.name}” será removida permanentemente. Essa ação não pode ser desfeita.`
    )
  );

  const foot = el("div", "dialog-foot");
  const cancelBtn = el("button", "btn btn-ghost", "Cancelar");
  cancelBtn.type = "button";
  cancelBtn.addEventListener("click", closeDialog);
  const confirmBtn = el("button", "btn btn-danger", "Excluir");
  confirmBtn.type = "button";
  confirmBtn.addEventListener("click", () => {
    closeDialog();
    expandedRules.delete(rule.id);
    deleteRule(rule);
  });
  foot.appendChild(cancelBtn);
  foot.appendChild(confirmBtn);
  dialog.appendChild(foot);

  overlay.appendChild(dialog);
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeDialog();
  });
  dom.dialogRoot.innerHTML = "";
  dom.dialogRoot.appendChild(overlay);
  dialogKeyHandler = event => {
    if (event.key === "Escape") closeDialog();
  };
  document.addEventListener("keydown", dialogKeyHandler);
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
      confirmDeleteRule(rule);
      break;
    case "expand":
      if (expandedRules.has(rule.id)) expandedRules.delete(rule.id);
      else expandedRules.add(rule.id);
      renderRuleList();
      break;
  }
}

function bindRulesPage() {
  dom.addRuleBtn.addEventListener("click", () => openRuleDialog(null));
  dom.ruleList.addEventListener("click", handleRuleListClick);
  if (dom.ruleSearchInput) {
    dom.ruleSearchInput.addEventListener("input", () => {
      ruleSearchQuery = dom.ruleSearchInput.value;
      renderRuleList();
    });
  }
}

function buildProviderRow(id) {
  const meta = PROVIDER_REGISTRY[id];
  const providers = appState.config.providers || {};
  const enabled = !!(providers[id] && providers[id].enabled);
  const live = enabled && appState.monitorActive;

  const row = el("div", `card provider-row${enabled ? "" : " off"}`);
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

  const switchLabel = el("label", "switch sm");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = enabled;
  input.disabled = appState.busyProviderIds.has(id);
  switchLabel.appendChild(input);
  switchLabel.appendChild(el("span", "track"));
  switchLabel.appendChild(el("span", "knob"));
  row.appendChild(switchLabel);

  return row;
}

function updateProviderRow(row, id) {
  const providers = appState.config.providers || {};
  const enabled = !!(providers[id] && providers[id].enabled);
  const live = enabled && appState.monitorActive;

  row.classList.toggle("off", !enabled);

  const nameRow = qs(".provider-name-row", row);
  const chip = qs(".chip.ok", nameRow);
  if (live && !chip) {
    nameRow.appendChild(el("span", "chip ok", "monitorando"));
  } else if (!live && chip) {
    chip.remove();
  }

  const input = qs('input[type="checkbox"]', row);
  if (input.checked !== enabled) input.checked = enabled;
  input.disabled = appState.busyProviderIds.has(id);
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
  appState.busyProviderIds.add(id);
  syncUI();
  const providerName = (PROVIDER_REGISTRY[id] || {}).name || "Provider";
  const successMessage = `${providerName} ${enabled ? "habilitado" : "desabilitado"}`;
  return performConfigMutation(() => {
    appState.config.providers[id].enabled = enabled;
  }, successMessage).finally(() => {
    appState.busyProviderIds.delete(id);
    syncUI();
  });
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
  updateGeminiWarning();
}

function isGeminiConfigured() {
  const gemini =
    (appState.config.settings && appState.config.settings.gemini) ||
    DEFAULT_CONFIG.settings.gemini;
  return !!(gemini.apiKey && gemini.apiKey.trim() && gemini.model);
}

function updateGeminiWarning() {
  dom.geminiApiKeyWarning.textContent = isGeminiConfigured()
    ? ""
    : 'Sem chave de API configurada, qualquer regra com a ação "Processar com IA" vai falhar quando disparada.';
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
  updateGeminiWarning();
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
  teardownDialogScrollbar();
  dom.dialogRoot.innerHTML = "";
  activeVariableDropdown = null;
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

function populateSelectOptions(select, options) {
  select.innerHTML = "";
  options.forEach(([value, text]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
  });
}

function createBoundSelectRow(label, obj, key, options) {
  const row = el("div", "field-row");
  row.appendChild(el("label", null, label));
  const select = document.createElement("select");
  populateSelectOptions(select, options);
  select.value = obj[key] || options[0][0];
  select.addEventListener("change", () => {
    obj[key] = select.value;
  });
  row.appendChild(select);
  return row;
}

function createBoundVariableSelectRow(label, obj, key, vars) {
  const row = el("div", "field-row");
  row.appendChild(el("label", null, label));
  const select = document.createElement("select");
  const validKeys = vars.map(v => v.key);

  const options = vars.length
    ? vars.map(v => [v.key, `{${v.key}} — ${v.label}`])
    : [["", "Nenhuma variável disponível"]];
  populateSelectOptions(select, options);

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

let activeVariableDropdown = null;

function closeActiveVariableDropdown() {
  if (activeVariableDropdown) activeVariableDropdown.closeFn();
}

document.addEventListener("pointerdown", event => {
  if (
    activeVariableDropdown &&
    !activeVariableDropdown.wrap.contains(event.target)
  ) {
    closeActiveVariableDropdown();
  }
});

function attachVariableDropdown(rowEl, vars) {
  const fieldEl = qs("input, textarea", rowEl);
  if (!fieldEl || !vars || !vars.length) return;

  const wrap = el("div", "var-field-wrap");
  fieldEl.parentNode.insertBefore(wrap, fieldEl);
  wrap.appendChild(fieldEl);

  const dropdown = buildVariableDropdown(vars);
  wrap.appendChild(dropdown);

  function closeThisDropdown() {
    dropdown.classList.remove("open");
    if (activeVariableDropdown && activeVariableDropdown.wrap === wrap) {
      activeVariableDropdown = null;
    }
  }
  function openThisDropdown() {
    closeActiveVariableDropdown();
    dropdown.classList.add("open");
    activeVariableDropdown = { wrap, closeFn: closeThisDropdown };
  }

  fieldEl.addEventListener("focus", openThisDropdown);
  fieldEl.addEventListener("blur", closeThisDropdown);

  function selectItem(item) {
    const insertText = `{${item.dataset.varKey}}`;
    const start =
      fieldEl.selectionStart != null
        ? fieldEl.selectionStart
        : fieldEl.value.length;
    const end =
      fieldEl.selectionEnd != null
        ? fieldEl.selectionEnd
        : fieldEl.value.length;
    const current = fieldEl.value || "";
    fieldEl.value = current.slice(0, start) + insertText + current.slice(end);
    fieldEl.dispatchEvent(new Event("input"));

    closeThisDropdown();
    fieldEl.focus();
    const cursor = start + insertText.length;
    fieldEl.setSelectionRange(cursor, cursor);
  }

  let pressedItem = null;
  dropdown.addEventListener("pointerdown", event => {
    const item = event.target.closest(".var-dd-item");
    pressedItem = item || null;
    event.preventDefault();
  });

  dropdown.addEventListener("pointerup", event => {
    const item = event.target.closest(".var-dd-item");
    const same = item && item === pressedItem;
    pressedItem = null;
    if (!same) return;
    selectItem(item);
  });

  dropdown.addEventListener("pointercancel", () => {
    pressedItem = null;
  });

  dropdown.addEventListener("click", event => {
    if (event.detail !== 0) return;
    const item = event.target.closest(".var-dd-item");
    if (!item) return;
    selectItem(item);
  });
}

function appendTemplateFieldWithVariables(container, rowEl, vars) {
  container.appendChild(rowEl);
  attachVariableDropdown(rowEl, vars);
}

function buildTemplateTextareaFields(container, action, config, vars) {
  appendTemplateFieldWithVariables(
    container,
    createBoundTextareaBlock("Texto", config, "text"),
    vars
  );
  if (action.type === "text_replacer") {
    container.appendChild(
      el(
        "div",
        "hint",
        "Use {trigger} para inserir o texto do gatilho reconhecido. O texto digitado antes do gatilho (input) é mantido automaticamente antes do texto de substituição."
      )
    );
  }
}

function buildRunTaskFields(container, action, config, vars) {
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
}

function buildOpenAppFields(container, action, config) {
  container.appendChild(
    createBoundTextRow("Pacote", config, "package", "com.exemplo.app")
  );
}

function buildAiFields(container, action, config, vars, draft) {
  container.appendChild(
    createBoundVariableSelectRow(
      "Variável de entrada",
      config,
      "inputVariable",
      vars
    )
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
  if (!isGeminiConfigured()) {
    container.appendChild(
      el(
        "div",
        "hint hint-warn",
        "Chave de API do Gemini não configurada — esta ação vai falhar quando disparada. Configure em Configurações > IA · Gemini."
      )
    );
  }
}

function buildTranslateFields(container, action, config, vars, draft) {
  container.appendChild(
    createBoundVariableSelectRow(
      "Variável de entrada",
      config,
      "inputVariable",
      vars
    )
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
}

function buildSearchFields(container, action, config, vars) {
  container.appendChild(
    createBoundSelectRow("Mecanismo", config, "engine", SEARCH_ENGINES)
  );
  appendTemplateFieldWithVariables(
    container,
    createBoundTextRow("Consulta", config, "query", "{input}"),
    vars
  );
}

function buildOpenUrlFields(container, action, config, vars) {
  appendTemplateFieldWithVariables(
    container,
    createBoundTextRow("URL", config, "url", "https://..."),
    vars
  );
}

function buildNotificationFields(container, action, config, vars) {
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
}

function buildClickFields(container, action, config) {
  container.appendChild(createBoundNumberRow("X", config, "x"));
  container.appendChild(createBoundNumberRow("Y", config, "y"));
}

const ACTION_FIELD_BUILDERS = {
  text_replacer: buildTemplateTextareaFields,
  clipboard: buildTemplateTextareaFields,
  run_task: buildRunTaskFields,
  open_app: buildOpenAppFields,
  ai: buildAiFields,
  translate: buildTranslateFields,
  search: buildSearchFields,
  open_url: buildOpenUrlFields,
  notification: buildNotificationFields,
  click: buildClickFields
};

function buildActionConfigFields(container, action, draft, actionIndex) {
  container.innerHTML = "";
  const vars = availableVariablesAt(draft, actionIndex);
  const builder = ACTION_FIELD_BUILDERS[action.type];
  if (builder) builder(container, action, action.config, vars, draft);
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
      populateSelectOptions(
        opSelect,
        allowedOperatorsForEvent(draft.event.type).map(op => [
          op,
          CONDITION_OPERATORS[op]
        ])
      );
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
  activeVariableDropdown = null;
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
    populateSelectOptions(
      typeSelect,
      allowedTypes.map(type => [type, ACTION_REGISTRY[type].label])
    );
    typeSelect.value = action.type;
    typeSelect.addEventListener("change", () => {
      action.type = typeSelect.value;
      action.config = defaultActionConfig(action.type, draft.event.type);
      renderActionsList(container, draft);
    });
    head.appendChild(typeSelect);

    const moveControls = el("div", "action-card-move");
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
    moveControls.appendChild(upBtn);
    moveControls.appendChild(downBtn);
    moveControls.appendChild(delBtn);
    head.appendChild(moveControls);
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
  body.appendChild(infoSection);

  const eventSection = el("div", "editor-section");
  eventSection.appendChild(sectionLabel(1, "Evento"));
  const providerRow = el("div", "field-row");
  providerRow.appendChild(el("label", null, "Provider"));
  const providerSelect = document.createElement("select");
  populateSelectOptions(
    providerSelect,
    Object.keys(PROVIDER_REGISTRY).map(id => [id, PROVIDER_REGISTRY[id].name])
  );
  providerSelect.value = draft.provider;
  providerRow.appendChild(providerSelect);
  eventSection.appendChild(providerRow);

  const eventRow = el("div", "field-row");
  eventRow.appendChild(el("label", null, "Evento"));
  const eventSelect = document.createElement("select");
  eventRow.appendChild(eventSelect);
  eventSection.appendChild(eventRow);

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
    populateSelectOptions(
      matchFieldSelect,
      def.matchFieldOptions.map(key => {
        const varMeta = def.variables.find(v => v.key === key);
        return [key, varMeta ? `${varMeta.label} (${key})` : key];
      })
    );
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
    populateSelectOptions(
      eventSelect,
      eventsOfProvider(providerSelect.value).map(type => [
        type,
        eventDef(type).label
      ])
    );
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
          id: isEdit ? existingRule.id : generateRuleId(),
          enabled: isEdit ? draft.enabled : true,
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
            if (
              !Array.isArray(appState.config.rules_by_provider[draft.provider])
            ) {
              appState.config.rules_by_provider[draft.provider] = [];
            }
            appState.config.rules_by_provider[draft.provider].push(
              persistedRule
            );
          }
        } else {
          if (
            !Array.isArray(appState.config.rules_by_provider[draft.provider])
          ) {
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
  attachDialogScrollbar(dialog);
  nameInput.focus();
}

const SCROLL_IDLE_MS = 1000;
const SCROLL_THUMB_MIN_HEIGHT = 30;

function createScrollbar({ extraClass, getTrackRect } = {}) {
  const track = el(
    "div",
    ["custom-scrollbar", extraClass].filter(Boolean).join(" ")
  );
  const thumb = el("div", "custom-scrollbar-thumb");
  track.appendChild(thumb);
  document.body.appendChild(track);

  let hideTimer = null;
  let ticking = false;
  let container = null;
  let resizeObserver = null;

  function updateThumb() {
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight <= clientHeight) {
      thumb.style.display = "none";
      return;
    }
    const trackHeight = track.clientHeight;
    const thumbHeight = Math.max(
      trackHeight * (clientHeight / scrollHeight),
      SCROLL_THUMB_MIN_HEIGHT
    );
    const maxScrollTop = scrollHeight - clientHeight;
    const thumbTop =
      maxScrollTop > 0
        ? (scrollTop / maxScrollTop) * (trackHeight - thumbHeight)
        : 0;
    thumb.style.display = "block";
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translate3d(0, ${thumbTop}px, 0)`;
  }

  function updatePosition() {
    if (getTrackRect) {
      const r = getTrackRect();
      track.style.top = `${r.top}px`;
      track.style.right = `${r.right}px`;
      track.style.bottom = `${r.bottom}px`;
    }
    updateThumb();
  }

  function scheduleThumbUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateThumb();
      ticking = false;
    });
  }

  function onScroll() {
    track.classList.add("is-visible");
    scheduleThumbUpdate();
    clearTimeout(hideTimer);
    hideTimer = setTimeout(
      () => track.classList.remove("is-visible"),
      SCROLL_IDLE_MS
    );
  }

  function attach(el) {
    container = el;
    updatePosition();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updatePosition);
    window.addEventListener("orientationchange", updatePosition);
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(container);
    }
  }

  function detach() {
    if (!container) return;
    container.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("orientationchange", updatePosition);
    resizeObserver?.disconnect();
    clearTimeout(hideTimer);
    track.remove();
    container = null;
  }

  return { attach, detach, updatePosition, updateThumb };
}

function setCssVar(name, px) {
  document.documentElement.style.setProperty(name, `${px}px`);
}

function updateHeaderHeightVar() {
  if (!dom.header) return;
  setCssVar("--header-height", dom.header.getBoundingClientRect().height);
}

let pageScrollbar = null;
let headerResizeObserver = null;

function updateScrollMetrics() {
  updateHeaderHeightVar();
  pageScrollbar?.updateThumb();
}

function resetContentScroll() {
  dom.scrollContainer?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  updateScrollMetrics();
}

function initCustomScrollbar() {
  if (pageScrollbar) return;
  pageScrollbar = createScrollbar();
  updateHeaderHeightVar();

  if (dom.header && "ResizeObserver" in window) {
    headerResizeObserver = new ResizeObserver(updateScrollMetrics);
    headerResizeObserver.observe(dom.header);
  }

  window.addEventListener("resize", updateScrollMetrics);
  window.addEventListener("orientationchange", updateScrollMetrics);
  pageScrollbar.attach(dom.scrollContainer);
}

const DIALOG_SCROLLBAR_INSET = 6;
let dialogScrollbar = null;

function teardownDialogScrollbar() {
  dialogScrollbar?.detach();
  dialogScrollbar = null;
}

function attachDialogScrollbar(container) {
  teardownDialogScrollbar();
  dialogScrollbar = createScrollbar({
    extraClass: "dialog-scrollbar",
    getTrackRect: () => {
      const r = container.getBoundingClientRect();
      return {
        top: r.top + DIALOG_SCROLLBAR_INSET,
        right: window.innerWidth - r.right + DIALOG_SCROLLBAR_INSET,
        bottom: window.innerHeight - r.bottom + DIALOG_SCROLLBAR_INSET
      };
    }
  });
  container.addEventListener(
    "animationend",
    () => dialogScrollbar?.updatePosition(),
    { once: true }
  );
  dialogScrollbar.attach(container);
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
  initCustomScrollbar();
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

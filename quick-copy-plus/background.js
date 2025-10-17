// Función para convertir texto a Formato de Título (Capitaliza Cada Palabra)
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// Se ejecuta cuando la extensión se instala o se actualiza.
chrome.runtime.onInstalled.addListener(() => {
  // Limpia menús anteriores para evitar duplicados.
  chrome.contextMenus.removeAll(() => {
    // Define las URL donde el menú contextual aparecerá.
    const DOCUMENT_URL_PATTERNS = ['http://*/*', 'https://*/*'];

    // 1. Crear el menú principal (padre)
    const parentMenuId = "quick-copy-parent";
    chrome.contextMenus.create({
      id: parentMenuId,
      title: chrome.i18n.getMessage("parentTitle"),
      contexts: ["selection"],
      documentUrlPatterns: DOCUMENT_URL_PATTERNS
    });

    // 2. Crear los sub-menús (hijos)
    chrome.contextMenus.create({
      id: "copy-lowercase",
      parentId: parentMenuId,
      title: chrome.i18n.getMessage("copyLowercase"),
      contexts: ["selection"],
      documentUrlPatterns: DOCUMENT_URL_PATTERNS
    });

    chrome.contextMenus.create({
      id: "copy-uppercase",
      parentId: parentMenuId,
      title: chrome.i18n.getMessage("copyUppercase"),
      contexts: ["selection"],
      documentUrlPatterns: DOCUMENT_URL_PATTERNS
    });

    chrome.contextMenus.create({
      id: "copy-titlecase",
      parentId: parentMenuId,
      title: chrome.i18n.getMessage("copyTitlecase"),
      contexts: ["selection"],
      documentUrlPatterns: DOCUMENT_URL_PATTERNS
    });
  });
});

// Listener para cuando se hace clic en una opción del menú.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Solo reaccionar a los clics de nuestros sub-menús.
  if (info.parentMenuItemId !== "quick-copy-parent") {
    return;
  }

  const selection = info.selectionText;
  if (!selection) return;

  let transformedText = "";

  switch (info.menuItemId) {
    case "copy-uppercase":
      transformedText = selection.toUpperCase();
      break;
    case "copy-lowercase":
      transformedText = selection.toLowerCase();
      break;
    case "copy-titlecase":
      transformedText = toTitleCase(selection);
      break;
  }

  // Inyecta un script en la pestaña activa para realizar la copia.
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (textToCopy) => {
      navigator.clipboard.writeText(textToCopy);
    },
    args: [transformedText]
  }).catch(err => {
    console.error(`Failed to execute script: ${err.message}`);
  });
});
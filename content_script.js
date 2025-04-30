(async () => {
  const { wordPairs } = await browser.storage.local.get("wordPairs");
  if (!wordPairs || wordPairs.length === 0) return;

  function escapeRegex(str) {
    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
  }

  function replaceTextInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let textContent = node.textContent;

      wordPairs.slice().reverse().forEach(pair => {
        const fromEscaped = escapeRegex(pair.from);
        const regex = new RegExp(`\\b${fromEscaped}\\b`, "gi");
        textContent = textContent.replace(regex, (match) => {
          return match === match.toLowerCase() ? pair.to.toLowerCase() : pair.to;
        });
      });

      node.textContent = textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (let childNode of node.childNodes) {
        replaceTextInNode(childNode);  
      }
    }
  }

  replaceTextInNode(document.body);

  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      replaceTextInNode(iframeDoc.body);
    } catch (e) {
      console.log("Could not access iframe contents:", e);
    }
  });

  const observer = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(addedNode => {
          if (addedNode.nodeType === Node.TEXT_NODE || addedNode.nodeType === Node.ELEMENT_NODE) {
            replaceTextInNode(addedNode);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();

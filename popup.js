const fromInput = document.getElementById("fromWord");
const toInput = document.getElementById("toWord");
const addBtn = document.getElementById("addBtn");
const wordList = document.getElementById("wordList");

function renderList(wordPairs) {
  wordList.innerHTML = "";
  wordPairs.forEach((pair, index) => {
    const li = document.createElement("li");

    const text = document.createElement("span");
    text.className = "arrow";
    text.textContent = `${pair.from} → ${pair.to}`;

    const delBtn = document.createElement("span");
    delBtn.textContent = "🗑️";
    delBtn.className = "trash";
    delBtn.title = "Delete";
    delBtn.onclick = async () => {
      wordPairs.splice(index, 1);
      await browser.storage.local.set({ wordPairs });
      renderList(wordPairs);
    };

    li.appendChild(text);
    li.appendChild(delBtn);
    wordList.appendChild(li);
  });
}

async function loadAndRender() {
  const { wordPairs } = await browser.storage.local.get("wordPairs");
  renderList(wordPairs || []);
}

addBtn.onclick = async () => {
  const from = fromInput.value.trim();
  const to = toInput.value.trim();
  if (!from || !to) return;

  const { wordPairs } = await browser.storage.local.get("wordPairs");
  const updated = [...(wordPairs || []), { from, to }];
  await browser.storage.local.set({ wordPairs: updated });

  fromInput.value = "";
  toInput.value = "";
  renderList(updated);
};

loadAndRender();

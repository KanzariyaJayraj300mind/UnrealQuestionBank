const state = {
  search: "",
  difficulty: "All",
  subtopic: "All",
  category: "All",
  tags: new Set(),
};

let questions = [];

const elements = {
  questionCount: document.getElementById("questionCount"),
  visibleCount: document.getElementById("visibleCount"),
  filterCount: document.getElementById("filterCount"),
  searchInput: document.getElementById("searchInput"),
  clearFilters: document.getElementById("clearFilters"),
  difficultyFilters: document.getElementById("difficultyFilters"),
  subtopicFilters: document.getElementById("subtopicFilters"),
  categoryFilters: document.getElementById("categoryFilters"),
  tagFilters: document.getElementById("tagFilters"),
  activeFilters: document.getElementById("activeFilters"),
  resultsMeta: document.getElementById("resultsMeta"),
  questionList: document.getElementById("questionList"),
  questionTemplate: document.getElementById("questionTemplate"),
};

function buildChip(label, value, type, active) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `chip${active ? " is-active" : ""}`;
  button.textContent = label;
  button.dataset.type = type;
  button.dataset.value = value;
  return button;
}

function renderFilterGroups() {
  const difficulties = ["All", ...new Set(questions.map((item) => item.difficulty))];
  const subtopics = ["All", ...new Set(questions.map((item) => item.subtopic))];
  const categories = ["All", ...new Set(questions.map((item) => item.category))];
  const tags = [...new Set(questions.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b),
  );

  elements.difficultyFilters.replaceChildren(
    ...difficulties.map((difficulty) =>
      buildChip(difficulty, difficulty, "difficulty", state.difficulty === difficulty),
    ),
  );

  elements.subtopicFilters.replaceChildren(
    ...subtopics.map((subtopic) =>
      buildChip(subtopic, subtopic, "subtopic", state.subtopic === subtopic),
    ),
  );

  elements.categoryFilters.replaceChildren(
    ...categories.map((category) =>
      buildChip(category, category, "category", state.category === category),
    ),
  );

  elements.tagFilters.replaceChildren(
    ...tags.map((tag) => buildChip(tag, tag, "tag", state.tags.has(tag))),
  );
}

function normalize(text) {
  return text.toLowerCase().trim();
}

function matchesQuestion(question) {
  const search = normalize(state.search);
  const haystack = normalize(
    [
      question.question,
      question.answer,
      question.subtopic,
      question.difficulty,
      question.category,
      ...question.tags,
    ].join(" "),
  );

  const searchMatches = !search || haystack.includes(search);
  const difficultyMatches = state.difficulty === "All" || question.difficulty === state.difficulty;
  const subtopicMatches = state.subtopic === "All" || question.subtopic === state.subtopic;
  const categoryMatches = state.category === "All" || question.category === state.category;
  const tagMatches =
    state.tags.size === 0 || [...state.tags].some((tag) => question.tags.includes(tag));

  return searchMatches && difficultyMatches && subtopicMatches && categoryMatches && tagMatches;
}

function getActiveFilterCount() {
  let count = 0;
  if (state.search) count += 1;
  if (state.difficulty !== "All") count += 1;
  if (state.subtopic !== "All") count += 1;
  if (state.category !== "All") count += 1;
  count += state.tags.size;
  return count;
}

function renderActiveFilters() {
  const items = [];

  if (state.search) {
    items.push(makeActivePill(`Search: ${state.search}`, () => {
      state.search = "";
      elements.searchInput.value = "";
      update();
    }));
  }

  if (state.difficulty !== "All") {
    items.push(makeActivePill(`Difficulty: ${state.difficulty}`, () => {
      state.difficulty = "All";
      update();
    }));
  }

  if (state.subtopic !== "All") {
    items.push(makeActivePill(`Sub topic: ${state.subtopic}`, () => {
      state.subtopic = "All";
      update();
    }));
  }

  if (state.category !== "All") {
    items.push(makeActivePill(`Category: ${state.category}`, () => {
      state.category = "All";
      update();
    }));
  }

  for (const tag of state.tags) {
    items.push(makeActivePill(`Tag: ${tag}`, () => {
      state.tags.delete(tag);
      update();
    }));
  }

  if (items.length === 0) {
    const empty = document.createElement("span");
    empty.className = "active-pill";
    empty.textContent = "No active filters";
    elements.activeFilters.replaceChildren(empty);
    return;
  }

  elements.activeFilters.replaceChildren(...items);
}

function makeActivePill(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "active-pill";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderQuestions() {
  const visibleQuestions = questions.filter(matchesQuestion);
  elements.questionList.replaceChildren();

  if (visibleQuestions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No questions match the current filters. Try clearing one or more filters.";
    elements.questionList.appendChild(empty);
  } else {
    const fragment = document.createDocumentFragment();

    visibleQuestions.forEach((question, index) => {
      const card = elements.questionTemplate.content.firstElementChild.cloneNode(true);
      const title = card.querySelector(".question-title");
      const answer = card.querySelector(".question-answer");
      const topicBadge = card.querySelector(".badge-topic");
      const categoryBadge = card.querySelector(".badge-category");
      const difficultyBadge = card.querySelector(".badge-difficulty");
      const tagRow = card.querySelector(".tag-row");
      const toggle = card.querySelector(".answer-toggle");

      title.textContent = question.question;
      answer.textContent = question.answer;
      topicBadge.textContent = question.subtopic;
      categoryBadge.textContent = question.category;
      difficultyBadge.textContent = question.difficulty;

      question.tags.forEach((tag) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "tag-chip";
        chip.textContent = `#${tag}`;
        chip.addEventListener("click", () => {
          if (state.tags.has(tag)) {
            state.tags.delete(tag);
          } else {
            state.tags.add(tag);
          }
          update();
        });
        tagRow.appendChild(chip);
      });

      let expanded = index < 2;
      answer.classList.toggle("is-hidden", !expanded);
      toggle.textContent = expanded ? "Hide answer" : "Show answer";

      toggle.addEventListener("click", () => {
        expanded = !expanded;
        answer.classList.toggle("is-hidden", !expanded);
        toggle.textContent = expanded ? "Hide answer" : "Show answer";
      });

      fragment.appendChild(card);
    });

    elements.questionList.appendChild(fragment);
  }

  elements.questionCount.textContent = String(questions.length);
  elements.visibleCount.textContent = String(visibleQuestions.length);
  elements.filterCount.textContent = String(getActiveFilterCount());
  elements.resultsMeta.textContent =
    visibleQuestions.length === questions.length
      ? "Showing the full question set."
      : `Filtered down to ${visibleQuestions.length} question${visibleQuestions.length === 1 ? "" : "s"}.`;
}

function update() {
  renderFilterGroups();
  renderActiveFilters();
  renderQuestions();
}

async function loadQuestions() {
  const response = await fetch("./data/questions.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load question data: ${response.status}`);
  }

  return response.json();
}

function bindControls() {
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    update();
  });

  elements.clearFilters.addEventListener("click", () => {
    state.search = "";
    state.difficulty = "All";
    state.subtopic = "All";
    state.category = "All";
    state.tags.clear();
    elements.searchInput.value = "";
    update();
  });

  ["difficultyFilters", "subtopicFilters", "categoryFilters", "tagFilters"].forEach((containerId) => {
    const container = elements[containerId];
    container.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      const { type, value } = button.dataset;
      if (type === "difficulty") {
        state.difficulty = state.difficulty === value ? "All" : value;
      } else if (type === "subtopic") {
        state.subtopic = state.subtopic === value ? "All" : value;
      } else if (type === "category") {
        state.category = state.category === value ? "All" : value;
      } else if (type === "tag") {
        if (state.tags.has(value)) {
          state.tags.delete(value);
        } else {
          state.tags.add(value);
        }
      }

      update();
    });
  });
}

async function boot() {
  elements.resultsMeta.textContent = "Loading question bank...";

  try {
    questions = await loadQuestions();
    renderFilterGroups();
    bindControls();
    update();
  } catch (error) {
    console.error(error);
    elements.resultsMeta.textContent =
      "Could not load data. Run the site through a static server and make sure data/questions.json exists.";
    elements.questionList.innerHTML =
      '<div class="empty-state">Unable to load question data. Open the site through a local static server.</div>';
  }
}

boot();

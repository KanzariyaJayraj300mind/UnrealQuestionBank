# Unreal Engine Question Bank

Static, mobile-friendly question bank for Unreal Engine interview prep.

## What it includes

- Search across questions, answers, tags, and metadata
- Filters for `difficulty`, `subtopic`, and `tags`
- Filters for `category` with `Theoretical`, `Scenario based`, and `Core`
- Expandable answer cards
- Responsive layout for phone and desktop screens

## Easy data updates

Edit [`data/questions.json`](./data/questions.json) to add, remove, or update questions.

Each item follows this shape:

```json
{
  question: "Question text",
  answer: "Short reference answer",
  subtopic: "Gameplay Framework",
  difficulty: "Beginner",
  category: "Theoretical",
  tags: ["tag-one", "tag-two"]
}
```

## Run locally

Open `index.html` through any static web server or GitHub Pages.

Example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

This repo is already set up to work on GitHub Pages as a static site:

- `index.html` is at the repository root
- asset paths are relative, so they work under a project subpath
- `.nojekyll` is included to prevent GitHub Pages from applying Jekyll processing
- question data is loaded from `data/questions.json` at runtime

To publish it:

1. Push the repo to GitHub.
2. Open the repository settings.
3. Go to `Pages`.
4. Choose the branch that contains this site, usually `main`, and set the folder to `/ (root)`.
5. Save and wait for the Pages URL to be generated.

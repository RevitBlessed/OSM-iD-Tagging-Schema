# OSM iD Tagging Schema Visualizer

<p align="center">
  A fast, modular, and dynamic web-based tool to visualize, explore, and debug the OpenStreetMap iD editor tagging schema. 
</p>

Live demo: https://osm-id-tagging.netlify.app/

## Project Overview

The **OSM iD Tagging Schema Visualizer** is a standalone web application designed for active OpenStreetMap contributors and developers. It provides a real-time, interactive exploration of the [openstreetmap/id-tagging-schema](https://github.com/openstreetmap/id-tagging-schema). 

Rather than just listing JSON files, this tool implements the strict, complex **business logic of the iD editor engine**. It accurately replicates graph inheritance, preset group unwrapping, defaults prioritization, and regional tag variants, giving developers a crystal-clear understanding of exactly *how* and *why* a specific field is presented to the mapper.


## Key Features

- **iD Engine Perfect Parity:** Implements the exact field resolution pipeline used by the iD editor. Correctly unrolls preset `{groups}` and calculates strict inheritance priority.
- **Smart Defaults & Inheritance:** Visually distinguishes the true origin of every field. The UI automatically generates badges like `[from geometry (area)]` or `[from tag (highway=footway)]`, preventing "magic" field appearances.
- **Deep Internationalization (i18n):** Dynamically fetches localization JSONs from the main schema repo. Not only translates presets and categories, but recursively parses internal references (e.g. `{crossing/markings}`).
- **Regional Variants Grouping:** Groups regional and country-specific variants (`*-BG`, `-DE-AT-CH`) under a single logical field, neatly organizing the UI with quick-access expandable sub-panels.
- **Live Native Fetching:** Pulls source-of-truth metadata straight from the `dist/` schema repository in real-time. No local building required.
- **Responsive & Themed:** Clean layout with CSS Grid/Flexbox and automatic Dark Mode detection (`prefers-color-scheme: dark`).

## Tech Stack

This tool is built to be fast, lightweight, and framework-agnostic. It embraces modern web standards without heavy node_module dependencies:

- **Vanilla JavaScript (ES2022+)** – Engineered using strict **ES Modules** for high maintainability and encapsulation.
- **HTML5 & Vanilla CSS3** – Utilizing CSS variables, Grid, and Flexbox for native blazing-fast rendering.
- **Fetch API & Promises** – Asynchronous, parallel background loading of vast JSON ecosystems.

## Project Architecture

The codebase cleanly separates State, Logic, and UI, ensuring highly testable and extensible components:

```text
├── index.html                   # Main entry point and structural layout
├── style.css                    # UI tokens, Dark mode, and layouts
├── app.js                       # Bootstrapper and module orchestrator
└── src/
    ├── data/
    │   └── api.js               # Network fetching and global appData state holding
    ├── i18n/
    │   └── translate.js         # Reactive localization, missing keys fallback, and nested string parsing
    ├── logic/
    │   └── fieldsResolver.js    # Core iD engine business logic (deduplication, hierarchies, geometry defaults)
    ├── ui/
    │   ├── categories.js        # Left-panel logic (Category tree and selection)
    │   ├── presets.js           # Center-panel logic (Search, string splitting, and preset lists)
    │   ├── details.js           # Right-panel logic (Preset layout and property binding)
    │   └── fields.js            # Extracted UI builder handling field variants and translation wrappers
    └── utils/
        └── icons.js             # SVG fallback generation and Maki/Temaki CDN resolution
```

## How to Run

Because the project leverages modern **ES Modules** (`<script type="module">`), modern browsers require the files to be served over HTTP/HTTPS to prevent CORS policy restrictions.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/osm-id-schema-visualizer.git
   cd osm-id-schema-visualizer
   ```

2. **Serve the files:**
   You can use any lightweight local web server. For example, using Node.js:
   ```bash
   npx serve .
   ```
   Or using Python 3:
   ```bash
   python -m http.server
   ```

3. **Open the browser:**
   Navigate to `http://localhost:3000` (or the port provided by your server).

## GSoC Alignment

This project perfectly aligns with OpenStreetMap development principles:
1. **Tooling & Data Accessibility:** Drastically lowers the barrier of entry for developers trying to understand OSM Tagging mapping definitions.
2. **Open Source Scalability:** ES Module refactoring allows community members to easily add new schema tests, UI extensions, or standalone logic exports.
3. **Data-Driven Transparency:** Exposes "hidden" routing metrics (like field source priority) natively to the core UI layout. 


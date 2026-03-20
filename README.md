# OSM iD Tagging Schema Visualizer

<p align="center">
  A fast, modular, and dynamic web-based tool to visualize, explore, and debug the OpenStreetMap iD editor tagging schema. 
</p>

Live demo: https://osm-id-tagging.netlify.app/

## Project Overview

The **OSM iD Tagging Schema Visualizer** is a standalone web application designed for OpenStreetMap contributors and developers. It provides an interactive exploration of the [openstreetmap/id-tagging-schema](https://github.com/openstreetmap/id-tagging-schema). 

Rather than just listing JSON files, this tool implements a custom field resolution system inspired by the **iD editor logic**. It explores graph inheritance, preset group unwrapping, defaults prioritization, and regional tag variants, helping developers understand how fields are resolved and combined within the schema.


## Key Features

- **Field Resolution Pipeline:** Implements a structured field resolution system inspired by the iD editor. Unrolls preset `{groups}` and processes inheritance priority across multiple sources.
- **Smart Defaults & Inheritance:** Visually distinguishes the origin of each field. The UI generates badges such as `[from geometry (area)]` or `[from tag (highway=footway)]` to make field sources explicit.
- **Deep Internationalization (i18n):** Dynamically fetches localization JSONs from the main schema repository. Supports nested references (e.g. `{crossing/markings}`) and fallback resolution.
- **Regional Variants Grouping:** Groups regional and country-specific variants (`*-BG`, `-DE-AT-CH`) under a unified field representation with expandable UI sections.
- **Live Native Fetching:** Loads schema data directly from the `dist/` repository without requiring a local build step.
- **Responsive & Themed:** Clean layout using CSS Grid/Flexbox with automatic Dark Mode support (`prefers-color-scheme: dark`).

## Tech Stack

This tool is built to be lightweight and framework-agnostic, relying on modern web standards:

- **Vanilla JavaScript (ES2022+)** – Organized using ES Modules for modularity and maintainability  
- **HTML5 & CSS3** – Using CSS variables, Grid, and Flexbox  
- **Fetch API & Promises** – Parallel asynchronous loading of schema data  

## Project Architecture

The codebase separates state, logic, and UI components:

```text
├── index.html                   # Main entry point and layout
├── style.css                    # UI styles, themes, and layout system
├── app.js                       # Application bootstrap and orchestration
└── src/
    ├── data/
    │   └── api.js               # Data fetching and global state
    ├── i18n/
    │   └── translate.js         # Localization and translation resolution
    ├── logic/
    │   └── fieldsResolver.js    # Field resolution logic (inheritance, deduplication, defaults)
    ├── ui/
    │   ├── categories.js        # Category tree UI
    │   ├── presets.js           # Preset list and search
    │   ├── details.js           # Preset details panel
    │   └── fields.js            # Field rendering and variants UI
    └── utils/
        └── icons.js             # Icon resolution and fallbacks
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

This project aligns with OpenStreetMap development goals:

1)Tooling & Accessibility: Helps developers and contributors better understand the tagging schema structure```
2)Lower Barrier to Contribution: Makes complex schema relationships more approachable and easier to debug```
3)Exploration & Transparency: Provides visibility into how fields are resolved across geometry, tags, and presets```


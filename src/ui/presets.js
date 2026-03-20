import { appData } from '../data/api.js';
import { translate } from '../i18n/translate.js';
import { createIconElement } from '../utils/icons.js';
import { renderPresetDetails } from './details.js';

let activeMembers = [];
let activeCategory = '';
let showAllPresets = false;

export function handleFilterInput(e) {
    const query = e.target.value.toLowerCase();
    const clearBtn = document.getElementById('clear-search');
    clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
    filterAndRenderPresets(query);
}

export function toggleAllPresets(filterQuery) {
    showAllPresets = !showAllPresets;
    const toggleBtn = document.getElementById('toggle-all-presets');
    toggleBtn.textContent = showAllPresets ? 'Show category only' : 'Show all presets';
    filterAndRenderPresets(filterQuery);
}

export function renderPresetList(members, categoryName, catId) {
    document.getElementById('center-header').textContent = categoryName ? `Presets: ${categoryName}` : 'Presets';
    activeMembers = members || [];
    activeCategory = catId || '';

    showAllPresets = false;
    document.getElementById('toggle-all-presets').textContent = 'Show all presets';
    document.getElementById('center-footer').style.display = 'block';

    // Clear filter
    const filterInput = document.getElementById('preset-filter');
    const clearBtn = document.getElementById('clear-search');
    filterInput.value = '';
    clearBtn.style.display = 'none';

    filterAndRenderPresets('');
}

export function filterAndRenderPresets(query) {
    const list = document.getElementById('preset-list');
    list.innerHTML = '';

    const getAllRealPresets = () => {
        return Object.keys(appData.presets).filter(id => {
            if (id.startsWith('{')) return false; // skip category-reference placeholders
            return !!appData.presets[id]; // any existing preset is valid
        });
    };

    const createPresetElement = (memberId) => {
        const preset = appData.presets[memberId];
        if (!preset) return null;

        const name = translate(`presets.${memberId}.name`, preset.name || memberId);
        const terms = (preset.terms || []).join(', ').toLowerCase();

        if (query && !name.toLowerCase().includes(query) && !terms.includes(query) && !memberId.toLowerCase().includes(query)) {
            return null;
        }

        const li = document.createElement('li');
        li.className = 'preset-item';

        // Always append an icon element (will use fallback if preset.icon is empty/null)
        li.appendChild(createIconElement(preset.icon || null));

        const nameContainer = document.createElement('span');
        nameContainer.className = 'preset-name-container';

        // Split string by spaces, slashes, brackets, and commas, preserving delimiters
        const parts = name.split(/([\s\/\(\),]+)/);

        parts.forEach(part => {
            if (!part) return;

            // If part consists only of delimiters, just add as text
            if (/^[\s\/\(\),]+$/.test(part)) {
                nameContainer.appendChild(document.createTextNode(part));
            } else {
                // If it's a standalone "word", wrap it in a clickable span
                const wordSpan = document.createElement('span');
                wordSpan.className = 'preset-name-word';
                wordSpan.textContent = part;
                wordSpan.title = 'Click to filter by: ' + part;

                wordSpan.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent click event from bubbling up to the entire row
                    const filterInput = document.getElementById('preset-filter');
                    const clearBtn = document.getElementById('clear-search');
                    filterInput.value = part;
                    clearBtn.style.display = 'flex';
                    // Call the filtering function
                    filterAndRenderPresets(part.toLowerCase());
                });

                nameContainer.appendChild(wordSpan);
            }
        });

        li.appendChild(nameContainer);

        li.addEventListener('click', () => {
            document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('selected'));
            li.classList.add('selected');
            renderPresetDetails(memberId);
        });

        return li;
    };

    const fragment = document.createDocumentFragment();
    let count = 0;

    if (query) {
        // Search globally across active members and real presets
        const allToSearch = new Set([...activeMembers, ...getAllRealPresets()]);
        allToSearch.forEach(id => {
            const el = createPresetElement(id);
            if (el) {
                fragment.appendChild(el);
                count++;
            }
        });
    } else {
        // Render category members first
        activeMembers.forEach(id => {
            const el = createPresetElement(id);
            if (el) {
                fragment.appendChild(el);
                count++;
            }
        });

        // Render other real presets if showAll is selected
        if (showAllPresets) {
            // Derive target folders primarily from the top-level folder segments of
            // actual member preset IDs (e.g. "waterway/stream" -> "waterway").
            // This works even when the category name differs from the preset folder names
            // (e.g. "category-infrastructure" whose members live in "man_made/", "power/", etc.)
            const targetFolders = new Set(
                activeMembers
                    .filter(id => id.includes('/') && !id.startsWith('{'))
                    .map(id => id.split('/')[0])
            );

            // Fallback: use the category ID suffix when no path-based members were found
            // e.g. "category-waterway" -> "waterway"
            if (targetFolders.size === 0 && activeCategory) {
                targetFolders.add(activeCategory.replace(/^category-/, ''));
            }

            // Build the set of preset IDs already shown above (only real presets, not category refs)
            const alreadyShownIds = new Set(
                activeMembers.filter(id => !!appData.presets[id])
            );

            const allReal = getAllRealPresets();

            const otherPresets = allReal.filter(id => {
                if (alreadyShownIds.has(id)) return false;
                const prefix = id.split('/')[0];
                return targetFolders.has(prefix);
            });

            if (otherPresets.length > 0) {
                const divider = document.createElement('li');
                divider.className = 'list-divider';
                divider.textContent = 'Other presets in same category folder';
                fragment.appendChild(divider);

                otherPresets.forEach(id => {
                    const el = createPresetElement(id);
                    if (el) {
                        fragment.appendChild(el);
                        count++;
                    }
                });
            }
        }
    }

    if (count === 0) {
        list.innerHTML = '<li class="empty-state">No matching presets.</li>';
    } else {
        list.appendChild(fragment);
    }
}

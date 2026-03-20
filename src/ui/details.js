import { appData } from '../data/api.js';
import { translate } from '../i18n/translate.js';
import { createIconElement } from '../utils/icons.js';
import { collectFieldRefs } from '../logic/fieldsResolver.js';
import { createFieldsSection } from './fields.js';

export function renderPresetDetails(presetId) {
    const preset = appData.presets[presetId];
    if (!preset) {
        console.warn(`Preset not found: ${presetId}`);
        return;
    }

    window.currentPresetId = presetId;

    const detailsContainer = document.getElementById('preset-details');
    detailsContainer.innerHTML = '';

    const header = document.createDocumentFragment();

    // Title
    const translatedName = translate(`presets.${presetId}.name`, preset.name ?? presetId);
    
    const h2 = document.createElement('h2');
    h2.className = 'preset-name';
    h2.textContent = translatedName;
    header.appendChild(h2);

    // Info Section
    const infoSection = document.createElement('div');
    infoSection.className = 'detail-section';

    let infoHtml = '<div class="info-grid">';
    infoHtml += `<strong>ID:</strong><code>${presetId}</code>`;
    infoHtml += `<strong>Icon:</strong><div id="preset-detail-icon-wrap" style="display: flex; align-items: center; gap: 8px;">
        <span style="${!preset.icon ? 'color: var(--text-muted); font-style: italic;' : ''}">${preset.icon || 'no icon (fallback)'}</span>
    </div>`;
    if (preset.geometry && preset.geometry.length > 0) {
        infoHtml += `<strong>Geometry:</strong><span>${preset.geometry.join(', ')}</span>`;
    }
    if (preset.terms && preset.terms.length > 0) {
        infoHtml += `<strong>Terms:</strong><span>${preset.terms.join(', ')}</span>`;
    }
    infoHtml += '</div>';
    infoSection.innerHTML = infoHtml;

    const wrap = infoSection.querySelector('#preset-detail-icon-wrap');
    wrap.insertBefore(createIconElement(preset.icon || null, true), wrap.firstChild);

    header.appendChild(infoSection);

    // Tags Area
    if (preset.tags && Object.keys(preset.tags).length > 0) {
        const tagSection = document.createElement('div');
        tagSection.className = 'detail-section';
        tagSection.innerHTML = '<h3>Tags</h3><div class="tag-list"></div>';
        const tagList = tagSection.querySelector('.tag-list');

        for (const [k, v] of Object.entries(preset.tags)) {
            const span = document.createElement('span');
            span.className = 'tag-badge';
            span.textContent = v === '*' ? k : `${k}=${v}`;
            tagList.appendChild(span);
        }
        header.appendChild(tagSection);
    }

    detailsContainer.appendChild(header);

    // Execute fields resolving logic isolated
    const { main, additional } = collectFieldRefs(preset);

    if (main.length > 0) {
        detailsContainer.appendChild(createFieldsSection('Fields', main));
    }

    if (additional.length > 0) {
        detailsContainer.appendChild(createFieldsSection('Additional Fields', additional));
    }
}

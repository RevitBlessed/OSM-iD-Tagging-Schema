import { appData } from '../data/api.js';
import { translate, resolveSubTranslates } from '../i18n/translate.js';

export function createFieldsSection(title, fieldGroups) {
    const section = document.createElement('div');
    section.className = 'detail-section';
    section.innerHTML = `<h3>${title}</h3><div class="field-list"></div>`;

    const list = section.querySelector('.field-list');

    fieldGroups.forEach(group => {
        const primaryRef = group.refs[0];
        const fieldData = appData.fields[primaryRef];
        const card = document.createElement('div');
        card.className = 'field-card';

        if (!fieldData) {
            card.innerHTML = `
                <div class="field-card-header">
                    <span class="field-name">${primaryRef}</span>
                    <span class="field-type">Unknown</span>
                </div>`;
        } else {
            let label = fieldData.label || fieldData.name || primaryRef;
            if (label.startsWith('{') && label.endsWith('}')) {
                const refId = label.slice(1, -1);
                if (appData.fields[refId]) {
                    label = appData.fields[refId].label || appData.fields[refId].name || refId;
                }
            }

            label = resolveSubTranslates(translate(`fields.${primaryRef}.label`, label));

            const type = fieldData.type || 'text';
            const key = fieldData.key || primaryRef;

            let badgeHtml = '';

            if (group.sourceType && group.sourceType !== 'preset') {
                badgeHtml = `<span class="field-badge">from ${group.sourceLabel}</span>`;
            }

            card.innerHTML = `
                <div class="field-card-header">
                    <span class="field-name">
                        ${label}
                        ${badgeHtml}
                    </span>
                    <span class="field-type">${type}</span>
                </div>
                ${key !== primaryRef ? `<div class="field-key">${key}</div>` : `<div class="field-key">${primaryRef}</div>`}
            `;
        }

        if (group.refs.length > 1) {
            const variants = group.refs.slice(1);
            const varsCount = variants.length;
            const varsContainer = document.createElement('div');
            varsContainer.className = 'variants-container';
            varsContainer.style.marginTop = '10px';
            varsContainer.style.borderTop = '1px dashed var(--border-color)';
            varsContainer.style.paddingTop = '8px';

            const btn = document.createElement('div');
            btn.className = 'variants-toggle-btn';
            btn.innerHTML = `🌍 Show ${varsCount} regional ${varsCount > 1 ? 'variants' : 'variant'} ▼`;
            btn.style.fontSize = '0.85em';
            btn.style.color = 'var(--primary-color)';
            btn.style.cursor = 'pointer';
            btn.style.display = 'inline-block';
            btn.style.userSelect = 'none';

            const variantsList = document.createElement('ul');
            variantsList.className = 'variants-list';
            variantsList.style.display = 'none';
            variantsList.style.listStyle = 'none';
            variantsList.style.padding = '8px 0 0 0';
            variantsList.style.margin = '0';
            variantsList.style.fontSize = '0.85em';

            // Check if all variants are identical in data logic to show hint
            let allIdentical = true;
            if (fieldData) {
                const baseStr = JSON.stringify(fieldData);
                for (const vRef of variants) {
                    const vData = appData.fields[vRef];
                    if (!vData || JSON.stringify(vData) !== baseStr) {
                        allIdentical = false;
                        break;
                    }
                }
            }

            if (allIdentical) {
                const hint = document.createElement('div');
                hint.style.color = 'var(--text-muted)';
                hint.style.fontStyle = 'italic';
                hint.style.marginBottom = '6px';
                hint.textContent = 'All variants currently identical to default';
                variantsList.appendChild(hint);
            }

            // Create Primary Item
            const primaryLi = document.createElement('li');
            primaryLi.innerHTML = `<strong>Default</strong> <span style="color: var(--text-muted);">(${primaryRef})</span>`;
            primaryLi.style.marginBottom = '4px';
            variantsList.appendChild(primaryLi);

            // Append Other variants
            variants.forEach(r => {
                const li = document.createElement('li');
                let regionName = r;

                // parse regional code
                const dashIndex = r.lastIndexOf('-');
                if (dashIndex > 0) {
                    const suffix = r.slice(dashIndex + 1);
                    regionName = suffix.split('-').join(', ');
                }

                // Clean view without original ids wrapping braces
                li.innerHTML = `<strong>${regionName}</strong>`;
                li.style.marginBottom = '4px';
                variantsList.appendChild(li);
            });

            btn.addEventListener('click', () => {
                const isHidden = variantsList.style.display === 'none';
                variantsList.style.display = isHidden ? 'block' : 'none';
                btn.innerHTML = isHidden
                    ? `🌍 Hide regional ${varsCount > 1 ? 'variants' : 'variant'} ▲`
                    : `🌍 Show ${varsCount} regional ${varsCount > 1 ? 'variants' : 'variant'} ▼`;
            });

            varsContainer.appendChild(btn);
            varsContainer.appendChild(variantsList);
            card.appendChild(varsContainer);
        }

        list.appendChild(card);
    });

    return section;
}

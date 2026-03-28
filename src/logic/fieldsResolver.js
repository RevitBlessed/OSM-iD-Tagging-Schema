import { appData } from '../data/api.js';

export const SOURCE_PRESET = 'preset';
export const SOURCE_TAG = 'tag';
export const SOURCE_GEOMETRY = 'geometry';
export const SOURCE_GROUP = 'group';

export function getDefaultFieldRefs(preset) {
    const result = {
        geometry: [],
        tag: []
    };

    const geometries = preset.geometry || [];

    geometries.forEach(g => {
        const defaultsList = appData.defaults[g] || [];

        defaultsList.forEach(presetId => {
            const p = appData.presets[presetId];
            if (!p) return;

            if (p.tags) {
                let match = true;
                for (const [k, v] of Object.entries(p.tags)) {
                    if (!preset.tags || !preset.tags[k]) {
                        match = false;
                        break;
                    }
                    if (v !== '*' && preset.tags[k] !== v) {
                        match = false;
                        break;
                    }
                }
                if (!match) return;
            }

            // Map sourceLabel directly to the base geometry type (e.g. "area" or "line") per user feedback
            if (p.fields) result.geometry.push({ refs: p.fields, sourceType: SOURCE_GEOMETRY, sourceLabel: `geometry (${g})`, isMain: true });
            if (p.moreFields) result.geometry.push({ refs: p.moreFields, sourceType: SOURCE_GEOMETRY, sourceLabel: `geometry (${g})`, isMain: false });
        });
    });

    return result;
}

export function collectFieldRefs(preset) {
    const fieldMap = new Map();
    const visitedGroups = new Map();

    // The correct origin resolution relies on attributing fields to their DEEPEST generic abstraction.
    // If geometry defined 'name', and preset also lists 'name', geometry is the TRUE origin.
    // Therefore, local preset has the LOWEST priority in claiming authorship.
    const PRIORITY = {
        [SOURCE_GROUP]: 4,
        [SOURCE_GEOMETRY]: 3,
        [SOURCE_TAG]: 2,
        [SOURCE_PRESET]: 1
    };

    function processRefs(refs, sourceType, sourceLabel, isMain) {
        if (!refs) return;

        refs.forEach(ref => {
            // --- GROUP RESOLUTION ---
            if (ref.startsWith('{') && ref.endsWith('}')) {
                const groupId = ref.slice(1, -1);
                const displayGroupId = groupId.startsWith('@') ? groupId.substring(1) : groupId;

                // ANY resolution of {} is treated as a Group source level
                const nextSourceType = SOURCE_GROUP;
                const nextSourceLabel = `group (${displayGroupId})`;

                // Only skip if we already visited this group with a HIGHER OR EQUAL priority source!
                // (This fixes the bug where Geometry visited {@templates/contact} and caused the Preset to silently drop it!)
                const currentVisitPriority = PRIORITY[nextSourceType];
                const highestPreviousPriority = visitedGroups.get(groupId) || 0;
                
                if (currentVisitPriority <= highestPreviousPriority) {
                    return; // Skip: already visited symmetrically or by a higher priority
                }
                visitedGroups.set(groupId, currentVisitPriority);

                // Fallback robust group lookup
                const groupPreset = appData.presets[groupId] || appData.presets[displayGroupId] || appData.presets[`@${groupId}`];
                
                if (groupPreset) {
                    processRefs(groupPreset.fields, nextSourceType, nextSourceLabel, isMain);
                    processRefs(groupPreset.moreFields, nextSourceType, nextSourceLabel, false); // always treat moreFields as additional
                }
                return;
            }

            // --- STANDARD FIELD ---
            const fData = appData.fields[ref];
            // Normalize variants down to their base key to manage overrides cleanly
            const dedupKey = (fData && fData.key) ? fData.key : ref;

            if (fieldMap.has(dedupKey)) {
                const existing = fieldMap.get(dedupKey);
                
                if (!existing.refs.includes(ref)) {
                    existing.refs.push(ref);
                }

                // Strictly apply priority replacement rules:
                if (PRIORITY[sourceType] > PRIORITY[existing.sourceType]) {
                    existing.sourceType = sourceType;
                    existing.sourceLabel = sourceLabel;
                    if (isMain) existing.isMain = true;
                } else if (PRIORITY[sourceType] === PRIORITY[existing.sourceType]) {
                    if (isMain) existing.isMain = true;
                }
            } else {
                fieldMap.set(dedupKey, {
                    id: dedupKey,
                    refs: [ref],
                    sourceType: sourceType,
                    sourceLabel: sourceLabel,
                    isMain: isMain
                });
            }
        });
    }

    // --- STEP 1: ADD GEOMETRY DEFAULTS ---
    const defaults = getDefaultFieldRefs(preset);
    defaults.geometry.forEach(def => {
        processRefs(def.refs, SOURCE_GEOMETRY, def.sourceLabel, def.isMain);
    });

    // --- STEP 2: ADD TAG INHERITANCE ---
    if (preset.tags) {
        const targetTagCount = Object.keys(preset.tags).length;

        for (const [pId, p] of Object.entries(appData.presets)) {
            if (pId === preset.id) continue;
            if (!p.tags) continue;

            const pTagCount = Object.keys(p.tags).length;
            if (pTagCount >= targetTagCount) continue;

            if (Object.values(p.tags).includes('*')) continue;

            let match = true;
            for (const [k, v] of Object.entries(p.tags)) {
                if (!preset.tags[k] || preset.tags[k] !== v) {
                    match = false;
                    break;
                }
            }
            
            if (match && pTagCount > 0) {
                const matchLabel = Object.entries(p.tags).map(([k,v]) => `${k}=${v}`).join(', ');
                processRefs(p.fields, SOURCE_TAG, `tag (${matchLabel})`, true);
                processRefs(p.moreFields, SOURCE_TAG, `tag (${matchLabel})`, false);
            }
        }
    }

    // --- STEP 3 & 4: ADD PRESET LOCAL FIELDS AND ITS GROUPS ---
    processRefs(preset.fields, SOURCE_PRESET, SOURCE_PRESET, true);
    processRefs(preset.moreFields, SOURCE_PRESET, SOURCE_PRESET, false);

    // Assembly output
    const main = [];
    const additional = [];

    for (const fg of fieldMap.values()) {
        if (fg.isMain) main.push(fg);
        else additional.push(fg);
    }

    return { main, additional };
}

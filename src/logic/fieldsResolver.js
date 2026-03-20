import { appData } from '../data/api.js';

export const SOURCE_PRESET = 'preset';
export const SOURCE_TAG = 'tag';
export const SOURCE_GEOMETRY = 'geometry';

export function getDefaultFieldRefs(preset) {
    const result = {
        geometry: [],
        tag: []
    };

    const geometries = preset.geometry || [];

    geometries.forEach(g => {
        // GET BASE FIELDS directly from the geometry preset "point" / "area"
        // (in data.defaults[g] there is normally an array [..., "point"], it doesn't have a .fields property)
        const geomPreset = appData.presets[g];
        if (geomPreset) {
            if (geomPreset.fields) result.geometry.push({ refs: geomPreset.fields, sourceType: SOURCE_GEOMETRY, sourceLabel: `geometry (${g})`, isMain: true });
            if (geomPreset.moreFields) result.geometry.push({ refs: geomPreset.moreFields, sourceType: SOURCE_GEOMETRY, sourceLabel: `geometry (${g})`, isMain: false });
        }

        const defs = appData.defaults[g];
        if (!defs) return;

        // tag-specific defaults
        if (preset.tags) {
            for (const [k, v] of Object.entries(preset.tags)) {
                const tagKey = `${k}=${v}`;
                const tagDefs = defs[tagKey];

                if (tagDefs) {
                    if (tagDefs.fields) result.tag.push({ refs: tagDefs.fields, sourceType: SOURCE_TAG, sourceLabel: `tag (${tagKey})`, isMain: true });
                    if (tagDefs.moreFields) result.tag.push({ refs: tagDefs.moreFields, sourceType: SOURCE_TAG, sourceLabel: `tag (${tagKey})`, isMain: false });
                }
            }
        }
    });

    return result;
}

export function collectFieldRefs(preset) {
    const visitedGroups = new Set();
    const addedFields = new Map();

    const main = [];
    const additional = [];

    function resolveRefs(refs, targetArray, sourceType = SOURCE_PRESET, sourceLabel = SOURCE_PRESET) {
        refs.forEach(ref => {
            // --- GROUP ---
            if (ref.startsWith('{') && ref.endsWith('}')) {
                const groupId = ref.slice(1, -1);

                if (visitedGroups.has(groupId)) return;
                visitedGroups.add(groupId);

                const groupPreset = appData.presets[groupId];

                if (groupPreset) {
                    resolveRefs(groupPreset.fields || [], targetArray, sourceType, sourceLabel);
                    resolveRefs(groupPreset.moreFields || [], targetArray, sourceType, sourceLabel);
                }
                return;
            }

            // Handle field references and merge regional variants
            const fData = appData.fields[ref];
            // Deduplication and grouping of regional fields with a common key
            const dedupKey = (fData && fData.key) ? fData.key : ref;

            if (addedFields.has(dedupKey)) {
                const existingGroup = addedFields.get(dedupKey);
                if (!existingGroup.refs.includes(ref)) {
                    existingGroup.refs.push(ref);
                }

                // IMPORTANT: if originalSourceType is missing for some reason — restore it
                if (!existingGroup.originalSourceType) {
                    existingGroup.originalSourceType = sourceType;
                    existingGroup.originalSourceLabel = sourceLabel;
                }

                // Update source by priority: preset > tag > geometry
                // BUT never overwrite the original source (originalSource)
                if (sourceType === SOURCE_PRESET) {
                    existingGroup.sourceType = SOURCE_PRESET;
                } else if (sourceType === SOURCE_TAG && existingGroup.sourceType === SOURCE_GEOMETRY) {
                    existingGroup.sourceType = SOURCE_TAG;
                }

                return;
            }

            const fieldGroup = {
                id: dedupKey,
                refs: [ref],
                sourceType: sourceType,
                sourceLabel: sourceLabel,
                originalSourceType: sourceType,
                originalSourceLabel: sourceLabel
            };
            addedFields.set(dedupKey, fieldGroup);
            targetArray.push(fieldGroup);
        });
    }

    const defaults = getDefaultFieldRefs(preset);

    // defaults: geometry
    defaults.geometry.forEach(def => {
        resolveRefs(def.refs, def.isMain ? main : additional, def.sourceType, def.sourceLabel);
    });

    // defaults: tag
    defaults.tag.forEach(def => {
        resolveRefs(def.refs, def.isMain ? main : additional, def.sourceType, def.sourceLabel);
    });

    // preset's own fields
    resolveRefs(preset.fields || [], main, SOURCE_PRESET, SOURCE_PRESET);
    resolveRefs(preset.moreFields || [], additional, SOURCE_PRESET, SOURCE_PRESET);

    return { main, additional };
}

import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function listSettings() {
  return unwrap(await api.get(endpoints.settings));
}

/** Save a single key/value setting */
export async function saveSetting(payload) {
  return unwrap(await api.post(endpoints.settings, payload));
}

/**
 * Save multiple settings.
 * @param {Array<{type: string, key: string, value: string, description?: string}>} items
 */
export async function saveSettings(items) {
  const results = [];
  for (const item of items) {
    results.push(await saveSetting(item));
  }
  return results;
}

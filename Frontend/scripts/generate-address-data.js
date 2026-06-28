import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const provincesUrl = 'https://raw.githubusercontent.com/NorakGithub/cambodia-gazetteer/main/provinces.json';
  const provincesMeta = await fetchJson(provincesUrl);

  const transformed = [];

  for (const provinceMeta of provincesMeta) {
    const provinceId = provinceMeta.id;
    const provinceCode = provinceMeta.code;
    const provinceNameKm = provinceMeta.local.replace(/^ខេត្ត|^រាជធានី/, '').trim();
    const provinceNameEn = provinceMeta.english.replace(/ Province$| Capital$/, '').trim();

    try {
      const districtsUrl = `https://raw.githubusercontent.com/NorakGithub/cambodia-gazetteer/main/provinces/${provinceId}.json`;
      const districtsRaw = await fetchJson(districtsUrl);

      const districts = districtsRaw.map((dist) => {
        const distNameKm = dist.local.trim();
        const distNameEn = dist.english.trim();
        const distCode = dist.code; // keep original code

        const communes = (dist.communes || []).map((com) => {
          const comNameKm = com.local.trim();
          const comNameEn = com.english.trim();
          const comCode = com.code;

          const villages = (com.villages || []).map((vil) => ({
            code: vil.code,
            nameEn: vil.english.trim(),
            nameKm: vil.local.trim(),
          }));

          return {
            code: comCode,
            nameEn: comNameEn,
            nameKm: comNameKm,
            villages,
          };
        });

        return {
          code: distCode,
          nameEn: distNameEn,
          nameKm: distNameKm,
          communes,
        };
      });

      transformed.push({
        code: provinceCode,
        nameEn: provinceNameEn,
        nameKm: provinceNameKm,
        districts,
      });

      console.log(`Fetched: ${provinceNameEn} (${districts.length} districts)`);
    } catch (err) {
      console.error(`Failed to fetch ${provinceId}:`, err.message);
      // Add province without districts so the list still shows all provinces
      transformed.push({
        code: provinceCode,
        nameEn: provinceNameEn,
        nameKm: provinceNameKm,
        districts: [],
      });
    }
  }

  const outputPath = path.join(__dirname, 'cambodiaAddress.js');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const fileContent = `/* Auto-generated from cambodia-gazetteer dataset */
export const cambodiaAddress = ${JSON.stringify(transformed, null, 2)};

export const isKhmerInput = (text = "") => /[\\u1780-\\u17FF]/.test(text);

export const getDisplayName = (item, search = "") => {
  if (!item) return "";

  if (!search) {
    return \`\${item.nameEn || ""} \${item.nameKm || ""}\`.trim();
  }

  return isKhmerInput(search) ? item.nameKm || "" : item.nameEn || "";
};

export const filterAddressOptions = (items = [], search = "") => {
  const value = search.trim().toLowerCase();

  if (!value) return items;

  const key = isKhmerInput(search) ? "nameKm" : "nameEn";

  return items.filter((item) =>
    String(item[key] || "").toLowerCase().includes(value)
  );
};

export const cleanAddressItem = (item) => {
  if (!item) return null;

  return {
    code: item.code || "",
    nameEn: item.nameEn || "",
    nameKm: item.nameKm || "",
  };
};

export const emptyShopAddress = () => ({
  province: null,
  district: null,
  commune: null,
  village: null,
  detail: "",
});

export const getAddressSummary = (address) => {
  if (!address) return "";

  return [
    address.province?.nameEn,
    address.district?.nameEn,
    address.commune?.nameEn,
    address.village?.nameEn,
  ]
    .filter(Boolean)
    .join(", ");
};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`Wrote ${transformed.length} provinces to ${outputPath}`);
}

main().catch(console.error);

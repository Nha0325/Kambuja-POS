const fs = require('fs');
const https = require('https');
const path = require('path');

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

  const outputPath = path.join(__dirname, 'Frontend', 'src', 'data', 'cambodiaAddress.js');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const fileContent = `/* Auto-generated from cambodia-gazetteer dataset */
export const cambodiaAddress = ${JSON.stringify(transformed, null, 2)};

export const isKhmerText = (text) => /[\u1780-\u17FF]/.test(text);

export const cleanAddressItem = (item) => {
  if (!item || typeof item !== "object") return null;
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

export const getAddressSummary = (address, language = "en") => {
  if (!address) return "";
  const parts = [];
  if (address.province) parts.push(language === "km" ? address.province.nameKm || address.province.nameEn : address.province.nameEn || address.province.nameKm);
  if (address.district) parts.push(language === "km" ? address.district.nameKm || address.district.nameEn : address.district.nameEn || address.district.nameKm);
  if (address.commune) parts.push(language === "km" ? address.commune.nameKm || address.commune.nameEn : address.commune.nameEn || address.commune.nameKm);
  if (address.village) parts.push(language === "km" ? address.village.nameKm || address.village.nameEn : address.village.nameEn || address.village.nameKm);
  return parts.join(", ");
};

export const getAddressOptions = (address, level) => {
  if (level === "province") return cambodiaAddress;
  if (level === "district") return address?.province?.districts || [];
  if (level === "commune") return address?.district?.communes || [];
  if (level === "village") return address?.commune?.villages || [];
  return [];
};

export const filterAddressOptions = (options, search) => {
  if (!search || !search.trim()) return options || [];
  const term = search.trim().toLowerCase();
  return (options || []).filter((option) => {
    const en = option.nameEn?.toLowerCase() || "";
    const km = option.nameKm?.toLowerCase() || "";
    return en.includes(term) || km.includes(term);
  });
};

export const getAddressItemName = (item, language, search) => {
  if (!item) return "";
  if (search && search.trim()) {
    return isKhmerText(search) ? (item.nameKm || item.nameEn) : (item.nameEn || item.nameKm);
  }
  if (language === "km" || language === "kh") return item.nameKm || item.nameEn;
  if (language === "en") return item.nameEn || item.nameKm;
  return item.nameEn ? \`\${item.nameEn} \${item.nameKm || ""}\`.trim() : (item.nameKm || "");
};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`Wrote ${transformed.length} provinces to ${outputPath}`);
}

main().catch(console.error);

const languages = [
  'en-IN', 'hi-IN', 'te-IN', 'ta-IN', 'mr-IN', 'bn-IN', 'gu-IN', 'kn-IN', 
  'ml-IN', 'pa-IN', 'ur-IN', 'as-IN', 'or-IN', 'sa-IN', 'ne-IN', 'kok-IN', 
  'brx-IN', 'doi-IN', 'ks-IN', 'mai-IN', 'mni-IN', 'sat-IN', 'sd-IN'
];

async function testLang(code) {
  const langCode = code.split('-')[0];
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent("Home")}`;
  const res = await fetch(url);
  return res.status;
}

async function run() {
  for (const lang of languages) {
    try {
      const status = await testLang(lang);
      console.log(`Language: ${lang} (code: ${lang.split('-')[0]}) -> Status: ${status}`);
    } catch (e) {
      console.log(`Language: ${lang} -> Error: ${e.message}`);
    }
  }
}

run();

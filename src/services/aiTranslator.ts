/**
 * BNKhub — AI Subtitle Translator Service
 * Translates SRT/VTT subtitles to Arabic using a translation proxy.
 */

export const translateSubtitle = async (url: string, targetLang: string = 'ar'): Promise<string> => {
  try {
    // 1. Fetch the subtitle content
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const json = await response.json();
    const content = json.contents;

    if (!content) throw new Error("Could not fetch subtitle content");

    // 2. Parse and translate (Simple line-by-line for SRT/VTT)
    const lines = content.split(/\r?\n/);
    const translatedLines = [];
    
    // Process in chunks to avoid overwhelming the translation API
    // We only translate lines that look like dialogue (not numbers, not timestamps)
    const timestampRegex = /-->/;
    const numberRegex = /^\d+$/;

    // To improve performance, we collect text lines and translate them in batches
    let textToTranslate: { index: number; text: string }[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !timestampRegex.test(line) && !numberRegex.test(line)) {
        textToTranslate.push({ index: i, text: line });
      }
      translatedLines.push(lines[i]); // Fill with original first
    }

    // Translation function using Google Translate (Free Proxy)
    const translateBatch = async (texts: string[]) => {
      const sourceText = texts.join(' ||| ');
      const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(sourceText)}`;
      
      const res = await fetch(translateUrl);
      const data = await res.json();
      
      // Google returns an array of chunks
      let translated = "";
      if (data && data[0]) {
        translated = data[0].map((item: any) => item[0]).join('');
      }
      return translated.split(' ||| ').map(s => s.trim());
    };

    // Process in batches of 20 lines to stay safe
    const batchSize = 20;
    for (let i = 0; i < textToTranslate.length; i += batchSize) {
      const batch = textToTranslate.slice(i, i + batchSize);
      const originalTexts = batch.map(b => b.text);
      try {
        const translatedTexts = await translateBatch(originalTexts);
        batch.forEach((item, idx) => {
          if (translatedTexts[idx]) {
            translatedLines[item.index] = translatedTexts[idx];
          }
        });
      } catch (e) {
        console.error("Batch translation error", e);
      }
    }

    // 3. Create a new blob URL for the translated subtitle
    const blob = new Blob([translatedLines.join('\n')], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("AI Translation failed:", error);
    throw error;
  }
};

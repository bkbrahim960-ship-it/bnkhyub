/**
 * Service Wyzie — DEPRECATED in favor of AI Translator.
 */
export interface WyzieSubtitle {
  url: string;
  lang: string;
  label: string;
}

export const searchWyzieSubtitles = async (): Promise<WyzieSubtitle[]> => {
  return [];
};

import { supabase } from '../integrations/supabase/client';
import { AdvancedLinkSearchEngine } from './AdvancedLinkSearchEngine';

export class AdvancedPlayerSourceManager {
  private linkSearchEngine: AdvancedLinkSearchEngine;
  private player: any; // Video player instance (e.g., video.js or hls.js)
  private availableSources: any[] = [];
  private updateUI: (key: string, value: any) => void;
  private showError: (msg: string) => void;
  private showNotification: (msg: string) => void;

  constructor(
    playerInstance: any, 
    updateUICallback: (key: string, value: any) => void,
    errorCallback: (msg: string) => void,
    notificationCallback: (msg: string) => void
  ) {
    this.linkSearchEngine = new AdvancedLinkSearchEngine();
    this.player = playerInstance;
    this.updateUI = updateUICallback;
    this.showError = errorCallback;
    this.showNotification = notificationCallback;
  }

  async initializePlayerWithAutoSearch(movieData: any) {
    const searchStart = Date.now();
    this.showNotification('🔍 جاري البحث الفوري عن أفضل مصادر...');
    
    // 1. البحث الفوري عن أفضل مصادر
    const allLinks = await this.linkSearchEngine.discoverAllSourcesCompletely(movieData);
    
    // 2. الحصول على المصادر المحفوظة من قاعدة البيانات
    const { data: savedLinks } = await supabase
      .from('MovieLinks')
      .select('*')
      .eq('movie_id', movieData.id)
      .eq('status', 'active')
      .order('priority', { ascending: true });

    // 3. دمج وتصفية المصادر
    const allSources = this.mergeAndFilter(allLinks, savedLinks || []);
    
    // 4. ترتيب المصادر حسب التفضيلات
    const rankedSources = await this.rankSources(allSources);
    this.availableSources = [...rankedSources];
    
    // 5. حفظ البحث والنتائج (Simulated)
    const searchDuration = Date.now() - searchStart;
    console.log(`Search duration: ${searchDuration}ms. Valid sources: ${rankedSources.length}`);

    // 6. تشغيل أول مصدر متاح
    if (rankedSources.length > 0) {
      this.displaySourcesList(rankedSources);
      await this.playSource(rankedSources[0]);
    } else {
      this.showError('لم يتم العثور على مصادر متاحة لهذا المحتوى.');
    }
  }

  mergeAndFilter(newLinks: any[], savedLinks: any[]) {
    // Basic deduplication based on URL
    const map = new Map();
    [...savedLinks, ...newLinks].forEach(item => {
      if (item && item.url) map.set(item.url, item);
    });
    return Array.from(map.values());
  }

  async rankSources(sources: any[]) {
    return sources.sort((a, b) => {
      const priorityA = a.priority || 999;
      const priorityB = b.priority || 999;
      return priorityA - priorityB;
    });
  }

  async playSource(source: any) {
    try {
      this.updateUI('playingStatus', source);
      
      // Assume testURL is successful for the mockup
      const isAccessible = await this.testURL(source.url);
      
      if (isAccessible) {
        if (this.player && this.player.setSources) {
          this.player.setSources([{
            src: source.url,
            type: this.getMediaType(source.format),
            quality: source.quality
          }]);
        }

        // تسجيل في السجل
        console.log('Playing source:', source);
        
        if (this.player && this.player.play) {
          this.player.play();
        }

      } else {
        await this.tryNextSource();
      }
    } catch (error) {
      console.error('Error playing source:', error);
      await this.tryNextSource();
    }
  }

  async tryNextSource() {
    if (this.availableSources.length > 0) {
      const nextSource = this.availableSources.shift();
      this.showNotification(`الرابط الحالي غير متاح. جاري الاتصال بـ ${nextSource.source || nextSource.source_provider}...`);
      await this.playSource(nextSource);
    } else {
      this.showError('جميع المصادر غير متاحة حالياً. يرجى المحاولة لاحقاً.');
    }
  }

  async testURL(url: string) {
    // Simple fetch head to check if URL is reachable (subject to CORS in frontend)
    try {
      // In a real app this would call a backend proxy to avoid CORS
      return true;
    } catch {
      return false;
    }
  }

  getMediaType(format: string) {
    switch (format?.toLowerCase()) {
      case 'm3u8': case 'hls': return 'application/x-mpegURL';
      case 'mpd': case 'dash': return 'application/dash+xml';
      case 'mp4': return 'video/mp4';
      default: return 'video/mp4';
    }
  }

  displaySourcesList(sources: any[]) {
    const sourcesList = sources.map((source, index) => ({
      id: index,
      name: source.source || source.source_provider || 'Unknown Source',
      quality: source.quality || 'Auto',
      speed: source.speed || 'Unknown',
      uptime: source.uptime || 'Unknown',
      hasAds: source.hasAds || false,
      selected: index === 0,
      url: source.url
    }));

    this.updateUI('sourcesList', sourcesList);
  }
}

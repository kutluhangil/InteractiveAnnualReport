import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2,
  Linkedin,
  Twitter,
  Copy,
  Check,
  Sparkles,
  Send,
  X,
  Quote,
  ExternalLink,
  MessageCircle,
  Mail,
  CheckCheck,
} from 'lucide-react';
import { REPORT_METADATA } from '../data/reportData';

interface HighlightOption {
  id: string;
  category: string;
  tag: string;
  metric: string;
  title: string;
  quote: string;
  hashtags: string[];
}

const HIGHLIGHTS: HighlightOption[] = [
  {
    id: 'overall',
    category: 'Annual Overview',
    tag: 'Skyline Rewilding',
    metric: '9.7M+ Bees • 194 Hives',
    title: 'London Bee Project 2025/2026 Impact Report',
    quote: `London Bee Project has transformed 52 rooftops across 11 London boroughs into living wildlife corridors—supporting 9.7M+ bees and 17,800+ m² of wildflower meadows.`,
    hashtags: ['LondonBeeProject', 'UrbanRewilding', 'Biodiversity', 'Sustainability'],
  },
  {
    id: 'biodiversity',
    category: 'Biodiversity',
    tag: 'Species Density',
    metric: '24.6 Species / Site',
    title: 'Surging Urban Pollinator Diversity',
    quote: `Rooftop wildflower meadows in London now sustain 24+ pollinator species per site, linking vital aerial stepping stones across the Thames corridor.`,
    hashtags: ['Biodiversity', 'UrbanEcology', 'Pollinators', 'LondonGreen'],
  },
  {
    id: 'climate',
    category: 'Climate Resilience',
    tag: 'Water & Heat',
    metric: '983,000L Stormwater Saved',
    title: 'Urban Stormwater & Heat Mitigation',
    quote: `Living rooftop bio-strata retained 983K+ litres of stormwater and reduced rooftop surface temperatures by up to 2.8°C across central London.`,
    hashtags: ['ClimateAction', 'GreenInfrastructure', 'StormwaterManagement'],
  },
  {
    id: 'food',
    category: 'Community Support',
    tag: 'Hyperlocal Food',
    metric: '2,599 Honey Jars Donated',
    title: '100% Harvest to Local Food Banks',
    quote: `Every jar of the 2,668kg raw wildflower honey harvested from London rooftops was bottled and donated to hyperlocal community food hubs.`,
    hashtags: ['FoodSovereignty', 'CommunityFirst', 'LondonCharity'],
  },
  {
    id: 'education',
    category: 'Education & Youth',
    tag: 'Future Stewards',
    metric: '4,500+ Students & Volunteers',
    title: 'Hands-on Ecological Learning',
    quote: `245 free school apiary field trips and 8,400+ volunteer hours engaged over 4,500 Londoners in hands-on urban conservation in 2025/2026.`,
    hashtags: ['EnvironmentalEducation', 'STEM', 'VolunteerLondon'],
  },
];

export const SocialShareWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightOption>(HIGHLIGHTS[0]);
  const [copiedType, setCopiedType] = useState<'url' | 'quote' | null>(null);
  const [isWebShareSupported, setIsWebShareSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setIsWebShareSupported(true);
    }
  }, []);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href.split('#')[0];
    }
    return 'https://londonbeeproject.org.uk/impact-report';
  };

  const shareUrl = getShareUrl();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedType('url');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
      setCopiedType('url');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleCopyQuote = async () => {
    const textToCopy = `"${selectedHighlight.quote}"\n\n— London Bee Project Impact Report 2025/2026\n${shareUrl}\n${selectedHighlight.hashtags.map((h) => `#${h}`).join(' ')}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedType('quote');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      setCopiedType('quote');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleShareTwitter = () => {
    const text = `${selectedHighlight.quote}\n\nExplore the interactive impact report:`;
    const hashtags = selectedHighlight.hashtags.join(',');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtags)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareLinkedIn = () => {
    // LinkedIn share offsite URL
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleShareWhatsApp = () => {
    const text = `*${selectedHighlight.title}*\n\n"${selectedHighlight.quote}"\n\nCheck out the full interactive London Bee Project Annual Report:\n${shareUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareEmail = () => {
    const subject = `London Bee Project: ${selectedHighlight.title}`;
    const body = `Hi,\n\nI thought you'd be interested in these key highlights from the London Bee Project Annual Impact Report (${REPORT_METADATA.year}):\n\n"${selectedHighlight.quote}"\n\nKey Metric: ${selectedHighlight.metric}\n\nExplore the full interactive report with borough corridors, stormwater climate metrics, and rooftop calculators here:\n${shareUrl}\n\nWarm regards`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `London Bee Project - ${selectedHighlight.title}`,
          text: `"${selectedHighlight.quote}" - ${selectedHighlight.metric}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or failed silently
      }
    }
  };

  return (
    <>
      {/* Persistent Floating Trigger Pill (Bottom-Right) */}
      <aside
        aria-label="Social sharing options"
        className="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end gap-2"
      >
        <AnimatePresence>
          {copiedType && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-[#1F2B1D] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#1F2B1D] text-xs font-medium shadow-xl flex items-center gap-2 border border-white/20 dark:border-[#1F2B1D]/20"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#A3B59E] dark:text-[#4A6D47]" />
              <span>
                {copiedType === 'url' ? 'Report link copied!' : 'Quote snippet copied to clipboard!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="social-share-widget-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={isOpen ? 'Close social share menu' : 'Share report highlights on social media'}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-xl transition-all duration-300 font-medium text-xs sm:text-sm tracking-wide ${
            isOpen
              ? 'bg-[#1F2B1D] text-[#F4EFE6] dark:bg-[#F4EFE6] dark:text-[#1F2B1D] ring-2 ring-[#657351]'
              : 'bg-[#243324] hover:bg-[#1B271B] dark:bg-[#1E2E1D] dark:hover:bg-[#283D27] text-[#F4EFE6] border border-white/15'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3B59E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A3B59E]"></span>
          </span>

          <Share2 className="w-4 h-4 text-[#A3B59E] group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-display font-medium">Share Highlights</span>
        </motion.button>
      </aside>

      {/* Popover / Modal Overlay for Highlights & Social Channels */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 print:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal Card */}
            <motion.div
              id="social-share-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-xl bg-[#FBF9F5] dark:bg-[#162215] text-[#243324] dark:text-[#F4EFE6] rounded-3xl sm:rounded-[2.5rem] shadow-2xl border-2 border-[#243324] dark:border-[#384F35] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-[#243324]/10 dark:border-white/10 flex items-center justify-between bg-[#F5F2EB] dark:bg-[#1A2819]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#1F2B1D] dark:bg-[#2E452C] text-[#F4EFE6]">
                    <Sparkles className="w-4 h-4 text-[#A3B59E]" />
                  </div>
                  <div>
                    <h2
                      id="share-modal-title"
                      className="font-display text-lg sm:text-xl font-medium tracking-tight"
                    >
                      Share Report Highlights
                    </h2>
                    <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                      Select an impact area to generate tailored snippets for social sharing
                    </p>
                  </div>
                </div>

                <button
                  id="close-share-modal-btn"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close share dialog"
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-160px)]">
                {/* Highlight Category Pills */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                    1. Choose Highlight Topic
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {HIGHLIGHTS.map((h) => {
                      const isSelected = selectedHighlight.id === h.id;
                      return (
                        <button
                          key={h.id}
                          id={`highlight-btn-${h.id}`}
                          type="button"
                          onClick={() => setSelectedHighlight(h)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#1F2B1D] text-[#F4EFE6] dark:bg-[#F4EFE6] dark:text-[#1F2B1D] shadow-sm'
                              : 'bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-[#243324] dark:text-[#E0E8DC] border border-[#243324]/10 dark:border-white/10'
                          }`}
                        >
                          <span>{h.category}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Highlight Preview Quote Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                      2. Highlight Snippet Preview
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#657351]/10 dark:bg-white/10 text-[#4A6D47] dark:text-[#A3B59E] font-medium">
                      {selectedHighlight.tag}
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1C2C1A] border border-[#243324]/15 dark:border-white/15 shadow-inner space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2 border-b border-[#243324]/10 dark:border-white/10 pb-2.5">
                      <span className="text-xs font-display font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                        {selectedHighlight.title}
                      </span>
                      <span className="text-xs font-semibold text-[#4A6D47] dark:text-[#88A884]">
                        {selectedHighlight.metric}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Quote className="w-5 h-5 text-[#657351]/40 dark:text-[#A3B59E]/40 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-[#243324] dark:text-[#E0E8DC] leading-relaxed italic">
                        "{selectedHighlight.quote}"
                      </p>
                    </div>

                    {/* Hashtags display */}
                    <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#243324]/5 dark:border-white/5">
                      {selectedHighlight.hashtags.map((ht) => (
                        <span
                          key={ht}
                          className="text-[11px] text-[#657351] dark:text-[#A3B59E] font-mono"
                        >
                          #{ht}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Platform Sharing Actions */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                    3. Share to Platform
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* LinkedIn */}
                    <button
                      id="share-linkedin-btn"
                      type="button"
                      onClick={handleShareLinkedIn}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5] border border-[#0077B5]/20 dark:border-[#0077B5]/40 transition-colors gap-1.5 group"
                    >
                      <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium">LinkedIn</span>
                    </button>

                    {/* Twitter / X */}
                    <button
                      id="share-twitter-btn"
                      type="button"
                      onClick={handleShareTwitter}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/20 dark:border-[#1DA1F2]/40 transition-colors gap-1.5 group"
                    >
                      <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium">Twitter / X</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      id="share-whatsapp-btn"
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 dark:border-[#25D366]/40 transition-colors gap-1.5 group"
                    >
                      <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium">WhatsApp</span>
                    </button>

                    {/* Email */}
                    <button
                      id="share-email-btn"
                      type="button"
                      onClick={handleShareEmail}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#657351]/15 hover:bg-[#657351]/25 text-[#4A6D47] dark:text-[#A3B59E] border border-[#657351]/20 dark:border-white/10 transition-colors gap-1.5 group"
                    >
                      <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium">Email</span>
                    </button>
                  </div>

                  {/* Secondary Fast Actions: Copy Snippet, Copy Link, or Native Share */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    {isWebShareSupported && (
                      <button
                        id="native-web-share-btn"
                        type="button"
                        onClick={handleNativeShare}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#243324] hover:bg-[#1B271B] dark:bg-[#253A23] dark:hover:bg-[#2E472C] text-[#F4EFE6] text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Share via Device Menu</span>
                      </button>
                    )}

                    <button
                      id="copy-quote-snippet-btn"
                      type="button"
                      onClick={handleCopyQuote}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-white/10 hover:bg-[#EAE5D9] dark:hover:bg-white/15 text-[#243324] dark:text-[#F4EFE6] border border-[#243324]/20 dark:border-white/20 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      {copiedType === 'quote' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#4A6D47] dark:text-[#A3B59E]" />
                          <span>Copied Quote!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Quote & Link</span>
                        </>
                      )}
                    </button>

                    <button
                      id="copy-report-url-btn"
                      type="button"
                      onClick={handleCopyLink}
                      className="py-2.5 px-4 rounded-xl bg-white dark:bg-white/10 hover:bg-[#EAE5D9] dark:hover:bg-white/15 text-[#243324] dark:text-[#F4EFE6] border border-[#243324]/20 dark:border-white/20 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      {copiedType === 'url' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#4A6D47] dark:text-[#A3B59E]" />
                          <span>Copied URL!</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#F5F2EB] dark:bg-[#1A2819] border-t border-[#243324]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#657351] dark:text-[#A3B59E]">
                <span>London Bee Project Charity No. 1198420</span>
                <span>Annual Impact Report 2025/2026</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

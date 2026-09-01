import { SEOAnalysisOutputSchema } from '../../apps/worker/src/seo/seo-analysis.schema';

const rawData = {
  "seoScore": 74,
  "subScores": {
    "keywordRelevance": 80,
    "searchIntentAlignment": 85,
    "titleQuality": 40,
    "readability": 92
  },
  "searchIntent": "Commercial Investigation & Transactional (Indian restaurant/cafe owners searching for tools to automate ordering, reduce manual billing errors, and improve customer experience)",
  "keywordData": {
    "primaryThemes": [
      "Restaurant Management",
      "QR Code Ordering",
      "Digital Menu",
      "GST Billing Software",
      "Kitchen Order Automation"
    ],
    "missingEntities": [
      "Restaurant POS Software",
      "KOT System",
      "Cloud Kitchen Software",
      "Billing App",
      "Inventory Management"
    ],
    "stuffedKeywords": []
  },
  "flags": [
    "Placeholder Title: The title 'BhojAI Brand Launch & Awareness Content 20' is an internal naming convention and offers zero organic search discoverability.",
    "Missing Core POS Keywords: The caption completely misses the term 'POS' or 'Billing Software', which are the highest-volume search terms for this target audience."
  ],
  "recommendations": [
    {
      "category": "Title & Hook Optimization",
      "severity": "High",
      "explanation": "Social media algorithms and search features rely heavily on first-line text and video titles. The current title is structured as an internal placeholder, which squanders valuable real estate.",
      "suggestedAction": "Rename the title/first line to a searchable, high-intent hook, such as: 'The Ultimate Restaurant POS & QR Ordering System for Busy Cafes | BhojAI'."
    },
    {
      "category": "Keyword Enrichment",
      "severity": "High",
      "explanation": "Indian restaurant owners searching for solutions look up terms like 'billing machine', 'restaurant billing software', or 'KOT software'. The copy relies on descriptive phrasing ('one simple platform') instead of these targeted category terms.",
      "suggestedAction": "Integrate primary transactional terms into the caption. Example: 'Looking for the best restaurant POS software in India? BhojAI combines QR code ordering, KOT, and GST billing into one easy app.'"
    },
    {
      "category": "Hashtag & Platform Discoverability",
      "severity": "Medium",
      "explanation": "The current hashtag list is highly generic. To capture high-intent leads on Instagram and Facebook, B2B hashtags should target specific niches and localized pain points.",
      "suggestedAction": "Swap out generic hashtags for high-intent ones: #RestaurantPOS, #BillingSoftware, #RestaurantBilling, #CloudKitchenIndia, #KOTSystem, and #BhojAI."
    },
    {
      "category": "On-Screen Text (SEO OCR Optimization)",
      "severity": "Medium",
      "explanation": "Meta's algorithm scans on-screen video text (OCR) for search indexation. The current script focuses on narrative voiceover, but key SEO search terms should be visually reinforced as static/timed text overlays.",
      "suggestedAction": "Add high-contrast, keyword-rich text overlays to the video script, such as 'No-Delay KOT Dispatch' at [0:10-0:15] and '1-Tap GST Billing POS' at [0:15-0:22]."      
    }
  ]
};

try {
  const result = SEOAnalysisOutputSchema.parse(rawData);
  console.log('Zod parsed successfully! Result:', result);
} catch (e: any) {
  console.error('Zod parsing failed:', e);
}

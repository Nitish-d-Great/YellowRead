/**
 * YellowRead - News API Service
 * Fetches real-time Web3/Crypto news from CryptoCompare (FREE, No CORS issues!)
 */

// CryptoCompare News API - FREE and CORS-friendly!
const CRYPTOCOMPARE_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

/**
 * Main function to fetch Web3 news from CryptoCompare
 */
export async function fetchWeb3News(limit = 12) {
  console.log('📰 Fetching live Web3 news from CryptoCompare...');

  try {
    const response = await fetch(CRYPTOCOMPARE_API);

    if (!response.ok) {
      console.error(`CryptoCompare API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.Data || data.Data.length === 0) {
      console.warn('No results from CryptoCompare');
      return null;
    }

    const articles = data.Data.slice(0, limit).map((item, index) => ({
      id: item.id || `cc-${index}-${Date.now()}`,
      title: item.title,
      summary: item.body?.slice(0, 200) + '...' || item.title,
      content: item.body || item.title,
      category: detectCategory(item.categories, item.title),
      author: item.source_info?.name || item.source || 'CryptoCompare',
      readTime: estimateReadTime(item.body),
      publishedAt: formatTimeAgo(item.published_on),
      image: item.imageurl || getPlaceholderImage(index),
      url: item.url,
      source: item.source_info?.name || item.source || 'CryptoCompare',
    }));

    console.log(`✅ Loaded ${articles.length} live articles from CryptoCompare`);
    return { articles, source: 'CryptoCompare' };

  } catch (error) {
    console.error('CryptoCompare fetch error:', error.message);
    return null;
  }
}

/**
 * Detect category from categories string or title
 */
function detectCategory(categories, title) {
  const cats = (categories || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  if (cats.includes('btc') || titleLower.includes('bitcoin')) return 'Bitcoin';
  if (cats.includes('eth') || titleLower.includes('ethereum')) return 'Ethereum';
  if (cats.includes('sol') || titleLower.includes('solana')) return 'Solana';
  if (cats.includes('defi') || titleLower.includes('defi')) return 'DeFi';
  if (cats.includes('nft') || titleLower.includes('nft')) return 'NFT';
  if (cats.includes('regulation') || titleLower.includes('sec')) return 'Regulation';
  if (cats.includes('exchange') || titleLower.includes('binance')) return 'Exchange';
  if (cats.includes('mining') || titleLower.includes('mining')) return 'Mining';
  if (cats.includes('trading') || titleLower.includes('trading')) return 'Trading';
  if (cats.includes('altcoin') || titleLower.includes('altcoin')) return 'Altcoin';

  return 'Crypto';
}

/**
 * Format Unix timestamp to "X hours ago" format
 */
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Recently';

  try {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (isNaN(seconds) || seconds < 0) return 'Recently';
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

/**
 * Estimate read time from content
 */
function estimateReadTime(content) {
  if (!content) return '3 min';
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${Math.max(2, Math.min(minutes, 10))} min`;
}

/**
 * Get placeholder image
 */
function getPlaceholderImage(index) {
  const images = [
    'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800',
    'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800',
    'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800',
    'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'https://images.unsplash.com/photo-1634704784915-aacf363b021f?w=800',
    'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800',
    'https://images.unsplash.com/photo-1609554496796-c345a5335ceb?w=800',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
  ];
  return images[index % images.length];
}

export default { fetchWeb3News };
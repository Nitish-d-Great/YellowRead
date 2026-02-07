// Demo News Articles for YellowRead
// 12 articles for testing the pay-per-read billing

export const articles = [
  {
    id: 1,
    title: "Bitcoin Breaks $150,000 as Institutional Adoption Soars",
    summary: "The world's largest cryptocurrency reached a historic all-time high amid unprecedented institutional buying.",
    content: `Bitcoin has shattered its previous records, surging past the $150,000 mark for the first time in history. The milestone comes as major financial institutions, including Goldman Sachs and Morgan Stanley, announced expanded cryptocurrency services for their clients.

The rally was fueled by several factors: the approval of spot Bitcoin ETFs in multiple countries, corporate treasury allocations by Fortune 500 companies, and growing recognition of Bitcoin as a legitimate store of value during times of economic uncertainty.

"We're witnessing a paradigm shift in how the world views digital assets," said Michael Saylor, Executive Chairman of MicroStrategy. "Bitcoin is no longer a speculative asset—it's becoming the foundation of global finance."

Trading volumes reached record highs of $150 billion in a single day, with retail and institutional investors alike rushing to gain exposure to the digital gold.`,
    category: "Crypto",
    author: "Sarah Chen",
    readTime: "4 min",
    publishedAt: "2 hours ago",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800"
  },
  {
    id: 2,
    title: "Ethereum 3.0 Launches with 1 Million TPS Capability",
    summary: "The long-awaited upgrade promises to revolutionize blockchain scalability and end gas fee concerns forever.",
    content: `Ethereum developers have successfully launched Ethereum 3.0, a groundbreaking upgrade that increases the network's transaction throughput to over 1 million transactions per second (TPS), effectively ending years of scalability concerns.

The upgrade, known as "Serenity Complete," introduces a revolutionary sharding mechanism combined with zero-knowledge proofs that allows the network to process transactions at speeds comparable to traditional payment networks like Visa and Mastercard.

Gas fees, which once plagued users during peak network usage, have dropped to fractions of a cent, making Ethereum accessible for everyday transactions and micropayments.

"This is the Ethereum we always envisioned," said Vitalik Buterin. "A world computer that's fast, cheap, and accessible to everyone on the planet."

DeFi protocols reported immediate benefits, with TVL (Total Value Locked) surging 40% in the first 24 hours as users rushed to take advantage of the improved performance.`,
    category: "Blockchain",
    author: "Marcus Webb",
    readTime: "5 min",
    publishedAt: "4 hours ago",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800"
  },
  {
    id: 3,
    title: "State Channels Emerge as the Future of Web3 Payments",
    summary: "Yellow Network and ERC-7824 standard gain massive adoption for instant, gas-free transactions.",
    content: `State channel technology is experiencing explosive growth as developers and enterprises discover its potential for enabling instant, gas-free blockchain transactions. The ERC-7824 standard, pioneered by Yellow Network, has become the de facto solution for high-frequency payment applications.

Unlike traditional on-chain transactions that require waiting for block confirmations and paying gas fees, state channels allow parties to exchange thousands of transactions off-chain, only settling the final state on the blockchain.

"State channels represent the missing piece for blockchain mass adoption," explained Dr. Elena Rossi, head of research at Yellow Network. "You get the security of blockchain with the speed of Web2."

Major use cases emerging include pay-per-second video streaming, gaming microtransactions, IoT device payments, and real-time content monetization—all previously impossible due to transaction costs.

The Nitrolite SDK has been downloaded over 500,000 times, with developers building everything from decentralized gaming platforms to real-time tipping systems.`,
    category: "Technology",
    author: "Alex Thompson",
    readTime: "4 min",
    publishedAt: "6 hours ago",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800"
  },
  {
    id: 4,
    title: "AI Achieves Scientific Breakthrough in Protein Folding",
    summary: "DeepMind's latest model solves remaining 15% of protein structures, opening doors to rapid drug discovery.",
    content: `DeepMind has announced that its latest AI model, AlphaFold 3, has successfully predicted the structures of the remaining 15% of proteins that had eluded previous versions of the system. This achievement marks the completion of a decades-long quest in structural biology.

The breakthrough has immediate implications for drug discovery, as pharmaceutical companies can now model virtually any protein target for developing new medications. Early estimates suggest this could reduce the drug development timeline from 10 years to just 2-3 years.

"We've essentially solved one of biology's grand challenges," said Demis Hassabis, CEO of DeepMind. "The implications for human health are profound."

Several major pharmaceutical companies have already licensed the technology, with early applications focusing on cancer treatments, neurodegenerative diseases, and rare genetic disorders.

The research community has praised the open release of AlphaFold's predictions for over 200 million proteins, democratizing access to structural biology data worldwide.`,
    category: "Science",
    author: "Dr. Jennifer Walsh",
    readTime: "5 min",
    publishedAt: "8 hours ago",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800"
  },
  {
    id: 5,
    title: "Global Climate Summit Achieves Historic Carbon Agreement",
    summary: "195 nations commit to net-zero emissions by 2040, backed by $5 trillion in funding.",
    content: `In what environmental experts are calling the most significant climate agreement since the Paris Accord, representatives from 195 nations have committed to achieving net-zero carbon emissions by 2040—a full decade ahead of previous targets.

The agreement, reached after intense two-week negotiations, includes a landmark $5 trillion funding mechanism to help developing nations transition to clean energy. Wealthy nations will contribute based on their historical emissions and current GDP.

Key provisions include:
- Complete phase-out of coal power by 2032
- 100% electric vehicle mandates by 2035
- Protection of remaining rainforests
- Carbon border adjustment taxes
- Technology transfer requirements

"This is the turning point future generations will remember," said UN Secretary-General at the closing ceremony. "We finally have the political will matched with financial commitment."

Markets responded positively, with clean energy stocks surging while fossil fuel companies accelerated their transition plans.`,
    category: "Climate",
    author: "David Park",
    readTime: "4 min",
    publishedAt: "10 hours ago",
    image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800"
  },
  {
    id: 6,
    title: "SpaceX Successfully Lands First Humans on Mars",
    summary: "Crew of six astronauts makes history with successful landing on the Red Planet.",
    content: `SpaceX has achieved humanity's greatest space exploration milestone: landing the first humans on Mars. The Starship Endurance touched down safely in the Jezero Crater region, carrying a crew of six international astronauts.

The historic landing came after a seven-month journey from Earth, with the crew conducting scientific experiments and system checks throughout the voyage. The moment of touchdown was broadcast live to an estimated 4 billion viewers worldwide.

"One small step for our crew, one giant leap for humanity's future as a multi-planetary species," said Mission Commander Dr. Sarah Kim as she became the first human to set foot on Martian soil.

The crew will spend 18 months on the surface, establishing the foundation for a permanent human presence on Mars. Their mission includes:
- Setting up the first Martian habitat
- Extracting water from subsurface ice
- Testing in-situ resource utilization
- Conducting geological surveys

The mission represents the culmination of over a decade of development and $50 billion in investment.`,
    category: "Space",
    author: "Amanda Foster",
    readTime: "5 min",
    publishedAt: "12 hours ago",
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800"
  },
  {
    id: 7,
    title: "Quantum Computer Cracks RSA-2048 Encryption",
    summary: "Major security milestone forces rapid transition to post-quantum cryptography worldwide.",
    content: `IBM's 10,000-qubit quantum computer has successfully factored an RSA-2048 key in under 48 hours, demonstrating that current encryption standards are now vulnerable to quantum attacks. The breakthrough has triggered an emergency response from security agencies worldwide.

The demonstration, conducted in a controlled research environment, proves that "Q-Day"—the moment quantum computers can break current encryption—has arrived. This has immediate implications for:

- Banking and financial systems
- Government communications
- Military networks
- Cryptocurrency security
- Personal data protection

"We've been preparing for this moment for years," said NIST director. "Our post-quantum cryptography standards are ready for deployment, and organizations must transition immediately."

Major tech companies including Apple, Google, and Microsoft have announced accelerated timelines for implementing quantum-resistant encryption across their products. Banks are conducting emergency security audits.

The silver lining: researchers confirm that post-quantum algorithms remain secure against known quantum attacks.`,
    category: "Security",
    author: "Chris Anderson",
    readTime: "4 min",
    publishedAt: "14 hours ago",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800"
  },
  {
    id: 8,
    title: "India Becomes World's Third Largest Economy",
    summary: "GDP surpasses Japan as digital transformation and manufacturing boom drive growth.",
    content: `India has officially overtaken Japan to become the world's third-largest economy by GDP, a milestone that caps two decades of rapid economic transformation. The country's GDP reached $5.5 trillion, driven by its booming technology sector, manufacturing growth, and expanding consumer market.

The achievement comes amid India's ambitious "Make in India" initiative, which has attracted over $200 billion in foreign direct investment over the past five years. The semiconductor, electric vehicle, and renewable energy sectors have been particular bright spots.

"India's demographic dividend is now fully materializing," said Finance Minister at a press conference. "Our young, educated workforce combined with digital infrastructure creates unprecedented opportunities."

Key factors in India's rise:
- Digital payments revolution (UPI processes 15 billion transactions monthly)
- Manufacturing shift from China
- IT services export dominance
- Renewable energy leadership
- Startup ecosystem (100+ unicorns)

Economists project India could surpass Germany within five years and potentially challenge China's position within two decades.`,
    category: "Economy",
    author: "Priya Sharma",
    readTime: "4 min",
    publishedAt: "16 hours ago",
    image: "https://images.unsplash.com/photo-1532664189809-02133fee698d?w=800"
  },
  {
    id: 9,
    title: "Universal Basic Income Trial Shows Transformative Results",
    summary: "Largest UBI experiment reveals recipients work more, start businesses, and report better health.",
    content: `Results from the world's largest Universal Basic Income trial, conducted across 50 cities in 15 countries with 500,000 participants, have definitively challenged assumptions about guaranteed income payments.

The three-year study found that UBI recipients actually worked 4.2 hours MORE per week than the control group, contradicting fears that guaranteed income would reduce work motivation. Key findings include:

- 32% increase in entrepreneurship and small business creation
- 40% reduction in anxiety and depression
- 28% decrease in emergency room visits
- 15% improvement in children's educational outcomes
- Significant reduction in crime rates

"The data is unambiguous," said lead researcher Dr. Amara Okonkwo. "When people have a financial safety net, they take more productive risks, invest in themselves, and contribute more to society."

The payment, equivalent to each country's poverty line, was distributed monthly with no strings attached. Several participating nations have announced plans to implement permanent UBI programs based on these findings.`,
    category: "Society",
    author: "Lisa Chen",
    readTime: "5 min",
    publishedAt: "18 hours ago",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800"
  },
  {
    id: 10,
    title: "Gene Therapy Cures Type 1 Diabetes in Clinical Trial",
    summary: "Breakthrough treatment restores insulin production in 90% of patients permanently.",
    content: `A revolutionary gene therapy has effectively cured Type 1 diabetes in clinical trials, with 90% of patients no longer requiring insulin injections one year after treatment. The therapy, developed by Vertex Pharmaceuticals, represents a paradigm shift in treating autoimmune diseases.

The treatment works by reprogramming patients' own cells to produce insulin-secreting beta cells, while also modifying the immune system to prevent it from attacking these new cells. Unlike previous attempts, this approach addresses both the cause and the symptoms of the disease.

"For the first time, we can say we have a functional cure for Type 1 diabetes," said Dr. Maria Santos, lead researcher. "Patients are living completely normal lives without daily insulin management."

Trial participant Tom Miller, diagnosed at age 8, described the experience: "I went from checking blood sugar 10 times a day and calculating every carb to... nothing. I can eat birthday cake without doing math. It's freedom."

The FDA has granted breakthrough therapy designation, with full approval expected within 18 months. The treatment will initially cost $500,000 but is expected to be cost-effective compared to lifetime diabetes management.`,
    category: "Health",
    author: "Dr. Robert Kim",
    readTime: "4 min",
    publishedAt: "20 hours ago",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800"
  },
  {
    id: 11,
    title: "Nuclear Fusion Plant Achieves Net Energy Gain",
    summary: "First commercial fusion reactor produces more energy than it consumes, heralding clean energy era.",
    content: `The world's first commercial nuclear fusion power plant has achieved sustained net energy gain, marking humanity's transition to virtually unlimited clean energy. The ITER-2 facility in southern France produced 500 megawatts of power while consuming only 50 megawatts—a 10:1 energy ratio.

Unlike nuclear fission, fusion produces no long-lived radioactive waste and cannot cause meltdowns. The fuel, hydrogen isotopes, can be extracted from seawater, providing enough energy to power civilization for billions of years.

"This is the moment everything changes," said ITER Director General. "Clean, safe, abundant energy for all of humanity is no longer a dream—it's now engineering reality."

The achievement required solving decades-old plasma containment challenges using AI-optimized magnetic confinement and advanced superconducting magnets operating at near absolute zero temperatures.

Construction of commercial fusion plants is expected to begin within five years, with the first grid-connected plants operational by 2032. Energy analysts predict fusion could provide 20% of global electricity by 2040.`,
    category: "Energy",
    author: "Pierre Dubois",
    readTime: "5 min",
    publishedAt: "22 hours ago",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800"
  },
  {
    id: 12,
    title: "Decentralized Social Media Reaches 1 Billion Users",
    summary: "Blockchain-based platforms surpass traditional social networks in active users.",
    content: `Decentralized social media platforms have collectively surpassed 1 billion monthly active users, overtaking traditional centralized networks for the first time. The milestone represents a fundamental shift in how people communicate online.

Leading the revolution is Farcaster, Lens Protocol, and several other Web3 social platforms that give users ownership of their data, content, and social connections. Users can move freely between applications while maintaining their identity and followers.

"People finally realized they were the product on Web2 social media," said Dan Romero, Farcaster founder. "On Web3 platforms, you own your identity, your content, and you can't be deplatformed by a corporation."

Key factors driving adoption:
- Data ownership and portability
- Tokenized creator monetization
- Censorship resistance
- Interoperability between platforms
- No algorithmic manipulation

Major advertisers have begun shifting budgets to decentralized platforms, attracted by more engaged audiences and transparent analytics. Traditional social media companies have seen significant user decline and are scrambling to adapt their business models.

The transition mirrors the earlier shift from centralized services to the open internet, but for social connections.`,
    category: "Technology",
    author: "Maya Patel",
    readTime: "4 min",
    publishedAt: "1 day ago",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800"
  }
];

// Get article by ID
export const getArticleById = (id) => {
  return articles.find(article => article.id === id);
};

// Get all categories
export const getCategories = () => {
  return [...new Set(articles.map(article => article.category))];
};

// Get articles by category
export const getArticlesByCategory = (category) => {
  return articles.filter(article => article.category === category);
};

export default articles;

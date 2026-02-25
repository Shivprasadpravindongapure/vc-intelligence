export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  stage: string;
  description: string;
  founded: string;
  employees: number;
  headquarters: string;
  founders: string[];
  funding: string;
  valuation: string;
  revenue: string;
  growth: string;
  market: string;
  competitors: string[];
  technologies: string[];
  businessModel: string;
  targetMarket: string;
  keyMetrics: {
    monthlyActiveUsers?: string;
    annualRevenue?: string;
    growthRate?: string;
    marketShare?: string;
  };
  team: {
    totalEmployees: number;
    engineering: number;
    sales: number;
    marketing: number;
    support: number;
  };
  financials: {
    totalFunding: string;
    lastRound: string;
    valuation: string;
    revenue: string;
    burnRate: string;
  };
}

export const companies: Company[] = [
  {
    id: '1',
    name: 'OpenAI',
    website: 'https://openai.com',
    industry: 'AI/ML',
    stage: 'Series C',
    description: 'Leading artificial intelligence research company developing advanced AI models and technologies.',
    founded: '2015',
    employees: 1200,
    headquarters: 'San Francisco, CA',
    founders: ['Sam Altman', 'Elon Musk', 'Greg Brockman', 'Ilya Sutskever'],
    funding: '$11.3B',
    valuation: '$80B',
    revenue: '$2B',
    growth: '150%',
    market: 'Artificial Intelligence',
    competitors: ['Google DeepMind', 'Anthropic', 'Meta AI'],
    technologies: ['GPT-4', 'DALL-E', 'ChatGPT', 'Codex'],
    businessModel: 'API subscriptions, Enterprise licenses',
    targetMarket: 'Enterprise, Developers, Researchers',
    keyMetrics: {
      monthlyActiveUsers: '100M+',
      annualRevenue: '$2B',
      growthRate: '150%',
      marketShare: '35%'
    },
    team: {
      totalEmployees: 1200,
      engineering: 600,
      sales: 200,
      marketing: 150,
      support: 250
    },
    financials: {
      totalFunding: '$11.3B',
      lastRound: '$10B Series C',
      valuation: '$80B',
      revenue: '$2B',
      burnRate: '$50M/month'
    }
  },
  {
    id: '2',
    name: 'Stripe',
    website: 'https://stripe.com',
    industry: 'FinTech',
    stage: 'Series I',
    description: 'Payment processing platform providing economic infrastructure for the internet.',
    founded: '2010',
    employees: 8000,
    headquarters: 'San Francisco, CA',
    founders: ['Patrick Collison', 'John Collison'],
    funding: '$8.7B',
    valuation: '$95B',
    revenue: '$14B',
    growth: '45%',
    market: 'Payment Processing',
    competitors: ['PayPal', 'Square', 'Adyen'],
    technologies: ['Payment APIs', 'Stripe Connect', 'Stripe Atlas'],
    businessModel: 'Transaction fees, Subscription services',
    targetMarket: 'E-commerce, SaaS, Marketplaces',
    keyMetrics: {
      monthlyActiveUsers: '3M+',
      annualRevenue: '$14B',
      growthRate: '45%',
      marketShare: '15%'
    },
    team: {
      totalEmployees: 8000,
      engineering: 3000,
      sales: 2500,
      marketing: 1200,
      support: 1300
    },
    financials: {
      totalFunding: '$8.7B',
      lastRound: '$6.5B Series I',
      valuation: '$95B',
      revenue: '$14B',
      burnRate: '$20M/month'
    }
  },
  {
    id: '3',
    name: 'Airbnb',
    website: 'https://airbnb.com',
    industry: 'TravelTech',
    stage: 'Public',
    description: 'Online marketplace for lodging and tourism experiences.',
    founded: '2008',
    employees: 6000,
    headquarters: 'San Francisco, CA',
    founders: ['Brian Chesky', 'Joe Gebbia', 'Nathan Blecharczyk'],
    funding: '$6.4B',
    valuation: '$75B',
    revenue: '$8.9B',
    growth: '25%',
    market: 'Travel & Hospitality',
    competitors: ['Booking.com', 'VRBO', 'Expedia'],
    technologies: ['Platform API', 'Machine Learning', 'Mobile Apps'],
    businessModel: 'Commission-based bookings',
    targetMarket: 'Travelers, Property owners',
    keyMetrics: {
      monthlyActiveUsers: '150M+',
      annualRevenue: '$8.9B',
      growthRate: '25%',
      marketShare: '20%'
    },
    team: {
      totalEmployees: 6000,
      engineering: 2000,
      sales: 1500,
      marketing: 1800,
      support: 700
    },
    financials: {
      totalFunding: '$6.4B',
      lastRound: 'IPO',
      valuation: '$75B',
      revenue: '$8.9B',
      burnRate: '$10M/month'
    }
  },
  {
    id: '4',
    name: 'SpaceX',
    website: 'https://spacex.com',
    industry: 'Aerospace',
    stage: 'Series F',
    description: 'Private aerospace manufacturer and space transportation company.',
    founded: '2002',
    employees: 12000,
    headquarters: 'Hawthorne, CA',
    founders: ['Elon Musk'],
    funding: '$9.5B',
    valuation: '$180B',
    revenue: '$8B',
    growth: '35%',
    market: 'Space Exploration',
    competitors: ['Blue Origin', 'Rocket Lab', 'Boeing'],
    technologies: ['Falcon 9', 'Starship', 'Dragon', 'Starlink'],
    businessModel: 'Launch services, Satellite internet',
    targetMarket: 'Government, Commercial, Consumer',
    keyMetrics: {
      monthlyActiveUsers: '2M+ (Starlink)',
      annualRevenue: '$8B',
      growthRate: '35%',
      marketShare: '60%'
    },
    team: {
      totalEmployees: 12000,
      engineering: 7000,
      sales: 1500,
      marketing: 1000,
      support: 2500
    },
    financials: {
      totalFunding: '$9.5B',
      lastRound: '$1.5B Series F',
      valuation: '$180B',
      revenue: '$8B',
      burnRate: '$100M/month'
    }
  },
  {
    id: '5',
    name: 'Discord',
    website: 'https://discord.com',
    industry: 'Social',
    stage: 'Series H',
    description: 'Voice, video, and text communication platform designed for communities.',
    founded: '2015',
    employees: 800,
    headquarters: 'San Francisco, CA',
    founders: ['Jason Citron'],
    funding: '$1.1B',
    valuation: '$15B',
    revenue: '$600M',
    growth: '40%',
    market: 'Social Communication',
    competitors: ['Slack', 'TeamSpeak', 'Guilded'],
    technologies: ['Voice over IP', 'Real-time messaging', 'Streaming'],
    businessModel: 'Premium subscriptions, Nitro boosts',
    targetMarket: 'Gamers, Communities, Developers',
    keyMetrics: {
      monthlyActiveUsers: '150M+',
      annualRevenue: '$600M',
      growthRate: '40%',
      marketShare: '25%'
    },
    team: {
      totalEmployees: 800,
      engineering: 400,
      sales: 100,
      marketing: 150,
      support: 150
    },
    financials: {
      totalFunding: '$1.1B',
      lastRound: '$500M Series H',
      valuation: '$15B',
      revenue: '$600M',
      burnRate: '$15M/month'
    }
  },
  {
    id: '6',
    name: 'Notion',
    website: 'https://notion.so',
    industry: 'Productivity',
    stage: 'Series C',
    description: 'All-in-one workspace for docs, projects, and knowledge management.',
    founded: '2016',
    employees: 1200,
    headquarters: 'San Francisco, CA',
    founders: ['Ivan Zhao', 'Simon Last'],
    funding: '$343M',
    valuation: '$10B',
    revenue: '$300M',
    growth: '55%',
    market: 'Work Collaboration',
    competitors: ['Confluence', 'Coda', 'ClickUp'],
    technologies: ['Realtime Sync', 'Database Blocks', 'AI Writing'],
    businessModel: 'Freemium, Team subscriptions',
    targetMarket: 'SMB, Enterprise, Individuals',
    keyMetrics: {
      monthlyActiveUsers: '35M+',
      annualRevenue: '$300M',
      growthRate: '55%',
      marketShare: '12%'
    },
    team: {
      totalEmployees: 1200,
      engineering: 500,
      sales: 280,
      marketing: 180,
      support: 240
    },
    financials: {
      totalFunding: '$343M',
      lastRound: '$275M Series C',
      valuation: '$10B',
      revenue: '$300M',
      burnRate: '$12M/month'
    }
  },
  {
    id: '7',
    name: 'Figma',
    website: 'https://figma.com',
    industry: 'Productivity',
    stage: 'Series E',
    description: 'Collaborative interface design and prototyping platform.',
    founded: '2012',
    employees: 1600,
    headquarters: 'San Francisco, CA',
    founders: ['Dylan Field', 'Evan Wallace'],
    funding: '$750M',
    valuation: '$20B',
    revenue: '$600M',
    growth: '48%',
    market: 'Design Software',
    competitors: ['Sketch', 'Adobe XD', 'Framer'],
    technologies: ['WebAssembly', 'Realtime Collaboration', 'Plugin Ecosystem'],
    businessModel: 'Seat-based SaaS subscriptions',
    targetMarket: 'Design teams, Developers, Product teams',
    keyMetrics: {
      monthlyActiveUsers: '18M+',
      annualRevenue: '$600M',
      growthRate: '48%',
      marketShare: '28%'
    },
    team: {
      totalEmployees: 1600,
      engineering: 700,
      sales: 350,
      marketing: 220,
      support: 330
    },
    financials: {
      totalFunding: '$750M',
      lastRound: '$200M Series E',
      valuation: '$20B',
      revenue: '$600M',
      burnRate: '$18M/month'
    }
  },
  {
    id: '8',
    name: 'Databricks',
    website: 'https://databricks.com',
    industry: 'AI/ML',
    stage: 'Series I',
    description: 'Data and AI platform for analytics, machine learning, and governance.',
    founded: '2013',
    employees: 7000,
    headquarters: 'San Francisco, CA',
    founders: ['Ali Ghodsi', 'Matei Zaharia', 'Ion Stoica'],
    funding: '$4.0B',
    valuation: '$43B',
    revenue: '$1.6B',
    growth: '60%',
    market: 'Data & AI Infrastructure',
    competitors: ['Snowflake', 'Google BigQuery', 'AWS Redshift'],
    technologies: ['Lakehouse', 'Delta Lake', 'MLflow'],
    businessModel: 'Consumption-based platform pricing',
    targetMarket: 'Enterprise, Data teams, AI teams',
    keyMetrics: {
      monthlyActiveUsers: '120K+',
      annualRevenue: '$1.6B',
      growthRate: '60%',
      marketShare: '14%'
    },
    team: {
      totalEmployees: 7000,
      engineering: 2600,
      sales: 2300,
      marketing: 900,
      support: 1200
    },
    financials: {
      totalFunding: '$4.0B',
      lastRound: '$500M Series I',
      valuation: '$43B',
      revenue: '$1.6B',
      burnRate: '$40M/month'
    }
  },
  {
    id: '9',
    name: 'Canva',
    website: 'https://canva.com',
    industry: 'Productivity',
    stage: 'Series G',
    description: 'Visual communication platform for design, docs, and presentations.',
    founded: '2013',
    employees: 5000,
    headquarters: 'Sydney, Australia',
    founders: ['Melanie Perkins', 'Cliff Obrecht', 'Cameron Adams'],
    funding: '$560M',
    valuation: '$26B',
    revenue: '$2.0B',
    growth: '35%',
    market: 'Design & Collaboration',
    competitors: ['Adobe Express', 'VistaCreate', 'Figma'],
    technologies: ['Drag-and-drop editor', 'Template engine', 'AI design'],
    businessModel: 'Freemium, Pro and Enterprise plans',
    targetMarket: 'Consumers, SMB, Enterprise',
    keyMetrics: {
      monthlyActiveUsers: '170M+',
      annualRevenue: '$2.0B',
      growthRate: '35%',
      marketShare: '32%'
    },
    team: {
      totalEmployees: 5000,
      engineering: 1800,
      sales: 1100,
      marketing: 900,
      support: 1200
    },
    financials: {
      totalFunding: '$560M',
      lastRound: '$200M Series G',
      valuation: '$26B',
      revenue: '$2.0B',
      burnRate: '$25M/month'
    }
  },
  {
    id: '10',
    name: 'Plaid',
    website: 'https://plaid.com',
    industry: 'FinTech',
    stage: 'Series D',
    description: 'Financial data network enabling account connectivity for fintech apps.',
    founded: '2013',
    employees: 1400,
    headquarters: 'San Francisco, CA',
    founders: ['Zach Perret', 'William Hockey'],
    funding: '$734M',
    valuation: '$13B',
    revenue: '$400M',
    growth: '30%',
    market: 'Open Banking',
    competitors: ['Yodlee', 'MX', 'TrueLayer'],
    technologies: ['Bank APIs', 'Identity verification', 'Fraud detection'],
    businessModel: 'API transaction fees',
    targetMarket: 'Fintech startups, Banks, Enterprises',
    keyMetrics: {
      monthlyActiveUsers: '6K+ businesses',
      annualRevenue: '$400M',
      growthRate: '30%',
      marketShare: '40%'
    },
    team: {
      totalEmployees: 1400,
      engineering: 620,
      sales: 300,
      marketing: 180,
      support: 300
    },
    financials: {
      totalFunding: '$734M',
      lastRound: '$425M Series D',
      valuation: '$13B',
      revenue: '$400M',
      burnRate: '$14M/month'
    }
  },
  {
    id: '11',
    name: 'Coinbase',
    website: 'https://coinbase.com',
    industry: 'FinTech',
    stage: 'Public',
    description: 'Cryptocurrency exchange and digital asset platform.',
    founded: '2012',
    employees: 3700,
    headquarters: 'San Francisco, CA',
    founders: ['Brian Armstrong', 'Fred Ehrsam'],
    funding: '$547M',
    valuation: '$22B',
    revenue: '$5.5B',
    growth: '22%',
    market: 'Digital Assets',
    competitors: ['Binance', 'Kraken', 'Robinhood Crypto'],
    technologies: ['Exchange Engine', 'Custody', 'Wallet Infrastructure'],
    businessModel: 'Trading fees, Custody services',
    targetMarket: 'Retail investors, Institutions',
    keyMetrics: {
      monthlyActiveUsers: '9M+',
      annualRevenue: '$5.5B',
      growthRate: '22%',
      marketShare: '11%'
    },
    team: {
      totalEmployees: 3700,
      engineering: 1600,
      sales: 700,
      marketing: 500,
      support: 900
    },
    financials: {
      totalFunding: '$547M',
      lastRound: 'Pre-IPO',
      valuation: '$22B',
      revenue: '$5.5B',
      burnRate: '$30M/month'
    }
  },
  {
    id: '12',
    name: 'Doctolib',
    website: 'https://doctolib.com',
    industry: 'Healthcare',
    stage: 'Series F',
    description: 'Healthcare booking and practice management platform.',
    founded: '2013',
    employees: 2900,
    headquarters: 'Paris, France',
    founders: ['Stanislas Niox-Chateau'],
    funding: '$815M',
    valuation: '$6.4B',
    revenue: '$350M',
    growth: '38%',
    market: 'HealthTech',
    competitors: ['Zocdoc', 'Kry', 'Qare'],
    technologies: ['Scheduling platform', 'Telehealth', 'EHR integrations'],
    businessModel: 'Subscription software for providers',
    targetMarket: 'Clinics, Hospitals, Patients',
    keyMetrics: {
      monthlyActiveUsers: '80M+',
      annualRevenue: '$350M',
      growthRate: '38%',
      marketShare: '18%'
    },
    team: {
      totalEmployees: 2900,
      engineering: 1000,
      sales: 700,
      marketing: 400,
      support: 800
    },
    financials: {
      totalFunding: '$815M',
      lastRound: '$549M Series F',
      valuation: '$6.4B',
      revenue: '$350M',
      burnRate: '$16M/month'
    }
  },
  {
    id: '13',
    name: 'Klarna',
    website: 'https://klarna.com',
    industry: 'FinTech',
    stage: 'Series H',
    description: 'Buy-now-pay-later and payments network for merchants and consumers.',
    founded: '2005',
    employees: 5000,
    headquarters: 'Stockholm, Sweden',
    founders: ['Sebastian Siemiatkowski', 'Niklas Adalberth', 'Victor Jacobsson'],
    funding: '$4.6B',
    valuation: '$15B',
    revenue: '$2.3B',
    growth: '27%',
    market: 'Consumer Payments',
    competitors: ['Affirm', 'Afterpay', 'PayPal Pay Later'],
    technologies: ['Risk scoring', 'Checkout APIs', 'Merchant network'],
    businessModel: 'Merchant fees, Consumer finance fees',
    targetMarket: 'E-commerce, Consumers',
    keyMetrics: {
      monthlyActiveUsers: '37M+',
      annualRevenue: '$2.3B',
      growthRate: '27%',
      marketShare: '9%'
    },
    team: {
      totalEmployees: 5000,
      engineering: 1900,
      sales: 1100,
      marketing: 800,
      support: 1200
    },
    financials: {
      totalFunding: '$4.6B',
      lastRound: '$800M Series H',
      valuation: '$15B',
      revenue: '$2.3B',
      burnRate: '$32M/month'
    }
  },
  {
    id: '14',
    name: 'Instacart',
    website: 'https://instacart.com',
    industry: 'E-commerce',
    stage: 'Public',
    description: 'Grocery technology platform offering delivery and pickup services.',
    founded: '2012',
    employees: 3200,
    headquarters: 'San Francisco, CA',
    founders: ['Apoorva Mehta'],
    funding: '$2.9B',
    valuation: '$12B',
    revenue: '$3.2B',
    growth: '18%',
    market: 'Online Grocery',
    competitors: ['Walmart+', 'DoorDash', 'Amazon Fresh'],
    technologies: ['Delivery routing', 'Retail media', 'Marketplace'],
    businessModel: 'Delivery fees, Advertising, Subscriptions',
    targetMarket: 'Consumers, Grocery retailers',
    keyMetrics: {
      monthlyActiveUsers: '14M+',
      annualRevenue: '$3.2B',
      growthRate: '18%',
      marketShare: '21%'
    },
    team: {
      totalEmployees: 3200,
      engineering: 1200,
      sales: 600,
      marketing: 450,
      support: 950
    },
    financials: {
      totalFunding: '$2.9B',
      lastRound: 'Pre-IPO',
      valuation: '$12B',
      revenue: '$3.2B',
      burnRate: '$19M/month'
    }
  },
  {
    id: '15',
    name: 'Duolingo',
    website: 'https://duolingo.com',
    industry: 'Education',
    stage: 'Public',
    description: 'Mobile-first language learning platform with gamified lessons.',
    founded: '2011',
    employees: 900,
    headquarters: 'Pittsburgh, PA',
    founders: ['Luis von Ahn', 'Severin Hacker'],
    funding: '$183M',
    valuation: '$8B',
    revenue: '$750M',
    growth: '42%',
    market: 'EdTech',
    competitors: ['Babbel', 'Rosetta Stone', 'Busuu'],
    technologies: ['Adaptive learning', 'Speech recognition', 'AI tutoring'],
    businessModel: 'Freemium, Subscription, Ads',
    targetMarket: 'Consumers, Schools',
    keyMetrics: {
      monthlyActiveUsers: '100M+',
      annualRevenue: '$750M',
      growthRate: '42%',
      marketShare: '30%'
    },
    team: {
      totalEmployees: 900,
      engineering: 420,
      sales: 80,
      marketing: 160,
      support: 240
    },
    financials: {
      totalFunding: '$183M',
      lastRound: 'Pre-IPO',
      valuation: '$8B',
      revenue: '$750M',
      burnRate: '$9M/month'
    }
  },
  {
    id: '16',
    name: 'Coursera',
    website: 'https://coursera.org',
    industry: 'Education',
    stage: 'Public',
    description: 'Online learning platform offering courses and degrees from top institutions.',
    founded: '2012',
    employees: 1300,
    headquarters: 'Mountain View, CA',
    founders: ['Andrew Ng', 'Daphne Koller'],
    funding: '$464M',
    valuation: '$4.5B',
    revenue: '$700M',
    growth: '20%',
    market: 'Online Education',
    competitors: ['Udemy', 'edX', 'FutureLearn'],
    technologies: ['MOOC platform', 'Video streaming', 'Skills analytics'],
    businessModel: 'Course subscriptions, Enterprise learning',
    targetMarket: 'Students, Professionals, Enterprises',
    keyMetrics: {
      monthlyActiveUsers: '25M+',
      annualRevenue: '$700M',
      growthRate: '20%',
      marketShare: '16%'
    },
    team: {
      totalEmployees: 1300,
      engineering: 520,
      sales: 260,
      marketing: 190,
      support: 330
    },
    financials: {
      totalFunding: '$464M',
      lastRound: 'Pre-IPO',
      valuation: '$4.5B',
      revenue: '$700M',
      burnRate: '$11M/month'
    }
  },
  {
    id: '17',
    name: 'Ramp',
    website: 'https://ramp.com',
    industry: 'FinTech',
    stage: 'Series D',
    description: 'Corporate card and expense management platform for businesses.',
    founded: '2019',
    employees: 1400,
    headquarters: 'New York, NY',
    founders: ['Eric Glyman', 'Karim Atiyeh'],
    funding: '$1.4B',
    valuation: '$8.1B',
    revenue: '$450M',
    growth: '85%',
    market: 'Spend Management',
    competitors: ['Brex', 'Airbase', 'Divvy'],
    technologies: ['Expense automation', 'Card controls', 'ERP integrations'],
    businessModel: 'Interchange, SaaS subscriptions',
    targetMarket: 'SMB, Mid-market, Enterprise',
    keyMetrics: {
      monthlyActiveUsers: '25K+ companies',
      annualRevenue: '$450M',
      growthRate: '85%',
      marketShare: '10%'
    },
    team: {
      totalEmployees: 1400,
      engineering: 560,
      sales: 330,
      marketing: 190,
      support: 320
    },
    financials: {
      totalFunding: '$1.4B',
      lastRound: '$300M Series D',
      valuation: '$8.1B',
      revenue: '$450M',
      burnRate: '$20M/month'
    }
  },
  {
    id: '18',
    name: 'Northvolt',
    website: 'https://northvolt.com',
    industry: 'Energy',
    stage: 'Series E',
    description: 'Battery manufacturer focused on sustainable lithium-ion cells.',
    founded: '2016',
    employees: 6000,
    headquarters: 'Stockholm, Sweden',
    founders: ['Peter Carlsson', 'Paolo Cerruti'],
    funding: '$14B',
    valuation: '$20B',
    revenue: '$1.1B',
    growth: '65%',
    market: 'Battery Technology',
    competitors: ['CATL', 'LG Energy Solution', 'Panasonic Energy'],
    technologies: ['Battery cells', 'Recycling systems', 'Grid storage'],
    businessModel: 'Battery supply contracts',
    targetMarket: 'Automotive, Energy storage',
    keyMetrics: {
      monthlyActiveUsers: 'N/A',
      annualRevenue: '$1.1B',
      growthRate: '65%',
      marketShare: '6%'
    },
    team: {
      totalEmployees: 6000,
      engineering: 2200,
      sales: 900,
      marketing: 400,
      support: 2500
    },
    financials: {
      totalFunding: '$14B',
      lastRound: '$1.2B Series E',
      valuation: '$20B',
      revenue: '$1.1B',
      burnRate: '$70M/month'
    }
  },
  {
    id: '19',
    name: 'Flexport',
    website: 'https://flexport.com',
    industry: 'E-commerce',
    stage: 'Series E',
    description: 'Technology-enabled global freight forwarding and logistics platform.',
    founded: '2013',
    employees: 2800,
    headquarters: 'San Francisco, CA',
    founders: ['Ryan Petersen'],
    funding: '$2.3B',
    valuation: '$8B',
    revenue: '$1.5B',
    growth: '24%',
    market: 'Supply Chain Tech',
    competitors: ['Maersk', 'Expeditors', 'Convoy'],
    technologies: ['Logistics OS', 'Tracking APIs', 'Customs automation'],
    businessModel: 'Freight margins, Software services',
    targetMarket: 'Importers, Exporters, Retailers',
    keyMetrics: {
      monthlyActiveUsers: '10K+ businesses',
      annualRevenue: '$1.5B',
      growthRate: '24%',
      marketShare: '4%'
    },
    team: {
      totalEmployees: 2800,
      engineering: 900,
      sales: 700,
      marketing: 300,
      support: 900
    },
    financials: {
      totalFunding: '$2.3B',
      lastRound: '$935M Series E',
      valuation: '$8B',
      revenue: '$1.5B',
      burnRate: '$22M/month'
    }
  },
  {
    id: '20',
    name: 'Mistral AI',
    website: 'https://mistral.ai',
    industry: 'AI/ML',
    stage: 'Series B',
    description: 'AI company building open and enterprise foundation models.',
    founded: '2023',
    employees: 250,
    headquarters: 'Paris, France',
    founders: ['Arthur Mensch', 'Guillaume Lample', 'Timothee Lacroix'],
    funding: '$1.1B',
    valuation: '$6B',
    revenue: '$120M',
    growth: '140%',
    market: 'Foundation Models',
    competitors: ['OpenAI', 'Anthropic', 'Cohere'],
    technologies: ['LLMs', 'Model serving', 'Inference optimization'],
    businessModel: 'API usage, Enterprise licensing',
    targetMarket: 'Developers, Enterprises',
    keyMetrics: {
      monthlyActiveUsers: '1.2M+',
      annualRevenue: '$120M',
      growthRate: '140%',
      marketShare: '3%'
    },
    team: {
      totalEmployees: 250,
      engineering: 170,
      sales: 25,
      marketing: 15,
      support: 40
    },
    financials: {
      totalFunding: '$1.1B',
      lastRound: '$640M Series B',
      valuation: '$6B',
      revenue: '$120M',
      burnRate: '$11M/month'
    }
  }
];

export const industries = [
  'AI/ML',
  'FinTech', 
  'TravelTech',
  'Aerospace',
  'Social',
  'Productivity',
  'Healthcare',
  'E-commerce',
  'Education',
  'Energy'
];

export const stages = [
  'Seed',
  'Series A',
  'Series B', 
  'Series C',
  'Series D',
  'Series E',
  'Series F',
  'Series G',
  'Series H',
  'Series I',
  'Public'
];

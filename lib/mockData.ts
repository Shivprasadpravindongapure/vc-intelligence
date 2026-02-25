export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  stage: string;
  description: string;
}

export const companies: Company[] = [
  {
    id: '1',
    name: 'OpenAI',
    website: 'https://openai.com',
    industry: 'AI/ML',
    stage: 'Series C',
    description: 'Leading artificial intelligence research company developing advanced AI models and technologies.'
  },
  {
    id: '2',
    name: 'Stripe',
    website: 'https://stripe.com',
    industry: 'FinTech',
    stage: 'Series I',
    description: 'Payment processing platform providing economic infrastructure for the internet.'
  },
  {
    id: '3',
    name: 'Airbnb',
    website: 'https://airbnb.com',
    industry: 'TravelTech',
    stage: 'Public',
    description: 'Online marketplace for lodging and tourism experiences.'
  },
  {
    id: '4',
    name: 'SpaceX',
    website: 'https://spacex.com',
    industry: 'Aerospace',
    stage: 'Series F',
    description: 'Private aerospace manufacturer and space transportation company.'
  },
  {
    id: '5',
    name: 'Discord',
    website: 'https://discord.com',
    industry: 'Social',
    stage: 'Series H',
    description: 'Voice, video, and text communication platform designed for communities.'
  },
  {
    id: '6',
    name: 'Notion',
    website: 'https://notion.so',
    industry: 'Productivity',
    stage: 'Series D',
    description: 'All-in-one workspace for notes, tasks, wikis, and databases.'
  },
  {
    id: '7',
    name: 'Figma',
    website: 'https://figma.com',
    industry: 'Design Tools',
    stage: 'Series E',
    description: 'Collaborative web-based design and prototyping tool.'
  },
  {
    id: '8',
    name: 'Rivian',
    website: 'https://rivian.com',
    industry: 'Automotive',
    stage: 'Public',
    description: 'Electric vehicle manufacturer focusing on adventure vehicles.'
  },
  {
    id: '9',
    name: 'Instacart',
    website: 'https://instacart.com',
    industry: 'Grocery Tech',
    stage: 'Public',
    description: 'North American leader in online grocery delivery and pickup services.'
  },
  {
    id: '10',
    name: 'Databricks',
    website: 'https://databricks.com',
    industry: 'Data Analytics',
    stage: 'Series I',
    description: 'Unified analytics platform for big data and machine learning.'
  },
  {
    id: '11',
    name: 'Anthropic',
    website: 'https://anthropic.com',
    industry: 'AI/ML',
    stage: 'Series D',
    description: 'AI research company focused on building safe, beneficial artificial intelligence.'
  },
  {
    id: '12',
    name: 'Plaid',
    website: 'https://plaid.com',
    industry: 'FinTech',
    stage: 'Series L',
    description: 'Financial services platform connecting banks with fintech applications.'
  },
  {
    id: '13',
    name: 'Robinhood',
    website: 'https://robinhood.com',
    industry: 'FinTech',
    stage: 'Public',
    description: 'Commission-free stock trading and investing platform.'
  },
  {
    id: '14',
    name: 'Zoom',
    website: 'https://zoom.us',
    industry: 'Communication',
    stage: 'Public',
    description: 'Cloud-based video conferencing and collaboration platform.'
  },
  {
    id: '15',
    name: 'Shopify',
    website: 'https://shopify.com',
    industry: 'E-commerce',
    stage: 'Public',
    description: 'E-commerce platform for building and managing online stores.'
  }
];

export const industries = Array.from(new Set(companies.map(c => c.industry))).sort();
export const stages = Array.from(new Set(companies.map(c => c.stage))).sort();

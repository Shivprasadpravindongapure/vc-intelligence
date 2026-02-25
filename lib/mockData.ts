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
    name: 'TechFlow Solutions',
    website: 'https://techflow.com',
    industry: 'SaaS',
    stage: 'Series A',
    description: 'AI-powered workflow automation platform for enterprises.'
  },
  {
    id: '2',
    name: 'GreenEnergy Innovations',
    website: 'https://greenenergy.io',
    industry: 'CleanTech',
    stage: 'Seed',
    description: 'Revolutionary solar panel technology with 40% efficiency.'
  },
  {
    id: '3',
    name: 'HealthSync',
    website: 'https://healthsync.com',
    industry: 'HealthTech',
    stage: 'Series B',
    description: 'Digital health platform connecting patients with healthcare providers.'
  },
  {
    id: '4',
    name: 'FinTech Plus',
    website: 'https://fintechplus.com',
    industry: 'FinTech',
    stage: 'Series A',
    description: 'Mobile-first banking solution for small businesses.'
  },
  {
    id: '5',
    name: 'EduLearn AI',
    website: 'https://edulearn.ai',
    industry: 'EdTech',
    stage: 'Pre-Seed',
    description: 'Personalized learning platform powered by artificial intelligence.'
  },
  {
    id: '6',
    name: 'CyberShield',
    website: 'https://cybershield.com',
    industry: 'Cybersecurity',
    stage: 'Series C',
    description: 'Advanced threat detection and prevention for cloud infrastructure.'
  },
  {
    id: '7',
    name: 'RetailTech Pro',
    website: 'https://retailtech.pro',
    industry: 'RetailTech',
    stage: 'Series A',
    description: 'Omnichannel retail management platform with real-time analytics.'
  },
  {
    id: '8',
    name: 'LogisticsFlow',
    website: 'https://logisticsflow.com',
    industry: 'Logistics',
    stage: 'Seed',
    description: 'AI-driven supply chain optimization and tracking system.'
  },
  {
    id: '9',
    name: 'CloudScale',
    website: 'https://cloudscale.io',
    industry: 'Cloud Infrastructure',
    stage: 'Series B',
    description: 'Serverless computing platform with auto-scaling capabilities.'
  },
  {
    id: '10',
    name: 'BioMed Innovations',
    website: 'https://biomed.com',
    industry: 'Biotech',
    stage: 'Series A',
    description: 'Gene therapy solutions for rare genetic disorders.'
  }
];

export const industries = Array.from(new Set(companies.map(c => c.industry))).sort();
export const stages = Array.from(new Set(companies.map(c => c.stage))).sort();

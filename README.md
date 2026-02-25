# 🚀 VC Intelligence Platform

A comprehensive venture capital intelligence platform that leverages AI-powered company enrichment to provide actionable insights for investment analysis.

## ✨ Features

### 🔍 Company Discovery & Analysis
- **Advanced Search**: Filter companies by industry, funding stage, and custom search queries
- **AI-Powered Enrichment**: Real-time website analysis with structured business intelligence
- **Smart Caching**: 24-hour localStorage caching to optimize API costs
- **Multi-AI Support**: OpenAI primary, Anthropic secondary, with mock data fallback

### 📊 Data Management
- **Custom Lists**: Create and manage curated company lists
- **Saved Searches**: Save and reuse complex search filters
- **Export Functionality**: Export lists and data in JSON format
- **Local Storage**: All data persists locally in your browser

### 🎨 Professional UI
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive design with Tailwind CSS
- **Loading States**: Professional loading animations and error handling
- **Dark Mode Support**: Automatic theme detection
- **Premium Design System**: Sophisticated code-like aesthetic with proper spacing and typography

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI Integration**: OpenAI GPT-3.5-turbo, Anthropic Claude
- **Web Scraping**: Cheerio with ScrapingAPI fallback
- **Data Storage**: LocalStorage with JSON persistence
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shivprasadpravindongapure/vc-intelligence.git
   cd vc-intelligence
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys to `.env.local`:
   ```env
   # AI API Keys for Live Enrichment
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Web Scraping API Key
   SCRAPING_API_KEY=your_scraping_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### API Keys Setup

#### OpenAI API
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and generate an API key
3. Add it to your `.env.local` file

#### Anthropic API
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account and generate an API key
3. Add it to your `.env.local` file

#### ScrapingAPI
1. Visit [ScrapingAPI](https://www.scrapingapi.com/)
2. Sign up and get your API key
3. Add it to your `.env.local` file

**Note**: The app will work with mock data even without API keys, but live enrichment requires proper API configuration.

## 📖 Usage Guide

### Company Analysis

1. **Browse Companies**: Navigate to the Companies page to see all available companies
2. **Apply Filters**: Use industry and stage filters to narrow down results
3. **Enrich Data**: Click "Enrich" on any company to get AI-powered insights
4. **View Insights**: See structured data including:
   - Company summary and business model
   - Relevant keywords and tags
   - Growth signals and indicators
   - Source URLs and timestamp

### List Management

1. **Create Lists**: Click "+ New List" in the Lists section
2. **Add Companies**: Use "Save to List" on company profiles
3. **Manage Lists**: Export, delete, or modify your lists
4. **Export Data**: Download lists as JSON for external use

### Saved Searches

1. **Apply Filters**: Set your desired search criteria
2. **Save Search**: Click "Save Search" to store the filter combination
3. **Reuse Later**: Access saved searches for quick filtering

## 🏗️ Project Structure

```
vc-intelligence/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── enrich/        # AI enrichment endpoint
│   ├── companies/         # Company-related pages
│   ├── lists/            # List management pages
│   ├── saved/            # Saved searches page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx         # Home page
├── components/           # Reusable React components
│   ├── Layout.tsx       # Main app layout
│   └── EnrichmentPanel.tsx # AI enrichment UI
├── lib/                 # Utility libraries
│   ├── mockData.ts      # Sample company data
│   ├── listManager.ts   # List management logic
│   └── searchManager.ts # Search management logic
├── public/              # Static assets
├── .gitignore           # Git ignore file
└── README.md           # This file
```

## 🔌 API Endpoints

### POST /api/enrich

Accepts a company URL and returns AI-powered enrichment data.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "summary": "Concise company overview",
  "whatTheyDo": "Detailed business description", 
  "keywords": ["relevant", "business", "tags"],
  "signals": ["growth", "indicators", "signals"],
  "sources": ["source", "URLs"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 AI Enrichment Features

### Content Analysis
- **Business Model**: How the company makes money
- **Target Market**: Primary customer segments
- **Technology Stack**: Key technologies and innovations
- **Competitive Positioning**: Industry standing and differentiation
- **Growth Indicators**: Signals of traction and scaling

### Fallback Strategy
1. **OpenAI GPT-3.5-turbo**: Primary analysis engine
2. **Anthropic Claude**: Secondary analysis option
3. **Mock Data**: Fallback ensures UI always works

### Smart Caching
- **24-hour Cache**: Prevents repeated API calls
- **Local Storage**: Fast, client-side caching
- **Automatic Refresh**: Stale data automatically refreshed

## 🧪 Testing

### Running Tests
```bash
npm run test
# or
yarn test
```

### Manual Testing Checklist
- [ ] Company page loads and displays data
- [ ] Search and filters work correctly
- [ ] AI enrichment provides results
- [ ] List creation and management functions
- [ ] Export functionality works
- [ ] Responsive design on mobile/tablet
- [ ] Error handling displays properly

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [OpenAI](https://openai.com/) - AI analysis capabilities
- [Anthropic](https://anthropic.com/) - AI analysis fallback
- [ScrapingAPI](https://www.scrapingapi.com/) - Web scraping service

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for the venture capital community**

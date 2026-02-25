import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to VC Intelligence</h1>
        <p className="text-lg text-gray-600">
          Navigate through the sidebar to explore Companies, Lists, and Saved items.
        </p>
      </div>
    </Layout>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>VC Intelligence</h1>
      <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '30px' }}>Smart Investment Analysis</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Companies</h2>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '15px' }}>Browse and analyze companies</p>
          <Link
            href="/companies"
            style={{ display: 'inline-block', backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', textDecoration: 'none' }}
          >
            View Companies
          </Link>
        </div>
        <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Lists</h2>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '15px' }}>Manage your company lists</p>
          <Link
            href="/lists"
            style={{ display: 'inline-block', backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', textDecoration: 'none' }}
          >
            View Lists
          </Link>
        </div>
        <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>Saved</h2>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '15px' }}>Access saved searches</p>
          <Link
            href="/saved"
            style={{ display: 'inline-block', backgroundColor: '#333', color: 'white', padding: '8px 16px', border: '1px solid #444', borderRadius: '4px', textDecoration: 'none' }}
          >
            View Saved
          </Link>
        </div>
      </div>
    </div>
  );
}

        

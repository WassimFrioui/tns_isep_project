'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/profile/' + email.split('@')[0]); // simplification, peut adapter
    } else {
      const data = await res.json();
      setError(data.error || 'Erreur lors de la connexion');
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Chargement...' : 'Se connecter'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}

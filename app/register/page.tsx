'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || 'Erreur lors de l\'inscription');
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h1>Inscription</h1>
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
          type="text"
          placeholder="Pseudo"
          value={username}
          onChange={e => setUsername(e.target.value)}
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
          {loading ? 'Chargement...' : 'S\'inscrire'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}

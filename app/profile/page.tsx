'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Profile = {
  name: string;
  bio: string;
  username?: string;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({ name: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

useEffect(() => {
  async function fetchProfile() {
    try {
      const res = await fetch('/api/auth/me'); // utilise les cookies envoyés automatiquement

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok) {
        setError('Impossible de récupérer le profil');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProfile({
        username: data.username,
        name: data.name,
        bio: data.bio,
      });
      setLoading(false);
    } catch {
      setError('Erreur lors du chargement');
      setLoading(false);
    }
  }

  fetchProfile();
}, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch(`/api/profile/${profile.username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profile.name, bio: profile.bio }),
    });

    setSaving(false);

    if (res.ok) {
      router.push(`/profile/${profile.username}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Erreur lors de la sauvegarde');
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <main style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Modifier mon profil</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nom complet"
          value={profile.name}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={profile.bio}
          onChange={handleChange}
          rows={5}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" disabled={saving} style={{ width: '100%' }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}

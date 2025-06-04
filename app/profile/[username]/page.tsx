'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Friend = {
    username: string;
    name: string;
    photo?: string;
};

export default function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function fetchFriends() {
            try {
                const resMe = await fetch('/api/auth/me');
                if (!resMe.ok) {
                    router.push('/login');
                    return;
                }
                const me = await resMe.json();

                const resFriends = await fetch(`/api/friends/${me.username}`);
                if (resFriends.ok) {
                    const data = await resFriends.json();
                    setFriends(data.friends || []);
                } else {
                    setError('Impossible de récupérer la liste d’amis');
                }
            } catch {
                setError('Erreur lors de la récupération des données');
            }
        }
        fetchFriends();
    }, [router]);

    return (
        <main className="max-w-xl mx-auto p-4">
            <h1>Mes amis</h1>
            {error && <p className="text-red-600">{error}</p>}
            <ul>
                {friends.length > 0 ? (
                    friends.map(f => (
                        <li key={f.username} className="flex items-center gap-2">
                            {f.photo && <img src={f.photo} alt={f.name} className="w-10 h-10 rounded-full" />}
                            <a href={`/profile/${f.username}`} className="underline">{f.name} (@{f.username})</a>
                        </li>
                    ))
                ) : (
                    !error && <p>Vous n’avez pas encore d’amis.</p>
                )}
            </ul>
        </main>
    );
}

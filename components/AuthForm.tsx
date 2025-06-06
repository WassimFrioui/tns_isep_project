'use client'

import { useState } from 'react'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const url = isLogin ? '/api/auth/login' : '/api/auth/register'

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur')
      return
    }

    if (isLogin) {
      localStorage.setItem('token', data.token)
      alert(`Connecté(e) en tant que ${data.user.name}`)
    } else {
      alert('Inscription réussie. Vous pouvez vous connecter.')
      setIsLogin(true)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded-2xl shadow bg-white space-y-4">
      <h2 className="text-2xl font-bold text-center">{isLogin ? 'Connexion' : 'Inscription'}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm text-blue-600 hover:underline w-full text-center"
      >
        {isLogin ? "Pas encore inscrit ?" : "Déjà un compte ? Se connecter"}
      </button>
    </div>
  )
}

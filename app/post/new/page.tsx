import React from 'react';
import { CreatePostForm as PostForm } from '@/components/PostForm';
import Navbar from '@/components/Navbar';

export default function PostPage() {
    return (
        <main className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Créer un nouveau post</h1>
            <PostForm />    
            <Navbar />
        </main>
    );
}
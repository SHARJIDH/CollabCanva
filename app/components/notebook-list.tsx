'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Notebook {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  userId: string;
}

export default function NotebookList() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotebooks() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/notebooks');
        if (!response.ok) {
          throw new Error('Failed to fetch notebooks');
        }
        const data = await response.json();
        setNotebooks(data);
      } catch (error) {
        console.error('Error fetching notebooks:', error);
        setError('Failed to load notebooks');
      } finally {
        setLoading(false);
      }
    }

    fetchNotebooks();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {notebooks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No notebooks yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {notebooks.map((notebook) => (
            <div 
              key={notebook._id}
              onClick={() => router.push(`/notebooks/${notebook._id}`)}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
            >
              <h3 className="font-semibold text-lg mb-2">{notebook.title}</h3>
              <p className="text-sm text-gray-600">
                Last updated: {new Date(notebook.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
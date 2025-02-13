"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Book, Plus } from "lucide-react";

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
        const response = await fetch("/api/notebooks");
        if (!response.ok) {
          throw new Error("Failed to fetch notebooks");
        }
        const data = await response.json();
        setNotebooks(data);
      } catch (error) {
        console.error("Error fetching notebooks:", error);
        setError("Failed to load notebooks");
      } finally {
        setLoading(false);
      }
    }

    fetchNotebooks();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="p-6 bg-gray-50 rounded-xl animate-pulse h-32"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="text-red-500 font-medium">{error}</div>
        <button
          onClick={() => setLoading(true)}
          className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notebooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl space-y-4">
          <Book className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600 text-lg">
            No notebooks yet. Create your first one!
          </p>
          <button
            onClick={() => router.push("/notebooks/new")}
            className="inline-flex items-center px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Notebook
          </button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {notebooks.map((notebook, index) => (
            <div
              key={notebook._id}
              onClick={() => router.push(`/notebooks/${notebook._id}`)}
              className="group p-6 bg-white rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer transform hover:-translate-y-1"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.5s ease-out forwards",
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {notebook.title}
                </h3>
                <Book className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-gray-600">
                Last updated:{" "}
                {new Date(notebook.updatedAt).toLocaleDateString()}
              </p>
              <div className="mt-4 w-full h-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

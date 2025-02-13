"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

interface Notebook {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  userId: string;
}

export default function NotebooksPage() {
  const { data: session, status } = useSession();
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-gray-600 animate-pulse">
            Loading your notebooks...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Your Notebooks
        </h1>
        <button
          className="group inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          onClick={() => router.push("/notebooks/new")}
        >
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          New Notebook
        </button>
      </div>

      {loading ? (
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
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4 text-lg">{error}</div>
          <button
            onClick={() => setLoading(true)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : notebooks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-600 mb-4">
            No notebooks yet. Start your journey!
          </p>
          <button
            onClick={() => router.push("/notebooks/new")}
            className="inline-flex items-center px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create your first notebook
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
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {notebook.title}
              </h3>
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

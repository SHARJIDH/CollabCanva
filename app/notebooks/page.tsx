"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotebookList from "../components/notebook-list";
import { LucidePlus } from "lucide-react";

export default function NotebooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return router.push("/auth");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Notebooks</h1>
        <button
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          onClick={() => router.push("/notebooks/new")}
        >
          <LucidePlus className="mr-2 h-5 w-5" />
          New Notebook
        </button>
      </div>
      <NotebookList />
    </div>
  );
}

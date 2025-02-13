import Link from 'next/link'
import { LucideNotebook, LucidePencil } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Collaborative Notebook
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, collaborate, and organize your notes and sketches in one place
          </p>
          <Link 
            href="/notebooks" 
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <LucideNotebook className="mr-2" />
            Get Started
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <LucideNotebook className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Notes</h3>
            <p className="text-gray-600">
              Create and organize your notes with rich text formatting and real-time collaboration
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <LucidePencil className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sketch Integration</h3>
            <p className="text-gray-600">
              Add sketches and drawings to your notes for better visualization
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-display font-bold text-ink mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-sakura-pink border-2 border-ink rounded-lg shadow-retro hover:shadow-retro-lg transition-all font-medium"
      >
        Go Home
      </Link>
    </div>
  )
}

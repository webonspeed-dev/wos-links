import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            WOS Links
          </h1>
          <p className="text-2xl text-gray-700 mb-4">
            AI-Powered Link Management Platform
          </p>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Track revenue, not just clicks. Build with edge infrastructure for
            sub-10ms redirects globally.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Get Started
            </Link>
            <Link
              href="/docs"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold border-2 border-indigo-600"
            >
              Documentation
            </Link>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Sub-10ms redirects powered by edge computing
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Smart slug suggestions, SEO optimization, and duplicate detection
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Revenue Attribution</h3>
              <p className="text-gray-600">
                Track conversions and revenue, not just clicks
              </p>
            </div>
          </div>

          <div className="mt-16 text-sm text-gray-500">
            <p>
              Built with Next.js, PostgreSQL with pgvector, and Bunny CDN Edge
              Scripts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

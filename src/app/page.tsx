import Link from 'next/link';
import PageLayout from '@/components/PageLayout';

export default function Home() {
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-12 md:pt-40 md:pb-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            <span className="block">Create stunning video montages</span>
            <span className="block text-indigo-600">with zero effort</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
            Upload your videos and music, then let our service automatically create beautiful montages for you.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link
              href="/upload-video"
              className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload Videos
            </Link>
            <Link
              href="/create-montage" 
              className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Montage
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative bg-white p-6 rounded-lg shadow-md">
              <div className="absolute -top-4 -left-4 bg-indigo-500 rounded-lg p-3 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Upload Your Content</h3>
              <p className="mt-2 text-gray-500">
                Easily upload your videos and music files with our intuitive drag-and-drop interface.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative bg-white p-6 rounded-lg shadow-md">
              <div className="absolute -top-4 -left-4 bg-indigo-500 rounded-lg p-3 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Browse Files & Folders</h3>
              <p className="mt-2 text-gray-500">
                Navigate through your file system with our advanced file browser to select exactly what you need.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative bg-white p-6 rounded-lg shadow-md">
              <div className="absolute -top-4 -left-4 bg-indigo-500 rounded-lg p-3 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Get Montages</h3>
              <p className="mt-2 text-gray-500">
                Automatically receive beautifully crafted montages in your output folder.
              </p>
            </div>
          </div>
        </div>

        {/* Browse Files Section */}
        <div className="py-16 bg-white rounded-xl shadow-lg mt-8">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Advanced File Browser
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our new file browser gives you complete control over your content. Browse directories, select specific folders, and create perfect montages.
            </p>
            <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-indigo-600">Simple Mode</h3>
                  <p className="mt-2 text-gray-600">Quick selection of top-level folders for fast montage creation.</p>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-indigo-600">Advanced Mode</h3>
                  <p className="mt-2 text-gray-600">Full directory browser for precise selection of nested folders and files.</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/create-montage"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try File Browser
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-12 bg-gradient-to-r from-indigo-800 to-purple-800 rounded-xl shadow-xl mt-8 mb-12">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white">
              Ready to create your first montage?
            </h2>
            <p className="mt-4 text-lg text-indigo-100">
              Get started now by uploading your videos and music, and let the magic happen.
            </p>
            <div className="mt-8">
              <Link
                href="/upload-video"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { fetchMontageRequests } from "@/lib/api";
import Link from "next/link";
import { MontageRequest } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ClipLoader } from "react-spinners";
import PageLayout from "@/components/PageLayout";

const MontagesPage: React.FC = () => {
  const [requests, setRequests] = useState<MontageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMontage, setSelectedMontage] = useState<MontageRequest | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await fetchMontageRequests();
        setRequests(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch montage requests:", err);
        setError("Failed to load montage requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectMontage = (montage: MontageRequest) => {
    setSelectedMontage(montage);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case "PROCESSING":
        return <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">Processing</span>;
      case "COMPLETED":
        return <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">Completed</span>;
      case "FAILED":
        return <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl text-slate-600 font-bold">Your Montage Requests</h1>
            <Link href="/create-montage">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                Create New Montage
              </button>
            </Link>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <ClipLoader color="#3B82F6" size={50} />
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && !error && requests.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You haven&apos;t created any montages yet.</p>
              <Link href="/create-montage">
                <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                  Create Your First Montage
                </button>
              </Link>
            </div>
          )}

          {!loading && requests.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg text-slate-600 font-semibold">All Requests</h2>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {requests.map((request) => (
                      <li
                        key={request.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          selectedMontage?.id === request.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleSelectMontage(request)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-slate-600">
                              {/* {request.videoFolder.split("/").pop()}  */}
                              {request.isMusicIncluded ? " with music" : " without music"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Created: {formatDate(request.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                {selectedMontage ? (
                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h2 className="text-lg text-slate-600 font-semibold">Montage Details</h2>
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">ID: {selectedMontage.id}</p>
                        <p className="text-sm text-gray-500">
                          Created: {formatDate(selectedMontage.createdAt)}
                        </p>
                        {selectedMontage.updatedAt && (
                          <p className="text-sm text-gray-500">
                            Updated: {formatDate(selectedMontage.updatedAt)}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Status: {getStatusBadge(selectedMontage.status)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Video Folder: {selectedMontage.videoFolder}
                        </p>
                        {selectedMontage.isMusicIncluded && (
                          <p className="text-sm text-gray-500">
                            Music Folder: {selectedMontage.musicFolder}
                          </p>
                        )}
                      </div>

                      {selectedMontage.status === "COMPLETED" && selectedMontage.result && (
                        <div className="mt-4">
                          <h3 className="text-slate-600 font-semibold mb-2">Completed Montage</h3>
                          <div className="aspect-video relative overflow-hidden rounded-lg">
                            <video
                              src={selectedMontage.result.publicUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="mt-2 flex justify-end">
                            <a
                              href={selectedMontage.result.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              Download Video
                            </a>
                          </div>
                        </div>
                      )}

                      {selectedMontage.status === "FAILED" && selectedMontage.result && selectedMontage.result.error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                          <h3 className="font-semibold mb-1">Error</h3>
                          <p className="text-sm">{selectedMontage.result.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center h-full flex items-center justify-center">
                    <p className="text-gray-500">Select a montage to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default MontagesPage; 
"use client";

import { useEffect, useState } from "react";

/**
 * Debug page to check if cookies are being set
 * 
 * Visit http://localhost:3001/debug after logging in
 * to see what cookies the browser has
 */
export default function DebugPage() {
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [hasCookie, setHasCookie] = useState(false);

  useEffect(() => {
    // Parse cookies
    const parsed: Record<string, string> = {};
    document.cookie.split("; ").forEach((cookie) => {
      const [name, value] = cookie.split("=");
      if (name) {
        parsed[name] = decodeURIComponent(value);
      }
    });

    setCookies(parsed);
    setHasCookie(!!parsed.access_token);

    // Log to console for debugging
    console.log("All cookies:", parsed);
    console.log("Has access_token:", !!parsed.access_token);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Cookie Debug Page</h1>

        {/* Status */}
        <div className={`p-4 rounded-lg mb-6 ${hasCookie ? "bg-green-100" : "bg-red-100"}`}>
          <p className={`text-lg font-semibold ${hasCookie ? "text-green-800" : "text-red-800"}`}>
            {hasCookie
              ? "✅ access_token cookie found!"
              : "❌ access_token cookie NOT found"}
          </p>
        </div>

        {/* Cookies Table */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">All Cookies</h2>
          {Object.keys(cookies).length === 0 ? (
            <p className="text-gray-600">No cookies found</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Name</th>
                  <th className="text-left p-2 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cookies).map(([name, value]) => (
                  <tr key={name} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono">{name}</td>
                    <td className="p-2 font-mono text-sm break-all">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">📋 What to check:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Open DevTools → Network tab</strong>
            </li>
            <li>
              <strong>Go to /login and submit credentials</strong>
            </li>
            <li>
              <strong>Find the /auth/login request</strong>
            </li>
            <li>
              <strong>Check Response Headers:</strong>
              <ul className="ml-6 mt-2 space-y-1">
                <li>
                  ❌ Missing <code className="bg-red-100 px-2 py-1">Set-Cookie</code> header?
                  <br />
                  → <strong>Backend must send:</strong>
                  <br />
                  <code className="bg-gray-200 px-2 py-1 text-xs">
                    Set-Cookie: access_token=&lt;token&gt;; HttpOnly; Secure; SameSite=Strict
                  </code>
                </li>
                <li>
                  ❌ Missing{" "}
                  <code className="bg-red-100 px-2 py-1">
                    Access-Control-Allow-Credentials: true
                  </code>
                  ?
                  <br />
                  → <strong>Backend must send this CORS header</strong>
                </li>
              </ul>
            </li>
            <li>
              <strong>Refresh this page after login</strong> - it will show all cookies
            </li>
          </ol>
        </div>

        {/* What should happen */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-bold mb-4">✅ If everything is working:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Login response has <code className="bg-green-100 px-2 py-1">Set-Cookie</code> header</li>
            <li>This page shows <strong>access_token</strong> cookie</li>
            <li>You can access /dashboard without redirecting to /login</li>
            <li>All API requests include the cookie automatically</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mt-6">
          <button
            onClick={() => window.location.href = "/login"}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="ml-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

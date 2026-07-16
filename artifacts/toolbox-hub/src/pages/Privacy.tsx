import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Your data stays on your device. Here's exactly what that means.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6 text-sm leading-relaxed text-gray-600">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Everything runs in your browser</h2>
          <p>
            All ToolBox Hub tools work entirely on your device. Files you upload (images, PDFs, documents),
            text you type, and results you generate are processed locally in your browser and are never
            uploaded to any server.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">What we store locally</h2>
          <p>
            Some tools save data in your browser's local storage so you don't lose your work — for example
            to-do lists, planners, notes, your favorite tools, and recently used tools. This data lives only
            on your device and can be cleared at any time via your browser settings.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">No accounts, no tracking</h2>
          <p>
            We don't require sign-up, we don't set advertising cookies, and we don't sell or share personal data.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Questions?</h2>
          <p>
            Email us at <a href="mailto:toolboxhub2@gmail.com" className="text-blue-600 hover:underline">toolboxhub2@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Use</h1>
        <p className="text-muted-foreground">Simple, fair terms for free tools.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6 text-sm leading-relaxed text-gray-600">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Free to use</h2>
          <p>
            All tools on ToolBox Hub are free for personal and commercial use. No account or payment is required.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">No warranty</h2>
          <p>
            Tools are provided “as is”, without warranty of any kind. While we work hard to keep results accurate,
            always double-check important outputs (for example financial, health, or legal calculations) before
            relying on them.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Your content is yours</h2>
          <p>
            Anything you create or process with these tools belongs to you. Since everything runs in your browser,
            we never receive a copy of your files or data.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Fair use</h2>
          <p>
            Please don't attempt to disrupt the service or use it for unlawful purposes.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Questions?</h2>
          <p>
            Email us at <a href="mailto:hello@toolboxhub.app" className="text-blue-600 hover:underline">hello@toolboxhub.app</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

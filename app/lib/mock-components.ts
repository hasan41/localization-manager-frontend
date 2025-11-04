/**
 * Mock components for testing without OpenAI
 * Use these to demonstrate save/load and localization features
 */

export const mockComponents = [
  {
    name: "WelcomeCard",
    description: "A welcoming card with title and description",
    code: `import React from 'react';

export default function WelcomeCard() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome to Our Platform
        </h2>
        <p className="mt-4 text-gray-600">
          Start your journey with us today
        </p>
        <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Get Started
        </button>
      </div>
    </div>
  );
}`
  },
  {
    name: "PricingCard",
    description: "A pricing card component with features",
    code: `import React from 'react';

export default function PricingCard() {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Premium Plan
      </h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        $29<span className="text-base font-normal">/month</span>
      </p>
      <ul className="mt-4 space-y-2">
        <li className="text-gray-600">✓ Unlimited access</li>
        <li className="text-gray-600">✓ Priority support</li>
        <li className="text-gray-600">✓ Advanced features</li>
      </ul>
      <button className="mt-6 w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Subscribe Now
      </button>
    </div>
  );
}`
  },
  {
    name: "ContactForm",
    description: "A simple contact form",
    code: `import React from 'react';

export default function ContactForm() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Contact Us
      </h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={4}
            placeholder="Type your message here"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}`
  },
  {
    name: "FeatureCard",
    description: "A feature showcase card",
    code: `import React from 'react';

export default function FeatureCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
        <span className="text-2xl">🚀</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Fast Performance
      </h3>
      <p className="text-gray-600">
        Lightning-fast load times and smooth interactions for the best user experience.
      </p>
      <button className="mt-4 text-purple-600 hover:text-purple-700 font-medium">
        Learn More →
      </button>
    </div>
  );
}`
  }
];

/**
 * Get a random mock component
 */
export function getRandomMockComponent() {
  return mockComponents[Math.floor(Math.random() * mockComponents.length)];
}

/**
 * Save a mock component to the database
 */
export async function saveMockComponent(component: typeof mockComponents[0]) {
  const response = await fetch('/api/components', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(component)
  });

  if (!response.ok) {
    throw new Error('Failed to save mock component');
  }

  return response.json();
}

/**
 * Demo script for testing
 */
export async function runDemo() {
  console.log('🎭 Running demo...');

  // Save all mock components
  for (const component of mockComponents) {
    try {
      const result = await saveMockComponent(component);
      console.log(`✅ Saved: ${component.name}`, result);
    } catch (error) {
      console.error(`❌ Failed to save: ${component.name}`, error);
    }
  }

  console.log('🎉 Demo complete! Check Component History sidebar.');
}

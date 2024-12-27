export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing or using DealSight's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                We grant you a limited, non-exclusive, non-transferable, and revocable license to use our service for your personal use, subject to these Terms of Service.
              </p>
              <p className="text-gray-600 mb-4">
                You may not:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Modify or copy our service's materials</li>
                <li>Use the service for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the materials to another person</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                To access certain features of our service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Maintaining the confidentiality of your account</li>
                <li>Restricting access to your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Service Modifications</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Modify or discontinue any part of our service</li>
                <li>Change service fees with notice</li>
                <li>Restrict access to some or all of the service</li>
                <li>Update these terms at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                DealSight shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Governing Law</h2>
              <p className="text-gray-600 mb-4">
                These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which DealSight operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact us at:
                <br />
                Email: legal@dealsight.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import { FileText, Check, X } from 'lucide-react';

export default function TermsOfService() {
  const [accepted, setAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setShowModal(false);
  };

  const handleDecline = () => {
    setAccepted(false);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-800">Terms of Service</h1>
          </div>
          <p className="text-slate-600">
            Last Updated: October 20, 2025
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Funeral Management System - Professional Services Agreement
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="prose max-w-none">
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                By accessing and using the Funeral Management System ("the System"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
              <p className="text-slate-700 leading-relaxed">
                These terms apply to all users of the System, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Service Description</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                The Funeral Management System provides digital tools and services for managing funeral arrangements, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Deceased information management and record keeping</li>
                <li>Service scheduling and coordination</li>
                <li>Financial tracking and invoicing</li>
                <li>Document generation and storage</li>
                <li>Communication tools for family members and staff</li>
                <li>Memorial and tribute services</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Privacy and Data Protection</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We understand the sensitive nature of funeral services and are committed to protecting your privacy. All personal information, including details about the deceased and their families, is handled with the utmost confidentiality and in compliance with applicable data protection laws.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Data is encrypted both in transit and at rest. We implement industry-standard security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information and data stored on our System.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. User Responsibilities</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                As a user of the System, you agree to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Use the System in accordance with all applicable laws and regulations</li>
                <li>Treat all information with appropriate respect and sensitivity</li>
                <li>Not misuse or attempt to gain unauthorized access to the System</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Payment Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Payment for services rendered through the System are subject to the following terms:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>All prices are quoted in local currency unless otherwise specified</li>
                <li>Payment is due according to the terms specified in individual service agreements</li>
                <li>Late payments may be subject to additional fees as permitted by law</li>
                <li>Refund policies are determined by individual service providers</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                The System and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. This includes but is not limited to damages for loss of profits, goodwill, use, data, or other intangible losses.
              </p>
              <p className="text-slate-700 leading-relaxed">
                While we strive to maintain accurate and up-to-date information, we do not warrant the accuracy, completeness, or usefulness of any information provided through the System.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. Modifications to Service</h2>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to modify or discontinue, temporarily or permanently, the System or any features or portions thereof without prior notice. You agree that we will not be liable for any modification, suspension, or discontinuance of the System.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">8. Termination</h2>
              <p className="text-slate-700 leading-relaxed">
                We may terminate or suspend your account and access to the System immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the System will immediately cease.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">9. Contact Information</h2>
              <p className="text-slate-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700">Email: support@funeralmanagementsystem.com</p>
                <p className="text-slate-700">Phone: 1-800-FUNERAL-HELP</p>
                <p className="text-slate-700">Address: 123 Memorial Drive, Suite 100</p>
              </div>
            </section>
          </div>
        </div>

        {/* Agreement Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              id="agree"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-slate-700 border-slate-300 rounded focus:ring-slate-500"
            />
            <label htmlFor="agree" className="text-slate-700 cursor-pointer">
              I have read and agree to the Terms of Service. I understand that by using the Funeral Management System, I am bound by these terms and conditions.
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAccept}
              disabled={!accepted}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                accepted
                  ? 'bg-slate-700 text-white hover:bg-slate-800 shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-5 h-5" />
              Accept Terms
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              <X className="w-5 h-5" />
              Decline
            </button>
          </div>

          {accepted && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-center font-medium">
                ✓ Terms of Service accepted. You may now proceed to use the system.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>© 2025 Funeral Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
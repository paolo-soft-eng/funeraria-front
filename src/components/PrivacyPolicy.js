import React, { useState } from 'react';
import { Shield, Lock, Eye, FileText, Users, Bell, Phone, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 'intro',
      title: 'Introduction',
      icon: Shield,
      content: `We understand the sensitive nature of funeral arrangements and are committed to protecting your privacy during this difficult time. This Privacy Policy explains how we collect, use, and safeguard your personal information.`
    },
    {
      id: 'collection',
      title: 'Information We Collect',
      icon: FileText,
      content: `We collect information necessary to provide funeral services, including:`,
      list: [
        'Personal details of the deceased (name, date of birth, date of death, Social Security Number)',
        'Next of kin and family contact information',
        'Medical and legal documents required for death certificates',
        'Payment and billing information',
        'Service preferences and memorial arrangements',
        'Photos and biographical information for obituaries and memorial services'
      ]
    },
    {
      id: 'usage',
      title: 'How We Use Your Information',
      icon: Eye,
      content: `Your information is used exclusively for:`,
      list: [
        'Coordinating and executing funeral services',
        'Filing death certificates and legal documentation',
        'Processing payments and insurance claims',
        'Communicating with family members and authorized parties',
        'Creating obituaries and memorial materials',
        'Maintaining records as required by law'
      ]
    },
    {
      id: 'sharing',
      title: 'Information Sharing',
      icon: Users,
      content: `We share information only when necessary:`,
      list: [
        'With government agencies for death certificates and legal compliance',
        'With cemeteries, crematoriums, and other service providers',
        'With insurance companies for claims processing',
        'With medical examiners or coroners when required',
        'With family members and authorized representatives',
        'We never sell your information to third parties'
      ]
    },
    {
      id: 'security',
      title: 'Data Security',
      icon: Lock,
      content: `We implement comprehensive security measures:`,
      list: [
        'Encrypted data storage and transmission',
        'Secure access controls and authentication',
        'Regular security audits and updates',
        'Staff training on privacy and confidentiality',
        'Physical security of paper records',
        'Secure disposal of sensitive documents'
      ]
    },
    {
      id: 'retention',
      title: 'Data Retention',
      icon: FileText,
      content: `We retain records in accordance with legal requirements and professional standards. Funeral service records are typically maintained for a minimum of 7-10 years, or as required by state law. Financial records are kept according to tax regulations.`
    },
    {
      id: 'rights',
      title: 'Your Rights',
      icon: Shield,
      content: `You have the right to:`,
      list: [
        'Access your personal information',
        'Request corrections to inaccurate data',
        'Request deletion of data (subject to legal requirements)',
        'Opt-out of non-essential communications',
        'Designate authorized representatives',
        'File a complaint with regulatory authorities'
      ]
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: Phone,
      content: `For privacy concerns or questions, please contact our Privacy Officer:`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-800 p-4 rounded-full">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-lg text-slate-600">Funeral Management System</p>
          <p className="text-sm text-slate-500 mt-2">Last Updated: October 20, 2025</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 space-y-8">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <div key={section.id} className="border-b border-slate-200 last:border-0 pb-8 last:pb-0">
                  <button
                    onClick={() => setActiveSection(isActive ? null : section.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-100 p-3 rounded-lg mt-1">
                        <Icon className="w-6 h-6 text-slate-700" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                          {section.title}
                        </h2>
                        <p className="text-slate-700 leading-relaxed">
                          {section.content}
                        </p>
                        {section.list && (
                          <ul className="mt-4 space-y-2">
                            {section.list.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-slate-400 mt-1">•</span>
                                <span className="text-slate-600">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Contact Information */}
            <div className="bg-slate-50 rounded-lg p-6 mt-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="text-slate-900 font-medium">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="text-slate-900 font-medium">privacy@funeralservices.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900">
                    <strong>Important Notice:</strong> We may update this Privacy Policy periodically. 
                    Material changes will be communicated to authorized family members via email or postal mail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-600 text-sm">
          <p>© 2025 Funeral Management System. All rights reserved.</p>
          <p className="mt-2">
            Committed to serving families with dignity, respect, and confidentiality.
          </p>
        </div>
      </div>
    </div>
  );
}
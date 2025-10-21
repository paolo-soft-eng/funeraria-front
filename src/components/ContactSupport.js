import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Headphones, Calendar, FileText, Users, AlertCircle } from 'lucide-react';

export default function ContactSupport() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
    urgent: false
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: '24/7 Emergency Line',
      details: '(555) 123-4567',
      description: 'Available anytime for immediate assistance',
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: Phone,
      title: 'General Support',
      details: '(555) 123-4568',
      description: 'Monday - Friday, 8:00 AM - 6:00 PM',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email Support',
      details: 'support@funeralservices.com',
      description: 'Response within 24 hours',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      details: 'Available on website',
      description: 'Monday - Friday, 9:00 AM - 5:00 PM',
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const supportCategories = [
    { value: 'arrangement', label: 'Service Arrangements', icon: Calendar },
    { value: 'billing', label: 'Billing & Payments', icon: FileText },
    { value: 'documentation', label: 'Documentation & Records', icon: FileText },
    { value: 'technical', label: 'Technical Support', icon: Headphones },
    { value: 'general', label: 'General Inquiry', icon: MessageCircle },
    { value: 'other', label: 'Other', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-800 p-4 rounded-full">
              <Headphones className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Contact Support</h1>
          <p className="text-lg text-slate-600">We're here to help you during this difficult time</p>
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-900 font-semibold mb-1">Emergency Services</h3>
              <p className="text-red-800 text-sm">
                If you need immediate assistance or are reporting a death, please call our 24/7 emergency line at <strong>(555) 123-4567</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className={`${method.color} p-3 rounded-lg w-fit mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{method.title}</h3>
                <p className="text-slate-700 font-medium mb-2">{method.details}</p>
                <p className="text-sm text-slate-500">{method.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Send Us a Message</h2>
              
              {submitted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 font-medium">Thank you for contacting us. We'll respond within 24 hours.</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select a category</option>
                      {supportCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none resize-none"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="urgent"
                    id="urgent"
                    checked={formData.urgent}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="urgent" className="text-sm text-slate-700">
                    This is an urgent matter
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-slate-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Office Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-6 h-6 text-slate-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Office Location</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    123 Memorial Drive<br />
                    Springfield, ST 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-6 h-6 text-slate-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Business Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Monday - Friday:</span>
                      <span className="text-slate-900 font-medium">8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Saturday:</span>
                      <span className="text-slate-900 font-medium">9:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Sunday:</span>
                      <span className="text-slate-900 font-medium">By Appointment</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 mt-3">
                      <span className="text-red-600 font-medium">Emergency: 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-slate-800 text-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Need Quick Answers?</h3>
              <p className="text-slate-300 text-sm mb-4">
                Check our FAQ section for immediate answers to common questions.
              </p>
              <button className="w-full bg-white text-slate-800 py-2 px-4 rounded-lg font-medium hover:bg-slate-100 transition-colors">
                View FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
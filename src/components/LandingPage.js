import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Clock,
  Menu,
  X,
  Heart,
  Calendar,
  FileText,
  Users,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function FuneralManagementLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = ()=>{
    navigate('/auth')
  }
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Navigation */}
      <nav className="bg-gray-900 text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <h1 className="text-xl font-semibold">Gomez Funeraria</h1>
              <p className="text-xs text-gray-300">Funeral Management Services</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Home</a>
            <a href="#services" className="hover:text-gray-300 transition-colors">Services</a>
            <a href="#about" className="hover:text-gray-300 transition-colors">About</a>
            <a href="#testimonials" className="hover:text-gray-300 transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-2 border-t border-gray-700">
            <div className="flex flex-col space-y-3 px-2">
              <a href="#" className="py-2 hover:text-gray-300 transition-colors">Home</a>
              <a href="#services" className="py-2 hover:text-gray-300 transition-colors">Services</a>
              <a href="#about" className="py-2 hover:text-gray-300 transition-colors">About</a>
              <a href="#testimonials" className="py-2 hover:text-gray-300 transition-colors">Testimonials</a>
              <a href="#contact" className="py-2 hover:text-gray-300 transition-colors">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-semibold mb-4">Compassionate Service in Your Time of Need</h2>
              <p className="text-lg text-gray-300 mb-8">Our comprehensive funeral management system helps you handle all aspects of memorial services with dignity and respect.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors shadow-lg" onClick={handleNavigate}>
                  Get Started
                </button>
                <button className="border border-white hover:bg-white hover:text-gray-900 text-white py-3 px-6 rounded-lg transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">Our Comprehensive Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide complete funeral management solutions to help you honor your loved ones with dignity and ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Service Planning</h3>
              <p className="text-gray-600">
                Comprehensive planning tools for funeral services, memorials, and celebrations of life.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Documentation</h3>
              <p className="text-gray-600">
                Assistance with all necessary paperwork, permits, and legal documentation.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Family Support</h3>
              <p className="text-gray-600">
                Compassionate guidance and support for family members during difficult times.
              </p>
            </div>

            {/* Service 4 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Grief Resources</h3>
              <p className="text-gray-600">
                Access to counseling services and resources for grief management and healing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="bg-gray-200 h-96 rounded-lg shadow-md flex items-center justify-center">
                <img src="/api/placeholder/500/384" alt="Funeral service professionals" className="rounded-lg" />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-semibold mb-4">About Gomez Funeraria</h2>
              <p className="text-gray-600 mb-4">
                For over 25 years, we've been helping families navigate the difficult journey of saying goodbye to loved ones. Our compassionate team understands the importance of honoring a life well-lived.
              </p>
              <p className="text-gray-600 mb-6">
                Our funeral management system was developed with input from funeral directors, grief counselors, and families to ensure it meets the needs of everyone involved in the memorial process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors shadow-lg">
                  Our Story
                </button>
                <button className="bg-white hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg transition-colors shadow-lg border border-gray-300">
                  Meet Our Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">What Families Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from families who have used our funeral management services during their time of need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">JD</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">James Douglas</h4>
                  <p className="text-gray-500 text-sm">Chicago, IL</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "During our family's difficult time, Gomez Funeraria made the process seamless and respectful. Their organization and compassion were invaluable."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">MR</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Maria Rodriguez</h4>
                  <p className="text-gray-500 text-sm">Austin, TX</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The management system simplified all the complicated paperwork and planning. It allowed us to focus on celebrating my father's life instead of administrative tasks."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">TJ</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Thomas Johnson</h4>
                  <p className="text-gray-500 text-sm">Denver, CO</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I was overwhelmed until we found Gomez Funeraria. Their guidance and support through every step of planning my mother's memorial was a blessing."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-semibold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-100 mb-8 max-w-2xl mx-auto">
            Our dedicated team is available 24/7 to help you navigate funeral arrangements with dignity and respect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-gray-700 hover:bg-gray-50 py-3 px-8 rounded-lg transition-colors shadow-lg font-semibold">
              Request a Consultation
            </button>
            <button className="border border-white hover:bg-gray-600 text-white py-3 px-8 rounded-lg transition-colors">
              View Our Services
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              We're available 24/7 to provide support and answer any questions you may have.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-6">Get In Touch</h3>

              <div className="flex items-center mb-4">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span>(555) 123-4567</span>
              </div>

              <div className="flex items-center mb-4">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span>support@gomezfuneraria.com</span>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <span>Available 24/7</span>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-700 p-6 rounded-lg md:col-span-2">
              <h3 className="text-xl font-semibold mb-6">Send Us a Message</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="p-3 rounded bg-gray-600 text-white placeholder-gray-400 border border-gray-500"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="p-3 rounded bg-gray-600 text-white placeholder-gray-400 border border-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="p-3 rounded bg-gray-600 text-white placeholder-gray-400 border border-gray-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="p-3 rounded bg-gray-600 text-white placeholder-gray-400 border border-gray-500"
                />
              </div>

              <textarea
                placeholder="Your Message"
                className="w-full p-3 rounded bg-gray-600 text-white placeholder-gray-400 border border-gray-500 mb-4"
                rows="4"
              ></textarea>

              <button className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors shadow-lg">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold">Gomez Funeraria</h3>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Compassionate Funeral Management Services
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
              <a href="#services" className="text-gray-300 hover:text-white transition-colors">Services</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Gomez Funeraria Funeral Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
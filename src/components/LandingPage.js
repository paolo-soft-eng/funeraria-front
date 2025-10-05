import React, { useEffect, useState } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Client-side validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.message.trim()) {
      setError('Message is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost/apii/components/contact_submit.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit the form');
      }

      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      // Reset submission status after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setIsSubmitting(false);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleNavigate = () => {
    navigate('/auth');
    console.log('Navigate to auth');
  }

  const handleStory = ()=>{
    navigate('/story')
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Navigation */}
      <nav className="bg-gray-900/95 backdrop-blur-sm text-white py-4 px-6 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Heart className="h-8 w-8 text-gray-400 mr-3" />
          <div>
            <h1 className="text-xl font-semibold">Funeraria Gomez - Udtohan</h1>
            <p className="text-xs text-gray-300">Funeral Management Services</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          {['Home', 'Services', 'About', 'Testimonials', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
              className="relative pb-1 cursor-pointer group hover:text-gray-300 transition-colors duration-900"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gray-300 transition-all group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-2 border-t border-gray-700">
          <div className="flex flex-col space-y-3 px-2">
            {['Home', 'Services', 'About', 'Testimonials', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                className="py-2 hover:text-gray-300 transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>

      {/* Hero Section with Video Background */}
      <section className="relative h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/assets/vid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="flex flex-col items-center text-center text-white">
              <div className="max-w-4xl">
                <h2 className="text-1xl md:text-3xl lg:text-6xl font-light mb-6 leading-tight">
                  Your partner who takes good care of you and your loved ones
                </h2>
                <p className="text-xl md:text-2xl text-gray-200 mb-12 font-light leading-relaxed max-w-3xl mx-auto">
                  Our comprehensive funeral management system helps you handle all aspects of memorial services with dignity and respect.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-4 px-8 rounded-lg transition-all duration-300 shadow-lg border border-white/30 font-medium text-lg"
                    onClick={handleNavigate}
                  >
                    Get Started
                  </button>
                  <button className="border-2 border-white/70 hover:bg-white hover:text-gray-900 text-white py-4 px-8 rounded-lg transition-all duration-300 font-medium text-lg">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-800">Our Comprehensive Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide complete funeral management solutions to help you honor your loved ones with dignity and ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <div className="group bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-20 h-20 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Service Planning</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive planning tools for funeral services, memorials, and celebrations of life.
              </p>
            </div>

            {/* Service 2 */}
            <div className="group bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-20 h-20 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Documentation</h3>
              <p className="text-gray-600 leading-relaxed">
                Assistance with all necessary paperwork, permits, and legal documentation.
              </p>
            </div>

            {/* Service 3 */}
            <div className="group bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-20 h-20 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Family Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Compassionate guidance and support for family members during difficult times.
              </p>
            </div>

            {/* Service 4 */}
            <div className="group bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-20 h-20 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Grief Resources</h3>
              <p className="text-gray-600 leading-relaxed">
                Access to counseling services and resources for grief management and healing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="bg-gray-200 h-96 lg:h-[500px] rounded-2xl shadow-lg overflow-hidden">
                <img
                 src='/assets/gomez_logo.jpg'
                  alt="Funeral service professionals"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-light mb-8 text-gray-800">Funeraria Gomez - Udtohan</h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                For over 25 years, we've been helping families navigate the difficult journey of saying goodbye to loved ones. Our compassionate team understands the importance of honoring a life well-lived.
              </p>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Our funeral management system was developed with input from funeral directors, grief counselors, and families to ensure it meets the needs of everyone involved in the memorial process.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button className="bg-gray-800 hover:bg-gray-900 text-white py-4 px-8 rounded-lg transition-all duration-300 shadow-lg text-lg font-medium" onClick={handleStory}>
                  Our Story
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-800 py-4 px-8 rounded-lg transition-all duration-300 shadow-lg border-2 border-gray-300 text-lg font-medium">
                  Meet Our Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-800">What Families Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Hear from families who have used our funeral management services during their time of need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-bold text-lg">PV</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-lg text-gray-800">Paolo Villanueva</h4>
                  <p className="text-gray-500">Poblacion, Dagohoy, Bohol</p>
                </div>
              </div>
              <p className="text-gray-600 italic text-lg leading-relaxed">
                "During our family's difficult time, Gomez Funeraria made the process seamless and respectful. Their organization and compassion were invaluable."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-bold text-lg">RJ</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-lg text-gray-800">Reynan Jumaylab</h4>
                  <p className="text-gray-500">Ba-ang, Catigbian, Bohol</p>
                </div>
              </div>
              <p className="text-gray-600 italic text-lg leading-relaxed">
                "The management system simplified all the complicated paperwork and planning. It allowed us to focus on celebrating my father's life instead of administrative tasks."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-bold text-lg">RB</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-lg text-gray-800">Rosanina Bagot</h4>
                  <p className="text-gray-500">Santa cruz, Dagohoy, Bohol, </p>
                </div>
              </div>
              <p className="text-gray-600 italic text-lg leading-relaxed">
                "I was overwhelmed until we found Gomez Funeraria. Their guidance and support through every step of planning my mother's memorial was a blessing."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-bold text-lg">JE</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-lg text-gray-800">Jasper Elevera</h4>
                  <p className="text-gray-500">Maribojoc, Bohol</p>
                </div>
              </div>
              <p className="text-gray-600 italic text-lg leading-relaxed">
                "I was overwhelmed until we found Gomez Funeraria. Their guidance and support through every step of planning my mother's memorial was a blessing."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-bold text-lg">AP</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-lg text-gray-800">Aianlee Pantoja</h4>
                  <p className="text-gray-500">Maribojoc, Bohol</p>
                </div>
              </div>
              <p className="text-gray-600 italic text-lg leading-relaxed">
                "I was overwhelmed until we found Gomez Funeraria. Their guidance and support through every step of planning my mother's memorial was a blessing."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-light mb-8">Ready to Get Started?</h2>
          <p className="text-xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Our dedicated team is available 24/7 to help you navigate funeral arrangements with dignity and respect.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white text-gray-800 hover:bg-gray-100 py-4 px-10 rounded-lg transition-all duration-300 shadow-lg font-semibold text-lg">
              Request a Consultation
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-gray-800 text-white py-4 px-10 rounded-lg transition-all duration-300 font-semibold text-lg">
              View Our Services
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6">Contact Us</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're available 24/7 to provide support and answer any questions you may have.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-8 text-white">Get In Touch</h3>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-gray-700 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-gray-300" />
                  </div>
                  <span className="text-lg">0909 669 7792</span>
                </div>

                <div className="flex items-center">
                  <div className="bg-gray-700 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-gray-300" />
                  </div>
                  <span className="text-lg">support@funerariagomez.com</span>
                </div>

                <div className="flex items-center">
                  <div className="bg-gray-700 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-gray-300" />
                  </div>
                  <span className="text-lg">Available 24/7</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-8 text-white">Send Us a Message</h3>

              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Thank You for Reaching Out</h4>
                  <p className="text-gray-300">We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-xl">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-red-200">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                      className="p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-gray-500 focus:outline-none transition-colors duration-300"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className="p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-gray-500 focus:outline-none transition-colors duration-300"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-gray-500 focus:outline-none transition-colors duration-300"
                      required
                    />
                  </div>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-gray-500 focus:outline-none transition-colors duration-300 mb-6"
                    rows="5"
                    required
                  ></textarea>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4 px-8 rounded-lg transition-all duration-300 shadow-lg font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Message</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-gray-400 mr-3" />
                <h3 className="text-2xl font-semibold">Funeraria Gomez - Udtohan</h3>
              </div>
              <p className="text-gray-400 mt-2 text-lg">
                Compassionate Funeral Management Services
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-lg">Home</a>
              <a href="#services" className="text-gray-300 hover:text-white transition-colors duration-300 text-lg">Services</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-300 text-lg">About</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors duration-300 text-lg">Testimonials</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-lg">Contact</a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p className="text-lg">© {new Date().getFullYear()} Funeraria Gomez - Udtohan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

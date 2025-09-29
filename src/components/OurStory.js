import React from 'react';
import { Heart, Award, Users, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OurStory() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-gray-900/95 backdrop-blur-sm text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <h1 className="text-xl font-semibold">Funeraria Gomez - Udtohan</h1>
              <p className="text-xs text-gray-300">Funeral Management Services</p>
            </div>
          </div>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 hover:text-gray-300 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-light mb-6">Our Story</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A legacy of compassion, dedication, and service to families in their most difficult moments
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="bg-gray-200 h-96 lg:h-[500px] rounded-2xl shadow-lg overflow-hidden">
                <img
                  src="/gomez_logo.jpg"
                  alt="Funeraria Gomez - Udtohan establishment"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-800">Where It All Began</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Funeraria Gomez - Udtohan was established over 25 years ago in the heart of Bohol, Philippines. What started as a small family-owned funeral home has grown into one of the most trusted funeral service providers in the region.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our founders, driven by their personal experiences with loss and grief, recognized the need for compassionate, professional funeral services that would honor the deceased while providing comfort and support to grieving families.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From humble beginnings, we have remained committed to our core values: dignity, respect, compassion, and excellence in service. These principles continue to guide everything we do today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-800">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The principles that have guided us for over two decades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-20 h-20 mb-6 flex items-center justify-center mx-auto">
                <Heart className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Compassion</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                We treat every family with empathy, understanding, and genuine care during their most vulnerable moments.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-20 h-20 mb-6 flex items-center justify-center mx-auto">
                <Award className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Excellence</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                We maintain the highest standards in every aspect of our service, from facilities to professional conduct.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-20 h-20 mb-6 flex items-center justify-center mx-auto">
                <Users className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Respect</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                We honor the dignity of the deceased and respect the cultural and religious traditions of every family.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-full w-20 h-20 mb-6 flex items-center justify-center mx-auto">
                <Clock className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Availability</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                We are available 24/7, 365 days a year, because we know that loss doesn't follow a schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestone Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-800">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Key milestones in our history of service
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                  1999
                </div>
                <div className="w-1 flex-1 bg-gray-300 mt-4"></div>
              </div>
              <div className="flex-1 pb-12">
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">Foundation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Funeraria Gomez - Udtohan was established in Bohol, beginning our mission to serve families with compassion and professionalism.
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                  2005
                </div>
                <div className="w-1 flex-1 bg-gray-300 mt-4"></div>
              </div>
              <div className="flex-1 pb-12">
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">Expansion</h3>
                <p className="text-gray-600 leading-relaxed">
                  Expanded our facilities and services to accommodate growing community needs, adding modern amenities and additional chapel spaces.
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                  2012
                </div>
                <div className="w-1 flex-1 bg-gray-300 mt-4"></div>
              </div>
              <div className="flex-1 pb-12">
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">Recognition</h3>
                <p className="text-gray-600 leading-relaxed">
                  Received regional recognition for excellence in funeral services, solidifying our reputation as a trusted provider in the community.
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                  2018
                </div>
                <div className="w-1 flex-1 bg-gray-300 mt-4"></div>
              </div>
              <div className="flex-1 pb-12">
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">Modernization</h3>
                <p className="text-gray-600 leading-relaxed">
                  Introduced comprehensive grief support programs and counseling services to better serve families beyond traditional funeral services.
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                  2024
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">Digital Innovation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Launched our advanced funeral management system, making planning and coordination easier for families during difficult times.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6">Our Commitment to You</h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            For over 25 years, we have been honored to serve thousands of families across Bohol. Our commitment remains unwavering: to provide compassionate, professional funeral services that honor your loved ones and support you through your journey of grief and healing.
          </p>
          <p className="text-xl text-gray-200 leading-relaxed">
            We understand that every life is unique and deserves to be celebrated in a meaningful way. That's why we work closely with each family to create personalized memorial services that truly reflect the life and legacy of those we've lost.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-light mb-8 text-gray-800">Let Us Help You</h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Whether you're planning ahead or need immediate assistance, our compassionate team is here for you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={handleGoBack}
              className="bg-gray-800 hover:bg-gray-900 text-white py-4 px-10 rounded-lg transition-all duration-300 shadow-lg font-semibold text-lg"
            >
              Contact Us Today
            </button>
            <button
              onClick={handleGoBack}
              className="border-2 border-gray-800 hover:bg-gray-800 hover:text-white text-gray-800 py-4 px-10 rounded-lg transition-all duration-300 font-semibold text-lg"
            >
              View Our Services
            </button>
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
              <button onClick={handleGoBack} className="text-gray-300 hover:text-white transition-colors duration-300 text-lg">Home</button>
              <button onClick={handleGoBack} className="text-gray-300 hover:text-white transition-colors duration-300 text-lg">Services</button>
              <button onClick={handleGoBack} className="text-gray-300 hover:text-white transition-colors duration-300 text-lg">About</button>
              <button onClick={handleGoBack} className="text-gray-300 hover:text-white transition-colors duration-300 text-lg">Contact</button>
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
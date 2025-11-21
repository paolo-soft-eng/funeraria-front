import React, { useEffect, useRef } from 'react';

const ClientAbout = () => {
    const heroRef = useRef(null);
    const storyRef = useRef(null);
    const valuesRef = useRef(null);
    const teamRef = useRef(null);
    const facilitiesRef = useRef(null);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-section');
                    entry.target.classList.remove('reverse-animate-section');
                } else {
                    entry.target.classList.remove('animate-section');
                    entry.target.classList.add('reverse-animate-section');
                }
            });
        }, options);

        const refs = [heroRef, storyRef, valuesRef, teamRef, facilitiesRef];
        refs.forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => {
            refs.forEach(ref => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            });
        };
    }, []);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Replace the styled-jsx with regular style tag */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @keyframes slideDown {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(50px); opacity: 0; }
                }

                @keyframes slideInRight {
                    from { transform: translateX(50px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @keyframes slideInLeft {
                    from { transform: translateX(-50px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(50px); opacity: 0; }
                }

                @keyframes slideOutLeft {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(-50px); opacity: 0; }
                }

                .animate-section {
                    animation: fadeIn 1s ease forwards;
                }

                .reverse-animate-section {
                    animation: fadeOut 1s ease forwards;
                }

                .animate-section h2,
                .animate-section h3 {
                    animation: slideUp 0.8s ease 0.2s both;
                }

                .reverse-animate-section h2,
                .reverse-animate-section h3 {
                    animation: slideDown 0.8s ease 0.2s both;
                }

                .animate-section p {
                    animation: fadeIn 0.8s ease 0.4s both;
                }

                .reverse-animate-section p {
                    animation: fadeOut 0.8s ease 0.4s both;
                }

                .slide-left {
                    animation: slideInLeft 0.8s ease both;
                }

                .reverse-slide-left {
                    animation: slideOutLeft 0.8s ease both;
                }

                .slide-right {
                    animation: slideInRight 0.8s ease both;
                }

                .reverse-slide-right {
                    animation: slideOutRight 0.8s ease both;
                }

                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }

                .scroll-smooth {
                    scroll-behavior: smooth;
                }
                `}
            </style>

            <div ref={heroRef} className="bg-gray-900 text-white py-20 text-center opacity-1">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-serif mb-4">Our Story</h2>
                    <p className="max-w-3xl mx-auto text-lg">
                        For over 35 years, Gomez Funeral Home has served our community with compassion,
                        dignity, and respect during the most difficult times.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 scroll-smooth">
                <section ref={storyRef} className="mb-16 flex flex-col md:flex-row gap-8 opacity-0">
                    <div className="md:w-1/2 slide-left">
                        <h3 className="text-3xl font-serif mb-4 text-gray-800">A Family Tradition</h3>
                        <p className="mb-4 text-gray-700">
                            Founded in 1987 by  Gomez, our funeral home began with a simple mission:
                            to provide dignified and respectful funeral services that honor each family's traditions
                            and beliefs.
                        </p>
                        <p className="mb-4 text-gray-700">
                            Today, the second generation of the Gomez family continues that legacy, blending traditional values
                            with modern services to meet the changing needs of our diverse community.
                        </p>
                        <p className="text-gray-700">
                            We are proud to be an independent family-owned business, deeply rooted in Hispanic traditions
                            and values while serving families from all backgrounds.
                        </p>
                    </div>
                    <div className="md:w-1/2 bg-gray-200 rounded-lg overflow-hidden slide-right">
                        <img
                            src="/assets/family.webp"
                            alt="The Gomez family - founders and current operators of Gomez Funeral Home"
                            className="w-full h-64 object-cover"
                        />
                    </div>
                </section>

                <section ref={valuesRef} className="mb-16 opacity-0">
                    <h3 className="text-3xl font-serif mb-8 text-center text-gray-800">Our Values</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md delay-100">
                            <h4 className="text-xl font-semibold mb-3 text-gray-800">Compassion</h4>
                            <p className="text-gray-600">
                                We understand the pain of loss and provide support with a caring and attentive heart.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md delay-300">
                            <h4 className="text-xl font-semibold mb-3 text-gray-800">Respect</h4>
                            <p className="text-gray-600">
                                We honor all cultural and religious traditions, ensuring each ceremony reflects
                                the family's wishes and beliefs.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md delay-500">
                            <h4 className="text-xl font-semibold mb-3 text-gray-800">Integrity</h4>
                            <p className="text-gray-600">
                                We offer transparency in all our services and pricing, building relationships
                                based on trust and honesty.
                            </p>
                        </div>
                    </div>
                </section>

                <section ref={teamRef} className="mb-16 opacity-0">
                    <h3 className="text-3xl font-serif mb-8 text-center text-gray-800">Our Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center delay-100">
                            <img
                                src="/assets/pawlo.jpg"
                                alt="Miguel Gomez - Funeral Director and Owner of Gomez Funeral Home"
                                className="h-48 w-48 rounded-full mx-auto mb-4 transform transition-transform hover:scale-105 object-cover"
                            />
                            <h4 className="text-xl font-semibold text-gray-800">Miguel Gomez</h4>
                            <p className="text-gray-600">Funeral Director / Owner</p>
                        </div>
                        <div className="text-center delay-300">
                            <img
                                src="/assets/reynan.jpg"
                                alt="Elena Gomez - Family Services Director at Gomez Funeral Home"
                                className="h-48 w-48 rounded-full mx-auto mb-4 transform transition-transform hover:scale-105 object-cover"
                            />
                            <h4 className="text-xl font-semibold text-gray-800">Elena Gomez</h4>
                            <p className="text-gray-600">Family Services Director</p>
                        </div>
                        <div className="text-center delay-500">
                            <img
                                src="/assets/nin.jpg"
                                alt="Carlos Mendez - Grief Counselor at Gomez Funeral Home"
                                className="h-48 w-48 rounded-full mx-auto mb-4 transform transition-transform hover:scale-105 object-cover"
                            />
                            <h4 className="text-xl font-semibold text-gray-800">Carlos Mendez</h4>
                            <p className="text-gray-600">Grief Counselor</p>
                        </div>
                    </div>
                </section>

                <section ref={facilitiesRef} className="opacity-0">
                    <h3 className="text-3xl font-serif mb-8 text-center text-gray-800">Our Facilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-200 rounded-lg overflow-hidden slide-left">
                            <img
                                src="/assets/chapel4.jpg"
                                alt="Main chapel interior at Gomez Funeral Home with seating for memorial services"
                                className="w-full h-64 transform transition-transform hover:scale-105 object-cover"
                            />
                            <div className="p-4">
                                <h4 className="text-xl font-semibold mb-2 text-gray-800 text-center">Chapel 4</h4>
                                <p className="text-gray-600">
                                    A peaceful and welcoming space for memorial and funeral services, with capacity
                                    for up to 150 people.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-200 rounded-lg overflow-hidden slide-right">
                            <img
                                src="/assets/chapel1.jpg"
                                alt="Reception room at Gomez Funeral Home set up for family gatherings"
                                className="w-full h-64 transform transition-transform hover:scale-105 object-cover"
                            />
                            <div className="p-4">
                                <h4 className="text-xl font-semibold mb-2 text-gray-800 text-center">Chapel 1</h4>
                                <p className="text-gray-600">
                                    A comfortable space for family gatherings and post-service receptions,
                                    with catering services available.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-6 md:mb-0">
                            <h2 className="text-2xl font-serif mb-4">Funeraria Gomez - Udtohan</h2>
                            <p>Serving our community since 1987</p>
                        </div>
                        <div className="mb-6 md:mb-0">
                            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                            <p>Tagbilaran City Branch</p>
                            <p>Phone: (123) 456-7890</p>
                            <p>Email: funerariagomez@gmail.com</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Hours</h3>
                            <p>Available 24 hours</p>
                            <p>Office: 8:00 AM - 8:00 PM</p>
                            <p>7 days a week</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ClientAbout;
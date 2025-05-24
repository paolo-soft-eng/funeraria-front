import React from 'react';

const ClientHome = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Fullscreen background video */}
            <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/vid.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white text-center px-8">
                <h1 className="text-4xl font-bold mb-4">Welcome to Funeraria Gomez</h1>
                <p className="text-lg max-w-2xl">
                    We provide compassionate and professional funeral services to honor the memory of your loved ones.
                </p>
            </div>
        </div>
    );
};

export default ClientHome;
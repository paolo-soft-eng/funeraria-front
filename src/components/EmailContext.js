import React, { createContext, useState, useEffect } from 'react';

export const EmailContext = createContext();

export const EmailProvider = ({ children }) => {
    const [email, setEmail] = useState(() => {
        // Initialize email from local storage
        return localStorage.getItem('userEmail') || '';
    });

    useEffect(() => {
        // Update local storage whenever email changes
        localStorage.setItem('userEmail', email);
    }, [email]);

    console.log('EmailProvider initialized with email:', email);

    return (
        <EmailContext.Provider value={{ email, setEmail }}>
            {children}
        </EmailContext.Provider>
    );
};


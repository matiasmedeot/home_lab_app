import React, { useState, useEffect } from 'react';

const HomelabServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {

      const response = await fetch('https://dev.homelabmdmcba.duckdns.org/api/services', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response URL:', response.url);  // Log de la URL de respuesta

      if (!response.ok) {
        throw new Error(`Error connecting to backend. HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setServices(data);
      setLoading(false);

    } catch (error) {
      setError("Failed to load services. Please try again later.");
      setLoading(false);
    }
  };
  
  // Function to render the appropriate icon based on the icon name from API
  const renderIcon = (iconName) => {
    switch(iconName) {
      case 'microscope':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18h8"></path>
            <path d="M3 22h18"></path>
            <path d="M14 22a5 5 0 0 0 5-5V7"></path>
            <path d="M9 14v-3"></path>
            <path d="M9 4v3"></path>
            <circle cx="9" cy="7" r="3"></circle>
          </svg>
        );
      case 'dna':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 15c6.667-6 13.333 0 20-6"></path>
            <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"></path>
            <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"></path>
            <path d="M17 6l-2.5-2.5"></path>
            <path d="M14 8l-1-1"></path>
            <path d="M7 18l2.5 2.5"></path>
            <path d="M3.5 14.5l.5.5"></path>
            <path d="M20 9l.5.5"></path>
            <path d="M6.5 12.5l1 1"></path>
            <path d="M16.5 10.5l1 1"></path>
            <path d="M10 16l1.5 1.5"></path>
          </svg>
        );
      case 'flask':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3h6v2H9z"></path>
            <path d="M5 8h14l-1.5 12h-11z"></path>
            <path d="M8 8v12"></path>
            <path d="M16 8v12"></path>
            <path d="M12 3v17"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="p-4 border-b">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3h6v2H9z"></path>
              <path d="M5 8h14l-1.5 12h-11z"></path>
            </svg>
            <h1 className="ml-2 text-xl font-bold">LabHome</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#" className="hover:underline">Services</a></li>
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-semibold mb-8">Our Services</h2>
          
          {loading ? (
            <div className="text-center py-12">Loading services...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg shadow-sm p-6">
                  <div className="text-green-500 mb-4">
                    {renderIcon('microscope')}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <a href={service.link}
                  target="_blank"
                  rel="noopener noreferrer" className="text-green-500 hover:underline">Acceder</a>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-sm">Contact us: <a href="mailto:info@labhome.com" className="hover:underline">info@labhome.com</a> | +123 456 7890</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomelabServices;
import React, { useEffect, useState } from 'react';
import '../../App.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/dashboard', {
        method: 'GET',
        credentials: 'include', 
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      {dashboardData ? (
        <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
      ) : (
        <h1>Dashboard</h1> 
      )}
      <section>
        <h2>About Ben Arous Industrial Zone</h2>
        <p>
          The Ben Arous Industrial Zone is a significant industrial hub located in the suburbs of Tunis, Tunisia. 
          It hosts a wide range of companies, from manufacturing to logistics, contributing to the region's economic growth. 
          The zone plays a vital role in the development of the country’s industrial sector, creating numerous job opportunities 
          and driving innovation in various fields.
        </p>
      </section>

      <section>
        <h2>Location of Ben Arous Industrial Zone</h2>
        <iframe title="Ben Arous Industrial Zone Location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.617174300543!2d10.234954500000011!3d36.7557591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd366cf700a9b5%3A0xc87ae003e48376ee!2sZone%20Industrielle%20Ben%20Arous!5e0!3m2!1sen!2stn!4v1736154655884!5m2!1sen!2stn" width="600" height="450" style={{ border: '0' }} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </section>

      <section>
        <h2>API Documentation</h2>
          <p>
            You can access the full API documentation <a href="http://localhost:5000/api-docs" target="_blank" rel="noopener noreferrer">here</a>.
          </p>
      </section>
    </div>
  );
};

export default Dashboard;

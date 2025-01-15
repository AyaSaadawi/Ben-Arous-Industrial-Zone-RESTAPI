import React, { useState } from 'react';

const Apis = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDataType, setSelectedDataType] = useState(null); // Track which button was clicked

  const fetchData = async (endpoint, dataType) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setError('No token found');
        console.error('No token found');
        return;
    }
    
    setSelectedDataType(dataType);

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
     
      if (!response.ok) {
        const errorText = await response.text();  // Get the raw error message
        console.error('Error fetching data:', errorText);
        setError('Error fetching data');
        throw new Error(errorText || 'Network response was not ok');
      }


      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
      console.error('Error:', err.message);
    }
  };


  return (
    <div>
      <h1>Protected APIs</h1>
      <div>
        <button onClick={() => fetchData('/companies', 'companies')}>Fetch Companies</button>
        <button onClick={() => fetchData('/jobs', 'jobs')}>Fetch Jobs</button>
        <button onClick={() => fetchData('/users', 'users')}>Fetch Users</button>
        <button onClick={() => fetchData('/applications', 'applications')}>Fetch Applications</button>
      </div>

      <div>
        {/* Conditional rendering based on the selected data type */}
        {selectedDataType === 'jobs' && data && Array.isArray(data) && data.length > 0 && (
          <div style={boxStyle}>
            <h3>Jobs Data</h3>
            {data.map((job) => (
              <div key={job.id} style={SpecificBoxStyle}>
                <h4>{job.title}</h4>
                <p>{job.description || 'No description available'}</p>
                <p>Company ID: {job.company_id}</p>
                <p>Type: {job.type}</p>
                <p>Created At: {new Date(job.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

{selectedDataType === 'companies' && data && Array.isArray(data) && data.length > 0 && (
  <div style={boxStyle}>
    <h3>Companies Data</h3>
    {data.map((company) => (
      <div key={company.id} style={SpecificBoxStyle}>
        <h4>{company.name}</h4>
        <p><strong>Address:</strong> {company.address || 'No address available'}</p>
        <p><strong>Sector:</strong> {company.sector || 'No sector information available'}</p>
        <p><strong>Contact:</strong> {
          company.contact_info && (company.contact_info.email || company.contact_info.phone)
            ? company.contact_info.email || company.contact_info.phone
            : 'No contact information available'
        }</p>
        {company.services && company.services.length > 0 && (
          <div>
            <strong>Services:</strong>
            <ul>
              {company.services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
        )}
        <p><strong>Created At:</strong> {new Date(company.created_at).toLocaleString()}</p>
      </div>
    ))}
  </div>
)}

        {selectedDataType === 'users' && data && Array.isArray(data) && data.length > 0 && (
          <div style={boxStyle}>
            <h3>Users Data</h3>
            {data.map((user) => (
              <div key={user.id} style={SpecificBoxStyle}>
                <h4>{user.username}</h4>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                    <p><strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {selectedDataType === 'applications' && data && Array.isArray(data) && data.length > 0 && (
          <div style={boxStyle}>
          <h3>Applications Data</h3>
          {data.map((application) => (
            <div key={application.id} style={SpecificBoxStyle}>
              <h4>Application for Job ID: {application.job_id}</h4>
              <p>Applicant ID: {application.user_id}</p>
              <p>Status: {application.status}</p>
              <p><strong>Application Date:</strong> {new Date(application.application_date).toLocaleString()}</p>
            </div>
          ))}
        </div>
        )}

        {/* Error Message */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

const boxStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '10px',
  marginTop: '10px',
  maxHeight: '400px',
  overflowY: 'auto',
  backgroundColor: '#f9f9f9',
};


const SpecificBoxStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '10px',
  marginTop: '10px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

export default Apis;
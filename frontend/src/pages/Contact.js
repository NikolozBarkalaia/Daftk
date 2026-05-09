import React from 'react';

const Contact = () => {
  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Contact Us</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--color-gray-dark)' }}>
        For inquiries, please reach out to our concierge team.
      </p>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</label>
          <input type="text" className="input-field" placeholder="Your Name" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
          <input type="email" className="input-field" placeholder="Your Email" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Message</label>
          <textarea className="input-field" rows="5" placeholder="Your Message"></textarea>
        </div>
        <button type="button" className="btn">Send Inquiry</button>
      </form>
    </div>
  );
};

export default Contact;

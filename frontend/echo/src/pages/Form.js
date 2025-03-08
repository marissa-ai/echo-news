import React, { useState } from 'react';
import ApiService from '../services/apiService';
import './Form.css'; // Ensure you have styles for the form

const Form = () => {
  const [formData, setFormData] = useState({
    loginName: '',
    password: '',
    title: '',
    text: '',
    url: '',
    category: '',
    topic: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!formData.loginName || !formData.password || !formData.title || !formData.url || !formData.category || !formData.topic) {
      setMessage('All fields are required!');
      return;
    }

    try {
      await ApiService.submitArticle({
        login_name: formData.loginName,
        password: formData.password,
        title: formData.title,
        text: formData.text,
        url: formData.url,
        category: formData.category,
        topic: formData.topic,
      });
      
      setMessage('Article submitted successfully!');
      setFormData({
        loginName: '',
        password: '',
        title: '',
        text: '',
        url: '',
        category: '',
        topic: '',
      });
    } catch (error) {
      console.error('Error submitting article:', error);
      setMessage('Failed to submit the article. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Submit Article</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loginName">Login Name:</label>
          <input
            type="text"
            id="loginName"
            name="loginName"
            value={formData.loginName}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="text">Text:</label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="url">URL:</label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="topic">Topic:</label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Submit Article</button>
      </form>
    </div>
  );
};

export default Form;


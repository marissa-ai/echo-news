import React, { useState } from 'react';
import axios from 'axios';
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate fields
    if (!formData.loginName || !formData.password || !formData.title || !formData.url || !formData.category || !formData.topic) {
      setMessage('All fields are required!');
      return;
    }

    // Submit the data to the backend
    axios
      .post('http://localhost:5000/articles/submit', {
        login_name: formData.loginName,
        password: formData.password,
        title: formData.title,
        text: formData.text,
        url: formData.url,
        category: formData.category,
        topic: formData.topic,
      })
      .then((response) => {
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
      })
      .catch((error) => {
        console.error('Error submitting article:', error);
        setMessage('Failed to submit the article. Please try again.');
      });
  };

  return (
    <form className="article-form" onSubmit={handleSubmit}>
      <h2>Submit Article</h2>
      <input
        type="text"
        name="loginName"
        value={formData.loginName}
        onChange={handleChange}
        placeholder="Login Name"
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
      />
      <textarea
        name="text"
        value={formData.text}
        onChange={handleChange}
        placeholder="Text"
      />
      <input
        type="url"
        name="url"
        value={formData.url}
        onChange={handleChange}
        placeholder="URL"
      />
      <select name="category" value={formData.category} onChange={handleChange}>
        <option value="">Select Category</option>
        <option value="Technology">Technology</option>
        <option value="Science">Science</option>
        <option value="Business">Business</option>
        <option value="Health">Health</option>
      </select>
      <input
        type="text"
        name="topic"
        value={formData.topic}
        onChange={handleChange}
        placeholder="Topic"
      />
      <button type="submit">Submit</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default Form;


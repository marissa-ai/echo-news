import React, { useState } from 'react';
import ApiService from '../services/apiService';
import styles from './Form.module.css';

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
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!formData.loginName || !formData.password || !formData.title || !formData.url || !formData.category || !formData.topic) {
      setMessage('All fields are required!');
      setIsSuccess(false);
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
      setIsSuccess(true);
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
      setIsSuccess(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Submit Article</h2>
      {message && (
        <div className={`${styles.message} ${isSuccess ? styles.successMessage : ''}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="loginName">Login Name:</label>
          <input
            type="text"
            id="loginName"
            name="loginName"
            value={formData.loginName}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="text">Text:</label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="url">URL:</label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="topic">Topic:</label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit Article
        </button>
      </form>
    </div>
  );
};

export default Form;


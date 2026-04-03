import React, { useState, useEffect } from 'react';
import './ContactMessages.css';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch messages');

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return alert('Reply cannot be empty');

    setSending(true);

    await fetch(
      `http://localhost:5000/api/contact/${selectedMessage._id}/reply`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: replyText }),
      }
    );

    setSending(false);
    setReplyText('');
    setSelectedMessage(null);
    fetchMessages();
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;

    await fetch(`http://localhost:5000/api/contact/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchMessages();
  };

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-contact-container">
      <h2>Contact Messages</h2>

      <table className="contact-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {messages.map((msg) => (
            <tr key={msg._id}>
              <td>{msg.name}</td>
              <td>{msg.email}</td>
              <td>{msg.subject}</td>
              <td>
                <span className={`status ${msg.status.toLowerCase()}`}>
                  {msg.status}
                </span>
              </td>
              <td>{new Date(msg.createdAt).toLocaleString()}</td>
              <td>
                <button
                  onClick={async () => {
                    setSelectedMessage(msg);

                    if (msg.status === 'Pending') {
                      await fetch(
                        `http://localhost:5000/api/contact/${msg._id}/seen`,
                        {
                          method: 'PUT',
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      fetchMessages();
                    }
                  }}
                >
                  View
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteMessage(msg._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {messages.length === 0 && <p>No messages found.</p>}

      {selectedMessage && (
        <div className="message-modal">
          <div className="message-modal-content">
            <h3>Contact Message</h3>

            <div className="message-row">
              <strong>Name:</strong> {selectedMessage.name}
            </div>

            <div className="message-row">
              <strong>Email:</strong> {selectedMessage.email}
            </div>

            <div className="message-row">
              <strong>Subject:</strong> {selectedMessage.subject}
            </div>

            <div className="message-body">{selectedMessage.message}</div>

            <div className="modal-actions">
              {selectedMessage.status !== 'Replied' && (
                <>
                  <textarea
                    className="reply-textarea"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />

                  <button
                    className="reply-btn"
                    onClick={sendReply}
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Send Reply'}
                  </button>
                </>
              )}

              <button
                className="close-img-btn"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;

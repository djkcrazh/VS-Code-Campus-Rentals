import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { AlertCircle, CheckCircle } from 'lucide-react';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isEduEmail = formData.email.toLowerCase().endsWith('.edu');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEduEmail) {
      setError('Please use a .edu email address');
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData);
      onLogin(response.data.user, response.data.access_token);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🐯</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-primary-500">Tiger</span>
              <span className="text-gray-900">Rentals</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join the campus sharing economy</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                required
                className="input"
                placeholder="John Smith"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                className="input"
                placeholder="your.name@princeton.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {formData.email && (
                <div className="mt-2 flex items-center space-x-2 text-sm">
                  {isEduEmail ? (
                    <>
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-green-600">Valid .edu email</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-red-500" size={16} />
                      <span className="text-red-600">Must use .edu email</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="label">Phone Number (Optional)</label>
              <input
                type="tel"
                className="input"
                placeholder="+1-609-555-0100"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>By signing up, you agree to:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                <li>Treat rentals with respect</li>
                <li>Return items on time and in good condition</li>
                <li>Communicate openly with other students</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !isEduEmail}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

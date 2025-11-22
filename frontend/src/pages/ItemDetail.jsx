import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, createRental } from '../api';
import { Calendar, MapPin, Shield, Star, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

function ItemDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const [rentalDates, setRentalDates] = useState({
    start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      const response = await getItem(id);
      setItem(response.data);
      if (response.data.images && response.data.images.length > 0) {
        setSelectedImage(0);
      }
    } catch (error) {
      console.error('Failed to load item:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = () => {
    if (!item) return { days: 0, total: 0, deposit: 0, platformFee: 0 };

    const start = new Date(rentalDates.start_date);
    const end = new Date(rentalDates.end_date);
    const days = differenceInDays(end, start);

    if (days < 1) return { days: 0, total: 0, platformFee: 0 };

    const total = item.daily_rate * days;
    const platformFee = total * 0.15;

    return {
      days,
      total,
      platformFee,
      ownerEarns: total - platformFee,
    };
  };

  const handleRequestRental = async () => {
    const cost = calculateCost();
    if (cost.days < 1) {
      alert('Please select valid rental dates (at least 1 day)');
      return;
    }

    setSubmitting(true);
    try {
      await createRental({
        item_id: parseInt(id),
        start_date: new Date(rentalDates.start_date).toISOString(),
        end_date: new Date(rentalDates.end_date).toISOString(),
        message: message || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create rental request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <button onClick={() => navigate('/marketplace')} className="btn-primary">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const cost = calculateCost();
  const isOwnItem = item.owner_id === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-up z-50">
          <CheckCircle size={24} />
          <div>
            <div className="font-semibold">Request Sent!</div>
            <div className="text-sm">Redirecting to dashboard...</div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-xl overflow-hidden mb-4">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[selectedImage]}
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-400">
                <span className="text-9xl">📦</span>
              </div>
            )}
          </div>

          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.categories.map((cat) => (
                    <span key={cat.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {cat.icon} {cat.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-500">${item.daily_rate}</div>
                <div className="text-sm text-gray-500">per day</div>
                {item.weekly_rate && (
                  <div className="text-sm text-gray-700 mt-1">${item.weekly_rate}/week</div>
                )}
              </div>
            </div>

            {/* Condition Badge */}
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              <CheckCircle size={16} className="mr-2" />
              {item.condition} Condition
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <MapPin className="text-gray-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <div className="font-semibold text-gray-900">Pickup Location</div>
                <div className="text-gray-700">{item.location_name}</div>
              </div>
            </div>

            {/* Insurance */}
            <div className="flex items-start space-x-3 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="text-blue-500 flex-shrink-0 mt-1" size={20} />
              <div>
                <div className="font-semibold text-blue-900">Protected by Insurance</div>
                <div className="text-sm text-blue-700">
                  Up to ${item.insurance_value.toLocaleString()} coverage on every rental
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Owner</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">{item.owner.full_name}</div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span>{item.owner.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{item.owner.total_ratings} reviews</span>
                    </div>
                  </div>
                </div>
                {item.owner.verified && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <CheckCircle size={16} />
                    <span>Verified</span>
                  </div>
                )}
              </div>
              {item.owner.bio && (
                <p className="text-sm text-gray-600 mt-3">{item.owner.bio}</p>
              )}
            </div>

            {/* Rental Request */}
            {!isOwnItem && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Request to Rent</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Start Date</label>
                      <input
                        type="date"
                        className="input"
                        value={rentalDates.start_date}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => setRentalDates({ ...rentalDates, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">End Date</label>
                      <input
                        type="date"
                        className="input"
                        value={rentalDates.end_date}
                        min={rentalDates.start_date}
                        onChange={(e) => setRentalDates({ ...rentalDates, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  {cost.days > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          ${item.daily_rate} × {cost.days} {cost.days === 1 ? 'day' : 'days'}
                        </span>
                        <span className="font-semibold">${cost.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform fee (15%)</span>
                        <span className="font-semibold">${cost.platformFee.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-primary-500 text-lg">
                          ${cost.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="label">Message to Owner (Optional)</label>
                    <textarea
                      className="input"
                      rows="3"
                      placeholder="Hi! I'd love to rent your camera for..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    onClick={handleRequestRental}
                    disabled={submitting || cost.days < 1}
                    className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending Request...' : 'Request to Rent'}
                  </button>

                  <p className="text-xs text-center text-gray-500">
                    You won't be charged until the owner approves your request
                  </p>
                </div>
              </div>
            )}

            {isOwnItem && (
              <div className="border-t border-gray-200 pt-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-blue-900 font-semibold">This is your listing</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Manage rental requests from your dashboard
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;

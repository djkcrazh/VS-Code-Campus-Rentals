import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, getCategories } from '../api';
import { Upload, X, DollarSign, MapPin, CheckCircle } from 'lucide-react';

const PRINCETON_LOCATIONS = [
  { name: 'Butler College', lat: 40.3453, lng: -74.6557 },
  { name: 'Mathey College', lat: 40.3461, lng: -74.6583 },
  { name: 'Rockefeller College', lat: 40.3478, lng: -74.6561 },
  { name: 'Whitman College', lat: 40.3487, lng: -74.6542 },
  { name: 'Forbes College', lat: 40.3442, lng: -74.6612 },
  { name: 'Engineering Quad', lat: 40.3491, lng: -74.6524 },
  { name: 'Frist Campus Center', lat: 40.3478, lng: -74.6553 },
  { name: 'McCosh Hall', lat: 40.3485, lng: -74.6579 },
];

const PRICING_SUGGESTIONS = {
  Electronics: { min: 15, max: 50, deposit: 200 },
  Photography: { min: 20, max: 60, deposit: 300 },
  Tools: { min: 10, max: 25, deposit: 80 },
  Fashion: { min: 20, max: 40, deposit: 150 },
  Sports: { min: 10, max: 30, deposit: 100 },
  'Party Supplies': { min: 15, max: 35, deposit: 100 },
  Academic: { min: 3, max: 10, deposit: 50 },
  Transportation: { min: 15, max: 30, deposit: 150 },
};

function AddItem() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    daily_rate: '',
    weekly_rate: '',
    deposit: '',
    category_ids: [],
    condition: 'Good',
    location_name: PRINCETON_LOCATIONS[0].name,
    latitude: PRINCETON_LOCATIONS[0].lat,
    longitude: PRINCETON_LOCATIONS[0].lng,
    images: [],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleDemoFill = () => {
    setFormData({
      title: 'Canon EOS R6 Camera + 24-70mm Lens',
      description: 'Professional mirrorless camera perfect for events, portraits, or creative projects. Includes battery, charger, and SD card. Excellent condition, well-maintained.',
      daily_rate: '45',
      weekly_rate: '250',
      deposit: '500',
      category_ids: categories.filter((c) => ['Electronics', 'Photography'].includes(c.name)).map((c) => c.id),
      condition: 'Excellent',
      location_name: 'Frist Campus Center',
      latitude: 40.3478,
      longitude: -74.6553,
      images: [],
    });
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData({
      ...formData,
      category_ids: formData.category_ids.includes(categoryId)
        ? formData.category_ids.filter((id) => id !== categoryId)
        : [...formData.category_ids, categoryId],
    });
  };

  const handleLocationChange = (locationName) => {
    const location = PRINCETON_LOCATIONS.find((loc) => loc.name === locationName);
    if (location) {
      setFormData({
        ...formData,
        location_name: locationName,
        latitude: location.lat,
        longitude: location.lng,
      });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          images: [...formData.images, reader.result],
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const getSuggestedPricing = () => {
    if (formData.category_ids.length === 0) return null;
    const selectedCategory = categories.find((c) => c.id === formData.category_ids[0]);
    if (!selectedCategory) return null;
    return PRICING_SUGGESTIONS[selectedCategory.name];
  };

  const applySuggestedPricing = () => {
    const suggestion = getSuggestedPricing();
    if (suggestion) {
      const avgDaily = (suggestion.min + suggestion.max) / 2;
      setFormData({
        ...formData,
        daily_rate: avgDaily.toString(),
        weekly_rate: (avgDaily * 6).toString(), // 1 day free for weekly
        deposit: suggestion.deposit.toString(),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createItem({
        ...formData,
        daily_rate: parseFloat(formData.daily_rate),
        weekly_rate: formData.weekly_rate ? parseFloat(formData.weekly_rate) : null,
        deposit: parseFloat(formData.deposit),
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const suggestion = getSuggestedPricing();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-up z-50">
          <CheckCircle size={24} />
          <div>
            <div className="font-semibold">Item Listed!</div>
            <div className="text-sm">Redirecting to dashboard...</div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Item</h1>
        <p className="text-gray-600">Start earning from items you're not using</p>
      </div>

      <button
        type="button"
        onClick={handleDemoFill}
        className="w-full mb-6 px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg font-medium transition-colors border-2 border-primary-200"
      >
        🎯 Quick Demo Fill (Camera Listing)
      </button>

      <form onSubmit={handleSubmit} className="card">
        {/* Title */}
        <div className="mb-6">
          <label className="label">Item Title *</label>
          <input
            type="text"
            required
            className="input"
            placeholder="e.g., Canon EOS R6 Camera + 24-70mm Lens"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="label">Description *</label>
          <textarea
            required
            className="input"
            rows="5"
            placeholder="Describe your item, its condition, and what's included..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="label">Categories * (Select 1-3)</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.category_ids.includes(category.id)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pricing</h3>
            {suggestion && (
              <button
                type="button"
                onClick={applySuggestedPricing}
                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Use Suggested Pricing
              </button>
            )}
          </div>

          {suggestion && (
            <div className="mb-4 p-3 bg-white rounded-lg text-sm">
              <div className="font-medium text-gray-900 mb-1">💡 Suggested Pricing</div>
              <div className="text-gray-600">
                Daily: ${suggestion.min}-${suggestion.max} • Deposit: ${suggestion.deposit}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Daily Rate *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  className="input pl-10"
                  placeholder="20"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Weekly Rate (Optional)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="input pl-10"
                  placeholder="100"
                  value={formData.weekly_rate}
                  onChange={(e) => setFormData({ ...formData, weekly_rate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Security Deposit *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  required
                  min="10"
                  step="0.01"
                  className="input pl-10"
                  placeholder="100"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="mb-6">
          <label className="label">Condition *</label>
          <div className="flex gap-4">
            {['Excellent', 'Good', 'Fair'].map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => setFormData({ ...formData, condition: cond })}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  formData.condition === cond
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="label">Pickup Location *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="input pl-10"
              value={formData.location_name}
              onChange={(e) => handleLocationChange(e.target.value)}
            >
              {PRINCETON_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="mb-6">
          <label className="label">Photos (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="image-upload"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <p className="text-gray-600">Click to upload photos</p>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB each</p>
            </label>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insurance Info */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <div className="font-semibold text-green-900">Protected by Insurance</div>
              <div className="text-sm text-green-700 mt-1">
                Every rental is covered up to $2,000. You're protected against damage or loss.
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || formData.category_ids.length === 0}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Listing...' : 'List Item'}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          By listing, you agree to rent your item in good faith and return it in the same condition
        </p>
      </form>
    </div>
  );
}

export default AddItem;

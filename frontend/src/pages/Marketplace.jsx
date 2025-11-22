import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItems, getCategories } from '../api';
import { Search, MapPin, Filter, Grid3x3, Map as MapIcon, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PRINCETON_CENTER = { lat: 40.3473, lng: -74.6552 };

function Marketplace({ user }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  const [filters, setFilters] = useState({
    search: '',
    category_id: null,
    min_price: '',
    max_price: '',
    latitude: PRINCETON_CENTER.lat,
    longitude: PRINCETON_CENTER.lng,
    max_distance: 10,
  });

  useEffect(() => {
    loadCategories();
    loadItems();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.min_price) params.min_price = parseFloat(filters.min_price);
      if (filters.max_price) params.max_price = parseFloat(filters.max_price);
      if (filters.latitude) params.latitude = filters.latitude;
      if (filters.longitude) params.longitude = filters.longitude;
      params.max_distance = filters.max_distance;

      const response = await getItems(params);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadItems();
  };

  const handleCategorySelect = (categoryId) => {
    setFilters({ ...filters, category_id: categoryId === filters.category_id ? null : categoryId });
    setTimeout(loadItems, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Marketplace</h1>
        <p className="text-gray-600">Discover items available from fellow Tigers</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for cameras, textbooks, bikes..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min $"
              className="input w-24"
              value={filters.min_price}
              onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Max $"
              className="input w-24"
              value={filters.max_price}
              onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Categories */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.category_id === category.id
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {items.length} {items.length === 1 ? 'item' : 'items'} found
        </div>
        <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 flex items-center space-x-2 ${
              viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Grid3x3 size={18} />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 flex items-center space-x-2 border-l ${
              viewMode === 'map' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MapIcon size={18} />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading items...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="h-[600px] rounded-xl overflow-hidden shadow-lg">
          <MapContainer center={[PRINCETON_CENTER.lat, PRINCETON_CENTER.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {items.map((item) => (
              item.latitude && item.longitude && (
                <Marker key={item.id} position={[item.latitude, item.longitude]}>
                  <Popup>
                    <Link to={`/items/${item.id}`} className="block">
                      <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                      <div className="text-primary-500 font-bold">${item.daily_rate}/day</div>
                      <div className="text-xs text-gray-600 mt-1">{item.location_name}</div>
                    </Link>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item }) {
  const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <Link to={`/items/${item.id}`} className="card hover:shadow-lg transition-shadow group">
      <div className="aspect-w-16 aspect-h-12 mb-4 bg-gray-100 rounded-lg overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={item.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center text-gray-400">
            <span className="text-5xl">📦</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-500 transition-colors">
          {item.title}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-primary-500">${item.daily_rate}</div>
            <div className="text-xs text-gray-500">per day</div>
          </div>
          {item.weekly_rate && (
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">${item.weekly_rate}</div>
              <div className="text-xs text-gray-500">per week</div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin size={14} />
          <span className="truncate">{item.location_name}</span>
          {item.distance && <span className="text-gray-400">• {item.distance} mi</span>}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-700">{item.owner.full_name.split(' ')[0]}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="font-semibold">{item.owner.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 pt-2">
          {item.categories.slice(0, 2).map((cat) => (
            <span key={cat.id} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {cat.icon} {cat.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default Marketplace;

import { useState, useEffect } from 'react';
import { getMyRentals, approveRental, verifyPickup, verifyReturn } from '../api';
import { Clock, CheckCircle, XCircle, Package, QrCode, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

function Dashboard({ user }) {
  const [rentals, setRentals] = useState({ as_renter: [], as_owner: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('renting'); // 'renting' or 'lending'
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      const response = await getMyRentals();
      setRentals(response.data);
    } catch (error) {
      console.error('Failed to load rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (rentalId) => {
    try {
      await approveRental(rentalId);
      loadRentals();
    } catch (error) {
      alert('Failed to approve rental');
    }
  };

  const handleVerifyPickup = async (rentalId) => {
    try {
      await verifyPickup(rentalId);
      loadRentals();
    } catch (error) {
      alert('Failed to verify pickup');
    }
  };

  const handleVerifyReturn = async (rentalId) => {
    try {
      await verifyReturn(rentalId);
      loadRentals();
    } catch (error) {
      alert('Failed to verify return');
    }
  };

  const stats = {
    renting: {
      active: rentals.as_renter.filter((r) => r.status === 'active').length,
      pending: rentals.as_renter.filter((r) => r.status === 'pending').length,
      completed: rentals.as_renter.filter((r) => r.status === 'completed').length,
    },
    lending: {
      active: rentals.as_owner.filter((r) => r.status === 'active').length,
      pending: rentals.as_owner.filter((r) => r.status === 'pending').length,
      completed: rentals.as_owner.filter((r) => r.status === 'completed').length,
      totalEarnings: rentals.as_owner
        .filter((r) => r.status === 'completed')
        .reduce((sum, r) => sum + r.owner_earnings, 0),
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Package}
          label="Active Rentals"
          value={stats.renting.active}
          color="text-blue-500"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={Clock}
          label="Pending Requests"
          value={stats.lending.pending}
          color="text-yellow-500"
          bgColor="bg-yellow-100"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.renting.completed + stats.lending.completed}
          color="text-green-500"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={`$${stats.lending.totalEarnings.toFixed(0)}`}
          color="text-primary-500"
          bgColor="bg-primary-100"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('renting')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'renting'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Items I'm Renting ({rentals.as_renter.length})
          </button>
          <button
            onClick={() => setActiveTab('lending')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'lending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Items I'm Lending ({rentals.as_owner.length})
          </button>
        </div>
      </div>

      {/* Rentals List */}
      <div className="space-y-4">
        {(activeTab === 'renting' ? rentals.as_renter : rentals.as_owner).map((rental) => (
          <RentalCard
            key={rental.id}
            rental={rental}
            isOwner={activeTab === 'lending'}
            onApprove={handleApprove}
            onVerifyPickup={handleVerifyPickup}
            onVerifyReturn={handleVerifyReturn}
            onShowQR={(qr) => setSelectedQR(qr)}
          />
        ))}

        {(activeTab === 'renting' ? rentals.as_renter : rentals.as_owner).length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rentals yet</h3>
            <p className="text-gray-600">
              {activeTab === 'renting'
                ? 'Browse the marketplace to find items to rent'
                : 'List your items to start earning'}
            </p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedQR(null)}
        >
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              {selectedQR.type === 'pickup' ? 'Pickup QR Code' : 'Return QR Code'}
            </h3>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
              <img src={selectedQR.qr} alt="QR Code" className="w-full" />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Scan this code to verify {selectedQR.type}
            </p>
            <button onClick={() => setSelectedQR(null)} className="w-full btn-primary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );
}

function RentalCard({ rental, isOwner, onApprove, onVerifyPickup, onVerifyReturn, onShowQR }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
    approved: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Approved' },
    active: { color: 'bg-green-100 text-green-700', icon: Package, label: 'Active' },
    completed: { color: 'bg-gray-100 text-gray-700', icon: CheckCircle, label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
  };

  const status = statusConfig[rental.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const otherUser = isOwner ? rental.renter : rental.owner;

  const firstImage = rental.item.images && rental.item.images.length > 0 ? rental.item.images[0] : null;

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Item Image */}
        <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {firstImage ? (
            <img src={firstImage} alt={rental.item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
              📦
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{rental.item.title}</h3>
              <p className="text-sm text-gray-600">
                {isOwner ? 'Renter' : 'Owner'}: {otherUser.full_name}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${status.color}`}>
              <StatusIcon size={16} />
              <span>{status.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <div className="text-gray-600">Start Date</div>
              <div className="font-semibold">{format(new Date(rental.start_date), 'MMM d, yyyy')}</div>
            </div>
            <div>
              <div className="text-gray-600">End Date</div>
              <div className="font-semibold">{format(new Date(rental.end_date), 'MMM d, yyyy')}</div>
            </div>
            <div>
              <div className="text-gray-600">Total Cost</div>
              <div className="font-semibold text-primary-500">${rental.total_cost.toFixed(2)}</div>
            </div>
            {isOwner && (
              <div>
                <div className="text-gray-600">Your Earnings</div>
                <div className="font-semibold text-green-600">${rental.owner_earnings.toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {isOwner && rental.status === 'pending' && (
              <button onClick={() => onApprove(rental.id)} className="btn-primary text-sm">
                Approve Request
              </button>
            )}

            {rental.status === 'approved' && (
              <>
                <button
                  onClick={() => onShowQR({ type: 'pickup', qr: rental.pickup_qr })}
                  className="btn-secondary text-sm flex items-center space-x-2"
                >
                  <QrCode size={16} />
                  <span>Pickup QR</span>
                </button>
                <button onClick={() => onVerifyPickup(rental.id)} className="btn-primary text-sm">
                  Verify Pickup
                </button>
              </>
            )}

            {rental.status === 'active' && (
              <>
                <button
                  onClick={() => onShowQR({ type: 'return', qr: rental.return_qr })}
                  className="btn-secondary text-sm flex items-center space-x-2"
                >
                  <QrCode size={16} />
                  <span>Return QR</span>
                </button>
                <button onClick={() => onVerifyReturn(rental.id)} className="btn-primary text-sm">
                  Verify Return
                </button>
              </>
            )}

            {rental.status === 'completed' && !isOwner && (
              <button className="btn-secondary text-sm">Leave Review</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

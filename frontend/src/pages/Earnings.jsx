import { useState, useEffect } from 'react';
import { getEarnings } from '../api';
import { DollarSign, TrendingUp, Package, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

function Earnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const response = await getEarnings();
      setData(response.data);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading earnings</h2>
        </div>
      </div>
    );
  }

  // Calculate projections
  const weeklyProjection = (data.monthly_earnings / 4).toFixed(2);
  const semesterProjection = (data.monthly_earnings * 4).toFixed(2);

  // Prepare chart data (mock monthly data based on current earnings)
  const chartData = [
    { month: 'Jan', earnings: data.monthly_earnings * 0.7 },
    { month: 'Feb', earnings: data.monthly_earnings * 0.85 },
    { month: 'Mar', earnings: data.monthly_earnings * 0.95 },
    { month: 'Apr', earnings: data.monthly_earnings },
    { month: 'May', earnings: data.monthly_earnings * 1.1, projected: true },
    { month: 'Jun', earnings: data.monthly_earnings * 1.15, projected: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings Dashboard</h1>
        <p className="text-gray-600">Track your rental income and projections</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={DollarSign}
          label="Total Earnings"
          value={`$${data.total_earnings.toFixed(2)}`}
          color="text-green-500"
          bgColor="bg-green-100"
          trend="+12% from last month"
        />
        <MetricCard
          icon={Calendar}
          label="This Month"
          value={`$${data.monthly_earnings.toFixed(2)}`}
          color="text-blue-500"
          bgColor="bg-blue-100"
          trend={`$${weeklyProjection}/week avg`}
        />
        <MetricCard
          icon={Clock}
          label="Pending"
          value={`$${data.pending_earnings.toFixed(2)}`}
          color="text-yellow-500"
          bgColor="bg-yellow-100"
          trend="From active rentals"
        />
        <MetricCard
          icon={Package}
          label="Active Items"
          value={data.total_items}
          color="text-primary-500"
          bgColor="bg-primary-100"
          trend={`${data.active_rentals} currently rented`}
        />
      </div>

      {/* Projections */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Earnings Projections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-white rounded-lg border-2 border-primary-200">
            <div className="text-sm text-gray-600 mb-2">Weekly Projection</div>
            <div className="text-3xl font-bold text-primary-500">${weeklyProjection}</div>
            <div className="text-xs text-gray-500 mt-2">Based on current activity</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-white rounded-lg border-2 border-green-200">
            <div className="text-sm text-gray-600 mb-2">Monthly Projection</div>
            <div className="text-3xl font-bold text-green-500">${data.monthly_earnings.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-2">Current month pace</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-2">Semester Projection</div>
            <div className="text-3xl font-bold text-blue-500">${semesterProjection}</div>
            <div className="text-xs text-gray-500 mt-2">4-month estimate</div>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Earnings Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']}
                labelStyle={{ color: '#374151' }}
              />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#ff6600"
                strokeWidth={3}
                dot={{ fill: '#ff6600', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span>Actual Earnings</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
        {data.transactions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="mx-auto text-gray-400 mb-2" size={40} />
            <p className="text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-green-600" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">{transaction.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(transaction.created_at), 'h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 card bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Maximize Your Earnings</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>List high-demand items like cameras, formal wear, and party equipment</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Keep items in excellent condition for better ratings and more rentals</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Respond quickly to rental requests to build a strong reputation</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Price competitively - check similar items on the marketplace</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, bgColor, trend }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={color} size={24} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      {trend && (
        <div className="text-xs text-gray-500 flex items-center space-x-1">
          <TrendingUp size={12} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default Earnings;

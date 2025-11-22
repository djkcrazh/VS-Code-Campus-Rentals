import { Link } from 'react-router-dom';
import { Camera, Wrench, Shirt, Trophy, PartyPopper, Book, Bike, DollarSign, Shield, Clock } from 'lucide-react';

function Landing() {
  const categories = [
    { icon: Camera, name: 'Photography', color: 'bg-purple-100 text-purple-600' },
    { icon: Wrench, name: 'Tools', color: 'bg-blue-100 text-blue-600' },
    { icon: Shirt, name: 'Fashion', color: 'bg-pink-100 text-pink-600' },
    { icon: Trophy, name: 'Sports', color: 'bg-green-100 text-green-600' },
    { icon: PartyPopper, name: 'Party', color: 'bg-yellow-100 text-yellow-600' },
    { icon: Book, name: 'Academic', color: 'bg-indigo-100 text-indigo-600' },
    { icon: Bike, name: 'Transport', color: 'bg-red-100 text-red-600' },
  ];

  const stats = [
    { label: 'Active Items', value: '500+' },
    { label: 'Happy Students', value: '1,000+' },
    { label: 'Avg. Monthly Earnings', value: '$450' },
    { label: 'Items Rented', value: '2,500+' },
  ];

  const features = [
    {
      icon: DollarSign,
      title: 'Earn Passive Income',
      description: 'Turn your unused items into cash. Students earn $300-$800 per semester.',
    },
    {
      icon: Shield,
      title: '$2,000 Insurance',
      description: 'Every rental is protected with comprehensive insurance coverage.',
    },
    {
      icon: Clock,
      title: 'Quick & Easy',
      description: 'List items in minutes. Get paid automatically. Focus on studying.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <div className="mb-8 animate-fade-in">
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-6">
                Princeton's Peer-to-Peer Marketplace
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-slide-up">
              Rent Anything
              <br />
              <span className="text-primary-500">On Campus</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-slide-up">
              From cameras to camping gear, tools to textbooks. The easiest way to
              borrow what you need or earn money from what you own.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link
                to="/register"
                className="btn-primary px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="btn-secondary px-8 py-4 text-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all"
              >
                Sign In
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Requires @princeton.edu email • Join 1,000+ Tigers
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-y border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-500 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Browse by Category
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Everything you need, available from fellow students
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="card text-center hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} />
                </div>
                <div className="font-semibold text-gray-900">{category.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Why TigerRentals?
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Safe, simple, and profitable for the entire campus community
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-primary-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
          How It Works
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* For Renters */}
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">For Renters</h3>
            <div className="space-y-6">
              {[
                { step: '1', text: 'Browse items or search for what you need' },
                { step: '2', text: 'Request rental with your desired dates' },
                { step: '3', text: 'Owner approves and you pick up the item' },
                { step: '4', text: 'Return it on time and leave a review' },
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-gray-700 pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* For Owners */}
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">For Owners</h3>
            <div className="space-y-6">
              {[
                { step: '1', text: 'List your item with photos and pricing' },
                { step: '2', text: 'Approve rental requests from students' },
                { step: '3', text: 'Hand over item using QR code verification' },
                { step: '4', text: 'Get paid automatically after return' },
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-gray-700 pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of Princeton students making money from their unused items.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-500 font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Create Free Account
          </Link>
          <p className="text-sm text-primary-100 mt-4">
            No credit card required • Takes less than 2 minutes
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold text-white mb-4">
            Campus<span className="text-primary-500">Rentals</span>
          </div>
          <p className="mb-4">
            Built with Claude • Princeton University
          </p>
          <p className="text-sm">
            © 2024 TigerRentals. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;

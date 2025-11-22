import { useState, useEffect } from 'react';
import { getMessages, sendMessage, getMyRentals } from '../api';
import { Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

function Messages({ user }) {
  const [messages, setMessages] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  useEffect(() => {
    if (selectedRental) {
      loadMessages(selectedRental.id);
    }
  }, [selectedRental]);

  const loadRentals = async () => {
    try {
      const response = await getMyRentals();
      const allRentals = [...response.data.as_renter, ...response.data.as_owner];
      setRentals(allRentals);
      if (allRentals.length > 0) {
        setSelectedRental(allRentals[0]);
      }
    } catch (error) {
      console.error('Failed to load rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (rentalId) => {
    try {
      const response = await getMessages(rentalId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRental) return;

    try {
      await sendMessage({
        rental_id: selectedRental.id,
        content: newMessage,
      });
      setNewMessage('');
      loadMessages(selectedRental.id);
    } catch (error) {
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No conversations yet</h2>
          <p className="text-gray-600">Start renting or lending items to chat with other students</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="card md:col-span-1 max-h-[600px] overflow-y-auto">
          <h2 className="font-semibold text-gray-900 mb-4">Conversations</h2>
          <div className="space-y-2">
            {rentals.map((rental) => {
              const otherUser = rental.renter_id === user.id ? rental.owner : rental.renter;
              const isSelected = selectedRental?.id === rental.id;

              return (
                <button
                  key={rental.id}
                  onClick={() => setSelectedRental(rental)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isSelected ? 'bg-primary-50 border-2 border-primary-500' : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{otherUser.full_name}</div>
                      <div className="text-sm text-gray-600 truncate">{rental.item.title}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        <div className="card md:col-span-2 flex flex-col" style={{ height: '600px' }}>
          {selectedRental ? (
            <>
              {/* Header */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {selectedRental.renter_id === user.id
                        ? selectedRental.owner.full_name
                        : selectedRental.renter.full_name}
                    </div>
                    <div className="text-sm text-gray-600">{selectedRental.item.title}</div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-gray-600">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary px-6 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-2" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;

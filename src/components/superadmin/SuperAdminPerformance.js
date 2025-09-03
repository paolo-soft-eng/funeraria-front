import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Filter, Calendar, UserCheck, Award, BarChart3, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const SuperAdminPerformance = () => {
  const [admins, setAdmins] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'average', direction: 'descending' });
  const [selectedAdminForRatings, setSelectedAdminForRatings] = useState(null);
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [adminRatings, setAdminRatings] = useState([]);
  const [adminRatingSummary, setAdminRatingSummary] = useState(null);
  const [formData, setFormData] = useState({
    efficiency: 0,
    communication: 0,
    problem_solving: 0,
    reliability: 0,
    knowledge: 0,
    comments: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingRatingId, setEditingRatingId] = useState(null);

  const navigate = useNavigate();
  const ratingCriteria = [
    { id: 'efficiency', label: 'Task Efficiency', description: 'How efficiently tasks are completed' },
    { id: 'communication', label: 'Communication', description: 'Quality of communication with team and users' },
    { id: 'problem_solving', label: 'Problem Solving', description: 'Ability to resolve issues effectively' },
    { id: 'reliability', label: 'Reliability', description: 'Dependability in completing assigned work' },
    { id: 'knowledge', label: 'Knowledge', description: 'Depth of system knowledge and expertise' }
  ];

  useEffect(() => {
    fetchAdmins();
    fetchAllRatings();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('http://localhost/apii/components/superadmin/users.php');
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to load admins');
    }
  };

  const fetchAllRatings = async () => {
    try {
      const response = await fetch('http://localhost/apii/components/superadmin/get_rating.php');
      const data = await response.json();
      
      if (data.success) {
        const ratingsMap = {};
        data.ratings.forEach(rating => {
          if (!ratingsMap[rating.admin_id]) {
            ratingsMap[rating.admin_id] = [];
          }
          ratingsMap[rating.admin_id].push(rating);
        });
        setRatings(ratingsMap);
      } else {
        setError(data.error || 'Failed to load ratings');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setError('Failed to load ratings');
      setLoading(false);
    }
  };


  const handleDashboardRedirect = () => {
    navigate('/super-admin');
  }

  const fetchAdminRatings = async (adminId, timeframe = 'all') => {
    try {
      const response = await fetch(
        `http://localhost/apii/components/superadmin/get_rating.php?admin_id=${adminId}&timeframe=${timeframe}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const data = await response.json();

      if (data.success) {
        setAdminRatings(data.ratings);
        setAdminRatingSummary(data.summary);
      } else {
        throw new Error(data.error || 'Failed to load ratings');
      }
    } catch (error) {
      setError('Error fetching ratings: ' + error.message);
      showNotification(error.message, 'error');
    }
  };

  const handleViewRatings = (admin) => {
    setSelectedAdminForRatings(admin);
    fetchAdminRatings(admin.id);
    setShowRatingsModal(true);
  };

  const handleRateAdmin = (admin) => {
    setSelectedAdmin(admin);
    
    // Check if admin has existing ratings and pre-fill form for update
    if (ratings[admin.id] && ratings[admin.id].length > 0) {
      const latestRating = ratings[admin.id][ratings[admin.id].length - 1];
      setFormData({
        efficiency: latestRating.efficiency,
        communication: latestRating.communication,
        problem_solving: latestRating.problem_solving,
        reliability: latestRating.reliability,
        knowledge: latestRating.knowledge,
        comments: latestRating.comments || ''
      });
      setIsEditing(true);
      setEditingRatingId(latestRating.id);
    } else {
      // Reset form for new rating
      setFormData({
        efficiency: 0,
        communication: 0,
        problem_solving: 0,
        reliability: 0,
        knowledge: 0,
        comments: ''
      });
      setIsEditing(false);
      setEditingRatingId(null);
    }
    
    setShowRatingForm(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        admin_id: selectedAdmin.id,
        ...formData,
        rated_by: 'superadmin' // This would typically be the logged-in user ID
      };
      
      // If we're editing, include the rating ID
      if (isEditing && editingRatingId) {
        payload.rating_id = editingRatingId;
      }
      
      const response = await fetch('http://localhost/apii/components/superadmin/save_rating.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh ratings
        fetchAllRatings();
        setShowRatingForm(false);
        setSelectedAdmin(null);
        setIsEditing(false);
        setEditingRatingId(null);
        showNotification(
          isEditing ? 'Rating updated successfully!' : 'Rating submitted successfully!', 
          'success'
        );
      } else {
        throw new Error(result.error || 'Failed to save rating');
      }
    } catch (error) {
      console.error('Error saving rating:', error);
      showNotification(error.message, 'error');
    }
  };

  const calculateAverageRating = (adminId) => {
    if (!ratings[adminId] || ratings[adminId].length === 0) return 0;

    const latestRating = ratings[adminId][ratings[adminId].length - 1];
    const criteriaValues = ratingCriteria.map(criterion => latestRating[criterion.id]);
    return criteriaValues.reduce((sum, value) => sum + value, 0) / criteriaValues.length;
  };

  const getRatingHistory = (adminId) => {
    return ratings[adminId] || [];
  };

  const showNotification = (message, type = 'info') => {
    // Implementation for showing notifications
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-500 transform translate-x-0 z-50 ${type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
      } text-white`;
    notification.innerHTML = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  // Filter and sort admins based on selected filter and sort config
  const filteredAdmins = admins.filter(admin => {
    if (filter === 'rated') return ratings[admin.id] && ratings[admin.id].length > 0;
    if (filter === 'not-rated') return !ratings[admin.id] || ratings[admin.id].length === 0;
    return true;
  });

  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    const aRating = calculateAverageRating(a.id);
    const bRating = calculateAverageRating(b.id);

    if (sortConfig.key === 'name') {
      if (a.username < b.username) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a.username > b.username) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    } else {
      if (aRating < bRating) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aRating > bRating) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-gray-500">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center">
                <TrendingUp size={28} className="text-white mr-3" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Performance Ratings</h1>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-black bg-opacity-20 hover:bg-opacity-30 text-white py-2 pl-10 pr-8 rounded-lg flex items-center shadow transition-all duration-200 appearance-none"
                  >
                    <option value="all">All Admins</option>
                    <option value="rated">Rated Admins</option>
                    <option value="not-rated">Not Rated</option>
                  </select>
                  <Filter size={18} className="absolute left-3 top-2.5 text-white" />
                </div>
                <button
                  onClick={() => setSortConfig({
                    key: sortConfig.key === 'name' ? 'average' : 'name',
                    direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
                  })}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg flex items-center shadow transition-all duration-200"
                >
                  <BarChart3 size={18} className="mr-2" />
                  Sort by {sortConfig.key === 'name' ? 'Rating' : 'Name'}
                </button>
                <button onClick={handleDashboardRedirect} className='bg-blue-600 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg flex items-center shadow transition-all duration-200'>Back to Dashboard</button>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <UserCheck size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Admins</p>
                  <p className="text-2xl font-bold">{admins.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Rated Admins</p>
                  <p className="text-2xl font-bold">
                    {Object.keys(ratings).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                  <Star size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Average Rating</p>
                  <p className="text-2xl font-bold">
                    {admins.length > 0 && Object.keys(ratings).length > 0 ?
                      (admins.reduce((sum, admin) => sum + (ratings[admin.id] ? calculateAverageRating(admin.id) : 0), 0) / 
                      admins.filter(admin => ratings[admin.id]).length).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admins List */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Performance</h2>

            {sortedAdmins.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <UserCheck size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No admins found</h3>
                <p className="text-gray-500">Try adjusting your filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAdmins.map(admin => (
                  <div key={admin.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                    {/* Header Section */}
                    <div className="p-3 sm:p-4 border-b border-gray-200 bg-indigo-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium mr-2 sm:mr-3 text-sm sm:text-base">
                          {admin.username?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{admin.username}</h3>
                          <p className="text-xs text-gray-500 truncate">{admin.first_name} {admin.last_name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full self-start sm:self-auto ${admin.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {admin.status || 'disabled'}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-3 sm:p-4">
                      {/* Rating Summary */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                          <span className="text-lg font-bold text-indigo-600">
                            {calculateAverageRating(admin.id).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                size={16}
                                className={
                                  star <= Math.round(calculateAverageRating(admin.id))
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">
                            ({getRatingHistory(admin.id).length} ratings)
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons - Stack on mobile, side-by-side on larger screens */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleRateAdmin(admin)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors"
                        >
                          {getRatingHistory(admin.id).length > 0 ? 'Update Rating' : 'Rate Admin'}
                        </button>
                        <button
                          onClick={() => handleViewRatings(admin)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-colors"
                        >
                          View Ratings
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && selectedAdmin && (
        <RatingFormModal
          admin={selectedAdmin}
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={handleSubmitRating}
          onClose={() => {
            setShowRatingForm(false);
            setIsEditing(false);
            setEditingRatingId(null);
          }}
          criteria={ratingCriteria}
          isEditing={isEditing}
        />
      )}

      {/* Ratings View Modal */}
      {showRatingsModal && selectedAdminForRatings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <Star size={20} className="mr-2 text-amber-500" />
                Ratings for {selectedAdminForRatings.username}
              </h2>
              <button
                onClick={() => setShowRatingsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <RatingsModalContent
                admin={selectedAdminForRatings}
                ratings={adminRatings}
                summary={adminRatingSummary}
                criteria={ratingCriteria}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Rating Form Component
const RatingFormModal = ({ admin, formData, onFormChange, onSubmit, onClose, criteria, isEditing }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Star size={20} className="mr-2 text-amber-500" />
            {isEditing ? 'Update Rating for' : 'Rate Admin:'} {admin.username}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          {criteria.map(criterion => (
            <div key={criterion.id} className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {criterion.label} - {formData[criterion.id]} stars
              </label>
              <p className="text-gray-500 text-sm mb-3">{criterion.description}</p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onFormChange(criterion.id, star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={
                        star <= formData[criterion.id]
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Comments
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => onFormChange('comments', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
              placeholder="Add any comments about this admin's performance..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
            >
              {isEditing ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Ratings Modal Content Component
const RatingsModalContent = ({ admin, ratings, summary, criteria }) => {
  const [timeframeFilter, setTimeframeFilter] = useState('all');

  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Star size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No ratings yet</h3>
        <p className="text-gray-500">This admin hasn't been rated yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Timeframe Filter */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">Timeframe</label>
        <select
          value={timeframeFilter}
          onChange={(e) => setTimeframeFilter(e.target.value)}
          className="shadow-sm appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 transition-all duration-200"
        >
          <option value="all">All Time</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </select>
      </div>

      {/* Rating Summary */}
      {summary && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{summary.total_ratings}</div>
              <div className="text-sm text-gray-500">Total Ratings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{summary.overall_average}</div>
              <div className="text-sm text-gray-500">Overall Average</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= Math.round(summary.overall_average)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500">Star Rating</div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Ratings */}
      <h3 className="text-lg font-medium mb-4">Individual Ratings</h3>
      <div className="space-y-4">
        {ratings.map((rating, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">Rating #{ratings.length - index}</div>
                <div className="text-sm text-gray-500">
                  {new Date(rating.rating_date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-indigo-600 mr-1">
                  {(
                    (rating.efficiency +
                      rating.communication +
                      rating.problem_solving +
                      rating.reliability +
                      rating.knowledge) / 5
                  ).toFixed(1)}
                </span>
                <Star size={16} className="text-amber-400 fill-amber-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {criteria.map(criterion => (
                <div key={criterion.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{criterion.label}:</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">{rating[criterion.id]}</span>
                    <Star size={14} className="text-amber-400" />
                  </div>
                </div>
              ))}
            </div>

            {rating.comments && (
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-700">Comments:</div>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                  {rating.comments}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminPerformance;
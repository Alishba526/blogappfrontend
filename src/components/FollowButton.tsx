import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';

interface Props {
  targetUserId: string;
}

const FollowButton: React.FC<Props> = ({ targetUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Note: Assuming we have a way to know if current user follows target, 
  // but for now, we'll implement simple toggle logic.

  const handleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await api.post(`/users/unfollow/${targetUserId}`);
        toast.success('Unfollowed');
      } else {
        await api.post(`/users/follow/${targetUserId}`);
        toast.success('Followed');
      }
      setIsFollowing(!isFollowing);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium transition ${
        isFollowing 
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {loading ? 'Processing...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;

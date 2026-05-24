import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Props {
  userId: string;
}

const UserStats: React.FC<Props> = ({ userId }) => {
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0, connectionsCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get(`/users/${userId}/stats`);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, [userId]);

  return (
    <div className="flex gap-6 text-sm">
      <div>
        <span className="font-bold text-gray-900">{stats.followersCount}</span> <span className="text-gray-500 font-medium">Followers</span>
      </div>
      <div>
        <span className="font-bold text-gray-900">{stats.followingCount}</span> <span className="text-gray-500 font-medium">Following</span>
      </div>
      <div>
        <span className="font-bold text-gray-900">{stats.connectionsCount || 0}</span> <span className="text-gray-500 font-medium">Connections</span>
      </div>
    </div>
  );
};

export default UserStats;

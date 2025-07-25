import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      const id = decodedToken.sub;
      fetchUserInfo(id);
    }
  }, []);

  const fetchUserInfo = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5024/api/user/${id}`);
      setUserInfo(response.data);
    } catch (err) {
      console.error('Sunucudan kullanıcı bilgileri alınamadı:', err);

      if (err.response?.data?.hata) {
        setError(err.response.data.hata);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Bilinmeyen bir hata.");
      }
    }
  };

  const handleEdit = () => {
    navigate(`/profile/edit/${userInfo.id}`);
  };

  return (
    <div className="w-full max-w-2xl p-8 text-left">
      {error && <div className="text-red-600 text-xl mb-4">{error}</div>}
      {userInfo ? (
        <div>
          <h2 className="text-4xl font-bold mb-6">Profilim</h2>
          <div className="mb-6">
            <label className="block text-2xl font-semibold mb-1">Kullanıcı Adı</label>
            <p className="text-xl">{userInfo.username}</p>
          </div>
          <div className="mb-6">
            <label className="block text-2xl font-semibold mb-1">E-posta</label>
            <p className="text-xl">{userInfo.email}</p>
          </div>
          <button
            onClick={handleEdit}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-lg px-6 py-3 rounded"
          >
            Düzenle
          </button>
        </div>
      ) : (
        <p className="text-xl">Yükleniyor...</p>
      )}
    </div>
  );
};

export default Profile;
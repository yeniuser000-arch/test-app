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
    <div className="max-w-2xl mx-auto p-6">
      {error && <div className="text-red-500">{error}</div>}
      {userInfo ? (
        <div>
          <h2 className="text-3xl font-bold mb-4">Profilim</h2>
          <div className="mb-4">
            <label className="block font-medium">Kullanıcı Adı</label>
            <p>{userInfo.username}</p>
          </div>
          <div className="mb-4">
            <label className="block font-medium">E-posta</label>
            <p>{userInfo.email}</p>
          </div>
          <button
            onClick={handleEdit}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Düzenle
          </button>
        </div>
      ) : (
        <p>Yükleniyor...</p>
      )}
    </div>
  );
};

export default Profile;
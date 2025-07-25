import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
  const { id } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [newUserInfo, setNewUserInfo] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo(id);
  }, [id]);

  const fetchUserInfo = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5024/api/user/${id}`);
      setUserInfo(response.data);
      setNewUserInfo({
        username: response.data.username,
        email: response.data.email,
        password: '',
        confirmPassword: '',
      });
      setLoading(false);
    } catch (err) {
      setError("Kullanıcı bilgileri alınamadı.");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newUserInfo.username || !newUserInfo.email) {
      setError("Kullanıcı adı ve e-posta boş bırakılamaz.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(newUserInfo.email)) {
      setError("Geçersiz e-posta adresi.");
      return;
    }

    if (newUserInfo.password !== newUserInfo.confirmPassword) {
      setError("Şifreler uyuşmuyor.");
      return;
    }
    if (newUserInfo.password && newUserInfo.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5024/api/user/${id}`,
        newUserInfo
      );
      alert('Bilgileriniz başarıyla güncellendi!');
      navigate('/profile');
    } catch (err) {
      if (err.response) {
        alert("Hata: " + (err.response?.data?.hata || "Kayıt başarısız."));
        console.error('Hata Yanıtı:', err.response.data);
        setError(err.response.data.message || "Kullanıcı bilgileri güncellenemedi.");
      } else {
        console.error("Hata:", err.message);
        setError("Kullanıcı bilgileri güncellenemedi.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {loading ? (
        <div className="text-center">Yükleniyor...</div>
      ) : (
        <>
          {error && <div className="text-red-500">{error}</div>}
          <h2 className="text-3xl font-bold mb-4">Profil Düzenle</h2>
          <div className="mb-4">
            <label className="block font-medium">Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={newUserInfo.username}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium">E-posta</label>
            <input
              type="email"
              name="email"
              value={newUserInfo.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium">Yeni Şifre</label>
            <input
              type="password"
              name="password"
              value={newUserInfo.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium">Şifre Tekrarı</label>
            <input
              type="password"
              name="confirmPassword"
              value={newUserInfo.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Kaydet
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileEdit;
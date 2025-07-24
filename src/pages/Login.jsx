import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from 'jwt-decode';

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5024/api/user/login', {
        Email: form.email,
        Password: form.password,
      });
      const decodedToken = jwtDecode(response.data.token);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        console.log('Token bulunamadı!');
      }

      const kullanici = response.data;

      localStorage.setItem('kullanici_id', kullanici.id);
      localStorage.setItem('kullanici_adi', kullanici.username);
      localStorage.setItem('isAdmin', decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === 'admin' ? 'true' : 'false');

      navigate('/home');
    } catch (error) {
      setError(error.response?.data?.hata || 'Giriş hatası oluştu.');
    }
  };


  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1557683304-673a23048d34?auto=format&fit=crop&w=1920&q=80')`,
      }}
    >
      <form
        onSubmit={handleLogin}
        className="backdrop-blur-md bg-white/30 p-8 rounded-2xl w-full max-w-md shadow-xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-white drop-shadow">Giriş Yap</h2>

        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-lg bg-white/80 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Şifre"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 pr-10 rounded-lg bg-white/80 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-700 text-lg"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && (
          <p className="text-red-100 text-center text-sm bg-red-500/60 rounded px-2 py-1">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Giriş
        </button>

        <p className="text-center text-white">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="text-blue-200 hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </form>
    </div>
  );
}



export default Login;
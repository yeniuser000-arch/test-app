import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error] = useState('');
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate()

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post("http://localhost:5024/api/user/login", {
      Email: form.email,
      Password: form.password,
    });

    const kullanici = response.data;

    localStorage.setItem("kullanici_id", kullanici.id);
    localStorage.setItem("kullanici_adi", kullanici.username);
    localStorage.setItem("rol", kullanici.rol);

    if (kullanici.rol === "admin") {
      localStorage.setItem("isAdmin", "true");
    } else {
      localStorage.setItem("isAdmin", "false");
    }

    alert("Giriş başarılı! Kullanıcı: " + kullanici.username);
    navigate("/home");
  } catch (error) {
    alert("Giriş hatası: " + (error.response?.data?.hata || error.message));
  } 
};

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80')` }}
      >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="backdrop-blur-sm bg-white/30 p-12 rounded-lg max-w-sm w-full space-y-4">
          <h2 className="text-4xl font-bold text-white text-center mb-6">Giriş Yap</h2>
            <input
            type="email"
            name='email'
            placeholder="E-posta"
            value={form.email}
            onChange={handleChange}
            required
             className="w-full px-4 py-2 rounded bg-white/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />  
          <input
            type="password"
            name='password'
            placeholder="Şifre"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-white/70 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Giriş
        </button>
        <p className="w-full text-center text-xl text-black">
          Hesabınız yok mu?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Kayıt Ol
          </Link>
        </p>
        {error && <p className=''>{error}</p>}
      </form>
    </div>
  );
}

export default Login;
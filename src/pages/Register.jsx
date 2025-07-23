import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    Username: "",
    Email: "",
    Password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5024/api/user/register", form);
      alert("Kayıt başarılı: " + res.data.message);
      navigate("/home"); // Başarılıysa yönlendir
    } catch (error) {
      console.error("Kayıt hatası:", error);
      if (error.response) {
        alert("Hata: " + (error.response.data?.hata || "Bilinmeyen hata"));
      } else if (error.request) {
        alert("Sunucuya ulaşamadı. API çalışıyor mu?");
      } else {
        alert("İstek hatası: " + error.message);
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80')` }}
    >
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Kayıt Ol</h2>

        <input
          type="text"
          name="Username"
          placeholder="Ad Soyad"
          value={form.Username}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <input
          type="email"
          name="Email"
          placeholder="E-posta"
          value={form.Email}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <input
          type="password"
          name="Password"
          placeholder="Şifre"
          value={form.Password}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Kayıt Ol
        </button>
      </form>
    </div>
  );
}

export default Register;
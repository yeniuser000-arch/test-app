import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const [form, setForm] = useState({
    Username: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const isEmailValid = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!isEmailValid(form.Email)) {
      alert("Geçerli bir e-posta adresi girin.");
      return;
    }

    if (form.Password.length < 6) {
      alert("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (form.Password !== form.ConfirmPassword) {
      alert("Şifreler eşleşmiyor.");
      return;
    }

    try {
      const { ConfirmPassword, ...postData } = form; 
      const res = await axios.post("http://localhost:5024/api/user/register", postData);
      alert("Kayıt başarılı: " + res.data.message);
      navigate("/home");
    } catch (error) {
      alert("Hata: " + (error.response?.data?.hata || "Kayıt başarısız."));
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex justify-center items-center px-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1557683304-673a23048d34?auto=format&fit=crop&w=1920&q=80')`,
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-md bg-white/30 shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-white drop-shadow">Kayıt Ol</h2>

        <input
          type="text"
          name="Username"
          placeholder="Ad Soyad"
          value={form.Username}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-white/80 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="email"
          name="Email"
          placeholder="E-posta"
          value={form.Email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-white/80 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="Password"
            placeholder="Şifre (min. 6 karakter)"
            value={form.Password}
            onChange={handleChange}
            className="w-full px-4 py-2 pr-10 rounded-lg bg-white/80 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-2 top-2 text-gray-600 hover:text-gray-900 text-xl"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          name="ConfirmPassword"
          placeholder="Şifre Tekrar"
          value={form.ConfirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 pr-10 rounded-lg bg-white/80 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Kayıt Ol
        </button>
      </form>
    </div>
  );
}

export default Register;
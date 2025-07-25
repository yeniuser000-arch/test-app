import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PencilLine, Plus, Lock, ListTodo, Type } from "lucide-react";

const AnketEkle = () => {
  const [soru, setSoru] = useState("");
  const [secenekler, setSecenekler] = useState(["", ""]);
  const [sifre, setSifre] = useState("");
  const [mesaj, setMesaj] = useState("");
  const navigate = useNavigate();

  const handleSecenekDegis = (index, value) => {
    const yeniSecenekler = [...secenekler];
    yeniSecenekler[index] = value;
    setSecenekler(yeniSecenekler);
  };

  const secenekEkle = () => {
    setSecenekler([...secenekler, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const temizSecenekler = secenekler.map(s => s.trim()).filter(Boolean);
    if (temizSecenekler.length < 2) {
      return alert("En az 2 geçerli seçenek girilmelidir.");
    }

    try {
      const response = await axios.post("http://localhost:5024/api/anket/ekle", {
        soru,
        sifre: sifre.trim(),
        secenekler: temizSecenekler.map(s => ({ secenek_adi: s }))
      });

      setMesaj("✅ " + response.data.mesaj);
      setSoru("");
      setSecenekler(["", ""]);
      setSifre("");

      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (err) {
      alert("Hata: " + (err.response?.data?.mesaj || err.message));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-2xl mt-8 space-y-6">
      <h2 className="text-4xl font-bold text-center text-gray-800 flex items-center justify-center gap-3">
        <ListTodo className="w-8 h-8 text-blue-600" />
        Yeni Anket Oluştur
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <Type className="w-5 h-5 text-gray-600" />
            Soru
          </label>
          <input
            type="text"
            value={soru}
            onChange={(e) => setSoru(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <PencilLine className="w-5 h-5 text-gray-600" />
            Seçenekler
          </label>
          {secenekler.map((secenek, index) => (
            <input
              key={index}
              type="text"
              value={secenek}
              onChange={(e) => handleSecenekDegis(index, e.target.value)}
              required
              placeholder={`Seçenek ${index + 1}`}
              className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          ))}

          <button
            type="button"
            onClick={secenekEkle}
            className="mt-2 inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full hover:bg-blue-200 transition"
          >
            <Plus className="w-4 h-4" />
            Yeni Seçenek Ekle
          </button>
        </div>

        <div>
          <label className="text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-600" />
            Anket Şifresi (Opsiyonel)
          </label>
          <input
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            placeholder="İsteğe bağlı şifre girin"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3 rounded-xl shadow-md transition"
        >
          Anketi Kaydet
        </button>
      </form>

      {mesaj && <p className="text-green-600 text-center text-lg mt-4">{mesaj}</p>}
    </div>
  );
};

export default AnketEkle;
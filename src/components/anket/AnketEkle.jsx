import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold">📝 Yeni Anket Ekle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Soru:</label>
          <input
            type="text"
            value={soru}
            onChange={(e) => setSoru(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700">Seçenekler:</label>
          {secenekler.map((secenek, index) => (
            <input
              key={index}
              type="text"
              value={secenek}
              onChange={(e) => handleSecenekDegis(index, e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded mb-2"
            />
          ))}
          <button
            type="button"
            onClick={secenekEkle}
            className="text-blue-600 hover:underline mt-1"
          >
            ➕ Seçenek Ekle
          </button>
        </div>

        <div>
          <label className="block text-gray-700">🔒 Anket Şifresi (Opsiyonel):</label>
          <input
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            placeholder="Şifre belirlemek isterseniz girin"
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Anketi Kaydet
        </button>
      </form>

      {mesaj && <p className="text-green-600">{mesaj}</p>}
    </div>
  );
};

export default AnketEkle;
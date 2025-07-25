import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AnketDetay = () => {
  const { id } = useParams();
  const [anket, setAnket] = useState(null);
  const [mesaj, setMesaj] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreGerekli, setSifreGerekli] = useState(false);
  const [seciliSecenekId, setSeciliSecenekId] = useState(null);
  const [oyVerildi, setOyVerildi] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (userRole === "admin") {
        setIsAdmin(true);
      }
    }
  }, []);
  const kullaniciId = localStorage.getItem("kullanici_id");

  const anketGetir = useCallback(async (girilenSifre = "") => {
    try {
      const res = await axios.get(`http://localhost:5024/api/anket/${id}`, {
        params: {
          kullaniciId,
          sifre: girilenSifre
        }
      });
      setAnket(res.data);
      setOyVerildi(res.data.oyVerildi);
      setSeciliSecenekId(res.data.kullaniciSecimi);
      setMesaj("");
      setSifreGerekli(false);
    } catch (err) {
      if (err.response?.status === 401) {
        setSifreGerekli(true);
        setMesaj("Bu ankete erişmek için şifre gerekli.");
      } else if (err.response?.data?.mesaj) {
        setMesaj("❌ " + err.response.data.mesaj);
      } else {
        setMesaj("❌ Anket detayları yüklenemedi.");
      }
    }
  }, [id, kullaniciId]);

  useEffect(() => {
    anketGetir();
  }, [anketGetir]);

  const sifreyiOnayla = () => {
    if (!sifre.trim()) {
      setMesaj("Lütfen bir şifre girin.");
      return;
    }
    anketGetir(sifre);
  };

  const oyGonder = async () => {
    if (!kullaniciId) {
      setMesaj("❌ Oy vermek için giriş yapmalısınız.");
      return;
    }
    if (!seciliSecenekId) {
      setMesaj("Lütfen bir seçenek seçin.");
      return;
    }

    try {
      await axios.post("http://localhost:5024/api/anket/oyver", {
        secenekId: seciliSecenekId,
        kullaniciId: parseInt(kullaniciId)
      });

      setMesaj("✅ Oy başarıyla eklendi.");
      setOyVerildi(true);
      anketGetir(sifre);
    } catch (err) {
      setMesaj("❌ " + (err.response?.data?.mesaj || "Oy verme hatası"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {sifreGerekli ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">🔐 Şifre Gerekli</h2>
          <input
            type="password"
            placeholder="Şifreyi girin"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            onClick={sifreyiOnayla}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Şifreyi Onayla
          </button>
          {mesaj && <p className="text-sm text-red-600">{mesaj}</p>}
        </div>
      ) : anket ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">🗳️ {anket.soru}</h2>
          <ul className="space-y-3">
            {anket.secenekler.map(secenek => (
              <li
                key={secenek.secenek_id}
                className="flex flex-col bg-gray-100 p-3 rounded"
              >
                <div className="flex justify-between items-center">
                  <span>
                    {secenek.secenek_adi}
                    {isAdmin && ` (${secenek.oy_sayisi} oy)`}
                  </span>
                  <button
                    onClick={() => setSeciliSecenekId(secenek.secenek_id)}
                    disabled={oyVerildi}
                    className={`px-3 py-1 rounded text-white ${oyVerildi
                      ? secenek.secenek_id === seciliSecenekId
                        ? "bg-green-600"
                        : "bg-gray-400"
                      : secenek.secenek_id === seciliSecenekId
                        ? "bg-blue-700"
                        : "bg-blue-500 hover:bg-blue-600"
                      }`}
                  >
                    {oyVerildi
                      ? secenek.secenek_id === seciliSecenekId
                        ? "✅ Oy Verdiniz"
                        : "Oy Verildi"
                      : secenek.secenek_id === seciliSecenekId
                        ? "Seçildi"
                        : "Seç"}
                  </button>
                </div>
                {oyVerildi && secenek.secenek_id === seciliSecenekId && anket.oyTarihi && (
                  <p className="text-sm text-gray-600 mt-1 ml-2">
                    Oy verdiğiniz tarih: {new Date(anket.oyTarihi).toLocaleString()}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {!oyVerildi && seciliSecenekId && (
            <button
              onClick={oyGonder}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Oyumu Onayla
            </button>
          )}

          {mesaj && (
            <p className="mt-4 text-sm text-green-600">{mesaj}</p>
          )}
        </div>
      ) : (
        <p className="text-gray-500">{mesaj || "Yükleniyor..."}</p>
      )}
    </div>
  );
};

export default AnketDetay;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AnketListePop = () => {
  const [anketler, setAnketler] = useState([]);
  const [hata, setHata] = useState(null);
  const [filtre, setFiltre] = useState("tum");
  const isAdmin = localStorage.getItem("rol") === "admin";
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5024/api/anket/listele")
      .then(res => {
        const sıralıAnketler = res.data
          .map(anket => ({
            ...anket,
            toplamOy: anket.secenekler.reduce((acc, secenek) => acc + secenek.oy_sayisi, 0)
          }))
          .sort((a, b) => b.toplamOy - a.toplamOy);
        setAnketler(sıralıAnketler);
      })
      .catch(() => setHata("Anketler yüklenemedi"));
  }, []);

  const handleDetay = (anketId, aktif) => {
    if (!aktif) return;
    navigate(`/anket/${anketId}`);
  };

  const filtrelenmisAnketler = anketler.filter(anket => {
    if (filtre === "aktif") return anket.aktif;
    if (filtre === "pasif") return !anket.aktif;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🔥 Popüler Anketler</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFiltre("tum")}
          className={`px-4 py-1 rounded-full text-sm ${filtre === "tum" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Tümü
        </button>
        <button
          onClick={() => setFiltre("aktif")}
          className={`px-4 py-1 rounded-full text-sm ${filtre === "aktif" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Aktif
        </button>
        <button
          onClick={() => setFiltre("pasif")}
          className={`px-4 py-1 rounded-full text-sm ${filtre === "pasif" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Pasif
        </button>
      </div>


      {hata ? (
        <div className="text-red-600 text-center mt-6">{hata}</div>
      ) : filtrelenmisAnketler.length === 0 ? (
        <p className="text-gray-500">Gösterilecek anket bulunamadı.</p>
      ) : (
        filtrelenmisAnketler.map((anket, index) => (
          <div
            key={index}
            onClick={() => handleDetay(anket.anketId, anket.aktif)}
            className={`border rounded-xl p-4 mb-4 transition-all ${anket.aktif
              ? "cursor-pointer border-gray-200 bg-white shadow hover:bg-gray-50"
              : "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-300"
              }`}
          >
            <div className="flex justify-between items-center">
              <h4 className={`text-lg font-semibold ${anket.aktif ? "text-gray-700" : "text-gray-500"}`}>
                🗨️ {anket.soru}
              </h4>
              {!anket.aktif && (
                <span className="text-sm px-2 py-1 bg-red-100 text-red-500 rounded">Pasif</span>
              )}
            </div>

            {isAdmin && (
              <p className="text-sm mt-1 mb-2">
                Toplam Oy: {anket.toplamOy}
              </p>
            )}

            <ul className="list-disc ml-5 mt-2 text-sm">
              {anket.secenekler.map((secenek, i) => (
                <li key={i}>
                  {secenek.secenek_adi}
                  {isAdmin && ` (${secenek.oy_sayisi} oy)`}
                </li>
              ))}
            </ul>

            {!anket.aktif && (
              <div className="text-sm mt-2 text-gray-600 italic space-y-1">
                <div>Pasife alan: {anket.pasifeAlanKullaniciAdi || "Bilinmiyor"}</div>
                <div>Pasife alınma: {anket.pasifTarihi
                  ? new Date(anket.pasifTarihi).toLocaleString("tr-TR")
                  : "Bilinmiyor"}
                </div>
                <div className="text-gray-700">Açıklama: {anket.pasifAciklama || "Yok"}</div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AnketListePop;
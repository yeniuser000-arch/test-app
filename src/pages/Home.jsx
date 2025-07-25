import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [anketler, setAnketler] = useState([]);
  const [hata, setHata] = useState(null);
  const [filtre, setFiltre] = useState("tum");
  const [acikBilgiId, setAcikBilgiId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [seciliAnket, setSeciliAnket] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5024/api/anket/listele")
      .then(res => setAnketler(res.data))
      .catch(() => setHata("Anketler yüklenemedi"));
  }, []);

  const handleDetay = (anketId, aktif) => {
    if (!aktif) return;
    navigate(`/anket/${anketId}`);
  };

  const filtrelenmisAnketler = anketler.filter((anket) => {
    if (filtre === "aktif") return anket.aktif;
    if (filtre === "pasif") return !anket.aktif;
    return true;
  });

  if (hata) {
    return <div className="text-red-600 text-center mt-6">{hata}</div>;
  }

  return (
    <div className="p-8 font-sans">
      <h2 className="text-3xl font-bold mb-8 text-gray-800"> Yayınlanan Anketler</h2>
      <div className="flex gap-4 mb-10">
        {["tum", "aktif", "pasif"].map((type) => (
          <button
            key={type}
            onClick={() => setFiltre(type)}
            className={`px-5 py-2 rounded-full text-md font-medium ${filtre === type
              ? type === "aktif"
                ? "bg-green-600 text-white"
                : type === "pasif"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
              }`}
          >
            {type === "tum" ? "Tümü" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      {filtrelenmisAnketler.length === 0 ? (
        <p className="text-gray-500">Bu kritere uygun anket bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrelenmisAnketler.map((anket, index) => (
            <div
              key={index}
              onClick={() => handleDetay(anket.anketId, anket.aktif)}
              className={`rounded-xl p-6 shadow transition-all ${anket.aktif
                ? 'cursor-pointer bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
                : 'cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-300'
                }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-semibold">
                  {anket.soru}
                </h4>

                {!anket.aktif && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-500 rounded">Pasif</span>

                    <InformationCircleIcon
                      className="h-5 w-5 text-blue-500 hover:text-blue-700 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeciliAnket(anket);
                        setShowModal(true);
                        setAcikBilgiId(acikBilgiId === anket.anketId ? null : anket.anketId);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && seciliAnket && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✖
            </button>

            <h3 className="text-lg font-bold mb-4">📌 Pasife Alma Bilgisi</h3>
            <p><strong>Pasife alan:</strong> {seciliAnket.pasifeAlanKullaniciAdi || "Bilinmiyor"}</p>
            <p><strong>Tarih:</strong> {seciliAnket.pasifTarihi
              ? new Date(seciliAnket.pasifTarihi).toLocaleString("tr-TR")
              : "Bilinmiyor"}
            </p>
            <p><strong>Açıklama:</strong> {seciliAnket.pasifAciklama || "Yok"}</p>
          </div>
        </div>
      )}
    </div>

  );
};

export default Home;
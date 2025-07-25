import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminAnketListe = () => {
  const [anketler, setAnketler] = useState([]);
  const [mesaj, setMesaj] = useState("");

  const adminId = localStorage.getItem("kullanici_id");

  const anketleriGetir = async () => {
    try {
      const res = await axios.get("http://localhost:5024/api/anket/listele");
      setAnketler(res.data.filter(a => a.aktif));
    } catch (err) {
      setMesaj("❌ Anketler yüklenemedi.");
    }
  };

  const anketiPasifYap = async (anketId, aciklama) => {
    try {
      await axios.put("http://localhost:5024/api/anket/pasif-yap", {
        anketId,
        kullaniciId: parseInt(adminId),
        pasifAciklama: aciklama
      });
      setMesaj("✅ Anket pasif hale getirildi.");
      anketleriGetir();
    } catch (err) {
      setMesaj("❌ Pasifleştirme başarısız.");
    }
  };

  useEffect(() => {
    anketleriGetir();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Admin - Anket Yönetimi</h2>
      {mesaj && <p className="mb-4 text-sm text-blue-600">{mesaj}</p>}

      {anketler.length === 0 ? (
        <p>Aktif anket bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {anketler.map((anket) => (
            <li key={anket.anketId} className="flex justify-between items-center bg-gray-100 p-4 rounded">
              <span className="font-medium">{anket.soru}</span>
              <button
                onClick={() => {
                  const aciklama = prompt("Lütfen anketi pasife alma nedeninizi yazınız:");
                  if (aciklama) anketiPasifYap(anket.anketId, aciklama);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Pasife Al
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminAnketListe;
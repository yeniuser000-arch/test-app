import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function KullaniciKontrol() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKullanicilar = async () => {
      try {
        const res = await axios.get("http://localhost:5024/api/user/tumkullanicilar");
        setKullanicilar(res.data);
      } catch (err) {
        setError("Kullanıcılar yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchKullanicilar();
  }, []);

  const handleGeriDon = () => {
    toast.info("Ana sayfaya yönlendiriliyorsunuz...");
    setTimeout(() => navigate("/home"), 1500);
  };

  const handleSil = async (id) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;

    try {
      await axios.delete(`http://localhost:5024/api/user/sil/${id}`);
      setKullanicilar((prev) => prev.filter((k) => k.id !== id));
      toast.success("Kullanıcı başarıyla silindi.");
    } catch (err) {
      toast.error("Kullanıcı silinirken bir hata oluştu.");
    }
  };

  return (
    <div className="p-6">
      {/* Geri Dön Butonu */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold"> Kullanıcı Kontrolü</h2>
         <div className="flex gap-2">
        <button
          onClick={handleGeriDon}
          className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-gray-400"
        >
          🔙 Geri Dön
        </button>
        <button
      onClick={() => navigate("/admin/silinen-kullanicilar")}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-yellow-600"
    >
      🗑️ Silinen Kullanıcılar
    </button>
    </div>
      </div>

      {/* İçerik */}
      {loading ? (
        <p>Yükleniyor...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-blue-600 text-white text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Kullanıcı Adı</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Rol</th>
                <th className="py-2 px-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {kullanicilar.map((kullanici) => (
                <tr key={kullanici.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{kullanici.id}</td>
                  <td className="py-2 px-4">{kullanici.username}</td>
                  <td className="py-2 px-4">{kullanici.email}</td>
                  <td className="py-2 px-4">{kullanici.rol}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleSil(kullanici.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast mesajlarını göstermek için */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default KullaniciKontrol;
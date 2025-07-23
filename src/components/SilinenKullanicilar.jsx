import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function SilinenKullanicilar() {
  const [silinmisler, setSilinmisler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSilinmis = async () => {
      try {
        const res = await axios.get("http://localhost:5024/api/user/silinmisler");
        setSilinmisler(res.data);
      } catch (err) {
        setError("Silinmiş kullanıcılar yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchSilinmis();
  }, []);

  const handleGeriAl = async (id) => {
    if (!window.confirm("Kullanıcıyı tekrar aktifleştirmek istiyor musunuz?")) return;

    try {
      await axios.put(`http://localhost:5024/api/user/aktiflestir/${id}`);
      setSilinmisler((prev) => prev.filter((k) => k.id !== id));
      toast.success("Kullanıcı geri getirildi.");
    } catch (err) {
      toast.error("Geri alma işlemi sırasında hata oluştu.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Silinmiş Kullanıcılar</h2>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-red-600 text-white text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Kullanıcı Adı</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Rol</th>
                <th className="py-2 px-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {silinmisler.map((kullanici) => (
                <tr key={kullanici.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{kullanici.id}</td>
                  <td className="py-2 px-4">{kullanici.username}</td>
                  <td className="py-2 px-4">{kullanici.email}</td>
                  <td className="py-2 px-4">{kullanici.rol}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleGeriAl(kullanici.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Geri Al
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default SilinenKullanicilar;
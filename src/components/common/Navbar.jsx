import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react"; 

function Navbar() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminFlag = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminFlag);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md py-3">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <Link to="/home">📊 Anket Uygulaması</Link>
        </h1>

        <div className="flex space-x-6 items-center">
          <Link to="/home" className="hover:text-gray-200 transition">
            Anasayfa
          </Link>
          <Link to="/anketListePop" className="hover:text-gray-200 transition">
            Popüler Anketler
          </Link>

          {isAdmin && (
  <div className="relative group">
    <button className="flex items-center hover:text-gray-200 transition">
      Admin Paneli <ChevronDown className="ml-1 w-4 h-4" />
    </button>

    <div className="absolute left-0 invisible group-hover:visible 
                    opacity-0 group-hover:opacity-100 
                    translate-y-1 group-hover:translate-y-0
                    transition-all duration-200 ease-out
                    bg-white text-gray-800 mt-2 rounded-md shadow-lg 
                    min-w-[180px] z-50">
      <Link
        to="/admin/anket-ekle"
        className="block px-4 py-2 hover:bg-gray-100 transition"
      >
        ➕ Anket Ekle
      </Link>
      <Link
        to="/admin/anket-sil"
        className="block px-4 py-2 hover:bg-gray-100 transition"
      >
        🗑️ Anket Sil
      </Link>
      <Link
        to="/admin/kullanicilar"
        className="block px-4 py-2 hover:bg-gray-100 transition"
      >
        👥 Kullanıcı Kontrolü
      </Link>
    </div>
  </div>
)}

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 transition px-3 py-1 rounded text-sm font-medium"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
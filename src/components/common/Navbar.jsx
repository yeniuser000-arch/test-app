import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userRole =
          decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setIsAdmin(userRole === "admin");
      } catch (error) {
        console.log("Token çözümleme hatası:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/home">Anket Uygulaması</Link>
        </h1>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`flex-col md:flex md:flex-row md:items-center md:space-x-6 space-y-3 md:space-y-0 w-full md:w-auto mt-4 md:mt-0 ${menuOpen ? "flex" : "hidden"}`}>
          <Link to="/home" className="hover:text-gray-200">
            Anasayfa
          </Link>
          <Link to="/anketListePop" className="hover:text-gray-200">
            Popüler Anketler
          </Link>
          <Link to="/profile" className="hover:text-gray-200">
            Profilim
          </Link>

          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className="flex items-center hover:text-gray-200"
              >
                Admin Paneli <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              {adminMenuOpen && (
                <div className="absolute bg-white text-gray-800 mt-2 rounded-md shadow-lg min-w-[180px] z-50">
                  <Link
                    to="/admin/anket-ekle"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Anket Ekle
                  </Link>
                  <Link
                    to="/admin/anket-sil"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Anket Sil
                  </Link>
                  <Link
                    to="/admin/kullanicilar"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Kullanıcı Kontrolü
                  </Link>
                </div>
              )}
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
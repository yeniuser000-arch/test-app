import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/common/Layout";
import Home from "./pages/Home";
import AnketDetay from "./components/anket/AnketDetay";
import PrivateRoute from "./components/common/PrivateRoute";
import AnketListePop from "./components/anket/AnketListePop";
import AnketEkle from "./components/anket/AnketEkle";
import AnketSil from "./components/AnketSil";
import KullaniciKontrol from "./components/KullaniciKontrol";
import SilinenKullanicilar from "./components/SilinenKullanicilar";
import Profile from "./pages/Profile";
import ProfileEdit from "./components/ProfileEdit";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="anket/:id" element={<AnketDetay />} />
          <Route path="anketListePop" element={<AnketListePop />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit/:id" element={<ProfileEdit />} />
        </Route>


        <Route
          path="/admin/anket-ekle"
          element={
            <PrivateRoute adminOnly={true}>
              <AnketEkle />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/anket-sil"
          element={
            <PrivateRoute adminOnly={true}>
              <AnketSil />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/kullanicilar"
          element={
            <PrivateRoute adminOnly={true}>
              <KullaniciKontrol />
            </PrivateRoute>
          }

        />
        <Route
          path="/admin/silinen-kullanicilar"
          element={
            <PrivateRoute adminOnly={true}>
              <SilinenKullanicilar />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
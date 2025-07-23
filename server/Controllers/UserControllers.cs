using Microsoft.AspNetCore.Mvc;
using server.Models;
using MySql.Data.MySqlClient;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly string connectionString = "server=localhost;database=anketdb;user=root;password=;";

    [HttpPost("register")]
    public IActionResult Register([FromBody] User kullanici)
    {
        using var conn = new MySqlConnection(connectionString);
        try
        {
            conn.Open();
            string query = @"
                INSERT INTO kullanici (kullanici_adi, kullanici_mail, kullanici_password, silindi)
                VALUES (@Username, @Email, @Password, 0)";

            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Username", kullanici.Username);
            cmd.Parameters.AddWithValue("@Email", kullanici.Email);
            cmd.Parameters.AddWithValue("@Password", kullanici.Password);

            cmd.ExecuteNonQuery();
            return Ok(new { message = "Kayıt başarılı" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { hata = ex.Message });
        }
    }

    [HttpPost("login")]
public IActionResult Login([FromBody] User kullanici)
{
    using var conn = new MySqlConnection(connectionString);
    try
    {
        conn.Open();

        // Kullanıcıyı bul
        string kontrolQuery = "SELECT * FROM kullanici WHERE kullanici_mail = @Email AND silindi = 0";
        using var kontrolCmd = new MySqlCommand(kontrolQuery, conn);
        kontrolCmd.Parameters.AddWithValue("@Email", kullanici.Email);

        using var reader = kontrolCmd.ExecuteReader();
        if (!reader.Read())
        {
            return Unauthorized(new { hata = "Kullanıcı bulunamadı." });
        }

        // reader'dan gerekli tüm alanları oku
        int kullaniciId = Convert.ToInt32(reader["kullanici_id"]);
        string kullaniciAdi = reader["kullanici_adi"].ToString() ?? "";
        string rol = reader["rol"].ToString() ?? "";
        int hataliGirisSayisi = Convert.ToInt32(reader["hatali_giris_sayisi"]);
        DateTime? sonHataZamani = reader["son_hatali_giris"] == DBNull.Value ? null : Convert.ToDateTime(reader["son_hatali_giris"]);
        string dogruSifre = reader["kullanici_password"] == DBNull.Value ? "" : reader["kullanici_password"].ToString() ?? "";

        reader.Close(); // reader'dan sonra işlem yapabilirsin

        // 5 kez hatalı girişten sonra 10 dakika beklet
        if (hataliGirisSayisi >= 5 && sonHataZamani != null && DateTime.Now < sonHataZamani.Value.AddMinutes(10))
        {
            return Unauthorized(new { hata = "Çok fazla başarısız giriş. Lütfen 10 dakika sonra tekrar deneyin." });
        }

        // Şifre kontrolü
        if (kullanici.Password != dogruSifre)
        {
            var updateCmd = new MySqlCommand(@"
                UPDATE kullanici 
                SET hatali_giris_sayisi = hatali_giris_sayisi + 1,
                    son_hatali_giris = @zaman
                WHERE kullanici_id = @id", conn);
            updateCmd.Parameters.AddWithValue("@zaman", DateTime.Now);
            updateCmd.Parameters.AddWithValue("@id", kullaniciId);
            updateCmd.ExecuteNonQuery();

            return Unauthorized(new { hata = "Şifre hatalı." });
        }

        // Hatalı giriş sayacını sıfırla
        var resetCmd = new MySqlCommand(@"
            UPDATE kullanici 
            SET hatali_giris_sayisi = 0, son_hatali_giris = NULL 
            WHERE kullanici_id = @id", conn);
        resetCmd.Parameters.AddWithValue("@id", kullaniciId);
        resetCmd.ExecuteNonQuery();

        // Başarılı giriş
        return Ok(new
        {
            message = "Giriş başarılı",
            username = kullaniciAdi,
            id = kullaniciId,
            rol = rol
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { hata = ex.Message });
    }
}

    [HttpGet("tumkullanicilar")]
    public IActionResult TumKullanicilariGetir()
    {
        var kullaniciListesi = new List<object>();

        using var conn = new MySqlConnection(connectionString);
        conn.Open();

        string query = @"
            SELECT kullanici_id, kullanici_adi, kullanici_mail, rol 
            FROM kullanici 
            WHERE silindi = 0";

        using var cmd = new MySqlCommand(query, conn);
        using var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            var kullanici = new
            {
                id = reader.GetInt32("kullanici_id"),
                username = reader.GetString("kullanici_adi"),
                email = reader.GetString("kullanici_mail"),
                rol = reader.GetString("rol")
            };

            kullaniciListesi.Add(kullanici);
        }

        return Ok(kullaniciListesi);
    }

    // SOFT DELETE UYGULANDI!
    [HttpDelete("sil/{id}")]
    public IActionResult KullaniciSil(int id)
    {
        using var conn = new MySqlConnection(connectionString);
        conn.Open();

        string query = "UPDATE kullanici SET silindi = 1 WHERE kullanici_id = @id";

        using var cmd = new MySqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);

        int affectedRows = cmd.ExecuteNonQuery();
        if (affectedRows > 0)
        {
            return Ok(new { message = "Kullanıcı soft-delete ile pasif hale getirildi." });
        }
        else
        {
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        }
    }
    [HttpPut("aktiflestir/{id}")]
    public IActionResult KullaniciAktiflestir(int id)
    {
        using var conn = new MySqlConnection(connectionString);
        try
        {
            conn.Open();
            string query = "UPDATE kullanici SET silindi = 0 WHERE kullanici_id = @id";

            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@id", id);

            int affected = cmd.ExecuteNonQuery();
            if (affected == 0)
                return NotFound(new { mesaj = "Kullanıcı bulunamadı veya zaten aktif." });

            return Ok(new { mesaj = "Kullanıcı başarıyla tekrar aktif hale getirildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { hata = ex.Message });
        }
    }
    [HttpGet("silinmisler")]
    public IActionResult SilinmisKullanicilariGetir()
    {
        var liste = new List<object>();
        using var conn = new MySqlConnection(connectionString);
        conn.Open();

        string query = "SELECT kullanici_id, kullanici_adi, kullanici_mail, rol FROM kullanici WHERE silindi = 1";
        using var cmd = new MySqlCommand(query, conn);
        using var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            var kullanici = new
            {
                id = reader.GetInt32("kullanici_id"),
                username = reader.GetString("kullanici_adi"),
                email = reader.GetString("kullanici_mail"),
                rol = reader.GetString("rol")
            };

            liste.Add(kullanici);
        }

        return Ok(liste);
    }
}
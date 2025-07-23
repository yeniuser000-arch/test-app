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

            string query = @"
                SELECT * FROM kullanici 
                WHERE kullanici_mail = @Email AND kullanici_password = @Password AND silindi = 0";

            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Email", kullanici.Email);
            cmd.Parameters.AddWithValue("@Password", kullanici.Password);

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                return Ok(new
                {
                    message = "Giriş başarılı",
                    username = reader["kullanici_adi"],
                    id = reader["kullanici_id"],
                    rol = reader["rol"]
                });
            }
            else
            {
                return Unauthorized(new { hata = "Kullanıcı bulunamadı veya şifre hatalı" });
            }
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
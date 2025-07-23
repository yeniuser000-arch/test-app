using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using server.Models;

[ApiController]
[Route("api/[controller]")]
public class AnketController : ControllerBase
{
    private readonly string _connectionString = "server=localhost;database=anketdb;user=root;password=;";


    [HttpPost("ekle")]
    public IActionResult Ekle([FromBody] AnketDto yeniAnket)
    {
        if (string.IsNullOrEmpty(yeniAnket.Soru) || yeniAnket.Secenekler == null || !yeniAnket.Secenekler.Any())
        {
            return BadRequest("Soru veya seçenekler boş olamaz.");
        }

        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        // ✅ Sifre dahil edildi
        var anketEkleQuery = "INSERT INTO anketler (soru, sifre) VALUES (@soru, @sifre)";
        using var anketCmd = new MySqlCommand(anketEkleQuery, conn);
        anketCmd.Parameters.AddWithValue("@soru", yeniAnket.Soru);
        anketCmd.Parameters.AddWithValue("@sifre", string.IsNullOrWhiteSpace(yeniAnket.Sifre)
         ? DBNull.Value : yeniAnket.Sifre);
         
        anketCmd.ExecuteNonQuery();

        int anketId = (int)anketCmd.LastInsertedId;

        
        foreach (var secenek in yeniAnket.Secenekler)
        {
            var secenekCmd = new MySqlCommand("INSERT INTO secenekler (anket_id, secenek_adi) VALUES (@anketId, @secenek)", conn);
            secenekCmd.Parameters.AddWithValue("@anketId", anketId);
            secenekCmd.Parameters.AddWithValue("@secenek", secenek.secenek_adi);
            secenekCmd.ExecuteNonQuery();
        }

        return Ok(new { anketId, mesaj = "Anket başarıyla eklendi." });
    }
    [HttpGet("listele")]
    public IActionResult Listele()
    {
        var anketler = new List<AnketDto>();
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        string query = @"
        SELECT 
        a.anket_id,
        a.soru,
        a.aktif,
        a.silinme_tarihi,
        a.silen_kullanici_id,
        a.pasif_aciklama,
        s.secenek_id,
        s.secenek_adi,
        s.oy_sayisi,
        k.kullanici_adi
        FROM anketler a
        LEFT JOIN 
        secenekler s ON a.anket_id = s.anket_id
        LEFT JOIN 
        kullanici k ON a.silen_kullanici_id = k.kullanici_id
        ORDER BY 
        a.anket_id, s.secenek_id;";

        using var cmd = new MySqlCommand(query, conn);
        using var reader = cmd.ExecuteReader();

        int currentAnketId = -1;
        AnketDto? anket = null;

        while (reader.Read())
        {
            int anketId = reader.GetInt32("anket_id");

            if (anketId != currentAnketId)
            {
                anket = new AnketDto
                {
                    AnketId = anketId,
                    Soru = reader.GetString("soru"),
                    Aktif = reader.GetBoolean("aktif"),
                    PasifTarihi = reader.IsDBNull(reader.GetOrdinal("silinme_tarihi"))
                                    ? null
                                    : reader.GetDateTime("silinme_tarihi"),
                    PasifeAlanKullaniciAdi = reader.IsDBNull(reader.GetOrdinal("kullanici_adi"))
                                                ? null
                                                : reader.GetString(reader.GetOrdinal("kullanici_adi")),
                    PasifAciklama = reader.IsDBNull(reader.GetOrdinal("pasif_aciklama")) ? null : reader.GetString(reader.GetOrdinal("pasif_aciklama")),
                    Secenekler = new List<SecenekDto>()
                };
                anketler.Add(anket);
                currentAnketId = anketId;
            }

            if (!reader.IsDBNull(reader.GetOrdinal("secenek_id")))
            {
                anket?.Secenekler.Add(new SecenekDto
                {
                    secenek_id = reader.GetInt32("secenek_id"),
                    secenek_adi = reader.GetString("secenek_adi"),
                    oy_sayisi = reader.IsDBNull(reader.GetOrdinal("oy_sayisi"))
                                ? 0
                                : reader.GetInt32("oy_sayisi")
                });
            }
        }

        return Ok(anketler);
    }[HttpGet("{id}")]
public IActionResult AnketDetay(int id, [FromQuery] int kullaniciId, [FromQuery] string? sifre)
{
    using var conn = new MySqlConnection(_connectionString);
    conn.Open();

    // 1. Kullanıcı oy vermiş mi, hangi seçeneğe, ne zaman?
    int? kullaniciSecimi = null;
    DateTime? oyTarihi = null;

    var kontrolCmd = new MySqlCommand(@"
        SELECT o.secenek_id, o.oy_tarihi
        FROM oylar o
        JOIN secenekler s ON o.secenek_id = s.secenek_id
        WHERE s.anket_id = @anketId AND o.kullanici_id = @kid
        LIMIT 1", conn);

    kontrolCmd.Parameters.AddWithValue("@anketId", id);
    kontrolCmd.Parameters.AddWithValue("@kid", kullaniciId);

    using var kontrolReader = kontrolCmd.ExecuteReader();
    if (kontrolReader.Read())
    {
        kullaniciSecimi = kontrolReader.GetInt32("secenek_id");
        oyTarihi = kontrolReader.GetDateTime("oy_tarihi");
    }
    kontrolReader.Close();

    // 2. Anket detayını ve şifresini al
    var cmd = new MySqlCommand("SELECT soru, sifre, aktif FROM anketler WHERE anket_id = @id", conn);
    cmd.Parameters.AddWithValue("@id", id);
    using var reader = cmd.ExecuteReader();

    if (!reader.Read()) return NotFound();

    string soru = reader.GetString("soru");
    string? dbSifre = reader["sifre"] as string;
    bool aktif = reader.GetBoolean("aktif");

    // 3. Şifre kontrolü
    if (!string.IsNullOrEmpty(dbSifre))
    {
        if (string.IsNullOrWhiteSpace(sifre) || dbSifre != sifre)
        {
            return Unauthorized(new { mesaj = "Bu ankete erişmek için doğru şifre girmeniz gereklidir." });
        }
    }

    reader.Close();

    // 4. Seçenekleri getir
    var secenekler = new List<object>();
    var secenekCmd = new MySqlCommand("SELECT * FROM secenekler WHERE anket_id = @id", conn);
    secenekCmd.Parameters.AddWithValue("@id", id);
    using var secenekReader = secenekCmd.ExecuteReader();

    while (secenekReader.Read())
    {
        secenekler.Add(new
        {
            secenek_id = secenekReader.GetInt32("secenek_id"),
            secenek_adi = secenekReader.GetString("secenek_adi"),
            oy_sayisi = secenekReader.GetInt32("oy_sayisi")
        });
    }

    return Ok(new
    {
        anketId = id,
        soru = soru,
        aktif = aktif,
        secenekler = secenekler,
        oyVerildi = kullaniciSecimi != null,
        kullaniciSecimi = kullaniciSecimi,
        oyTarihi = oyTarihi
    });
}

    [HttpPost("oyver")]
    public IActionResult OyVer([FromBody] OyDto oy)
    {
        Console.WriteLine($"SecenekId: {oy?.SecenekId}, KullaniciId: {oy?.KullaniciId}");

        if (oy == null)
            return BadRequest(new { mesaj = "Model boş geldi" });

        try
        {
            if (oy.SecenekId <= 0 || oy.KullaniciId <= 0)
                return BadRequest(new { mesaj = "Geçersiz seçenek veya kullanıcı." });

            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            // Kullanıcı gerçekten var mı?
            var kullaniciKontrolCmd = new MySqlCommand("SELECT COUNT(*) FROM kullanici WHERE kullanici_id = @kid", conn);
            kullaniciKontrolCmd.Parameters.AddWithValue("@kid", oy.KullaniciId);
            var kullaniciVarMi = Convert.ToInt32(kullaniciKontrolCmd.ExecuteScalar());

            if (kullaniciVarMi == 0)
                return BadRequest(new { mesaj = "Kullanıcı bulunamadı." });

            // Seçeneğin ait olduğu anket aktif mi?
            var aktiflikCmd = new MySqlCommand(@"
            SELECT a.aktif 
            FROM anketler a
            JOIN secenekler s ON s.anket_id = a.anket_id
            WHERE s.secenek_id = @sid", conn);

            aktiflikCmd.Parameters.AddWithValue("@sid", oy.SecenekId);
            var aktifMi = Convert.ToBoolean(aktiflikCmd.ExecuteScalar());

            if (!aktifMi)
                return BadRequest(new { mesaj = "Bu anket artık aktif değil, oy verilemez." });

            // Kullanıcı bu ankete daha önce oy vermiş mi?
            var kontrolCmd = new MySqlCommand(@"
            SELECT COUNT(*) 
            FROM oylar o
            JOIN secenekler s ON o.secenek_id = s.secenek_id
            WHERE s.anket_id = (
                SELECT anket_id FROM secenekler WHERE secenek_id = @sid
            ) AND o.kullanici_id = @kid", conn);

            kontrolCmd.Parameters.AddWithValue("@sid", oy.SecenekId);
            kontrolCmd.Parameters.AddWithValue("@kid", oy.KullaniciId);
            var varMi = Convert.ToInt32(kontrolCmd.ExecuteScalar());

            if (varMi > 0)
                return BadRequest(new { mesaj = "Bu ankete zaten oy verdiniz." });

            // Oy ekle
            var ekleCmd = new MySqlCommand("INSERT INTO oylar (secenek_id, kullanici_id, oy_tarihi) VALUES (@sid, @kid, NOW())", conn);
            ekleCmd.Parameters.AddWithValue("@sid", oy.SecenekId);
            ekleCmd.Parameters.AddWithValue("@kid", oy.KullaniciId);
            ekleCmd.ExecuteNonQuery();

            // Oy sayısını artır
            var guncelleCmd = new MySqlCommand("UPDATE secenekler SET oy_sayisi = oy_sayisi + 1 WHERE secenek_id = @sid", conn);
            guncelleCmd.Parameters.AddWithValue("@sid", oy.SecenekId);
            guncelleCmd.ExecuteNonQuery();

            return Ok(new { mesaj = "Oy başarıyla eklendi." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mesaj = "Sunucu hatası", hata = ex.Message });
        }
    }
    [HttpGet("populer-anketler")]
    public IActionResult PopulerAnketler()
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var anketler = new List<object>();

        string query = @"
        SELECT 
            a.anket_id AS AnketId,
            a.soru AS Soru,
            a.aktif AS Aktif,
            a.silinme_tarihi AS silinme_tarihi,
            k.adsoyad AS silen_kullanici_id,
            COUNT(o.oy_id) AS OySayisi
        FROM 
            anketler a
        JOIN 
            secenekler s ON s.anket_id = a.anket_id
        LEFT JOIN 
            oylar o ON o.secenek_id = s.secenek_id
        LEFT JOIN 
            kullanici k ON a.silen_kullanici_id = k.kullanici_id
        GROUP BY 
            a.anket_id, a.soru, a.aktif, a.silinme_tarihi, k.adsoyad
        ORDER BY 
            OySayisi DESC;
    ";

        using var cmd = new MySqlCommand(query, conn);
        using var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            anketler.Add(new
            {
                id = reader.GetInt32("AnketId"),
                soru = reader.GetString("Soru"),
                oySayisi = reader.GetInt32("OySayisi"),
                aktif = reader.GetBoolean("Aktif"),
                pasifTarihi = reader.IsDBNull(reader.GetOrdinal("PasifTarihi"))
                              ? "Bilinmiyor"
                              : reader.GetDateTime("silinme_tarihi").ToString("yyyy-MM-dd HH:mm"),
                pasifeAlan = reader.IsDBNull(reader.GetOrdinal("silen_kullanici_id"))
                              ? "Bilinmiyor"
                              : reader.GetString("silen_kullanici_id")
            });
        }

        return Ok(anketler);
    }
    [HttpPut("pasif-yap")]
    public IActionResult AnketPasifYap([FromBody] PasifYapDto data)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var cmd = new MySqlCommand(@"UPDATE anketler 
                                  SET aktif = 0, 
                                      silen_kullanici_id = @silenId, 
                                      silinme_tarihi = NOW(),
                                      pasif_aciklama = @aciklama
                                  WHERE anket_id = @id", conn);

        cmd.Parameters.AddWithValue("@id", data.AnketId);
        cmd.Parameters.AddWithValue("@silenId", data.KullaniciId);
        cmd.Parameters.AddWithValue("@aciklama", (object?)data.PasifAciklama ?? DBNull.Value);

        int result = cmd.ExecuteNonQuery();

        return result > 0
            ? Ok(new { mesaj = "Anket pasif yapıldı." })
            : BadRequest(new { mesaj = "Anket pasif hale getirilemedi." });
    }

}
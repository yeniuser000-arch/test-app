namespace server.Models
{
    public class SecenekDto
    {
        public int secenek_id { get; set; }
        public string? secenek_adi { get; set; }
        public int oy_sayisi { get; set; }
    }

    public class AnketDto
    {
        public int AnketId { get; set; }
        public string? Soru { get; set; }
        public bool Aktif { get; set; }
        public string? Sifre { get; set; }
        public DateTime? PasifTarihi { get; set; }
        public int KullaniciId { get; set; }
        public string? PasifeAlanKullaniciAdi { get; set; }
        public string? PasifAciklama { get; set; } 
        public List<SecenekDto> Secenekler { get; set; } = new();
    }

    public class PasifYapDto
    {
        public int AnketId { get; set; }
        public int KullaniciId { get; set; }
        public string? PasifAciklama { get; set; }
}

}
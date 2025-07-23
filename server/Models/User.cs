namespace server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        
        public string? Rol { get; set; }
    }
}
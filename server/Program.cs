using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Veritabanı bağlantısını test et
string connStr = "server=localhost;port=3306;database=anketdb;user=root;password=;";
using var conn = new MySqlConnection(connStr);
try
{
    conn.Open();
    Console.WriteLine("✅ MySQL bağlantısı başarılı!");
}
catch (Exception ex)
{
    Console.WriteLine("❌ Hata: " + ex.Message);
}

// CORS ayarları
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// JWT yapılandırması
var jwtSettings = builder.Configuration.GetSection("Jwt");
string? keyString = jwtSettings["Key"];
if (string.IsNullOrEmpty(keyString))
{
    throw new Exception("JWT key bulunamadı. Lütfen appsettings.json dosyasına 'Jwt:Key' ekleyin.");
}

var key = Encoding.UTF8.GetBytes(keyString);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting();
app.UseCors("AllowReactApp");

app.UseAuthentication(); // 🔐 Authentication middleware
app.UseAuthorization();

app.MapControllers();

app.Run();
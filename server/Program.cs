using MySql.Data.MySqlClient;

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.AddControllers();

var app = builder.Build();
app.UseRouting();
app.UseCors("AllowReactApp");


app.UseAuthorization();

app.MapControllers();

app.Run();
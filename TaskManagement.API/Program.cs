using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=tasks.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// Ensure DB is created and apply any additive schema changes
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    // Add AssignedTo column if it doesn't exist yet (SQLite has no IF NOT EXISTS for ALTER TABLE)
    try { db.Database.ExecuteSqlRaw("ALTER TABLE Tasks ADD COLUMN AssignedTo TEXT"); } catch { /* already exists */ }
    try { db.Database.ExecuteSqlRaw("ALTER TABLE Tasks ADD COLUMN Tags TEXT"); } catch { /* already exists */ }
}

app.UseCors("AllowAngular");
// UseHttpsRedirection omitted: API runs HTTP-only in development
app.MapControllers();
app.Run();

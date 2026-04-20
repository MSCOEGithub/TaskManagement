using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using System.Reflection;
using TaskManagement.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "TaskFlow API",
        Version     = "v1",
        Description = "REST API for the TaskFlow task management application.",
        Contact     = new OpenApiContact { Name = "TaskFlow", Url = new Uri("https://github.com/MSCOEGithub/TaskManagement") }
    });

    // Include XML comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

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

// Swagger UI — available at /swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskFlow API v1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "TaskFlow API";
});

// UseHttpsRedirection omitted: API runs HTTP-only in development
app.MapControllers();
app.Run();

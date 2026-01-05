using Microsoft.EntityFrameworkCore;
using SellerHub.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext (C?C QUAN TR?NG)
builder.Services.AddDbContext<SellerHubDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
});

// CORS (n?u FE g?i qua port khác)
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("fe", p => p
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .SetIsOriginAllowed(origin =>
            !string.IsNullOrWhiteSpace(origin) &&
            (origin.StartsWith("http://localhost:") || origin.StartsWith("http://127.0.0.1:"))
        ));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("fe");
app.MapControllers();

app.Run();

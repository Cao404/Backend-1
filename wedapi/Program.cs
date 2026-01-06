using Microsoft.Extensions.DependencyInjection;
using SellerHub.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//  đăng ký factory tạo SqlConnection (ADO.NET)
builder.Services.AddSingleton<ISqlConnectionFactory>(sp =>
{
    var cfg = sp.GetRequiredService<IConfiguration>();
    return new SqlConnectionFactory(cfg.GetConnectionString("Default")!);
});

//  Repo/service
builder.Services.AddScoped<SellerApplicationRepository>();

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

var cs = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrWhiteSpace(cs))
    throw new Exception("Missing ConnectionStrings:Default in appsettings(.Development).json");

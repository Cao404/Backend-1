using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SellerHub.Api.Data;

public class SellerHubDbContextFactory : IDesignTimeDbContextFactory<SellerHubDbContext>
{
    public SellerHubDbContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .Build();

        var conn = config.GetConnectionString("Default");

        var options = new DbContextOptionsBuilder<SellerHubDbContext>()
            .UseSqlServer(conn)
            .Options;

        return new SellerHubDbContext(options);
    }
}

using Microsoft.Data.SqlClient;
using SellerHub.Api.Models;

namespace SellerHub.Api.Repositories;

public class SellerApplicationsRepository
{
    private readonly string _cs;

    public SellerApplicationsRepository(IConfiguration config)
    {
        _cs = config.GetConnectionString("Default")
              ?? throw new InvalidOperationException("Missing ConnectionStrings:Default");
    }
}
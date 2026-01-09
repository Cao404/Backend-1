using Microsoft.Data.SqlClient;
using SellerHub.Api.model;

namespace SellerHub.Api.Repositories;

public class UsersRepository
{
    private readonly string _cs;

    public UsersRepository(IConfiguration config)
    {
        _cs = config.GetConnectionString("Default")
              ?? throw new InvalidOperationException("Missing ConnectionStrings:Default");
    }
}
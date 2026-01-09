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
    public async Task<List<User>> GetAllAsync()
    {
        var list = new List<User>();
        const string sql = @"SELECT Id, FullName, Email, Phone, Role, Status, PasswordHash, CreatedAt
                             FROM Users
                             ORDER BY Id DESC";

        await using var conn = new SqlConnection(_cs);
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        await using var rd = await cmd.ExecuteReaderAsync();

        while (await rd.ReadAsync())
            }
}
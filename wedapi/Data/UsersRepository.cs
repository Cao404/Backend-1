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
        {
            list.Add(new User
            {
                Id = rd.GetInt32(0),
                FullName = rd.IsDBNull(1) ? null : rd.GetString(1),
                Email = rd.IsDBNull(2) ? null : rd.GetString(2),
                Phone = rd.IsDBNull(3) ? null : rd.GetString(3),
                Role = rd.IsDBNull(4) ? null : rd.GetString(4),
                Status = rd.IsDBNull(5) ? null : rd.GetString(5),
                PasswordHash = rd.IsDBNull(6) ? null : rd.GetString(6),
                CreatedAt = rd.GetDateTime(7)
            });
        }

        return list;
    }
    public async Task<User?> GetByIdAsync(int id)
    {
        const string sql = @"SELECT TOP 1 Id, FullName, Email, Phone, Role, Status, PasswordHash, CreatedAt
                             FROM Users WHERE Id=@Id";

        await using var conn = new SqlConnection(_cs);
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);

        await using var rd = await cmd.ExecuteReaderAsync();
        if (!await rd.ReadAsync()) return null;

        return new User
        {
            Id = rd.GetInt32(0),
            FullName = rd.IsDBNull(1) ? null : rd.GetString(1),
            Email = rd.IsDBNull(2) ? null : rd.GetString(2),
            Phone = rd.IsDBNull(3) ? null : rd.GetString(3),
            Role = rd.IsDBNull(4) ? null : rd.GetString(4),
            Status = rd.IsDBNull(5) ? null : rd.GetString(5),
            PasswordHash = rd.IsDBNull(6) ? null : rd.GetString(6),
            CreatedAt = rd.GetDateTime(7)
        };
    }
    public async Task<bool> SetStatusAsync(int id, string status)
    {
        const string sql = @"UPDATE Users SET Status=@Status WHERE Id=@Id";

        await using var conn = new SqlConnection(_cs);
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Status", status);
        cmd.Parameters.AddWithValue("@Id", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}

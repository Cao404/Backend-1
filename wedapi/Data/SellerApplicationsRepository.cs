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
    public async Task<List<object>> GetListAsync(string? status = "all", string? q = null)
    {
        var list = new List<object>();

        // build SQL 
        var where = new List<string>();
        if (!string.IsNullOrWhiteSpace(status) && status != "all")
            where.Add("sa.Status = @Status");

        if (!string.IsNullOrWhiteSpace(q))
            where.Add("(u.FullName LIKE @Q OR u.Email LIKE @Q OR u.Phone LIKE @Q)");

        var whereSql = where.Count > 0 ? "WHERE " + string.Join(" AND ", where) : "";

        var sql = $@"
SELECT sa.Id, sa.UserId, sa.Kyc, sa.Status, sa.CreatedAt,
       u.FullName, u.Email, u.Phone, u.Role
FROM SellerApplications sa
JOIN Users u ON u.Id = sa.UserId
{whereSql}
ORDER BY sa.CreatedAt DESC";

        await using var conn = new SqlConnection(_cs);
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
            cmd.Parameters.AddWithValue("@Status", status.Trim());

        if (!string.IsNullOrWhiteSpace(q))
            cmd.Parameters.AddWithValue("@Q", "%" + q.Trim() + "%");

        await using var rd = await cmd.ExecuteReaderAsync();
        while (await rd.ReadAsync())
        {
            list.Add(new
            {
                id = rd.GetInt32(0),
                userId = rd.GetInt32(1),
                kyc = rd.IsDBNull(2) ? null : rd.GetString(2),
                status = rd.GetString(3),
                createdAt = rd.GetDateTime(4),
                fullName = rd.IsDBNull(5) ? null : rd.GetString(5),
                email = rd.IsDBNull(6) ? null : rd.GetString(6),
                phone = rd.IsDBNull(7) ? null : rd.GetString(7),
                role = rd.IsDBNull(8) ? null : rd.GetString(8),
            });
        }

        return list.Cast<object>().ToList();
    }
    public async Task<object?> GetByUserIdAsync(int userId)
    {
        var sql = @"
SELECT TOP 1 sa.Id, sa.UserId, sa.Kyc, sa.Status, sa.CreatedAt,
       u.FullName, u.Email, u.Phone, u.Role
FROM SellerApplications sa
JOIN Users u ON u.Id = sa.UserId
WHERE sa.UserId = @UserId
ORDER BY sa.CreatedAt DESC";

        await using var conn = new SqlConnection(_cs);
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);

        await using var rd = await cmd.ExecuteReaderAsync();
        if (!await rd.ReadAsync()) return null;

        return new
        {
            id = rd.GetInt32(0),
            userId = rd.GetInt32(1),
            kyc = rd.IsDBNull(2) ? null : rd.GetString(2),
            status = rd.GetString(3),
            createdAt = rd.GetDateTime(4),
            fullName = rd.IsDBNull(5) ? null : rd.GetString(5),
            email = rd.IsDBNull(6) ? null : rd.GetString(6),
            phone = rd.IsDBNull(7) ? null : rd.GetString(7),
            role = rd.IsDBNull(8) ? null : rd.GetString(8),
        };
    }
}
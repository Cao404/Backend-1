using Microsoft.Data.SqlClient;
using SellerHub.Api.Models;

public class SellerApplicationRepository
{
    private readonly ISqlConnectionFactory _factory;

    public SellerApplicationRepository(ISqlConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<List<object>> GetListAsync(string? status, string? q)
    {
        using var conn = _factory.Create();
        await conn.OpenAsync();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
SELECT sa.Id, sa.UserId, u.FullName, u.Email, u.Phone, sa.Status, sa.CreatedAt, sa.Kyc
FROM SellerApplications sa
JOIN Users u ON u.Id = sa.UserId
WHERE (@status IS NULL OR @status = 'all' OR LOWER(sa.Status) = LOWER(@status))
  AND (@q IS NULL OR u.Email LIKE '%' + @q + '%'
              OR u.FullName LIKE '%' + @q + '%'
              OR ISNULL(u.Phone,'') LIKE '%' + @q + '%')
ORDER BY sa.CreatedAt DESC";

        cmd.Parameters.AddWithValue("@status", (object?)status ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@q", (object?)q ?? DBNull.Value);

        using var rd = await cmd.ExecuteReaderAsync();
        var list = new List<object>();
        while (await rd.ReadAsync())
        {
            list.Add(new
            {
                Id = rd.GetInt32(0),
                UserId = rd.GetInt32(1),
                FullName = rd.GetString(2),
                Email = rd.GetString(3),
                Phone = rd.IsDBNull(4) ? null : rd.GetString(4),
                Status = rd.GetString(5),
                CreatedAt = rd.GetDateTime(6),
                Kyc = rd.IsDBNull(7) ? null : rd.GetString(7),
            });
        }
        return list;
    }

    internal async Task<IEnumerable<object>> GetListAsync(SellerAppStatus? st, string? q)
    {
        throw new NotImplementedException();
    }
}

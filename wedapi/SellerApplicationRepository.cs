using Microsoft.Data.SqlClient;

public class SellerApplicationRepository
{
    private readonly SqlConnection _conn;
    public SellerApplicationRepository(SqlConnection conn) => _conn = conn;

    public async Task<List<object>> GetListAsync(int? status, string? q)
    {
        var sql = @"
SELECT sa.Id, sa.UserId, u.FullName, u.Email, u.Phone, u.Role, sa.Kyc, sa.Status, sa.CreatedAt
FROM SellerApplications sa
JOIN Users u ON u.Id = sa.UserId
WHERE (@status IS NULL OR sa.Status = @status)
  AND (@q IS NULL OR u.FullName LIKE '%' + @q + '%'
               OR u.Email    LIKE '%' + @q + '%'
               OR u.Phone    LIKE '%' + @q + '%')
ORDER BY sa.CreatedAt DESC;
";

        await _conn.OpenAsync();
        using var cmd = new SqlCommand(sql, _conn);
        cmd.Parameters.AddWithValue("@status", (object?)status ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@q", (object?)q ?? DBNull.Value);

        using var rd = await cmd.ExecuteReaderAsync();
        var list = new List<object>();
        while (await rd.ReadAsync())
        {
            list.Add(new
            {
                id = rd.GetInt32(0),
                userId = rd.GetInt32(1),
                fullName = rd.GetString(2),
                email = rd.GetString(3),
                phone = rd.IsDBNull(4) ? null : rd.GetString(4),
                role = rd.GetString(5),
                kyc = rd.IsDBNull(6) ? null : rd.GetString(6),
                status = rd.GetInt32(7),
                createdAt = rd.GetDateTime(8),
            });
        }
        await _conn.CloseAsync();
        return list;
    }
}

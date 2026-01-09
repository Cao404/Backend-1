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
    public async Task<(bool ok, int appId, string message)> CreateForExistingUserAsync(int userId, string? kyc)
    {
        // chặn đăng ký trùng 
        var checkSql = @"SELECT TOP 1 Id FROM SellerApplications WHERE UserId=@UserId ORDER BY CreatedAt DESC";

        await using var conn = new SqlConnection(_cs);
        await conn.OpenAsync();

        await using (var check = new SqlCommand(checkSql, conn))
        {
            check.Parameters.AddWithValue("@UserId", userId);
            var existed = await check.ExecuteScalarAsync();
            if (existed != null)
                return (false, 0, "User này đã có đơn đăng ký người bán rồi.");
        }

        var insertSql = @"
INSERT INTO SellerApplications(UserId, Kyc, Status, CreatedAt)
OUTPUT INSERTED.Id
VALUES(@UserId, @Kyc, @Status, @CreatedAt)";

        await using var cmd = new SqlCommand(insertSql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);
        cmd.Parameters.AddWithValue("@Kyc", (object?)kyc ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Status", SellerAppStatus.Submitted.ToString());
        cmd.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

        var newId = (int)(await cmd.ExecuteScalarAsync() ?? 0);
        return (true, newId, "Đăng ký người bán thành công, vui lòng chờ admin duyệt.");
    }
    public async Task<(bool ok, string message)> UpdateStatusAsync(
        int appId,
        SellerAppStatus status,
        string? rejectReason = null,
        bool setUserRoleSeller = false)
    {
        await using var conn = new SqlConnection(_cs);
        await conn.OpenAsync();

        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            // lấy UserId từ Application
            int? userId = null;
            await using (var get = new SqlCommand("SELECT UserId FROM SellerApplications WHERE Id=@Id", conn, (SqlTransaction)tx))
            {
                get.Parameters.AddWithValue("@Id", appId);
                var obj = await get.ExecuteScalarAsync();
                if (obj == null)
                {
                    await tx.RollbackAsync();
                    return (false, "Không tìm thấy đơn đăng ký người bán.");
                }
                userId = Convert.ToInt32(obj);
            }

        }
    }
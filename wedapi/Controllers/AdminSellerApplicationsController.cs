using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SellerHub.Api.Data;
using SellerHub.Api.Dto;
using SellerHub.Api.Models;

namespace SellerHub.Api.Controllers;

[ApiController]
[Route("api/admin/seller-applications")]
public class AdminSellerApplicationsController : ControllerBase
{
    private readonly ISqlConnectionFactory _factory;
    public AdminSellerApplicationsController(ISqlConnectionFactory factory) => _factory = factory;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? status = "all", [FromQuery] string? q = null)
    {
        SellerAppStatus? st = null;
        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            if (!Enum.TryParse<SellerAppStatus>(status.Trim(), true, out var parsed))
                return BadRequest($"status không hợp lệ: {status}");
            st = parsed;
        }

        q = string.IsNullOrWhiteSpace(q) ? null : q.Trim();

        var sql = @"
SELECT sa.Id, sa.UserId, u.FullName, u.Email, u.Phone, u.Role, sa.Kyc, sa.Status, sa.CreatedAt
FROM SellerApplications sa
JOIN Users u ON u.Id = sa.UserId
WHERE (@status IS NULL OR sa.Status = @status)
  AND (@q IS NULL OR u.Email LIKE '%' + @q + '%' OR u.FullName LIKE '%' + @q + '%' OR ISNULL(u.Phone,'') LIKE '%' + @q + '%')
ORDER BY sa.CreatedAt DESC;";

        var list = new List<SellerAppAdminDto>();

        await using var conn = _factory.Create();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("@status", (object?)st is null ? DBNull.Value : (int)st.Value);
        cmd.Parameters.AddWithValue("@q", (object?)q ?? DBNull.Value);

        await using var rd = await cmd.ExecuteReaderAsync();
        while (await rd.ReadAsync())
        {
            list.Add(new SellerAppAdminDto
            {
                Id = rd.GetInt32(0),
                UserId = rd.GetInt32(1),
                FullName = rd.IsDBNull(2) ? null : rd.GetString(2),
                Email = rd.IsDBNull(3) ? null : rd.GetString(3),
                Phone = rd.IsDBNull(4) ? null : rd.GetString(4),
                Role = rd.IsDBNull(5) ? null : rd.GetString(5),
                Kyc = rd.IsDBNull(6) ? null : rd.GetString(6),
                Status = (SellerAppStatus)rd.GetInt32(7),
                CreatedAt = rd.GetDateTime(8),
            });
        }

        return Ok(list);
    }

    [HttpPatch("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
        => await UpdateStatusAndMaybeRole(id, SellerAppStatus.Approved, setSellerRole: true, rejectReason: null);

    public record RejectBody(string? reason);

    [HttpPatch("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectBody body)
        => await UpdateStatusAndMaybeRole(id, SellerAppStatus.Rejected, setSellerRole: false, rejectReason: body.reason);

    [HttpPatch("{id:int}/suspend")]
    public async Task<IActionResult> Suspend(int id)
        => await UpdateStatusAndMaybeRole(id, SellerAppStatus.Suspended, setSellerRole: false, rejectReason: null);

    [HttpPatch("{id:int}/lock")]
    public async Task<IActionResult> Lock(int id)
        => await UpdateStatusAndMaybeRole(id, SellerAppStatus.Locked, setSellerRole: false, rejectReason: null);

    private async Task<IActionResult> UpdateStatusAndMaybeRole(int appId, SellerAppStatus newStatus, bool setSellerRole, string? rejectReason)
    {
        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            // Lấy UserId của application
            int? userId = null;
            await using (var getCmd = new SqlCommand("SELECT UserId FROM SellerApplications WHERE Id=@id", conn, (SqlTransaction)tx))
            {
                getCmd.Parameters.AddWithValue("@id", appId);
                var obj = await getCmd.ExecuteScalarAsync();
                if (obj == null) return NotFound();
                userId = Convert.ToInt32(obj);
            }

            // Update SellerApplications
            await using (var upCmd = new SqlCommand(@"
UPDATE SellerApplications
SET Status=@st, UpdatedAt=@now, RejectReason=@reason
WHERE Id=@id;", conn, (SqlTransaction)tx))
            {
                upCmd.Parameters.AddWithValue("@st", (int)newStatus);
                upCmd.Parameters.AddWithValue("@now", DateTime.UtcNow);
                upCmd.Parameters.AddWithValue("@reason", (object?)rejectReason ?? DBNull.Value);
                upCmd.Parameters.AddWithValue("@id", appId);

                await upCmd.ExecuteNonQueryAsync();
            }

            // Nếu approve thì set role user = seller
            if (setSellerRole && userId.HasValue)
            {
                await using var roleCmd = new SqlCommand("UPDATE Users SET Role='seller' WHERE Id=@uid", conn, (SqlTransaction)tx);
                roleCmd.Parameters.AddWithValue("@uid", userId.Value);
                await roleCmd.ExecuteNonQueryAsync();
            }

            await tx.CommitAsync();
            return Ok();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}

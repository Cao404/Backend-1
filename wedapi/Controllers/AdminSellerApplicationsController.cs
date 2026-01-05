using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellerHub.Api.Data;
using SellerHub.Api.Models;

namespace SellerHub.Api.Controllers;

[ApiController]
[Route("api/admin/seller-applications")]
public class AdminSellerApplicationsController : ControllerBase
{
    private readonly SellerHubDbContext _db;
    public AdminSellerApplicationsController(SellerHubDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? status = "all", [FromQuery] string? q = null)
    {
        var query = _db.SellerApplications
            .Include(x => x.User)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            if (Enum.TryParse<SellerAppStatus>(status.Trim(), true, out var st))
                query = query.Where(x => x.Status == st);
            else
                return BadRequest($"status không hợp lệ: {status}");
        }


        if (!string.IsNullOrWhiteSpace(q))
        {
            q = q.Trim();
            query = query.Where(x =>
                (x.User != null && (
                    (x.User.FullName ?? "").Contains(q) ||
                    (x.User.Email ?? "").Contains(q) ||
                    (x.User.Phone ?? "").Contains(q)
                ))
            );
        }

        var data = await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.UserId,
                fullName = x.User!.FullName,
                email = x.User!.Email,
                phone = x.User!.Phone,
                role = x.User!.Role,
                kyc = x.Kyc,
                status = x.Status.ToString(),
                createdAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpPatch("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var app = await _db.SellerApplications.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
        if (app == null) return NotFound();

        app.Status = SellerAppStatus.Approved;
        app.UpdatedAt = DateTime.UtcNow;

        // (tuỳ bạn) duyệt xong thì set user role = seller
        if (app.User != null) app.User.Role = "seller";

        await _db.SaveChangesAsync();
        return Ok();
    }

    public record RejectBody(string? reason);

    [HttpPatch("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectBody body)
    {
        var app = await _db.SellerApplications.FirstOrDefaultAsync(x => x.Id == id);
        if (app == null) return NotFound();

        app.Status = SellerAppStatus.Rejected;
        app.RejectReason = body.reason;
        app.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPatch("{id:int}/suspend")]
    public async Task<IActionResult> Suspend(int id)
    {
        var app = await _db.SellerApplications.FirstOrDefaultAsync(x => x.Id == id);
        if (app == null) return NotFound();

        app.Status = SellerAppStatus.Suspended;
        app.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPatch("{id:int}/lock")]
    public async Task<IActionResult> Lock(int id)
    {
        var app = await _db.SellerApplications.FirstOrDefaultAsync(x => x.Id == id);
        if (app == null) return NotFound();

        app.Status = SellerAppStatus.Locked;
        app.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok();
    }
}

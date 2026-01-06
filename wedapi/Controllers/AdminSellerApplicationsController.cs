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
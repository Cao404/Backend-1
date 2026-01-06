using Microsoft.AspNetCore.Mvc;
using SellerHub.Api.Data;
using SellerHub.Api.Dto;
using SellerHub.Api.Models;

[ApiController]
public class SellerApplicationsController : ControllerBase
{
    private readonly SellerHubDbContext _db;
    public SellerApplicationsController(SellerHubDbContext db) => _db = db;

    [HttpPost("/api/seller-applications")]
    public async Task<IActionResult> Create([FromBody] CreateSellerApplicationDto dto)
    {
        // 1) tạo user
        var user = new SellerHub.Api.model.User
        {
            Email = dto.Email,
            Phone = dto.Phone,
            FullName = dto.FullName ?? dto.Email,
            Role = "seller",
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            PasswordHash = dto.Password
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // 2) tạo application
        var app = new SellerApplication
        {
            UserId = user.Id,
            Status = SellerAppStatus.Submitted,
            CreatedAt = DateTime.UtcNow,
            Kyc = null
        };

        _db.SellerApplications.Add(app);
        await _db.SaveChangesAsync();

        var res = new SellerAppAdminDto
        {
            Id = app.Id,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Kyc = app.Kyc,
            Status = app.Status,
            CreatedAt = app.CreatedAt
        };

        return Ok(res);
    }
}
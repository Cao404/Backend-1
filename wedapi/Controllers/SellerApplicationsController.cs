using Microsoft.AspNetCore.Mvc;
using SellerHub.Api.Data;
using SellerHub.Api.Dto;
using SellerHub.Api.model;
using SellerHub.Api.Models;

[ApiController]
public class SellerApplicationsController : ControllerBase
{
    private readonly SellerHubDbContext _db;
    public SellerApplicationsController(SellerHubDbContext db) => _db = db;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSellerApplicationDto dto)
    {
        if (dto == null)
            return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ" });

        if (string.IsNullOrWhiteSpace(dto.Email) && string.IsNullOrWhiteSpace(dto.Phone))
            return BadRequest(new { success = false, message = "Email hoặc SĐT là bắt buộc" });

        // 1) check trùng email/phone
        var existsUser = await _db.Users.AsNoTracking()
            .FirstOrDefaultAsync(u =>
                (!string.IsNullOrWhiteSpace(dto.Email) && u.Email == dto.Email) ||
                (!string.IsNullOrWhiteSpace(dto.Phone) && u.Phone == dto.Phone)
            );

        if (existsUser != null)
        {
            // nếu user đã có seller application thì báo đã đăng ký
            var hasApp = await _db.SellerApplications.AsNoTracking()
                .AnyAsync(a => a.UserId == existsUser.Id);

            if (hasApp)
                return Conflict(new { success = false, message = "Bạn đã đăng ký người bán rồi. Vui lòng chờ admin duyệt." });

            // nếu user tồn tại nhưng chưa có app -> tạo app luôn (không tạo user mới)
            var app2 = new SellerApplication
            {
                UserId = existsUser.Id,
                Status = SellerAppStatus.Submitted,
                CreatedAt = DateTime.UtcNow,
                Kyc = null
            };

            _db.SellerApplications.Add(app2);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Đăng ký thành công. Vui lòng chờ admin duyệt.",
                data = new
                {
                    id = app2.Id,
                    userId = existsUser.Id,
                    fullName = existsUser.FullName,
                    email = existsUser.Email,
                    phone = existsUser.Phone,
                    kyc = app2.Kyc,
                    status = app2.Status.ToString(),
                    createdAt = app2.CreatedAt
                }
            });
        }

        // 2) tạo user 
        var user = new User
        {
            Email = dto.Email,
            Phone = dto.Phone,
            FullName = string.IsNullOrWhiteSpace(dto.FullName) ? (dto.Email ?? dto.Phone) : dto.FullName,
            Role = "user",
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            PasswordHash = dto.Password
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // 3) tạo application
        var app = new SellerApplication
        {
            UserId = user.Id,
            Status = SellerAppStatus.Submitted,
            CreatedAt = DateTime.UtcNow,
            Kyc = null
        };

        _db.SellerApplications.Add(app);
        await _db.SaveChangesAsync();
    }
}

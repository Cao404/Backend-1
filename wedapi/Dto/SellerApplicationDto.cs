using SellerHub.Api.Models;

namespace SellerHub.Api.Dto;

public class SellerAppAdminDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Role { get; set; }
    public string? Kyc { get; set; }
    public SellerAppStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

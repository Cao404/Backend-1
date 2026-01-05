using SellerHub.Api.model;

namespace SellerHub.Api.Models;

public class SellerApplication
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public string? Kyc { get; set; }
    public SellerAppStatus Status { get; set; } = SellerAppStatus.Pending;

    public string? RejectReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

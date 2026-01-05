namespace SellerHub.Api.Dto;

public class CreateSellerApplicationDto
{
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string Password { get; set; } = "";
    public string? FullName { get; set; }
}

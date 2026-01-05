
namespace SellerHub.Api.Dto
{
    public class UpdateUserDto
    {
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public string Role { get; set; } = "Customer";
        public string Status { get; set; } = "Active";

        // mật khẩu mới (nếu muốn đổi)
        public string? Password { get; set; }

        public string? GetPassword() => Password;

    }
}


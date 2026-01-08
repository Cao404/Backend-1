using SellerHub.Api.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace SellerHub.Api.model
{
    public enum UserRole { Admin, Seller, Customer }
    public enum AccountStatus { Active, Locked }
    public class User
    {
        internal string? Password;

        public int Id { get; set; }

        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Phone { get; set; }

        public string PasswordHash { get; set; } = "";

        // "Admin" | "Seller" | "Customer"
        public string Role { get; set; } = "Customer";

        // "Active" | "Locked"
        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 1 user có thể có 0/1 hồ sơ đăng ký người bán
        public SellerApplication? SellerApplication { get; set; }

        private string? password;

        public string? GetPassword()
        {
            return password;
        }

        public void SetPassword(string? value)
        {
            password = value;
        }
    }
}

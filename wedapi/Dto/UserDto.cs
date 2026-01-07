public class UserDto
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public required string Role { get; set; }
    public required string Status { get; set; }
}

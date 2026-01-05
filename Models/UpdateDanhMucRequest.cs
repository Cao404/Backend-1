namespace SellerHub.Api.Models.Requests;

public sealed class UpdateDanhMucRequest
{
    public string? MaDanhMucCode { get; set; }
    public string TenDanhMuc { get; set; } = string.Empty;
    public int? MaDanhMucCha { get; set; }
    public bool? TrangThai { get; set; } // optional (nếu muốn bật/tắt)
}

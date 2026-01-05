namespace SellerHub.Api.Models.Responses;

public sealed class DanhMucListItem
{
    public int MaDanhMuc { get; set; }
    public string TenDanhMuc { get; set; } = "";
    public string? MaDanhMucCode { get; set; }
    public int SanPham { get; set; }
    public string DanhMucCha { get; set; } = "—";
    public string TrangThai { get; set; } = "Đang bán";
}

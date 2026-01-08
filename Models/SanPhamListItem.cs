namespace SellerHub.Api.Models.Responses;

public sealed class SanPhamListItem
{
    public int MaSanPham { get; set; }
    public string SKU { get; set; } = "";
    public string TenSanPham { get; set; } = "";
    public int MaDanhMuc { get; set; }
    public string TenDanhMuc { get; set; } = "—";
  
}

namespace SellerHub.Api.Models.Requests;

public sealed class CreateSanPhamRequest
{
    public string SKU { get; set; } = "";
    public string TenSanPham { get; set; } = "";
    public int MaDanhMuc { get; set; }
    public decimal GiaBan { get; set; }
    public int Kho { get; set; }
  
}

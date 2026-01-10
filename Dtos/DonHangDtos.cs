namespace SellerHub.Api.Dtos;

// ===== KHÁCH HÀNG =====
public class KhachHangDonHangDto
{
    public string HoTen { get; set; } = "";
    public string SoDienThoai { get; set; } = "";
    public string? Email { get; set; }
    public string? Avatar { get; set; } // optional
}

// ===== THANH TOÁN =====
public class ThanhToanDonHangDto
{
    public string PhuongThuc { get; set; } = "COD";
    public bool DaThanhToan { get; set; } = false;
}

// ===== SẢN PHẨM TRONG ĐƠN =====
public class SanPhamDonHangDto
{
    public int? MaSanPham { get; set; }
    public string? Emoji { get; set; }  // optional
    public string Ten { get; set; } = "";
    public int SoLuong { get; set; } = 1;
    public decimal DonGia { get; set; } = 0;
}

// ===== REQUEST TẠO ĐƠN =====
public class DonHangCreateReq
{
    public string MaDon { get; set; } = "";                 // "#DH-12345"
    public int? MaKhachHang { get; set; }                   // optional
    public KhachHangDonHangDto KhachHang { get; set; } = new();
    public List<SanPhamDonHangDto> SanPham { get; set; } = new();
    public ThanhToanDonHangDto ThanhToan { get; set; } = new();
    public string TrangThai { get; set; } = "pending";
    public string? DiaChiGiaoHang { get; set; }
    public string? GhiChu { get; set; }
    public DateTime? ThoiGianTao { get; set; }              // optional
}

// ===== REQUEST CẬP NHẬT =====
public class DonHangUpdateReq
{
    public int? MaKhachHang { get; set; }                   // optional
    public KhachHangDonHangDto KhachHang { get; set; } = new();
    public List<SanPhamDonHangDto> SanPham { get; set; } = new();
    public ThanhToanDonHangDto ThanhToan { get; set; } = new();
    public string? DiaChiGiaoHang { get; set; }
    public string? GhiChu { get; set; }
}

// ===== LIST DTO =====
public class DonHangListDto
{
    public int MaDonHang { get; set; }
    public string MaDon { get; set; } = "";
    public KhachHangDonHangDto KhachHang { get; set; } = new();
    public decimal TongTien { get; set; }
    public ThanhToanDonHangDto ThanhToan { get; set; } = new();
    public string TrangThai { get; set; } = "pending";
    public DateTime ThoiGianTao { get; set; }
}

// ===== DETAIL DTO =====
public class DonHangDetailDto : DonHangListDto
{
    public string? DiaChiGiaoHang { get; set; }
    public string? GhiChu { get; set; }
    public List<SanPhamDonHangDto> SanPham { get; set; } = new();
}

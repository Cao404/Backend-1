namespace wedduyhuy.DTOs
{
    public class DonHangDto
    {
        public int DonHangID { get; set; }
        public string MaDonHang { get; set; } = string.Empty;
        public int KhachHangID { get; set; }
        public string TenKhachHang { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public byte TrangThai { get; set; }
        public string TenTrangThai { get; set; } = string.Empty;
        public string DiaChiGiao { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
        public decimal TongTien { get; set; }
        public decimal PhiShip { get; set; }
        public decimal TongThanhToan => TongTien + PhiShip;
        public DateTime NgayTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public List<DonHangItemDto> Items { get; set; } = new();
    }

    public class DonHangItemDto
    {
        public int DonHangItemID { get; set; }
        public int SanPhamID { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string TenSanPham { get; set; } = string.Empty;
        public decimal DonGia { get; set; }
        public int SoLuong { get; set; }
        public decimal ThanhTien { get; set; }
    }

    public class CreateDonHangDto
    {
        public int KhachHangID { get; set; }
        public string DiaChiGiao { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
        public decimal PhiShip { get; set; }
        public List<CreateDonHangItemDto> Items { get; set; } = new();
    }

    public class CreateDonHangItemDto
    {
        public int SanPhamID { get; set; }
        public int SoLuong { get; set; }
    }

    public class UpdateTrangThaiDonHangDto
    {
        public byte TrangThai { get; set; }
        public string? GhiChu { get; set; }
    }
}
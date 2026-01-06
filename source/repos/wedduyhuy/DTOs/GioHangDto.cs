namespace wedduyhuy.DTOs
{
    public class GioHangDto
    {
        public int GioHangID { get; set; }
        public int KhachHangID { get; set; }
        public string TenKhachHang { get; set; } = string.Empty;
        public bool TrangThai { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public List<GioHangItemDto> Items { get; set; } = new();
        public decimal TongTien => Items.Sum(x => x.ThanhTien);
        public int TongSoLuong => Items.Sum(x => x.SoLuong);
    }

    public class GioHangItemDto
    {
        public int GioHangItemID { get; set; }
        public int SanPhamID { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string TenSanPham { get; set; } = string.Empty;
        public int SoLuong { get; set; }
        public decimal DonGia { get; set; }
        public decimal ThanhTien => SoLuong * DonGia;
        public DateTime NgayTao { get; set; }
    }

    public class AddToCartDto
    {
        public int KhachHangID { get; set; }
        public int SanPhamID { get; set; }
        public int SoLuong { get; set; }
    }

    public class UpdateCartItemDto
    {
        public int SoLuong { get; set; }
    }
}
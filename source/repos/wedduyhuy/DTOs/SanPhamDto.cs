namespace wedduyhuy.DTOs
{
    public class SanPhamDto
    {
        public int SanPhamID { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string TenSanPham { get; set; } = string.Empty;
        public int DanhMucID { get; set; }
        public string TenDanhMuc { get; set; } = string.Empty;
        public decimal GiaBan { get; set; }
        public int Kho { get; set; }
        public int DaBan { get; set; }
        public bool TrangThai { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
    }

    public class CreateSanPhamDto
    {
        public string SKU { get; set; } = string.Empty;
        public string TenSanPham { get; set; } = string.Empty;
        public int DanhMucID { get; set; }
        public decimal GiaBan { get; set; }
        public int Kho { get; set; }
    }

    public class UpdateSanPhamDto
    {
        public string TenSanPham { get; set; } = string.Empty;
        public int DanhMucID { get; set; }
        public decimal GiaBan { get; set; }
        public int Kho { get; set; }
        public bool TrangThai { get; set; }
    }
}
namespace wedduyhuy.DTOs
{
    public class KhachHangDto
    {
        public int KhachHangID { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string SoDienThoai { get; set; } = string.Empty;
        public string? DiaChi { get; set; }
        public string Loai { get; set; } = "thuong";
        public DateTime NgayThamGia { get; set; }
        public DateTime? DonGanNhat { get; set; }
        public int SoDon { get; set; }
        public decimal DanhGia { get; set; }
        public decimal TongChiTieu { get; set; }
        public bool TrangThai { get; set; }
    }

    public class CreateKhachHangDto
    {
        public string HoTen { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string SoDienThoai { get; set; } = string.Empty;
        public string? DiaChi { get; set; }
        public string Loai { get; set; } = "thuong";
    }

    public class UpdateKhachHangDto
    {
        public string HoTen { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
        public string Loai { get; set; } = "thuong";
        public bool TrangThai { get; set; }
    }
}
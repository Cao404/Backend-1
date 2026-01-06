namespace wedduyhuy.DTOs
{
    public class DanhMucDto
    {
        public int DanhMucID { get; set; }
        public string? MaDanhMuc { get; set; }
        public string TenDanhMuc { get; set; } = string.Empty;
        public int? DanhMucChaID { get; set; }
        public string? TenDanhMucCha { get; set; }
        public bool TrangThai { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
    }

    public class CreateDanhMucDto
    {
        public string? MaDanhMuc { get; set; }
        public string TenDanhMuc { get; set; } = string.Empty;
        public int? DanhMucChaID { get; set; }
    }

    public class UpdateDanhMucDto
    {
        public string? MaDanhMuc { get; set; }
        public string TenDanhMuc { get; set; } = string.Empty;
        public int? DanhMucChaID { get; set; }
        public bool TrangThai { get; set; }
    }
}
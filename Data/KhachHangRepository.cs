using Microsoft.Data.SqlClient;
using SellerHub.Api.Dtos;

namespace SellerHub.Api.Data;

public class KhachHangRepository
{
    private readonly SqlConnectionFactory _factory;
    public KhachHangRepository(SqlConnectionFactory factory) => _factory = factory;

    public async Task<List<KhachHangDto>> GetAllAsync(string? tuKhoa, string? loai, bool? trangThai)
    {
        const string sql = @"
SELECT ma_khach_hang, ho_ten, email, so_dien_thoai, dia_chi, loai,
       ngay_tham_gia, tong_chi_tieu, don_gan_nhat, so_don, danh_gia, trang_thai
FROM dbo.khach_hang
WHERE (@TrangThai IS NULL OR trang_thai = @TrangThai)
  AND (@Loai IS NULL OR loai = @Loai)
  AND (@TuKhoa IS NULL OR (
        ho_ten LIKE N'%' + @TuKhoa + N'%'
     OR so_dien_thoai LIKE N'%' + @TuKhoa + N'%'
     OR email LIKE N'%' + @TuKhoa + N'%'
  ))
ORDER BY tong_chi_tieu DESC, ma_khach_hang DESC;
";

        using var conn = _factory.Create();
        using var cmd = new SqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("@TrangThai", (object?)trangThai ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Loai", string.IsNullOrWhiteSpace(loai) ? (object)DBNull.Value : loai!.Trim());
        cmd.Parameters.AddWithValue("@TuKhoa", string.IsNullOrWhiteSpace(tuKhoa) ? (object)DBNull.Value : tuKhoa!.Trim());

        await conn.OpenAsync();
        using var rd = await cmd.ExecuteReaderAsync();

        var list = new List<KhachHangDto>();
        while (await rd.ReadAsync())
        {
            list.Add(new KhachHangDto
            {
                MaKhachHang = rd.GetInt32(rd.GetOrdinal("ma_khach_hang")),
                HoTen = rd.GetString(rd.GetOrdinal("ho_ten")),
                Email = rd.IsDBNull(rd.GetOrdinal("email")) ? null : rd.GetString(rd.GetOrdinal("email")),
                SoDienThoai = rd.GetString(rd.GetOrdinal("so_dien_thoai")),
                DiaChi = rd.IsDBNull(rd.GetOrdinal("dia_chi")) ? null : rd.GetString(rd.GetOrdinal("dia_chi")),
                Loai = rd.GetString(rd.GetOrdinal("loai")),
                NgayThamGia = rd.GetDateTime(rd.GetOrdinal("ngay_tham_gia")),
                TongChiTieu = rd.GetDecimal(rd.GetOrdinal("tong_chi_tieu")),
                DonGanNhat = rd.IsDBNull(rd.GetOrdinal("don_gan_nhat")) ? null : rd.GetDateTime(rd.GetOrdinal("don_gan_nhat")),
                SoDon = rd.GetInt32(rd.GetOrdinal("so_don")),
                DanhGia = rd.GetDecimal(rd.GetOrdinal("danh_gia")),
                TrangThai = rd.GetBoolean(rd.GetOrdinal("trang_thai")),
            });
        }

        return list;
    }

    public async Task<KhachHangDto?> GetByIdAsync(int id)
    {
        const string sql = @"
SELECT ma_khach_hang, ho_ten, email, so_dien_thoai, dia_chi, loai,
       ngay_tham_gia, tong_chi_tieu, don_gan_nhat, so_don, danh_gia, trang_thai
FROM dbo.khach_hang
WHERE ma_khach_hang = @Id;";

        using var conn = _factory.Create();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);

        await conn.OpenAsync();
        using var rd = await cmd.ExecuteReaderAsync();
        if (!await rd.ReadAsync()) return null;

        return new KhachHangDto
        {
            MaKhachHang = rd.GetInt32(rd.GetOrdinal("ma_khach_hang")),
            HoTen = rd.GetString(rd.GetOrdinal("ho_ten")),
            Email = rd.IsDBNull(rd.GetOrdinal("email")) ? null : rd.GetString(rd.GetOrdinal("email")),
            SoDienThoai = rd.GetString(rd.GetOrdinal("so_dien_thoai")),
            DiaChi = rd.IsDBNull(rd.GetOrdinal("dia_chi")) ? null : rd.GetString(rd.GetOrdinal("dia_chi")),
            Loai = rd.GetString(rd.GetOrdinal("loai")),
            NgayThamGia = rd.GetDateTime(rd.GetOrdinal("ngay_tham_gia")),
            TongChiTieu = rd.GetDecimal(rd.GetOrdinal("tong_chi_tieu")),
            DonGanNhat = rd.IsDBNull(rd.GetOrdinal("don_gan_nhat")) ? null : rd.GetDateTime(rd.GetOrdinal("don_gan_nhat")),
            SoDon = rd.GetInt32(rd.GetOrdinal("so_don")),
            DanhGia = rd.GetDecimal(rd.GetOrdinal("danh_gia")),
            TrangThai = rd.GetBoolean(rd.GetOrdinal("trang_thai")),
        };
    }

    public async Task<int> CreateAsync(KhachHangCreateReq req)
    {
        const string sql = @"
INSERT INTO dbo.khach_hang (ho_ten, email, so_dien_thoai, dia_chi, loai)
VALUES (@HoTen, @Email, @SoDienThoai, @DiaChi, @Loai);
SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var conn = _factory.Create();
        using var cmd = new SqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("@HoTen", req.HoTen.Trim());

        cmd.Parameters.AddWithValue("@Email",
            string.IsNullOrWhiteSpace(req.Email) ? DBNull.Value : req.Email!.Trim()
        );

        cmd.Parameters.AddWithValue("@DiaChi",
            string.IsNullOrWhiteSpace(req.DiaChi) ? DBNull.Value : req.DiaChi!.Trim()
        );

        cmd.Parameters.AddWithValue("@SoDienThoai", req.SoDienThoai.Trim());
        cmd.Parameters.AddWithValue("@Loai", req.Loai.Trim());


        await conn.OpenAsync();
        return (int)(await cmd.ExecuteScalarAsync()!);
    }

    public async Task<bool> UpdateAsync(int id, KhachHangUpdateReq req)
    {
        const string sql = @"
UPDATE dbo.khach_hang
SET ho_ten=@HoTen, email=@Email, so_dien_thoai=@SoDienThoai, dia_chi=@DiaChi, loai=@Loai
WHERE ma_khach_hang=@Id AND trang_thai=1;";

        using var conn = _factory.Create();
        using var cmd = new SqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("@Id", id);
        cmd.Parameters.AddWithValue("@HoTen", req.HoTen.Trim());
        cmd.Parameters.Add("@Email", System.Data.SqlDbType.NVarChar, 120).Value =
    string.IsNullOrWhiteSpace(req.Email) ? DBNull.Value : req.Email!.Trim();

        cmd.Parameters.Add("@DiaChi", System.Data.SqlDbType.NVarChar, 255).Value =
            string.IsNullOrWhiteSpace(req.DiaChi) ? DBNull.Value : req.DiaChi!.Trim();

        cmd.Parameters.AddWithValue("@Loai", string.IsNullOrWhiteSpace(req.Loai) ? "thuong" : req.Loai.Trim());

        await conn.OpenAsync();
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<int> DeleteAsync(int id)
    {
        const string sql = @"UPDATE dbo.KhachHang
                         SET TrangThai = 0
                         WHERE MaKhachHang = @id AND TrangThai = 1;";

        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@id", id);

        return await cmd.ExecuteNonQueryAsync(); // 1 = xóa ok, 0 = không thấy
    }

}

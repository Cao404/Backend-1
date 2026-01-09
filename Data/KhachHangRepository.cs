using Microsoft.Data.SqlClient;
using SellerHub.Api.Dtos;
using System.Data;

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
ORDER BY tong_chi_tieu DESC, ma_khach_hang DESC;";

        await using var conn = _factory.Create();
        await using var cmd = new SqlCommand(sql, conn);

        cmd.Parameters.Add("@TrangThai", SqlDbType.Bit).Value = (object?)trangThai ?? DBNull.Value;
        cmd.Parameters.Add("@Loai", SqlDbType.NVarChar, 50).Value =
            string.IsNullOrWhiteSpace(loai) ? DBNull.Value : loai!.Trim();
        cmd.Parameters.Add("@TuKhoa", SqlDbType.NVarChar, 200).Value =
            string.IsNullOrWhiteSpace(tuKhoa) ? DBNull.Value : tuKhoa!.Trim();

        await conn.OpenAsync();
        await using var rd = await cmd.ExecuteReaderAsync();

        // ordinals (nhanh + tránh gõ sai)
        int oMa = rd.GetOrdinal("ma_khach_hang");
        int oHoTen = rd.GetOrdinal("ho_ten");
        int oEmail = rd.GetOrdinal("email");
        int oSdt = rd.GetOrdinal("so_dien_thoai");
        int oDiaChi = rd.GetOrdinal("dia_chi");
        int oLoai = rd.GetOrdinal("loai");
        int oNgay = rd.GetOrdinal("ngay_tham_gia");
        int oTong = rd.GetOrdinal("tong_chi_tieu");
        int oDonGan = rd.GetOrdinal("don_gan_nhat");
        int oSoDon = rd.GetOrdinal("so_don");
        int oDanhGia = rd.GetOrdinal("danh_gia");
        int oTrangThai = rd.GetOrdinal("trang_thai");

        var list = new List<KhachHangDto>();
        while (await rd.ReadAsync())
        {
            list.Add(new KhachHangDto
            {
                MaKhachHang = rd.GetInt32(oMa),
                HoTen = rd.IsDBNull(oHoTen) ? "" : rd.GetString(oHoTen),
                Email = rd.IsDBNull(oEmail) ? null : rd.GetString(oEmail),
                SoDienThoai = rd.IsDBNull(oSdt) ? "" : rd.GetString(oSdt),
                DiaChi = rd.IsDBNull(oDiaChi) ? null : rd.GetString(oDiaChi),
                Loai = rd.IsDBNull(oLoai) ? "thuong" : rd.GetString(oLoai),

                NgayThamGia = rd.IsDBNull(oNgay) ? DateTime.MinValue : rd.GetDateTime(oNgay),
                TongChiTieu = rd.IsDBNull(oTong) ? 0 : rd.GetDecimal(oTong),
                DonGanNhat = rd.IsDBNull(oDonGan) ? null : rd.GetDateTime(oDonGan),
                SoDon = rd.IsDBNull(oSoDon) ? 0 : rd.GetInt32(oSoDon),
                DanhGia = rd.IsDBNull(oDanhGia) ? 0 : rd.GetDecimal(oDanhGia),
                TrangThai = !rd.IsDBNull(oTrangThai) && rd.GetBoolean(oTrangThai),
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

        await using var conn = _factory.Create();
        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.Add("@Id", SqlDbType.Int).Value = id;

        await conn.OpenAsync();
        await using var rd = await cmd.ExecuteReaderAsync();
        if (!await rd.ReadAsync()) return null;

        return new KhachHangDto
        {
            MaKhachHang = rd.GetInt32(rd.GetOrdinal("ma_khach_hang")),
            HoTen = rd.IsDBNull(rd.GetOrdinal("ho_ten")) ? "" : rd.GetString(rd.GetOrdinal("ho_ten")),
            Email = rd.IsDBNull(rd.GetOrdinal("email")) ? null : rd.GetString(rd.GetOrdinal("email")),
            SoDienThoai = rd.IsDBNull(rd.GetOrdinal("so_dien_thoai")) ? "" : rd.GetString(rd.GetOrdinal("so_dien_thoai")),
            DiaChi = rd.IsDBNull(rd.GetOrdinal("dia_chi")) ? null : rd.GetString(rd.GetOrdinal("dia_chi")),
            Loai = rd.IsDBNull(rd.GetOrdinal("loai")) ? "thuong" : rd.GetString(rd.GetOrdinal("loai")),

            NgayThamGia = rd.IsDBNull(rd.GetOrdinal("ngay_tham_gia")) ? DateTime.MinValue : rd.GetDateTime(rd.GetOrdinal("ngay_tham_gia")),
            TongChiTieu = rd.IsDBNull(rd.GetOrdinal("tong_chi_tieu")) ? 0 : rd.GetDecimal(rd.GetOrdinal("tong_chi_tieu")),
            DonGanNhat = rd.IsDBNull(rd.GetOrdinal("don_gan_nhat")) ? null : rd.GetDateTime(rd.GetOrdinal("don_gan_nhat")),
            SoDon = rd.IsDBNull(rd.GetOrdinal("so_don")) ? 0 : rd.GetInt32(rd.GetOrdinal("so_don")),
            DanhGia = rd.IsDBNull(rd.GetOrdinal("danh_gia")) ? 0 : rd.GetDecimal(rd.GetOrdinal("danh_gia")),
            TrangThai = !rd.IsDBNull(rd.GetOrdinal("trang_thai")) && rd.GetBoolean(rd.GetOrdinal("trang_thai")),
        };
    }

    public async Task<int> CreateAsync(KhachHangCreateReq req)
    {
        // INSERT đầy đủ các cột "thường hay NOT NULL" để tránh lỗi schema
        const string sql = @"
INSERT INTO dbo.khach_hang
(ho_ten, email, so_dien_thoai, dia_chi, loai, ngay_tham_gia, tong_chi_tieu, don_gan_nhat, so_don, danh_gia, trang_thai)
VALUES
(@HoTen, @Email, @SoDienThoai, @DiaChi, @Loai, GETDATE(), 0, NULL, 0, 0, 1);

SELECT CAST(SCOPE_IDENTITY() AS INT);";

        await using var conn = _factory.Create();
        await using var cmd = new SqlCommand(sql, conn);

        cmd.Parameters.Add("@HoTen", SqlDbType.NVarChar, 120).Value = req.HoTen.Trim();
        cmd.Parameters.Add("@SoDienThoai", SqlDbType.NVarChar, 20).Value = req.SoDienThoai.Trim();

        cmd.Parameters.Add("@Email", SqlDbType.NVarChar, 120).Value =
            string.IsNullOrWhiteSpace(req.Email) ? DBNull.Value : req.Email!.Trim();

        cmd.Parameters.Add("@DiaChi", SqlDbType.NVarChar, 255).Value =
            string.IsNullOrWhiteSpace(req.DiaChi) ? DBNull.Value : req.DiaChi!.Trim();

        cmd.Parameters.Add("@Loai", SqlDbType.NVarChar, 30).Value =
            string.IsNullOrWhiteSpace(req.Loai) ? "thuong" : req.Loai.Trim();

        await conn.OpenAsync();
        return (int)(await cmd.ExecuteScalarAsync())!;
    }

    public async Task<bool> UpdateAsync(int id, KhachHangUpdateReq req)
    {
        const string sql = @"
UPDATE dbo.khach_hang
SET ho_ten=@HoTen,
    email=@Email,
    so_dien_thoai=@SoDienThoai,
    dia_chi=@DiaChi,
    loai=@Loai
WHERE ma_khach_hang=@Id AND trang_thai=1;";

        await using var conn = _factory.Create();
        await using var cmd = new SqlCommand(sql, conn);

        cmd.Parameters.Add("@Id", SqlDbType.Int).Value = id;
        cmd.Parameters.Add("@HoTen", SqlDbType.NVarChar, 120).Value = req.HoTen.Trim();
        cmd.Parameters.Add("@SoDienThoai", SqlDbType.NVarChar, 20).Value = req.SoDienThoai.Trim(); // ✅ thiếu cái này trong code bạn

        cmd.Parameters.Add("@Email", SqlDbType.NVarChar, 120).Value =
            string.IsNullOrWhiteSpace(req.Email) ? DBNull.Value : req.Email!.Trim();

        cmd.Parameters.Add("@DiaChi", SqlDbType.NVarChar, 255).Value =
            string.IsNullOrWhiteSpace(req.DiaChi) ? DBNull.Value : req.DiaChi!.Trim();

        cmd.Parameters.Add("@Loai", SqlDbType.NVarChar, 30).Value =
            string.IsNullOrWhiteSpace(req.Loai) ? "thuong" : req.Loai.Trim();

        await conn.OpenAsync();
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<int> DeleteAsync(int id)
    {
        // ✅ sửa đúng tên bảng + cột snake_case
        const string sql = @"
UPDATE dbo.khach_hang
SET trang_thai = 0
WHERE ma_khach_hang = @Id AND trang_thai = 1;";

        await using var conn = _factory.Create();
        await using var cmd = new SqlCommand(sql, conn);

        cmd.Parameters.Add("@Id", SqlDbType.Int).Value = id;

        await conn.OpenAsync();
        return await cmd.ExecuteNonQueryAsync(); // 1=ok, 0=notfound
    }
}

using Microsoft.Data.SqlClient;
using SellerHub.Api.Dtos;

namespace SellerHub.Api.Data;

public class DonHangRepository
{
    private readonly SqlConnectionFactory _factory;
    public DonHangRepository(SqlConnectionFactory factory) => _factory = factory;

    private static string AvatarFromName(string name)
    {
        var parts = (name ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "U";
        var a = parts[0][0].ToString().ToUpperInvariant();
        var b = parts.Length >= 2 ? parts[^1][0].ToString().ToUpperInvariant() : "";
        return (a + b).Trim();
    }

    // ===== GET ALL =====
    public async Task<List<DonHangListDto>> GetAllAsync(string? trangThai, string? q, DateTime? from, DateTime? to)
    {
        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();

        var sql = @"
SELECT MaDonHang, MaDon, TenKhachHang, Email, SoDienThoai, TongTien,
       PhuongThucThanhToan, DaThanhToan, TrangThai, NgayTao
FROM dbo.DonHang
WHERE TrangThaiHoatDong = 1
  AND (@trangThai IS NULL OR @trangThai = '' OR TrangThai = @trangThai)
  AND (
        @q IS NULL OR @q = '' 
        OR MaDon LIKE N'%' + @q + N'%'
        OR TenKhachHang LIKE N'%' + @q + N'%'
        OR SoDienThoai LIKE N'%' + @q + N'%'
      )
  AND (@from IS NULL OR NgayTao >= @from)
  AND (@to IS NULL OR NgayTao <= @to)
ORDER BY NgayTao DESC;";

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@trangThai", (object?)trangThai ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@q", (object?)q ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@from", (object?)from ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@to", (object?)to ?? DBNull.Value);

        var list = new List<DonHangListDto>();
        await using var rd = await cmd.ExecuteReaderAsync();
        while (await rd.ReadAsync())
        {
            var ten = rd.GetString(rd.GetOrdinal("TenKhachHang"));
            var sdt = rd.GetString(rd.GetOrdinal("SoDienThoai"));
            var email = rd.IsDBNull(rd.GetOrdinal("Email")) ? null : rd.GetString(rd.GetOrdinal("Email"));

            list.Add(new DonHangListDto
            {
                MaDonHang = rd.GetInt32(rd.GetOrdinal("MaDonHang")),
                MaDon = rd.GetString(rd.GetOrdinal("MaDon")),
                KhachHang = new KhachHangDonHangDto
                {
                    HoTen = ten,
                    SoDienThoai = sdt,
                    Email = email,
                    Avatar = AvatarFromName(ten)
                },
                TongTien = rd.GetDecimal(rd.GetOrdinal("TongTien")),
                ThanhToan = new ThanhToanDonHangDto
                {
                    PhuongThuc = rd.GetString(rd.GetOrdinal("PhuongThucThanhToan")),
                    DaThanhToan = rd.GetBoolean(rd.GetOrdinal("DaThanhToan"))
                },
                TrangThai = rd.GetString(rd.GetOrdinal("TrangThai")),
                ThoiGianTao = rd.GetDateTime(rd.GetOrdinal("NgayTao"))
            });
        }

        return list;
    }

    // ===== GET BY ID (DETAIL) =====
    public async Task<DonHangDetailDto?> GetByIdAsync(int id)
    {
        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();

        // 1) Header
        var headerSql = @"
SELECT MaDonHang, MaDon, TenKhachHang, Email, SoDienThoai, DiaChiGiao,
       TongTien, PhuongThucThanhToan, DaThanhToan, TrangThai, GhiChu, NgayTao
FROM dbo.DonHang
WHERE TrangThaiHoatDong = 1 AND MaDonHang = @id;";

        await using var headerCmd = new SqlCommand(headerSql, conn);
        headerCmd.Parameters.AddWithValue("@id", id);

        DonHangDetailDto? dto = null;
        await using (var rd = await headerCmd.ExecuteReaderAsync())
        {
            if (!await rd.ReadAsync()) return null;

            var ten = rd.GetString(rd.GetOrdinal("TenKhachHang"));
            var sdt = rd.GetString(rd.GetOrdinal("SoDienThoai"));
            var email = rd.IsDBNull(rd.GetOrdinal("Email")) ? null : rd.GetString(rd.GetOrdinal("Email"));
            var diaChi = rd.IsDBNull(rd.GetOrdinal("DiaChiGiao")) ? null : rd.GetString(rd.GetOrdinal("DiaChiGiao"));
            var ghiChu = rd.IsDBNull(rd.GetOrdinal("GhiChu")) ? null : rd.GetString(rd.GetOrdinal("GhiChu"));

            dto = new DonHangDetailDto
            {
                MaDonHang = rd.GetInt32(rd.GetOrdinal("MaDonHang")),
                MaDon = rd.GetString(rd.GetOrdinal("MaDon")),
                KhachHang = new KhachHangDonHangDto
                {
                    HoTen = ten,
                    SoDienThoai = sdt,
                    Email = email,
                    Avatar = AvatarFromName(ten)
                },
                DiaChiGiaoHang = diaChi,
                GhiChu = ghiChu,
                TongTien = rd.GetDecimal(rd.GetOrdinal("TongTien")),
                ThanhToan = new ThanhToanDonHangDto
                {
                    PhuongThuc = rd.GetString(rd.GetOrdinal("PhuongThucThanhToan")),
                    DaThanhToan = rd.GetBoolean(rd.GetOrdinal("DaThanhToan"))
                },
                TrangThai = rd.GetString(rd.GetOrdinal("TrangThai")),
                ThoiGianTao = rd.GetDateTime(rd.GetOrdinal("NgayTao")),
                SanPham = new List<SanPhamDonHangDto>()
            };
        }

        // 2) Items
        var itemsSql = @"
SELECT MaSanPham, TenSanPham, SoLuong, DonGia
FROM dbo.DonHangChiTiet
WHERE MaDonHang = @id
ORDER BY MaChiTiet ASC;";

        await using var itemsCmd = new SqlCommand(itemsSql, conn);
        itemsCmd.Parameters.AddWithValue("@id", id);

        await using var rd2 = await itemsCmd.ExecuteReaderAsync();
        while (await rd2.ReadAsync())
        {
            dto!.SanPham.Add(new SanPhamDonHangDto
            {
                MaSanPham = rd2.IsDBNull(rd2.GetOrdinal("MaSanPham")) ? null : rd2.GetInt32(rd2.GetOrdinal("MaSanPham")),
                Ten = rd2.GetString(rd2.GetOrdinal("TenSanPham")),
                SoLuong = rd2.GetInt32(rd2.GetOrdinal("SoLuong")),
                DonGia = rd2.GetDecimal(rd2.GetOrdinal("DonGia")),
                Emoji = "📦"
            });
        }

        return dto;
    }

    // ===== CREATE =====
    public async Task<int> CreateAsync(DonHangCreateReq req)
    {
        if (string.IsNullOrWhiteSpace(req.MaDon)) throw new ArgumentException("MaDon is required");
        if (req.KhachHang == null) throw new ArgumentException("KhachHang is required");
        if (string.IsNullOrWhiteSpace(req.KhachHang.HoTen)) throw new ArgumentException("KhachHang.HoTen is required");
        if (string.IsNullOrWhiteSpace(req.KhachHang.SoDienThoai)) throw new ArgumentException("KhachHang.SoDienThoai is required");
        if (req.SanPham == null || req.SanPham.Count == 0) throw new ArgumentException("SanPham is required");

        decimal tong = 0;
        foreach (var p in req.SanPham)
        {
            if (string.IsNullOrWhiteSpace(p.Ten)) throw new ArgumentException("SanPham.Ten is required");
            if (p.SoLuong <= 0) throw new ArgumentException("SanPham.SoLuong must be > 0");
            if (p.DonGia < 0) throw new ArgumentException("SanPham.DonGia must be >= 0");
            tong += p.DonGia * p.SoLuong;
        }

        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            var createdAt = req.ThoiGianTao ?? DateTime.Now;

            var insertHeader = @"
INSERT INTO dbo.DonHang(MaDon, MaKhachHang, TenKhachHang, Email, SoDienThoai, DiaChiGiao,
                       TongTien, PhuongThucThanhToan, DaThanhToan, TrangThai, GhiChu, NgayTao, TrangThaiHoatDong)
VALUES(@MaDon, @MaKhachHang, @Ten, @Email, @SDT, @DiaChi,
       @TongTien, @PTTT, @DaThanhToan, @TrangThai, @GhiChu, @NgayTao, 1);
SELECT CAST(SCOPE_IDENTITY() AS INT);";

            await using var cmd = new SqlCommand(insertHeader, conn, (SqlTransaction)tx);
            cmd.Parameters.AddWithValue("@MaDon", req.MaDon.Trim());
            cmd.Parameters.AddWithValue("@MaKhachHang", (object?)req.MaKhachHang ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Ten", req.KhachHang.HoTen.Trim());
            cmd.Parameters.AddWithValue("@Email", string.IsNullOrWhiteSpace(req.KhachHang.Email) ? (object)DBNull.Value : req.KhachHang.Email.Trim());
            cmd.Parameters.AddWithValue("@SDT", req.KhachHang.SoDienThoai.Trim());
            cmd.Parameters.AddWithValue("@DiaChi", string.IsNullOrWhiteSpace(req.DiaChiGiaoHang) ? (object)DBNull.Value : req.DiaChiGiaoHang.Trim());
            cmd.Parameters.AddWithValue("@TongTien", tong);
            cmd.Parameters.AddWithValue("@PTTT", string.IsNullOrWhiteSpace(req.ThanhToan?.PhuongThuc) ? "COD" : req.ThanhToan.PhuongThuc.Trim());
            cmd.Parameters.AddWithValue("@DaThanhToan", req.ThanhToan?.DaThanhToan ?? false);
            cmd.Parameters.AddWithValue("@TrangThai", string.IsNullOrWhiteSpace(req.TrangThai) ? "pending" : req.TrangThai.Trim());
            cmd.Parameters.AddWithValue("@GhiChu", string.IsNullOrWhiteSpace(req.GhiChu) ? (object)DBNull.Value : req.GhiChu.Trim());
            cmd.Parameters.AddWithValue("@NgayTao", createdAt);

            var orderId = (int)(await cmd.ExecuteScalarAsync() ?? 0);

            var insertItem = @"
INSERT INTO dbo.DonHangChiTiet(MaDonHang, MaSanPham, TenSanPham, SoLuong, DonGia)
VALUES(@MaDonHang, @MaSanPham, @TenSP, @SoLuong, @DonGia);";

            foreach (var p in req.SanPham)
            {
                await using var cmdItem = new SqlCommand(insertItem, conn, (SqlTransaction)tx);
                cmdItem.Parameters.AddWithValue("@MaDonHang", orderId);
                cmdItem.Parameters.AddWithValue("@MaSanPham", (object?)p.MaSanPham ?? DBNull.Value);
                cmdItem.Parameters.AddWithValue("@TenSP", p.Ten.Trim());
                cmdItem.Parameters.AddWithValue("@SoLuong", p.SoLuong);
                cmdItem.Parameters.AddWithValue("@DonGia", p.DonGia);
                await cmdItem.ExecuteNonQueryAsync();
            }

            await tx.CommitAsync();
            return orderId;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // ===== UPDATE (thay header + replace items) =====
    public async Task<bool> UpdateAsync(int id, DonHangUpdateReq req)
    {
        if (req.KhachHang == null) throw new ArgumentException("KhachHang is required");
        if (string.IsNullOrWhiteSpace(req.KhachHang.HoTen)) throw new ArgumentException("KhachHang.HoTen is required");
        if (string.IsNullOrWhiteSpace(req.KhachHang.SoDienThoai)) throw new ArgumentException("KhachHang.SoDienThoai is required");
        if (req.SanPham == null || req.SanPham.Count == 0) throw new ArgumentException("SanPham is required");

        decimal tong = 0;
        foreach (var p in req.SanPham)
        {
            if (string.IsNullOrWhiteSpace(p.Ten)) throw new ArgumentException("SanPham.Ten is required");
            if (p.SoLuong <= 0) throw new ArgumentException("SanPham.SoLuong must be > 0");
            if (p.DonGia < 0) throw new ArgumentException("SanPham.DonGia must be >= 0");
            tong += p.DonGia * p.SoLuong;
        }

        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            var updateHeader = @"
UPDATE dbo.DonHang
SET MaKhachHang = @MaKhachHang,
    TenKhachHang = @Ten,
    Email = @Email,
    SoDienThoai = @SDT,
    DiaChiGiao = @DiaChi,
    TongTien = @TongTien,
    PhuongThucThanhToan = @PTTT,
    DaThanhToan = @DaThanhToan,
    GhiChu = @GhiChu
WHERE TrangThaiHoatDong = 1 AND MaDonHang = @Id;";

            await using (var cmd = new SqlCommand(updateHeader, conn, (SqlTransaction)tx))
            {
                cmd.Parameters.AddWithValue("@Id", id);
                cmd.Parameters.AddWithValue("@MaKhachHang", (object?)req.MaKhachHang ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Ten", req.KhachHang.HoTen.Trim());
                cmd.Parameters.AddWithValue("@Email", string.IsNullOrWhiteSpace(req.KhachHang.Email) ? (object)DBNull.Value : req.KhachHang.Email.Trim());
                cmd.Parameters.AddWithValue("@SDT", req.KhachHang.SoDienThoai.Trim());
                cmd.Parameters.AddWithValue("@DiaChi", string.IsNullOrWhiteSpace(req.DiaChiGiaoHang) ? (object)DBNull.Value : req.DiaChiGiaoHang.Trim());
                cmd.Parameters.AddWithValue("@TongTien", tong);
                cmd.Parameters.AddWithValue("@PTTT", string.IsNullOrWhiteSpace(req.ThanhToan?.PhuongThuc) ? "COD" : req.ThanhToan.PhuongThuc.Trim());
                cmd.Parameters.AddWithValue("@DaThanhToan", req.ThanhToan?.DaThanhToan ?? false);
                cmd.Parameters.AddWithValue("@GhiChu", string.IsNullOrWhiteSpace(req.GhiChu) ? (object)DBNull.Value : req.GhiChu.Trim());

                var affected = await cmd.ExecuteNonQueryAsync();
                if (affected == 0)
                {
                    await tx.RollbackAsync();
                    return false;
                }
            }

            var deleteItems = @"DELETE FROM dbo.DonHangChiTiet WHERE MaDonHang = @Id;";
            await using (var cmdDel = new SqlCommand(deleteItems, conn, (SqlTransaction)tx))
            {
                cmdDel.Parameters.AddWithValue("@Id", id);
                await cmdDel.ExecuteNonQueryAsync();
            }

            var insertItem = @"
INSERT INTO dbo.DonHangChiTiet(MaDonHang, MaSanPham, TenSanPham, SoLuong, DonGia)
VALUES(@MaDonHang, @MaSanPham, @TenSP, @SoLuong, @DonGia);";

            foreach (var p in req.SanPham)
            {
                await using var cmdItem = new SqlCommand(insertItem, conn, (SqlTransaction)tx);
                cmdItem.Parameters.AddWithValue("@MaDonHang", id);
                cmdItem.Parameters.AddWithValue("@MaSanPham", (object?)p.MaSanPham ?? DBNull.Value);
                cmdItem.Parameters.AddWithValue("@TenSP", p.Ten.Trim());
                cmdItem.Parameters.AddWithValue("@SoLuong", p.SoLuong);
                cmdItem.Parameters.AddWithValue("@DonGia", p.DonGia);
                await cmdItem.ExecuteNonQueryAsync();
            }

            await tx.CommitAsync();
            return true;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // ===== UPDATE TRẠNG THÁI =====
    public async Task<bool> UpdateTrangThaiAsync(int id, string trangThai)
    {
        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();

        var sql = @"
UPDATE dbo.DonHang
SET TrangThai = @st
WHERE TrangThaiHoatDong = 1 AND MaDonHang = @id;";

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@st", trangThai);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // ===== SOFT DELETE =====
    public async Task<bool> SoftDeleteAsync(int id)
    {
        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();

        var sql = @"
UPDATE dbo.DonHang
SET TrangThaiHoatDong = 0
WHERE MaDonHang = @id;";

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}

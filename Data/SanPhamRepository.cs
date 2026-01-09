using Microsoft.Data.SqlClient;
using SellerHub.Api.Models.Requests;
using SellerHub.Api.Models.Responses;

namespace SellerHub.Api.Data;

public sealed class SanPhamRepository
{
    private readonly SqlConnectionFactory _factory;

    public SanPhamRepository(SqlConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<List<SanPhamListItem>> GetAllAsync(string? tuKhoa, int? maDanhMuc, bool? trangThai)
    {
        tuKhoa = (tuKhoa ?? "").Trim();
        var hasKw = !string.IsNullOrWhiteSpace(tuKhoa);

        var sql = @"
SELECT
  sp.MaSanPham,
  sp.SKU,
  sp.TenSanPham,
  sp.MaDanhMuc,
  ISNULL(dm.TenDanhMuc, N'—') AS TenDanhMuc,
  sp.GiaBan,
  sp.Kho,
  sp.DaBan,
  CASE WHEN ISNULL(sp.TrangThai, 1) = 1 THEN N'Đang bán' ELSE N'Tạm dừng' END AS TrangThai
FROM dbo.SanPham sp
LEFT JOIN dbo.DanhMuc dm ON dm.MaDanhMuc = sp.MaDanhMuc
WHERE sp.IsDeleted = 0
";

        if (hasKw)
            sql += " AND (sp.TenSanPham LIKE @kw OR sp.SKU LIKE @kw)\n";

        if (maDanhMuc.HasValue && maDanhMuc.Value > 0)
            sql += " AND sp.MaDanhMuc = @maDanhMuc\n";

        if (trangThai.HasValue)
            sql += " AND sp.TrangThai = @trangThai\n";

        sql += " ORDER BY sp.MaSanPham DESC;";

        var list = new List<SanPhamListItem>();
        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);

        if (hasKw) cmd.Parameters.AddWithValue("@kw", "%" + tuKhoa + "%");
        if (maDanhMuc.HasValue && maDanhMuc.Value > 0) cmd.Parameters.AddWithValue("@maDanhMuc", maDanhMuc.Value);
        if (trangThai.HasValue) cmd.Parameters.AddWithValue("@trangThai", trangThai.Value ? 1 : 0);

        await using var rd = await cmd.ExecuteReaderAsync();
        while (await rd.ReadAsync())
        {
            list.Add(new SanPhamListItem
            {
                MaSanPham = rd.GetInt32(0),
                SKU = rd.GetString(1),
                TenSanPham = rd.GetString(2),
                MaDanhMuc = rd.GetInt32(3),
                TenDanhMuc = rd.GetString(4),
                GiaBan = rd.GetDecimal(5),
                Kho = rd.GetInt32(6),
                DaBan = rd.GetInt32(7),
                TrangThai = rd.GetString(8)
            });
        }
        return list;
    }

    public async Task<int> CreateAsync(CreateSanPhamRequest req)
    {
        Validate(req.SKU, req.TenSanPham, req.GiaBan, req.Kho, req.DaBan);

        const string sql = @"
INSERT INTO dbo.SanPham(SKU, TenSanPham, MaDanhMuc, GiaBan, Kho, DaBan, TrangThai, IsDeleted)
VALUES(@sku, @ten, @maDm, @gia, @kho, @daBan, @tt, 0);
SELECT SCOPE_IDENTITY();
";

        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@sku", req.SKU.Trim());
        cmd.Parameters.AddWithValue("@ten", req.TenSanPham.Trim());
        cmd.Parameters.AddWithValue("@maDm", req.MaDanhMuc);
        cmd.Parameters.AddWithValue("@gia", req.GiaBan);
        cmd.Parameters.AddWithValue("@kho", req.Kho);
        cmd.Parameters.AddWithValue("@daBan", req.DaBan);
        cmd.Parameters.AddWithValue("@tt", req.TrangThai ? 1 : 0);

        var idObj = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(idObj);
    }

    public async Task UpdateAsync(int id, UpdateSanPhamRequest req)
    {
        Validate(req.SKU, req.TenSanPham, req.GiaBan, req.Kho, req.DaBan);

        const string sql = @"
UPDATE dbo.SanPham
SET
  SKU = @sku,
  TenSanPham = @ten,
  MaDanhMuc = @maDm,
  GiaBan = @gia,
  Kho = @kho,
  DaBan = @daBan,
  TrangThai = @tt,
  NgayCapNhat = SYSDATETIME()
WHERE MaSanPham = @id AND IsDeleted = 0;
";

        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@sku", req.SKU.Trim());
        cmd.Parameters.AddWithValue("@ten", req.TenSanPham.Trim());
        cmd.Parameters.AddWithValue("@maDm", req.MaDanhMuc);
        cmd.Parameters.AddWithValue("@gia", req.GiaBan);
        cmd.Parameters.AddWithValue("@kho", req.Kho);
        cmd.Parameters.AddWithValue("@daBan", req.DaBan);
        cmd.Parameters.AddWithValue("@tt", req.TrangThai ? 1 : 0);

        var rows = await cmd.ExecuteNonQueryAsync();
        if (rows == 0) throw new KeyNotFoundException("Sản phẩm không tồn tại.");
    }

    public async Task DeleteAsync(int id)
    {
        const string sql = @"
UPDATE dbo.SanPham
SET IsDeleted = 1, TrangThai = 0, NgayCapNhat = SYSDATETIME()
WHERE MaSanPham = @id AND IsDeleted = 0;
";

        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@id", id);

        var rows = await cmd.ExecuteNonQueryAsync();
        if (rows == 0) throw new KeyNotFoundException("Sản phẩm không tồn tại.");
    }

    private static void Validate(string sku, string ten, decimal gia, int kho, int daBan)
    {
        if (string.IsNullOrWhiteSpace(sku)) throw new ArgumentException("SKU không được trống.");
        if (string.IsNullOrWhiteSpace(ten)) throw new ArgumentException("Tên sản phẩm không được trống.");
        if (gia < 0) throw new ArgumentException("Giá bán không hợp lệ.");
        if (kho < 0) throw new ArgumentException("Kho không hợp lệ.");
        if (daBan < 0) throw new ArgumentException("Đã bán không hợp lệ.");
    }
}

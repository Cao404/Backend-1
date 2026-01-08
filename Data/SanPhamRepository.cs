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

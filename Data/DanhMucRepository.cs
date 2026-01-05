using Microsoft.Data.SqlClient;
using SellerHub.Api.Models.Requests;
using SellerHub.Api.Models.Responses;

namespace SellerHub.Api.Data;

public sealed class DanhMucRepository
{
    private readonly SqlConnectionFactory _factory;

    public DanhMucRepository(SqlConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<List<DanhMucListItem>> GetAllAsync(string? tuKhoa)
    {
        tuKhoa = (tuKhoa ?? "").Trim();
        var hasKw = !string.IsNullOrWhiteSpace(tuKhoa);

        var sql = @"
SELECT
  dm.MaDanhMuc,
  dm.TenDanhMuc,
  dm.MaDanhMucCode,
  COUNT(sp.MaSanPham) AS SanPham,
  ISNULL(cha.TenDanhMuc, N'—') AS DanhMucCha,
  CASE WHEN dm.TrangThai = 1 THEN N'Đang bán' ELSE N'Tạm dừng' END AS TrangThai
FROM dbo.DanhMuc dm
LEFT JOIN dbo.DanhMuc cha ON dm.MaDanhMucCha = cha.MaDanhMuc
LEFT JOIN dbo.SanPham sp ON sp.MaDanhMuc = dm.MaDanhMuc AND sp.IsDeleted = 0
WHERE dm.IsDeleted = 0
" + (hasKw ? "AND (dm.TenDanhMuc LIKE @kw OR dm.MaDanhMucCode LIKE @kw)\n" : "") + @"
GROUP BY dm.MaDanhMuc, dm.TenDanhMuc, dm.MaDanhMucCode, cha.TenDanhMuc, dm.TrangThai
ORDER BY dm.MaDanhMuc DESC;";

        var list = new List<DanhMucListItem>();

        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        if (hasKw)
            cmd.Parameters.AddWithValue("@kw", "%" + tuKhoa + "%");

        await using var rd = await cmd.ExecuteReaderAsync();
        while (await rd.ReadAsync())
        {
            list.Add(new DanhMucListItem
            {
                MaDanhMuc = rd.GetInt32(0),
                TenDanhMuc = rd.GetString(1),
                MaDanhMucCode = rd.IsDBNull(2) ? null : rd.GetString(2),
                SanPham = rd.GetInt32(3),
                DanhMucCha = rd.GetString(4),
                TrangThai = rd.GetString(5)
            });
        }

        return list;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        const string sql = @"SELECT 1 FROM dbo.DanhMuc WHERE MaDanhMuc=@id AND IsDeleted=0;";
        await using var conn = _factory.Create();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@id", id);
        var obj = await cmd.ExecuteScalarAsync();
        return obj != null;
    }

    public async Task<int> CreateAsync(CreateDanhMucRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.TenDanhMuc))
            throw new ArgumentException("Tên danh mục không được trống.");

        // check parent exists (nếu có)
        if (req.MaDanhMucCha.HasValue && !await ExistsAsync(req.MaDanhMucCha.Value))
            throw new InvalidOperationException("Danh mục cha không tồn tại.");

        const string sql = @"
INSERT INTO dbo.DanhMuc(MaDanhMucCode, TenDanhMuc, MaDanhMucCha, TrangThai, IsDeleted)
VALUES(@code, @name, @parent, 1, 0);
SELECT SCOPE_IDENTITY();";

        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@code", (object?)NormalizeCode(req.MaDanhMucCode) ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@name", req.TenDanhMuc.Trim());
        cmd.Parameters.AddWithValue("@parent", (object?)req.MaDanhMucCha ?? DBNull.Value);

        var idObj = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(idObj);
    }

    public async Task UpdateAsync(int id, UpdateDanhMucRequest req)
    {
        if (!await ExistsAsync(id))
            throw new KeyNotFoundException("Danh mục không tồn tại.");

        if (string.IsNullOrWhiteSpace(req.TenDanhMuc))
            throw new ArgumentException("Tên danh mục không được trống.");

        if (req.MaDanhMucCha.HasValue)
        {
            if (req.MaDanhMucCha.Value == id)
                throw new InvalidOperationException("Danh mục cha không hợp lệ (trùng chính nó).");

            if (!await ExistsAsync(req.MaDanhMucCha.Value))
                throw new InvalidOperationException("Danh mục cha không tồn tại.");
        }

        // nếu không truyền TrangThai thì giữ nguyên
        var sql = @"
UPDATE dbo.DanhMuc
SET
  MaDanhMucCode = @code,
  TenDanhMuc = @name,
  MaDanhMucCha = @parent,
  TrangThai = COALESCE(@status, TrangThai),
  NgayCapNhat = SYSDATETIME()
WHERE MaDanhMuc = @id AND IsDeleted = 0;";

        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@code", (object?)NormalizeCode(req.MaDanhMucCode) ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@name", req.TenDanhMuc.Trim());
        cmd.Parameters.AddWithValue("@parent", (object?)req.MaDanhMucCha ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@status", req.TrangThai.HasValue ? (object)(req.TrangThai.Value ? 1 : 0) : DBNull.Value);

        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteAsync(int id)
    {
        if (!await ExistsAsync(id))
            throw new KeyNotFoundException("Danh mục không tồn tại.");

        // chặn xóa nếu còn danh mục con
        const string hasChildSql = @"SELECT TOP 1 1 FROM dbo.DanhMuc WHERE MaDanhMucCha=@id AND IsDeleted=0;";
        await using var conn = _factory.Create();
        await conn.OpenAsync();

        await using (var cmdChild = new SqlCommand(hasChildSql, conn))
        {
            cmdChild.Parameters.AddWithValue("@id", id);
            var hasChild = await cmdChild.ExecuteScalarAsync();
            if (hasChild != null)
                throw new InvalidOperationException("Không thể xóa: danh mục còn danh mục con.");
        }

        // xóa mềm
        const string sql = @"
UPDATE dbo.DanhMuc
SET IsDeleted = 1, TrangThai = 0, NgayCapNhat = SYSDATETIME()
WHERE MaDanhMuc = @id AND IsDeleted = 0;";

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@id", id);
        await cmd.ExecuteNonQueryAsync();
    }

    private static string? NormalizeCode(string? code)
    {
        code = (code ?? "").Trim();
        if (code.Length == 0) return null;
        return code.ToUpperInvariant();
    }
}

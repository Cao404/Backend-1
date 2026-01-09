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

    public async Task<List<DonHangListDto>> GetAllAsync(string? status, string? q, DateTime? from, DateTime? to)
    {
        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();

        var sql = @"
SELECT MaDonHang, MaDon, TenKhachHang, Email, SoDienThoai, TongTien, PhuongThucThanhToan, DaThanhToan, TrangThai, NgayTao
FROM dbo.DonHang
WHERE TrangThaiHoatDong = 1
  AND (@status IS NULL OR @status = '' OR TrangThai = @status)
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
        cmd.Parameters.AddWithValue("@status", (object?)status ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@q", (object?)q ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@from", (object?)from ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@to", (object?)to ?? DBNull.Value);

        var list = new List<DonHangListDto>();
        await using var rd = await cmd.ExecuteReaderAsync();
        while (await rd.ReadAsync())
        {
            var name = rd.GetString(rd.GetOrdinal("TenKhachHang"));
            var phone = rd.GetString(rd.GetOrdinal("SoDienThoai"));
            var email = rd.IsDBNull(rd.GetOrdinal("Email")) ? null : rd.GetString(rd.GetOrdinal("Email"));

            list.Add(new DonHangListDto
            {
                Id = rd.GetInt32(rd.GetOrdinal("MaDonHang")),
                Code = rd.GetString(rd.GetOrdinal("MaDon")),
                Customer = new OrderCustomerDto
                {
                    Name = name,
                    Phone = phone,
                    Email = email,
                    Avatar = AvatarFromName(name)
                },
                Total = rd.GetDecimal(rd.GetOrdinal("TongTien")),
                Payment = new OrderPaymentDto
                {
                    Method = rd.GetString(rd.GetOrdinal("PhuongThucThanhToan")),
                    Paid = rd.GetBoolean(rd.GetOrdinal("DaThanhToan"))
                },
                Status = rd.GetString(rd.GetOrdinal("TrangThai")),
                CreatedAt = rd.GetDateTime(rd.GetOrdinal("NgayTao"))
            });
        }
        return list;
    }

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

            var name = rd.GetString(rd.GetOrdinal("TenKhachHang"));
            var phone = rd.GetString(rd.GetOrdinal("SoDienThoai"));
            var email = rd.IsDBNull(rd.GetOrdinal("Email")) ? null : rd.GetString(rd.GetOrdinal("Email"));
            var diaChi = rd.IsDBNull(rd.GetOrdinal("DiaChiGiao")) ? null : rd.GetString(rd.GetOrdinal("DiaChiGiao"));
            var note = rd.IsDBNull(rd.GetOrdinal("GhiChu")) ? null : rd.GetString(rd.GetOrdinal("GhiChu"));

            dto = new DonHangDetailDto
            {
                Id = rd.GetInt32(rd.GetOrdinal("MaDonHang")),
                Code = rd.GetString(rd.GetOrdinal("MaDon")),
                Customer = new OrderCustomerDto
                {
                    Name = name,
                    Phone = phone,
                    Email = email,
                    Avatar = AvatarFromName(name)
                },
                ShippingAddress = diaChi,
                Note = note,
                Total = rd.GetDecimal(rd.GetOrdinal("TongTien")),
                Payment = new OrderPaymentDto
                {
                    Method = rd.GetString(rd.GetOrdinal("PhuongThucThanhToan")),
                    Paid = rd.GetBoolean(rd.GetOrdinal("DaThanhToan"))
                },
                Status = rd.GetString(rd.GetOrdinal("TrangThai")),
                CreatedAt = rd.GetDateTime(rd.GetOrdinal("NgayTao")),
                Products = new List<OrderItemDto>()
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
            dto!.Products.Add(new OrderItemDto
            {
                ProductId = rd2.IsDBNull(rd2.GetOrdinal("MaSanPham")) ? null : rd2.GetInt32(rd2.GetOrdinal("MaSanPham")),
                Name = rd2.GetString(rd2.GetOrdinal("TenSanPham")),
                Quantity = rd2.GetInt32(rd2.GetOrdinal("SoLuong")),
                Price = rd2.GetDecimal(rd2.GetOrdinal("DonGia"))
            });
        }

        return dto;
    }

    public async Task<int> CreateAsync(DonHangCreateReq req)
    {
        // validate tối thiểu
        if (string.IsNullOrWhiteSpace(req.Code)) throw new ArgumentException("Code is required");
        if (req.Customer == null) throw new ArgumentException("Customer is required");
        if (string.IsNullOrWhiteSpace(req.Customer.Name)) throw new ArgumentException("Customer.Name is required");
        if (string.IsNullOrWhiteSpace(req.Customer.Phone)) throw new ArgumentException("Customer.Phone is required");
        if (req.Products == null || req.Products.Count == 0) throw new ArgumentException("Products is required");

        // tính tổng
        decimal total = 0;
        foreach (var p in req.Products)
        {
            if (string.IsNullOrWhiteSpace(p.Name)) throw new ArgumentException("Product.Name is required");
            if (p.Quantity <= 0) throw new ArgumentException("Product.Quantity must be > 0");
            if (p.Price < 0) throw new ArgumentException("Product.Price must be >= 0");
            total += p.Price * p.Quantity;
        }

        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            var createdAt = req.CreatedAt ?? DateTime.Now;

            var insertHeader = @"
INSERT INTO dbo.DonHang(MaDon, MaKhachHang, TenKhachHang, Email, SoDienThoai, DiaChiGiao,
                       TongTien, PhuongThucThanhToan, DaThanhToan, TrangThai, GhiChu, NgayTao, TrangThaiHoatDong)
VALUES(@MaDon, @MaKhachHang, @Ten, @Email, @Phone, @DiaChi,
       @TongTien, @PTTT, @Paid, @Status, @Note, @NgayTao, 1);
SELECT CAST(SCOPE_IDENTITY() AS INT);";

            await using var cmd = new SqlCommand(insertHeader, conn, (SqlTransaction)tx);
            cmd.Parameters.AddWithValue("@MaDon", req.Code.Trim());
            cmd.Parameters.AddWithValue("@MaKhachHang", (object?)req.CustomerId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Ten", req.Customer.Name.Trim());
            cmd.Parameters.AddWithValue("@Email", string.IsNullOrWhiteSpace(req.Customer.Email) ? (object)DBNull.Value : req.Customer.Email.Trim());
            cmd.Parameters.AddWithValue("@Phone", req.Customer.Phone.Trim());
            cmd.Parameters.AddWithValue("@DiaChi", string.IsNullOrWhiteSpace(req.ShippingAddress) ? (object)DBNull.Value : req.ShippingAddress.Trim());
            cmd.Parameters.AddWithValue("@TongTien", total);
            cmd.Parameters.AddWithValue("@PTTT", string.IsNullOrWhiteSpace(req.Payment?.Method) ? "COD" : req.Payment.Method.Trim());
            cmd.Parameters.AddWithValue("@Paid", req.Payment?.Paid ?? false);
            cmd.Parameters.AddWithValue("@Status", string.IsNullOrWhiteSpace(req.Status) ? "pending" : req.Status.Trim());
            cmd.Parameters.AddWithValue("@Note", string.IsNullOrWhiteSpace(req.Note) ? (object)DBNull.Value : req.Note.Trim());
            cmd.Parameters.AddWithValue("@NgayTao", createdAt);

            var orderId = (int)(await cmd.ExecuteScalarAsync() ?? 0);

            var insertItem = @"
INSERT INTO dbo.DonHangChiTiet(MaDonHang, MaSanPham, TenSanPham, SoLuong, DonGia)
VALUES(@MaDonHang, @MaSanPham, @TenSP, @SoLuong, @DonGia);";

            foreach (var p in req.Products)
            {
                await using var cmdItem = new SqlCommand(insertItem, conn, (SqlTransaction)tx);
                cmdItem.Parameters.AddWithValue("@MaDonHang", orderId);
                cmdItem.Parameters.AddWithValue("@MaSanPham", (object?)p.ProductId ?? DBNull.Value);
                cmdItem.Parameters.AddWithValue("@TenSP", p.Name.Trim());
                cmdItem.Parameters.AddWithValue("@SoLuong", p.Quantity);
                cmdItem.Parameters.AddWithValue("@DonGia", p.Price);
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

    public async Task<bool> UpdateTrangThaiAsync(int id, string status)
    {
        await using var conn = _factory.CreateConnection();
        await conn.OpenAsync();

        var sql = @"
UPDATE dbo.DonHang
SET TrangThai = @st
WHERE TrangThaiHoatDong = 1 AND MaDonHang = @id;";

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@st", status);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

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

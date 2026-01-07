using Microsoft.Data.SqlClient;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories.Interfaces;

namespace wedduyhuy.Repositories
{
    public class DonHangRepository : IDonHangRepository
    {
        private readonly string _connectionString;

        public DonHangRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        private static string GetTenTrangThai(byte trangThai) => trangThai switch
        {
            0 => "Chờ xác nhận",
            1 => "Đã xác nhận",
            2 => "Đang giao",
            3 => "Đã giao",
            4 => "Đã hủy",
            5 => "Hoàn tiền",
            _ => "Không xác định"
        };

        public async Task<IEnumerable<DonHangDto>> GetAllAsync()
        {
            var list = new List<DonHangDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT dh.DonHangID, dh.MaDonHang, dh.KhachHangID, dh.TrangThai, 
                        dh.DiaChiGiao, dh.GhiChu, dh.TongTien, dh.PhiShip, dh.NgayTao, dh.NgayCapNhat,
                        kh.HoTen as TenKhachHang, kh.SoDienThoai
                        FROM dbo.DonHang dh
                        INNER JOIN dbo.KhachHang kh ON dh.KhachHangID = kh.KhachHangID
                        ORDER BY dh.NgayTao DESC";

            using var cmd = new SqlCommand(sql, conn);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var donHang = MapToDto(reader);
                list.Add(donHang);
            }

            // Load items for each order
            foreach (var dh in list)
            {
                dh.Items = (await GetItemsByDonHangIdAsync(dh.DonHangID)).ToList();
            }

            return list;
        }

        public async Task<DonHangDto?> GetByIdAsync(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT dh.DonHangID, dh.MaDonHang, dh.KhachHangID, dh.TrangThai, 
                        dh.DiaChiGiao, dh.GhiChu, dh.TongTien, dh.PhiShip, dh.NgayTao, dh.NgayCapNhat,
                        kh.HoTen as TenKhachHang, kh.SoDienThoai
                        FROM dbo.DonHang dh
                        INNER JOIN dbo.KhachHang kh ON dh.KhachHangID = kh.KhachHangID
                        WHERE dh.DonHangID = @Id";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = await cmd.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var donHang = MapToDto(reader);
                donHang.Items = (await GetItemsByDonHangIdAsync(id)).ToList();
                return donHang;
            }
            return null;
        }

        public async Task<DonHangDto?> GetByMaDonHangAsync(string maDonHang)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT dh.DonHangID, dh.MaDonHang, dh.KhachHangID, dh.TrangThai, 
                        dh.DiaChiGiao, dh.GhiChu, dh.TongTien, dh.PhiShip, dh.NgayTao, dh.NgayCapNhat,
                        kh.HoTen as TenKhachHang, kh.SoDienThoai
                        FROM dbo.DonHang dh
                        INNER JOIN dbo.KhachHang kh ON dh.KhachHangID = kh.KhachHangID
                        WHERE dh.MaDonHang = @MaDonHang";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@MaDonHang", maDonHang);
            using var reader = await cmd.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var donHang = MapToDto(reader);
                donHang.Items = (await GetItemsByDonHangIdAsync(donHang.DonHangID)).ToList();
                return donHang;
            }
            return null;
        }

        public async Task<int> CreateAsync(CreateDonHangDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                // Generate MaDonHang
                var maDonHang = $"DH{DateTime.Now:yyyyMMddHHmmss}";

                // Insert DonHang
                var sqlDonHang = @"INSERT INTO dbo.DonHang (MaDonHang, KhachHangID, DiaChiGiao, GhiChu, PhiShip)
                                   OUTPUT INSERTED.DonHangID
                                   VALUES (@MaDonHang, @KhachHangID, @DiaChiGiao, @GhiChu, @PhiShip)";

                using var cmdDonHang = new SqlCommand(sqlDonHang, conn, transaction);
                cmdDonHang.Parameters.AddWithValue("@MaDonHang", maDonHang);
                cmdDonHang.Parameters.AddWithValue("@KhachHangID", dto.KhachHangID);
                cmdDonHang.Parameters.AddWithValue("@DiaChiGiao", dto.DiaChiGiao);
                cmdDonHang.Parameters.AddWithValue("@GhiChu", (object?)dto.GhiChu ?? DBNull.Value);
                cmdDonHang.Parameters.AddWithValue("@PhiShip", dto.PhiShip);

                var donHangId = Convert.ToInt32(await cmdDonHang.ExecuteScalarAsync());

                // Insert DonHangItems
                decimal tongTien = 0;
                foreach (var item in dto.Items)
                {
                    // Get product info
                    var sqlSp = "SELECT SKU, TenSanPham, GiaBan FROM dbo.SanPham WHERE SanPhamID = @SanPhamID";
                    using var cmdSp = new SqlCommand(sqlSp, conn, transaction);
                    cmdSp.Parameters.AddWithValue("@SanPhamID", item.SanPhamID);
                    using var readerSp = await cmdSp.ExecuteReaderAsync();
                    
                    if (await readerSp.ReadAsync())
                    {
                        var sku = readerSp.GetString(0);
                        var tenSp = readerSp.GetString(1);
                        var giaBan = readerSp.GetDecimal(2);
                        readerSp.Close();

                        var sqlItem = @"INSERT INTO dbo.DonHangItem (DonHangID, SanPhamID, SKU, TenSanPham, DonGia, SoLuong)
                                        VALUES (@DonHangID, @SanPhamID, @SKU, @TenSanPham, @DonGia, @SoLuong)";

                        using var cmdItem = new SqlCommand(sqlItem, conn, transaction);
                        cmdItem.Parameters.AddWithValue("@DonHangID", donHangId);
                        cmdItem.Parameters.AddWithValue("@SanPhamID", item.SanPhamID);
                        cmdItem.Parameters.AddWithValue("@SKU", sku);
                        cmdItem.Parameters.AddWithValue("@TenSanPham", tenSp);
                        cmdItem.Parameters.AddWithValue("@DonGia", giaBan);
                        cmdItem.Parameters.AddWithValue("@SoLuong", item.SoLuong);
                        await cmdItem.ExecuteNonQueryAsync();

                        tongTien += giaBan * item.SoLuong;
                    }
                }

                // Update TongTien
                var sqlUpdate = "UPDATE dbo.DonHang SET TongTien = @TongTien WHERE DonHangID = @DonHangID";
                using var cmdUpdate = new SqlCommand(sqlUpdate, conn, transaction);
                cmdUpdate.Parameters.AddWithValue("@TongTien", tongTien);
                cmdUpdate.Parameters.AddWithValue("@DonHangID", donHangId);
                await cmdUpdate.ExecuteNonQueryAsync();

                // Insert tracking
                var sqlTracking = @"INSERT INTO dbo.DonHangTrangThai (DonHangID, TrangThai, GhiChu)
                                    VALUES (@DonHangID, 0, N'Đơn hàng được tạo')";
                using var cmdTracking = new SqlCommand(sqlTracking, conn, transaction);
                cmdTracking.Parameters.AddWithValue("@DonHangID", donHangId);
                await cmdTracking.ExecuteNonQueryAsync();

                transaction.Commit();
                return donHangId;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> UpdateTrangThaiAsync(int id, UpdateTrangThaiDonHangDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                // Update DonHang
                var sqlUpdate = @"UPDATE dbo.DonHang SET TrangThai = @TrangThai, NgayCapNhat = SYSDATETIME()
                                  WHERE DonHangID = @Id";
                using var cmdUpdate = new SqlCommand(sqlUpdate, conn, transaction);
                cmdUpdate.Parameters.AddWithValue("@Id", id);
                cmdUpdate.Parameters.AddWithValue("@TrangThai", dto.TrangThai);
                var rows = await cmdUpdate.ExecuteNonQueryAsync();

                if (rows > 0)
                {
                    // Insert tracking
                    var sqlTracking = @"INSERT INTO dbo.DonHangTrangThai (DonHangID, TrangThai, GhiChu)
                                        VALUES (@DonHangID, @TrangThai, @GhiChu)";
                    using var cmdTracking = new SqlCommand(sqlTracking, conn, transaction);
                    cmdTracking.Parameters.AddWithValue("@DonHangID", id);
                    cmdTracking.Parameters.AddWithValue("@TrangThai", dto.TrangThai);
                    cmdTracking.Parameters.AddWithValue("@GhiChu", (object?)dto.GhiChu ?? DBNull.Value);
                    await cmdTracking.ExecuteNonQueryAsync();
                }

                transaction.Commit();
                return rows > 0;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<IEnumerable<DonHangDto>> GetByKhachHangAsync(int khachHangId)
        {
            var list = new List<DonHangDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT dh.DonHangID, dh.MaDonHang, dh.KhachHangID, dh.TrangThai, 
                        dh.DiaChiGiao, dh.GhiChu, dh.TongTien, dh.PhiShip, dh.NgayTao, dh.NgayCapNhat,
                        kh.HoTen as TenKhachHang, kh.SoDienThoai
                        FROM dbo.DonHang dh
                        INNER JOIN dbo.KhachHang kh ON dh.KhachHangID = kh.KhachHangID
                        WHERE dh.KhachHangID = @KhachHangId ORDER BY dh.NgayTao DESC";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@KhachHangId", khachHangId);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }

            foreach (var dh in list)
            {
                dh.Items = (await GetItemsByDonHangIdAsync(dh.DonHangID)).ToList();
            }

            return list;
        }

        public async Task<IEnumerable<DonHangDto>> GetByTrangThaiAsync(byte trangThai)
        {
            var list = new List<DonHangDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT dh.DonHangID, dh.MaDonHang, dh.KhachHangID, dh.TrangThai, 
                        dh.DiaChiGiao, dh.GhiChu, dh.TongTien, dh.PhiShip, dh.NgayTao, dh.NgayCapNhat,
                        kh.HoTen as TenKhachHang, kh.SoDienThoai
                        FROM dbo.DonHang dh
                        INNER JOIN dbo.KhachHang kh ON dh.KhachHangID = kh.KhachHangID
                        WHERE dh.TrangThai = @TrangThai ORDER BY dh.NgayTao DESC";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@TrangThai", trangThai);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }

            foreach (var dh in list)
            {
                dh.Items = (await GetItemsByDonHangIdAsync(dh.DonHangID)).ToList();
            }

            return list;
        }

        private async Task<IEnumerable<DonHangItemDto>> GetItemsByDonHangIdAsync(int donHangId)
        {
            var list = new List<DonHangItemDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT DonHangItemID, SanPhamID, SKU, TenSanPham, DonGia, SoLuong, ThanhTien
                        FROM dbo.DonHangItem WHERE DonHangID = @DonHangID";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@DonHangID", donHangId);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new DonHangItemDto
                {
                    DonHangItemID = reader.GetInt32(reader.GetOrdinal("DonHangItemID")),
                    SanPhamID = reader.GetInt32(reader.GetOrdinal("SanPhamID")),
                    SKU = reader.GetString(reader.GetOrdinal("SKU")),
                    TenSanPham = reader.GetString(reader.GetOrdinal("TenSanPham")),
                    DonGia = reader.GetDecimal(reader.GetOrdinal("DonGia")),
                    SoLuong = reader.GetInt32(reader.GetOrdinal("SoLuong")),
                    ThanhTien = reader.GetDecimal(reader.GetOrdinal("ThanhTien"))
                });
            }
            return list;
        }

        private DonHangDto MapToDto(SqlDataReader r)
        {
            var trangThai = r.GetByte(r.GetOrdinal("TrangThai"));
            return new DonHangDto
            {
                DonHangID = r.GetInt32(r.GetOrdinal("DonHangID")),
                MaDonHang = r.GetString(r.GetOrdinal("MaDonHang")),
                KhachHangID = r.GetInt32(r.GetOrdinal("KhachHangID")),
                TenKhachHang = r.GetString(r.GetOrdinal("TenKhachHang")),
                SoDienThoai = r.GetString(r.GetOrdinal("SoDienThoai")),
                TrangThai = trangThai,
                TenTrangThai = GetTenTrangThai(trangThai),
                DiaChiGiao = r.GetString(r.GetOrdinal("DiaChiGiao")),
                GhiChu = r.IsDBNull(r.GetOrdinal("GhiChu")) ? null : r.GetString(r.GetOrdinal("GhiChu")),
                TongTien = r.GetDecimal(r.GetOrdinal("TongTien")),
                PhiShip = r.GetDecimal(r.GetOrdinal("PhiShip")),
                NgayTao = r.GetDateTime(r.GetOrdinal("NgayTao")),
                NgayCapNhat = r.IsDBNull(r.GetOrdinal("NgayCapNhat")) ? null : r.GetDateTime(r.GetOrdinal("NgayCapNhat"))
            };
        }
    }
}

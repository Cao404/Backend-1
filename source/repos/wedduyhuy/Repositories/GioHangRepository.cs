using Microsoft.Data.SqlClient;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories.Interfaces;

namespace wedduyhuy.Repositories
{
    public class GioHangRepository : IGioHangRepository
    {
        private readonly string _connectionString;

        public GioHangRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<GioHangDto?> GetByKhachHangAsync(int khachHangId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            // Get or create cart
            var sqlCart = @"SELECT gh.GioHangID, gh.KhachHangID, gh.TrangThai, gh.NgayTao, gh.NgayCapNhat,
                            kh.HoTen as TenKhachHang
                            FROM dbo.GioHang gh
                            INNER JOIN dbo.KhachHang kh ON gh.KhachHangID = kh.KhachHangID
                            WHERE gh.KhachHangID = @KhachHangId AND gh.TrangThai = 1";

            using var cmdCart = new SqlCommand(sqlCart, conn);
            cmdCart.Parameters.AddWithValue("@KhachHangId", khachHangId);
            using var readerCart = await cmdCart.ExecuteReaderAsync();

            GioHangDto? gioHang = null;
            if (await readerCart.ReadAsync())
            {
                gioHang = new GioHangDto
                {
                    GioHangID = readerCart.GetInt32(readerCart.GetOrdinal("GioHangID")),
                    KhachHangID = readerCart.GetInt32(readerCart.GetOrdinal("KhachHangID")),
                    TenKhachHang = readerCart.GetString(readerCart.GetOrdinal("TenKhachHang")),
                    TrangThai = readerCart.GetBoolean(readerCart.GetOrdinal("TrangThai")),
                    NgayTao = readerCart.GetDateTime(readerCart.GetOrdinal("NgayTao")),
                    NgayCapNhat = readerCart.IsDBNull(readerCart.GetOrdinal("NgayCapNhat")) ? null : readerCart.GetDateTime(readerCart.GetOrdinal("NgayCapNhat"))
                };
            }
            readerCart.Close();

            if (gioHang == null) return null;

            // Get cart items
            var sqlItems = @"SELECT gi.GioHangItemID, gi.SanPhamID, gi.SoLuong, gi.DonGia, gi.NgayTao,
                             sp.SKU, sp.TenSanPham
                             FROM dbo.GioHangItem gi
                             INNER JOIN dbo.SanPham sp ON gi.SanPhamID = sp.SanPhamID
                             WHERE gi.GioHangID = @GioHangID";

            using var cmdItems = new SqlCommand(sqlItems, conn);
            cmdItems.Parameters.AddWithValue("@GioHangID", gioHang.GioHangID);
            using var readerItems = await cmdItems.ExecuteReaderAsync();

            while (await readerItems.ReadAsync())
            {
                gioHang.Items.Add(new GioHangItemDto
                {
                    GioHangItemID = readerItems.GetInt32(readerItems.GetOrdinal("GioHangItemID")),
                    SanPhamID = readerItems.GetInt32(readerItems.GetOrdinal("SanPhamID")),
                    SKU = readerItems.GetString(readerItems.GetOrdinal("SKU")),
                    TenSanPham = readerItems.GetString(readerItems.GetOrdinal("TenSanPham")),
                    SoLuong = readerItems.GetInt32(readerItems.GetOrdinal("SoLuong")),
                    DonGia = readerItems.GetDecimal(readerItems.GetOrdinal("DonGia")),
                    NgayTao = readerItems.GetDateTime(readerItems.GetOrdinal("NgayTao"))
                });
            }

            return gioHang;
        }

        public async Task<int> AddToCartAsync(AddToCartDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            // Get or create cart
            var sqlGetCart = "SELECT GioHangID FROM dbo.GioHang WHERE KhachHangID = @KhachHangId AND TrangThai = 1";
            using var cmdGetCart = new SqlCommand(sqlGetCart, conn);
            cmdGetCart.Parameters.AddWithValue("@KhachHangId", dto.KhachHangID);
            var cartId = await cmdGetCart.ExecuteScalarAsync();

            int gioHangId;
            if (cartId == null)
            {
                // Create new cart
                var sqlCreateCart = @"INSERT INTO dbo.GioHang (KhachHangID, TrangThai)
                                      OUTPUT INSERTED.GioHangID VALUES (@KhachHangId, 1)";
                using var cmdCreateCart = new SqlCommand(sqlCreateCart, conn);
                cmdCreateCart.Parameters.AddWithValue("@KhachHangId", dto.KhachHangID);
                gioHangId = Convert.ToInt32(await cmdCreateCart.ExecuteScalarAsync());
            }
            else
            {
                gioHangId = Convert.ToInt32(cartId);
            }

            // Check if product already in cart
            var sqlCheckItem = "SELECT GioHangItemID, SoLuong FROM dbo.GioHangItem WHERE GioHangID = @GioHangID AND SanPhamID = @SanPhamID";
            using var cmdCheckItem = new SqlCommand(sqlCheckItem, conn);
            cmdCheckItem.Parameters.AddWithValue("@GioHangID", gioHangId);
            cmdCheckItem.Parameters.AddWithValue("@SanPhamID", dto.SanPhamID);
            using var readerCheck = await cmdCheckItem.ExecuteReaderAsync();

            if (await readerCheck.ReadAsync())
            {
                // Update quantity
                var itemId = readerCheck.GetInt32(0);
                var currentQty = readerCheck.GetInt32(1);
                readerCheck.Close();

                var sqlUpdateQty = "UPDATE dbo.GioHangItem SET SoLuong = @SoLuong WHERE GioHangItemID = @ItemId";
                using var cmdUpdateQty = new SqlCommand(sqlUpdateQty, conn);
                cmdUpdateQty.Parameters.AddWithValue("@SoLuong", currentQty + dto.SoLuong);
                cmdUpdateQty.Parameters.AddWithValue("@ItemId", itemId);
                await cmdUpdateQty.ExecuteNonQueryAsync();
                return itemId;
            }
            else
            {
                readerCheck.Close();

                // Get product price
                var sqlGetPrice = "SELECT GiaBan FROM dbo.SanPham WHERE SanPhamID = @SanPhamID";
                using var cmdGetPrice = new SqlCommand(sqlGetPrice, conn);
                cmdGetPrice.Parameters.AddWithValue("@SanPhamID", dto.SanPhamID);
                var price = Convert.ToDecimal(await cmdGetPrice.ExecuteScalarAsync());

                // Add new item
                var sqlAddItem = @"INSERT INTO dbo.GioHangItem (GioHangID, SanPhamID, SoLuong, DonGia)
                                   OUTPUT INSERTED.GioHangItemID
                                   VALUES (@GioHangID, @SanPhamID, @SoLuong, @DonGia)";
                using var cmdAddItem = new SqlCommand(sqlAddItem, conn);
                cmdAddItem.Parameters.AddWithValue("@GioHangID", gioHangId);
                cmdAddItem.Parameters.AddWithValue("@SanPhamID", dto.SanPhamID);
                cmdAddItem.Parameters.AddWithValue("@SoLuong", dto.SoLuong);
                cmdAddItem.Parameters.AddWithValue("@DonGia", price);
                return Convert.ToInt32(await cmdAddItem.ExecuteScalarAsync());
            }
        }

        public async Task<bool> UpdateCartItemAsync(int gioHangItemId, UpdateCartItemDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = "UPDATE dbo.GioHangItem SET SoLuong = @SoLuong WHERE GioHangItemID = @ItemId";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@SoLuong", dto.SoLuong);
            cmd.Parameters.AddWithValue("@ItemId", gioHangItemId);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> RemoveCartItemAsync(int gioHangItemId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = "DELETE FROM dbo.GioHangItem WHERE GioHangItemID = @ItemId";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@ItemId", gioHangItemId);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> ClearCartAsync(int khachHangId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"DELETE gi FROM dbo.GioHangItem gi
                        INNER JOIN dbo.GioHang gh ON gi.GioHangID = gh.GioHangID
                        WHERE gh.KhachHangID = @KhachHangId AND gh.TrangThai = 1";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@KhachHangId", khachHangId);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }
    }
}

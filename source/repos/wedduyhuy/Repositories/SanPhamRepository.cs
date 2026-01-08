using Microsoft.Data.SqlClient;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories.Interfaces;

namespace wedduyhuy.Repositories
{
    public class SanPhamRepository : ISanPhamRepository
    {
        private readonly string _connectionString;

        public SanPhamRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<IEnumerable<SanPhamDto>> GetAllAsync()
        {
            var list = new List<SanPhamDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT sp.SanPhamID, sp.SKU, sp.TenSanPham, sp.DanhMucID, sp.GiaBan, 
                        sp.Kho, sp.DaBan, sp.TrangThai, sp.NgayTao, sp.NgayCapNhat, dm.TenDanhMuc
                        FROM dbo.SanPham sp
                        INNER JOIN dbo.DanhMuc dm ON sp.DanhMucID = dm.DanhMucID
                        WHERE sp.IsDeleted = 0 ORDER BY sp.NgayTao DESC";

            using var cmd = new SqlCommand(sql, conn);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }
            return list;
        }

        public async Task<SanPhamDto?> GetByIdAsync(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT sp.SanPhamID, sp.SKU, sp.TenSanPham, sp.DanhMucID, sp.GiaBan, 
                        sp.Kho, sp.DaBan, sp.TrangThai, sp.NgayTao, sp.NgayCapNhat, dm.TenDanhMuc
                        FROM dbo.SanPham sp
                        INNER JOIN dbo.DanhMuc dm ON sp.DanhMucID = dm.DanhMucID
                        WHERE sp.SanPhamID = @Id AND sp.IsDeleted = 0";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync()) return MapToDto(reader);
            return null;
        }

        public async Task<SanPhamDto?> GetBySKUAsync(string sku)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT sp.SanPhamID, sp.SKU, sp.TenSanPham, sp.DanhMucID, sp.GiaBan, 
                        sp.Kho, sp.DaBan, sp.TrangThai, sp.NgayTao, sp.NgayCapNhat, dm.TenDanhMuc
                        FROM dbo.SanPham sp
                        INNER JOIN dbo.DanhMuc dm ON sp.DanhMucID = dm.DanhMucID
                        WHERE sp.SKU = @SKU AND sp.IsDeleted = 0";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@SKU", sku);
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync()) return MapToDto(reader);
            return null;
        }

        public async Task<int> CreateAsync(CreateSanPhamDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"INSERT INTO dbo.SanPham (SKU, TenSanPham, DanhMucID, GiaBan, Kho)
                        OUTPUT INSERTED.SanPhamID
                        VALUES (@SKU, @TenSanPham, @DanhMucID, @GiaBan, @Kho)";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@SKU", dto.SKU);
            cmd.Parameters.AddWithValue("@TenSanPham", dto.TenSanPham);
            cmd.Parameters.AddWithValue("@DanhMucID", dto.DanhMucID);
            cmd.Parameters.AddWithValue("@GiaBan", dto.GiaBan);
            cmd.Parameters.AddWithValue("@Kho", dto.Kho);

            return Convert.ToInt32(await cmd.ExecuteScalarAsync());
        }

        public async Task<bool> UpdateAsync(int id, UpdateSanPhamDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"UPDATE dbo.SanPham SET TenSanPham = @TenSanPham, DanhMucID = @DanhMucID, 
                        GiaBan = @GiaBan, Kho = @Kho, TrangThai = @TrangThai, NgayCapNhat = SYSDATETIME()
                        WHERE SanPhamID = @Id AND IsDeleted = 0";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@TenSanPham", dto.TenSanPham);
            cmd.Parameters.AddWithValue("@DanhMucID", dto.DanhMucID);
            cmd.Parameters.AddWithValue("@GiaBan", dto.GiaBan);
            cmd.Parameters.AddWithValue("@Kho", dto.Kho);
            cmd.Parameters.AddWithValue("@TrangThai", dto.TrangThai);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = "UPDATE dbo.SanPham SET IsDeleted = 1, NgayCapNhat = SYSDATETIME() WHERE SanPhamID = @Id";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<IEnumerable<SanPhamDto>> GetByDanhMucAsync(int danhMucId)
        {
            var list = new List<SanPhamDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT sp.SanPhamID, sp.SKU, sp.TenSanPham, sp.DanhMucID, sp.GiaBan, 
                        sp.Kho, sp.DaBan, sp.TrangThai, sp.NgayTao, sp.NgayCapNhat, dm.TenDanhMuc
                        FROM dbo.SanPham sp
                        INNER JOIN dbo.DanhMuc dm ON sp.DanhMucID = dm.DanhMucID
                        WHERE sp.DanhMucID = @DanhMucId AND sp.IsDeleted = 0";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@DanhMucId", danhMucId);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }
            return list;
        }

        public async Task<IEnumerable<SanPhamDto>> SearchAsync(string keyword)
        {
            var list = new List<SanPhamDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT sp.SanPhamID, sp.SKU, sp.TenSanPham, sp.DanhMucID, sp.GiaBan, 
                        sp.Kho, sp.DaBan, sp.TrangThai, sp.NgayTao, sp.NgayCapNhat, dm.TenDanhMuc
                        FROM dbo.SanPham sp
                        INNER JOIN dbo.DanhMuc dm ON sp.DanhMucID = dm.DanhMucID
                        WHERE sp.IsDeleted = 0 AND (sp.TenSanPham LIKE @Keyword OR sp.SKU LIKE @Keyword)";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Keyword", $"%{keyword}%");
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }
            return list;
        }

        private static SanPhamDto MapToDto(SqlDataReader r)
        {
            return new SanPhamDto
            {
                SanPhamID = r.GetInt32(r.GetOrdinal("SanPhamID")),
                SKU = r.GetString(r.GetOrdinal("SKU")),
                TenSanPham = r.GetString(r.GetOrdinal("TenSanPham")),
                DanhMucID = r.GetInt32(r.GetOrdinal("DanhMucID")),
                TenDanhMuc = r.GetString(r.GetOrdinal("TenDanhMuc")),
                GiaBan = r.GetDecimal(r.GetOrdinal("GiaBan")),
                Kho = r.GetInt32(r.GetOrdinal("Kho")),
                DaBan = r.GetInt32(r.GetOrdinal("DaBan")),
                TrangThai = r.GetBoolean(r.GetOrdinal("TrangThai")),
                NgayTao = r.GetDateTime(r.GetOrdinal("NgayTao")),
                NgayCapNhat = r.IsDBNull(r.GetOrdinal("NgayCapNhat")) ? null : r.GetDateTime(r.GetOrdinal("NgayCapNhat"))
            };
        }
    }
}

using Microsoft.Data.SqlClient;
using wedduyhuy.DTOs;

namespace wedduyhuy.Repositories
{
    public class KhachHangRepository : IKhachHangRepository
    {
        private readonly string _connectionString;

        public KhachHangRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<IEnumerable<KhachHangDto>> GetAllAsync()
        {
            var list = new List<KhachHangDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT KhachHangID, HoTen, Email, SoDienThoai, DiaChi, Loai, 
                        NgayThamGia, DonGanNhat, SoDon, DanhGia, TongChiTieu, TrangThai
                        FROM dbo.KhachHang WHERE TrangThai = 1 ORDER BY NgayThamGia DESC";

            using var cmd = new SqlCommand(sql, conn);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }
            return list;
        }

        public async Task<KhachHangDto?> GetByIdAsync(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT KhachHangID, HoTen, Email, SoDienThoai, DiaChi, Loai, 
                        NgayThamGia, DonGanNhat, SoDon, DanhGia, TongChiTieu, TrangThai
                        FROM dbo.KhachHang WHERE KhachHangID = @Id";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync()) return MapToDto(reader);
            return null;
        }

        public async Task<KhachHangDto?> GetByPhoneAsync(string phone)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT KhachHangID, HoTen, Email, SoDienThoai, DiaChi, Loai, 
                        NgayThamGia, DonGanNhat, SoDon, DanhGia, TongChiTieu, TrangThai
                        FROM dbo.KhachHang WHERE SoDienThoai = @Phone AND TrangThai = 1";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Phone", phone);
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync()) return MapToDto(reader);
            return null;
        }

        public async Task<int> CreateAsync(CreateKhachHangDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"INSERT INTO dbo.KhachHang (HoTen, Email, SoDienThoai, DiaChi, Loai)
                        OUTPUT INSERTED.KhachHangID
                        VALUES (@HoTen, @Email, @SoDienThoai, @DiaChi, @Loai)";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@HoTen", dto.HoTen);
            cmd.Parameters.AddWithValue("@Email", (object?)dto.Email ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@SoDienThoai", dto.SoDienThoai);
            cmd.Parameters.AddWithValue("@DiaChi", (object?)dto.DiaChi ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Loai", dto.Loai);

            return Convert.ToInt32(await cmd.ExecuteScalarAsync());
        }

        public async Task<bool> UpdateAsync(int id, UpdateKhachHangDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"UPDATE dbo.KhachHang SET HoTen = @HoTen, Email = @Email, 
                        DiaChi = @DiaChi, Loai = @Loai, TrangThai = @TrangThai
                        WHERE KhachHangID = @Id";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@HoTen", dto.HoTen);
            cmd.Parameters.AddWithValue("@Email", (object?)dto.Email ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@DiaChi", (object?)dto.DiaChi ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Loai", dto.Loai);
            cmd.Parameters.AddWithValue("@TrangThai", dto.TrangThai);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = "UPDATE dbo.KhachHang SET TrangThai = 0 WHERE KhachHangID = @Id";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<IEnumerable<KhachHangDto>> GetByLoaiAsync(string loai)
        {
            var list = new List<KhachHangDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT KhachHangID, HoTen, Email, SoDienThoai, DiaChi, Loai, 
                        NgayThamGia, DonGanNhat, SoDon, DanhGia, TongChiTieu, TrangThai
                        FROM dbo.KhachHang WHERE Loai = @Loai AND TrangThai = 1";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Loai", loai);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }
            return list;
        }

        public async Task<IEnumerable<KhachHangDto>> SearchAsync(string keyword)
        {
            var list = new List<KhachHangDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT KhachHangID, HoTen, Email, SoDienThoai, DiaChi, Loai, 
                        NgayThamGia, DonGanNhat, SoDon, DanhGia, TongChiTieu, TrangThai
                        FROM dbo.KhachHang WHERE TrangThai = 1 
                        AND (HoTen LIKE @Keyword OR SoDienThoai LIKE @Keyword OR Email LIKE @Keyword)";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Keyword", $"%{keyword}%");
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }
            return list;
        }

        private static KhachHangDto MapToDto(SqlDataReader r)
        {
            return new KhachHangDto
            {
                KhachHangID = r.GetInt32(r.GetOrdinal("KhachHangID")),
                HoTen = r.GetString(r.GetOrdinal("HoTen")),
                Email = r.IsDBNull(r.GetOrdinal("Email")) ? null : r.GetString(r.GetOrdinal("Email")),
                SoDienThoai = r.GetString(r.GetOrdinal("SoDienThoai")),
                DiaChi = r.IsDBNull(r.GetOrdinal("DiaChi")) ? null : r.GetString(r.GetOrdinal("DiaChi")),
                Loai = r.GetString(r.GetOrdinal("Loai")),
                NgayThamGia = r.GetDateTime(r.GetOrdinal("NgayThamGia")),
                DonGanNhat = r.IsDBNull(r.GetOrdinal("DonGanNhat")) ? null : r.GetDateTime(r.GetOrdinal("DonGanNhat")),
                SoDon = r.GetInt32(r.GetOrdinal("SoDon")),
                DanhGia = r.GetDecimal(r.GetOrdinal("DanhGia")),
                TongChiTieu = r.GetDecimal(r.GetOrdinal("TongChiTieu")),
                TrangThai = r.GetBoolean(r.GetOrdinal("TrangThai"))
            };
        }
    }
}

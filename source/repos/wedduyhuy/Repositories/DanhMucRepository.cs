using Microsoft.Data.SqlClient;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories.Interfaces;

namespace wedduyhuy.Repositories
{
    public class DanhMucRepository : IDanhMucRepository
    {
        private readonly string _connectionString;

        public DanhMucRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        public async Task<IEnumerable<DanhMucDto>> GetAllAsync()
        {
            var list = new List<DanhMucDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT dm.DanhMucID, dm.MaDanhMuc, dm.TenDanhMuc, dm.DanhMucChaID, 
                        dm.TrangThai, dm.NgayTao, dm.NgayCapNhat, cha.TenDanhMuc as TenDanhMucCha
                        FROM dbo.DanhMuc dm
                        LEFT JOIN dbo.DanhMuc cha ON dm.DanhMucChaID = cha.DanhMucID
                        WHERE dm.IsDeleted = 0 ORDER BY dm.TenDanhMuc";

            using var cmd = new SqlCommand(sql, conn);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }
            return list;
        }

        public async Task<DanhMucDto?> GetByIdAsync(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT dm.DanhMucID, dm.MaDanhMuc, dm.TenDanhMuc, dm.DanhMucChaID, 
                        dm.TrangThai, dm.NgayTao, dm.NgayCapNhat, cha.TenDanhMuc as TenDanhMucCha
                        FROM dbo.DanhMuc dm
                        LEFT JOIN dbo.DanhMuc cha ON dm.DanhMucChaID = cha.DanhMucID
                        WHERE dm.DanhMucID = @Id AND dm.IsDeleted = 0";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync()) return MapToDto(reader);
            return null;
        }

        public async Task<int> CreateAsync(CreateDanhMucDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"INSERT INTO dbo.DanhMuc (MaDanhMuc, TenDanhMuc, DanhMucChaID)
                        OUTPUT INSERTED.DanhMucID
                        VALUES (@MaDanhMuc, @TenDanhMuc, @DanhMucChaID)";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@MaDanhMuc", (object?)dto.MaDanhMuc ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@TenDanhMuc", dto.TenDanhMuc);
            cmd.Parameters.AddWithValue("@DanhMucChaID", (object?)dto.DanhMucChaID ?? DBNull.Value);

            return Convert.ToInt32(await cmd.ExecuteScalarAsync());
        }

        public async Task<bool> UpdateAsync(int id, UpdateDanhMucDto dto)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"UPDATE dbo.DanhMuc SET MaDanhMuc = @MaDanhMuc, TenDanhMuc = @TenDanhMuc, 
                        DanhMucChaID = @DanhMucChaID, TrangThai = @TrangThai, NgayCapNhat = SYSDATETIME()
                        WHERE DanhMucID = @Id AND IsDeleted = 0";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@MaDanhMuc", (object?)dto.MaDanhMuc ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@TenDanhMuc", dto.TenDanhMuc);
            cmd.Parameters.AddWithValue("@DanhMucChaID", (object?)dto.DanhMucChaID ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@TrangThai", dto.TrangThai);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = "UPDATE dbo.DanhMuc SET IsDeleted = 1, NgayCapNhat = SYSDATETIME() WHERE DanhMucID = @Id";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<IEnumerable<DanhMucDto>> GetByParentIdAsync(int? parentId)
        {
            var list = new List<DanhMucDto>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = @"SELECT dm.DanhMucID, dm.MaDanhMuc, dm.TenDanhMuc, dm.DanhMucChaID, 
                        dm.TrangThai, dm.NgayTao, dm.NgayCapNhat, cha.TenDanhMuc as TenDanhMucCha
                        FROM dbo.DanhMuc dm
                        LEFT JOIN dbo.DanhMuc cha ON dm.DanhMucChaID = cha.DanhMucID
                        WHERE dm.IsDeleted = 0 AND (@ParentId IS NULL AND dm.DanhMucChaID IS NULL OR dm.DanhMucChaID = @ParentId)
                        ORDER BY dm.TenDanhMuc";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@ParentId", (object?)parentId ?? DBNull.Value);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapToDto(reader));
            }
            return list;
        }

        private static DanhMucDto MapToDto(SqlDataReader r)
        {
            return new DanhMucDto
            {
                DanhMucID = r.GetInt32(r.GetOrdinal("DanhMucID")),
                MaDanhMuc = r.IsDBNull(r.GetOrdinal("MaDanhMuc")) ? null : r.GetString(r.GetOrdinal("MaDanhMuc")),
                TenDanhMuc = r.GetString(r.GetOrdinal("TenDanhMuc")),
                DanhMucChaID = r.IsDBNull(r.GetOrdinal("DanhMucChaID")) ? null : r.GetInt32(r.GetOrdinal("DanhMucChaID")),
                TenDanhMucCha = r.IsDBNull(r.GetOrdinal("TenDanhMucCha")) ? null : r.GetString(r.GetOrdinal("TenDanhMucCha")),
                TrangThai = r.GetBoolean(r.GetOrdinal("TrangThai")),
                NgayTao = r.GetDateTime(r.GetOrdinal("NgayTao")),
                NgayCapNhat = r.IsDBNull(r.GetOrdinal("NgayCapNhat")) ? null : r.GetDateTime(r.GetOrdinal("NgayCapNhat"))
            };
        }
    }
}

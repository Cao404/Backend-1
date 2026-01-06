using Microsoft.Data.SqlClient;
using System.Data;
using wedduyhuy.DTOs;

namespace wedduyhuy.Repositories
{
    public class DanhMucRepository : IDanhMucRepository
    {
        private readonly string _connectionString;

        public DanhMucRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException("Connection string not found");
        }

        public async Task<IEnumerable<DanhMucDto>> GetAllAsync()
        {
            var danhMucs = new List<DanhMucDto>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var sql = @"
                SELECT dm.DanhMucID, dm.MaDanhMuc, dm.TenDanhMuc, dm.DanhMucChaID, 
                       dm.TrangThai, dm.NgayTao, dm.NgayCapNhat,
                       cha.TenDanhMuc as TenDanhMucCha
                FROM dbo.DanhMuc dm
                LEFT JOIN dbo.DanhMuc cha ON dm.DanhMucChaID = cha.DanhMucID
                WHERE dm.IsDeleted = 0
                ORDER BY dm.TenDanhMuc";
            
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                danhMucs.Add(new DanhMucDto
                {
                    DanhMucID = reader.GetInt32("DanhMucID"),
                    MaDanhMuc = reader.IsDBNull("MaDanhMuc") ? null : reader.GetString("MaDanhMuc"),
                    TenDanhMuc = reader.GetString("TenDanhMuc"),
                    DanhMucChaID = reader.IsDBNull("DanhMucChaID") ? null : reader.GetInt32("DanhMucChaID"),
                    TenDanhMucCha = reader.IsDBNull("TenDanhMucCha") ? null : reader.GetString("TenDanhMucCha"),
                    TrangThai = reader.GetBoolean("TrangThai"),
                    NgayTao = reader.GetDateTime("NgayTao"),
                    NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? null : reader.GetDateTime("NgayCapNhat")
                });
            }
            
            return danhMucs;
        }

        public async Task<DanhMucDto?> GetByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var sql = @"
                SELECT dm.DanhMucID, dm.MaDanhMuc, dm.TenDanhMuc, dm.DanhMucChaID, 
                       dm.TrangThai, dm.NgayTao, dm.NgayCapNhat,
                       cha.TenDanhMuc as TenDanhMucCha
                FROM dbo.DanhMuc dm
                LEFT JOIN dbo.DanhMuc cha ON dm.DanhMucChaID = cha.DanhMucID
                WHERE dm.DanhMucID = @Id AND dm.IsDeleted = 0";
            
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", id);
            
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return new DanhMucDto
                {
                    DanhMucID = reader.GetInt32("DanhMucID"),
                    MaDanhMuc = reader.IsDBNull("MaDanhMuc") ? null : reader.GetString("MaDanhMuc"),
                    TenDanhMuc = reader.GetString("TenDanhMuc"),
                    DanhMucChaID = reader.IsDBNull("DanhMucChaID") ? null : reader.GetInt32("DanhMucChaID"),
                    TenDanhMucCha = reader.IsDBNull("TenDanhMucCha") ? null : reader.GetString("TenDanhMucCha"),
                    TrangThai = reader.GetBoolean("TrangThai"),
                    NgayTao = reader.GetDateTime("NgayTao"),
                    NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? null : reader.GetDateTime("NgayCapNhat")
                };
            }
            
            return null;
        }

        public async Task<int> CreateAsync(CreateDanhMucDto dto)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var sql = @"
                INSERT INTO dbo.DanhMuc (MaDanhMuc, TenDanhMuc, DanhMucChaID)
                OUTPUT INSERTED.DanhMucID
                VALUES (@MaDanhMuc, @TenDanhMuc, @DanhMucChaID)";
            
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@MaDanhMuc", (object?)dto.MaDanhMuc ?? DBNull.Value);
            command.Parameters.AddWithValue("@TenDanhMuc", dto.TenDanhMuc);
            command.Parameters.AddWithValue("@DanhMucChaID", (object?)dto.DanhMucChaID ?? DBNull.Value);
            
            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result);
        }

        public async Task<bool> UpdateAsync(int id, UpdateDanhMucDto dto)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var sql = @"
                UPDATE dbo.DanhMuc 
                SET MaDanhMuc = @MaDanhMuc, 
                    TenDanhMuc = @TenDanhMuc, 
                    DanhMucChaID = @DanhMucChaID,
                    TrangThai = @TrangThai,
                    NgayCapNhat = SYSDATETIME()
                WHERE DanhMucID = @Id AND IsDeleted = 0";
            
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", id);
            command.Parameters.AddWithValue("@MaDanhMuc", (object?)dto.MaDanhMuc ?? DBNull.Value);
            command.Parameters.AddWithValue("@TenDanhMuc", dto.TenDanhMuc);
            command.Parameters.AddWithValue("@DanhMucChaID", (object?)dto.DanhMucChaID ?? DBNull.Value);
            command.Parameters.AddWithValue("@TrangThai", dto.TrangThai);
            
            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var sql = @"
                UPDATE dbo.DanhMuc 
                SET IsDeleted = 1, NgayCapNhat = SYSDATETIME()
                WHERE DanhMucID = @Id";
            
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", id);
            
            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<IEnumerable<DanhMucDto>> GetByParentIdAsync(int? parentId)
        {
            var danhMucs = new List<DanhMucDto>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var sql = @"
                SELECT dm.DanhMucID, dm.MaDanhMuc, dm.TenDanhMuc, dm.DanhMucChaID, 
                       dm.TrangThai, dm.NgayTao, dm.NgayCapNhat,
                       cha.TenDanhMuc as TenDanhMucCha
                FROM dbo.DanhMuc dm
                LEFT JOIN dbo.DanhMuc cha ON dm.DanhMucChaID = cha.DanhMucID
                WHERE dm.IsDeleted = 0 AND (@ParentId IS NULL AND dm.DanhMucChaID IS NULL OR dm.DanhMucChaID = @ParentId)
                ORDER BY dm.TenDanhMuc";
            
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@ParentId", (object?)parentId ?? DBNull.Value);
            
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                danhMucs.Add(new DanhMucDto
                {
                    DanhMucID = reader.GetInt32("DanhMucID"),
                    MaDanhMuc = reader.IsDBNull("MaDanhMuc") ? null : reader.GetString("MaDanhMuc"),
                    TenDanhMuc = reader.GetString("TenDanhMuc"),
                    DanhMucChaID = reader.IsDBNull("DanhMucChaID") ? null : reader.GetInt32("DanhMucChaID"),
                    TenDanhMucCha = reader.IsDBNull("TenDanhMucCha") ? null : reader.GetString("TenDanhMucCha"),
                    TrangThai = reader.GetBoolean("TrangThai"),
                    NgayTao = reader.GetDateTime("NgayTao"),
                    NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? null : reader.GetDateTime("NgayCapNhat")
                });
            }
            
            return danhMucs;
        }
    }
}
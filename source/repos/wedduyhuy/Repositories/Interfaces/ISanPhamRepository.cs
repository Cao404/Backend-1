using wedduyhuy.DTOs;

namespace wedduyhuy.Repositories.Interfaces
{
    public interface ISanPhamRepository
    {
        Task<IEnumerable<SanPhamDto>> GetAllAsync();
        Task<SanPhamDto?> GetByIdAsync(int id);
        Task<SanPhamDto?> GetBySKUAsync(string sku);
        Task<int> CreateAsync(CreateSanPhamDto dto);
        Task<bool> UpdateAsync(int id, UpdateSanPhamDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<SanPhamDto>> GetByDanhMucAsync(int danhMucId);
        Task<IEnumerable<SanPhamDto>> SearchAsync(string keyword);
    }
}

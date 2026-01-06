using wedduyhuy.DTOs;

namespace wedduyhuy.Repositories
{
    public interface IDanhMucRepository
    {
        Task<IEnumerable<DanhMucDto>> GetAllAsync();
        Task<DanhMucDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateDanhMucDto dto);
        Task<bool> UpdateAsync(int id, UpdateDanhMucDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<DanhMucDto>> GetByParentIdAsync(int? parentId);
    }
}
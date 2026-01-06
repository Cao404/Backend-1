using wedduyhuy.DTOs;

namespace wedduyhuy.Repositories
{
    public interface IKhachHangRepository
    {
        Task<IEnumerable<KhachHangDto>> GetAllAsync();
        Task<KhachHangDto?> GetByIdAsync(int id);
        Task<KhachHangDto?> GetByPhoneAsync(string phone);
        Task<int> CreateAsync(CreateKhachHangDto dto);
        Task<bool> UpdateAsync(int id, UpdateKhachHangDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<KhachHangDto>> GetByLoaiAsync(string loai);
        Task<IEnumerable<KhachHangDto>> SearchAsync(string keyword);
    }
}

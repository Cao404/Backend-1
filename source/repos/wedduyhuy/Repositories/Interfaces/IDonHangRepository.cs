using wedduyhuy.DTOs;

namespace wedduyhuy.Repositories.Interfaces
{
    public interface IDonHangRepository
    {
        Task<IEnumerable<DonHangDto>> GetAllAsync();
        Task<DonHangDto?> GetByIdAsync(int id);
        Task<DonHangDto?> GetByMaDonHangAsync(string maDonHang);
        Task<int> CreateAsync(CreateDonHangDto dto);
        Task<bool> UpdateTrangThaiAsync(int id, UpdateTrangThaiDonHangDto dto);
        Task<IEnumerable<DonHangDto>> GetByKhachHangAsync(int khachHangId);
        Task<IEnumerable<DonHangDto>> GetByTrangThaiAsync(byte trangThai);
    }
}

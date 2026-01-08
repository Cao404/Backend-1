using wedduyhuy.DTOs;

namespace wedduyhuy.Repositories.Interfaces
{
    public interface IGioHangRepository
    {
        Task<GioHangDto?> GetByKhachHangAsync(int khachHangId);
        Task<int> AddToCartAsync(AddToCartDto dto);
        Task<bool> UpdateCartItemAsync(int gioHangItemId, UpdateCartItemDto dto);
        Task<bool> RemoveCartItemAsync(int gioHangItemId);
        Task<bool> ClearCartAsync(int khachHangId);
    }
}

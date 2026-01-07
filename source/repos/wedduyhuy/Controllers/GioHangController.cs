using Microsoft.AspNetCore.Mvc;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories.Interfaces;

namespace wedduyhuy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GioHangController : ControllerBase
    {
        private readonly IGioHangRepository _repo;

        public GioHangController(IGioHangRepository repo) => _repo = repo;

        [HttpGet("get-by-khachhang/{khachHangId}")]
        public async Task<ActionResult<GioHangDto>> GetByKhachHang(int khachHangId)
        {
            var item = await _repo.GetByKhachHangAsync(khachHangId);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpPost("add-to-cart")]
        public async Task<ActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            if (dto.SoLuong <= 0) return BadRequest("Số lượng phải lớn hơn 0");
            var itemId = await _repo.AddToCartAsync(dto);
            return Ok(new { GioHangItemID = itemId, Message = "Đã thêm vào giỏ hàng" });
        }

        [HttpPut("update-item/{gioHangItemId}")]
        public async Task<ActionResult> UpdateCartItem(int gioHangItemId, [FromBody] UpdateCartItemDto dto)
        {
            if (dto.SoLuong <= 0) return BadRequest("Số lượng phải lớn hơn 0");
            var success = await _repo.UpdateCartItemAsync(gioHangItemId, dto);
            return success ? NoContent() : NotFound();
        }

        [HttpDelete("delete-item/{gioHangItemId}")]
        public async Task<ActionResult> RemoveCartItem(int gioHangItemId)
        {
            var success = await _repo.RemoveCartItemAsync(gioHangItemId);
            return success ? NoContent() : NotFound();
        }

        [HttpDelete("clear-cart/{khachHangId}")]
        public async Task<ActionResult> ClearCart(int khachHangId)
        {
            await _repo.ClearCartAsync(khachHangId);
            return NoContent();
        }
    }
}

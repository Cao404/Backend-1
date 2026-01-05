using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using User.Api.Common;
using User.Api.Dtos;
using User.Api.Repositories;

namespace User.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _repo;
        public CartController(ICartRepository repo) => _repo = repo;

        [HttpGet("{maKhachHang:int}")]
        public IActionResult GetCart(int maKhachHang)
        {
            var cart = _repo.GetCart(maKhachHang);
            return Ok(ApiResponse<object>.Ok(cart));
        }

        [HttpPost("items")]
        public IActionResult AddItem([FromBody] AddCartItemRequest req)
        {
            _repo.AddOrUpdateItem(req.MaKhachHang, req.MaSanPham, req.SoLuong);
            return Ok(ApiResponse<string>.Ok("OK", "Đã thêm vào giỏ"));
        }

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using User.Api.Common;
using User.Api.Dtos;
using User.Api.Repositories;

namespace User.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _repo;
        public OrdersController(IOrderRepository repo) => _repo = repo;

        // đặt hàng từ giỏ
        [HttpPost]
        public IActionResult Place([FromBody] PlaceOrderRequest req)
        {
            var orderId = _repo.PlaceOrderFromCart(req.MaKhachHang, req.DiaChiGiao, req.GhiChu);
            return Ok(ApiResponse<object>.Ok(new { MaDonHang = orderId }, "Đặt hàng thành công"));
        }

        // danh sách đơn theo khách
        [HttpGet]
        public IActionResult List([FromQuery] int maKhachHang)
        {
            var list = _repo.GetOrdersByCustomer(maKhachHang);
            return Ok(ApiResponse<object>.Ok(list));
        }

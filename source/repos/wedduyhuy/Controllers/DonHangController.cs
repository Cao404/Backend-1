using Microsoft.AspNetCore.Mvc;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories.Interfaces;

namespace wedduyhuy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonHangController : ControllerBase
    {
        private readonly IDonHangRepository _repo;

        public DonHangController(IDonHangRepository repo) => _repo = repo;

        [HttpGet("get-all")]
        public async Task<ActionResult<IEnumerable<DonHangDto>>> GetAll()
        {
            return Ok(await _repo.GetAllAsync());
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<ActionResult<DonHangDto>> GetById(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("get-by-madonhang/{maDonHang}")]
        public async Task<ActionResult<DonHangDto>> GetByMaDonHang(string maDonHang)
        {
            var item = await _repo.GetByMaDonHangAsync(maDonHang);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("get-by-khachhang/{khachHangId}")]
        public async Task<ActionResult<IEnumerable<DonHangDto>>> GetByKhachHang(int khachHangId)
        {
            return Ok(await _repo.GetByKhachHangAsync(khachHangId));
        }

        [HttpGet("get-by-trangthai/{trangThai}")]
        public async Task<ActionResult<IEnumerable<DonHangDto>>> GetByTrangThai(byte trangThai)
        {
            return Ok(await _repo.GetByTrangThaiAsync(trangThai));
        }

        [HttpPost("create")]
        public async Task<ActionResult<DonHangDto>> Create([FromBody] CreateDonHangDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest("Đơn hàng phải có ít nhất 1 sản phẩm");

            var id = await _repo.CreateAsync(dto);
            var created = await _repo.GetByIdAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, created);
        }

        [HttpPut("update-trangthai/{id}")]
        public async Task<ActionResult> UpdateTrangThai(int id, [FromBody] UpdateTrangThaiDonHangDto dto)
        {
            if (await _repo.GetByIdAsync(id) == null) return NotFound();
            await _repo.UpdateTrangThaiAsync(id, dto);
            return NoContent();
        }
    }
}
